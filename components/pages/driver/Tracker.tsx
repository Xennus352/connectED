"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { UserMarker } from "@/types/types";
import Image from "next/image";

// Leaflet dynamic import
let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// React-Leaflet dynamic imports
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Haversine formula for distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Tracker = () => {
  const supabase = createClient();
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(
    null
  );
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [driverId, setDriverId] = useState<string | null>(null);

  // Get logged-in driver
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setDriverId(user.id);
    };
    getUser();
  }, [supabase]);

  // Track driver's live location
  useEffect(() => {
    if (!navigator.geolocation || !driverId) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setDriverLocation(loc);

        // Update reached status dynamically
        setUserMarkers((prev) =>
          prev.map((m) => {
            const distance = getDistance(loc[0], loc[1], m.position[0], m.position[1]);
            return { ...m, reached: distance <= 10 }; // within 10 meters
          })
        );
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId]);

  // Fetch student locations
  useEffect(() => {
    if (!driverId) return;

    const fetchStudentLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("student_locations")
          .select(`
            id,
            latitude,
            longitude,
            students (
              student_id_number,
              profiles (full_name, avatar_url),
              student_parents (
                relationship,
                parents:profiles (full_name, avatar_url)
              )
            )
          `);

        if (error) throw error;

        const markers = data?.map((s: any) => ({
          id: s.id,
          position: [s.latitude, s.longitude] as [number, number],
          user: {
            full_name: s.students?.profiles?.full_name || "Unknown Student",
            avatar_url: s.students?.profiles?.avatar_url || "/default-avatar.png",
            student_id_number: s.students?.student_id_number,
          },
          parents:
            s.students?.student_parents?.map((p: any) => ({
              relationship: p.relationship,
              full_name: p.parents?.full_name || "Unknown",
              avatar_url: p.parents?.avatar_url || "/default-avatar.png",
            })) || [],
          lastUpdate: new Date().toISOString(),
          reached: false,
        })) || [];

        setUserMarkers(markers);
      } catch (err) {
        console.error("Error fetching student locations:", err);
      }
    };

    fetchStudentLocations();

    const channel = supabase
      .channel("student_locations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_locations" },
        fetchStudentLocations
      )
      .subscribe();

    return () => {supabase.removeChannel(channel);}
  }, [driverId]);

  if (!driverLocation) return <div>Loading map...</div>;

  // Function to create custom marker icon based on reached status
  const createMarkerIcon = (reached?: boolean) =>
    L.divIcon({
      html: `<div style="background-color:${reached ? "green" : "red"};width:20px;height:20px;border-radius:50%;border:2px solid white;"></div>`,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={driverLocation}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver Marker */}
        <Marker
          position={driverLocation}
          icon={createMarkerIcon(true)}
        >
          <Popup>
            <strong>You (Driver)</strong>
          </Popup>
        </Marker>

        {/* Student Markers */}
        {userMarkers.map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            icon={createMarkerIcon(m.reached)}
          >
            <Popup>
              <div className="max-w-sm p-3 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Image
                    src={m.user.avatar_url || '/default-avatar.png'}
                    alt={m.user.full_name}
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-indigo-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{m.user.full_name}</h3>
                  </div>
                  {m.reached && (
                    <span className="ml-auto text-green-500 text-xl font-bold">✅</span>
                  )}
                </div>

                {/* Parents */}
                {m.parents.length > 0 ? (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-1">Parents:</h4>
                    {m.parents.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Image
                          src={p.avatar_url || "/default-avatar.png"}
                          alt={p.full_name}
                          width={30}
                          height={30}
                          className="rounded-full border border-gray-400"
                        />
                        <p className="text-sm">{p.relationship} :: {p.full_name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No parents found</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Tracker;
