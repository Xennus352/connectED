"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
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
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

interface ChildDriverInfo {
  student_id: string;
  student_name: string;
  student_avatar: string;
  driver_id: string;
  driver_name: string;
  driver_avatar: string;
  driver_location: [number, number];
  address: string;
}

const TrackMyChild = () => {
  const supabase = createClient();
  const [parentId, setParentId] = useState<string | null>(null);
  const [childDrivers, setChildDrivers] = useState<ChildDriverInfo[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Get logged-in parent
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setParentId(user.id);
    };
    getUser();
  }, [supabase]);

  // Fetch children & drivers
  useEffect(() => {
    if (!parentId) return;

    const fetchChildDrivers = async () => {
      try {
        const { data: children } = await supabase
          .from("student_parents")
          .select(`
            student_id,
            student:students (
              student_id_number,
              profiles(full_name, avatar_url)
            )
          `)
          .eq("parent_id", parentId);

        if (!children || children.length === 0) return;

        const childDriverPromises = children.map(async (c: any) => {
          const student_id = c.student_id;
          const student_name = c.student?.profiles?.full_name || "Unknown Student";
          const student_avatar = c.student?.profiles?.avatar_url || "/default-avatar.png";

          // Latest student_location
          const { data: locData } = await supabase
            .from("student_locations")
            .select("driver_id, latitude, longitude, address")
            .eq("student_id", student_id)
            .order("id", { ascending: false })
            .limit(1);

          if (!locData || locData.length === 0) return null;
          const latestLoc = locData[0];

          // Driver profile
          const { data: driverProfiles } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", latestLoc.driver_id)
            .single();

          return {
            student_id,
            student_name,
            student_avatar,
            driver_id: latestLoc.driver_id,
            driver_name: driverProfiles?.full_name || "Unknown Driver",
            driver_avatar: driverProfiles?.avatar_url || "/default-avatar.png",
            driver_location: [latestLoc.latitude, latestLoc.longitude] as [number, number],
            address: latestLoc.address,
          };
        });

        const resolved = await Promise.all(childDriverPromises);
        setChildDrivers(resolved.filter(Boolean) as ChildDriverInfo[]);
      } catch (err) {
        console.error("Error fetching child/driver:", err);
      }
    };

    fetchChildDrivers();

    // Realtime updates
    const channel = supabase
      .channel("student_locations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_locations" },
        (payload: any) => {
          setChildDrivers((prev) =>
            prev.map((cd) =>
              cd.student_id === payload.new.student_id
                ? {
                    ...cd,
                    driver_location: [payload.new.latitude, payload.new.longitude],
                    address: payload.new.address,
                  }
                : cd
            )
          );
        }
      )
      .subscribe();

    return () => {supabase.removeChannel(channel);}
  }, [parentId]);

  if (!mounted) return null;
  if (!childDrivers || childDrivers.length === 0) return <div>Loading map...</div>;

  const defaultCenter = childDrivers[0].driver_location || [16.8409, 96.1735];

  // Custom marker with driver avatar
  const createDriverIcon = (avatarUrl: string) =>
    L.divIcon({
      html: `<div style="background-color:white;border-radius:50%;width:40px;height:40px;border:2px solid #4F46E5;overflow:hidden;">
        <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />
      </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={defaultCenter} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {childDrivers.map((cd) => (
          <Marker key={cd.student_id} position={cd.driver_location} icon={createDriverIcon(cd.driver_avatar)}>
            <Popup>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src={cd.driver_avatar} alt={cd.driver_name} width={50} height={50} className="rounded-full border-2 border-indigo-500" />
                  <span>{cd.driver_name} (Driver)</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Image src={cd.student_avatar} alt={cd.student_name} width={40} height={40} className="rounded-full border-2 border-green-500" />
                  <span>{cd.student_name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Address: {cd.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrackMyChild;
