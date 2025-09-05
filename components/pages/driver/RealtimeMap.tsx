// components/Map/RealTimeMap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/utils/supabase/client";

interface Location {
  id: string;
  student_id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  students?: {
    full_name: string;
  };
  drivers?: {
    profiles: {
      full_name: string;
    };
  };
}

interface RealTimeMapProps {
  role: "admin" | "driver" | "parent";
  userId?: string;
}

export default function RealTimeMap({ role, userId }: RealTimeMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<[number, number]>([18.97491, 96.4167]); // UCST, Taungoo

  const supabase = createClient();
  useEffect(() => {
    // Get initial locations based on role
    fetchLocations();

    // Set up real-time subscription
    const channel = supabase
      .channel("gps_locations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gps_locations",
        },
        (payload) => {
          setLocations((prev) => [...prev, payload.new as Location]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "gps_locations",
        },
        (payload) => {
          setLocations((prev) =>
            prev.map((loc) =>
              loc.id === payload.new.id ? (payload.new as Location) : loc
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, userId]);

  const fetchLocations = async () => {
    let query = supabase
      .from("gps_locations")
      .select(
        `
        *,
        students:student_id (full_name),
        drivers:driver_id (profiles (full_name))
      `
      )
      .order("timestamp", { ascending: false });

    // Filter based on role
    if (role === "driver") {
      query = query.eq("driver_id", userId);
    } else if (role === "parent") {
      // Get student IDs that belong to this parent
      const { data: studentRelations } = await supabase
        .from("students_parents")
        .select("student_id")
        .eq("parent_id", userId);

      if (studentRelations) {
        const studentIds = studentRelations.map((rel) => rel.student_id);
        query = query.in("student_id", studentIds);
      }
    }

    const { data, error } = await query;

    if (data) {
      setLocations(data as Location[]);

      // Center map on first location if available
      if (data.length > 0) {
        setCenter([data[0].latitude, data[0].longitude]);
      }
    }
  };

  const studentIcon = new Icon({
    iconUrl: "/marker-student.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const driverIcon = new Icon({
    iconUrl: "/marker-driver.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="h-screen w-full">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={location.driver_id ? driverIcon : studentIcon}
          >
            <Popup>
              {location.driver_id ? (
                <>
                  <strong>Driver:</strong>{" "}
                  {location.drivers?.profiles.full_name}
                  <br />
                  <strong>Time:</strong>{" "}
                  {new Date(location.timestamp).toLocaleTimeString()}
                </>
              ) : (
                <>
                  <strong>Student:</strong> {location.students?.full_name}
                  <br />
                  <strong>Time:</strong>{" "}
                  {new Date(location.timestamp).toLocaleTimeString()}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
