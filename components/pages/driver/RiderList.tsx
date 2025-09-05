"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/utils/supabase/user";

interface Parent {
  parent_id: string;
  relationship: string;
  parents: {
    full_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Student {
  id: string;

  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  student_parents?: Parent[];
}

const RiderList: React.FC = () => {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiders = async () => {
      const userProfile = await getCurrentUserProfile();
      const driverId = userProfile?.profile?.id;
      if (!driverId) return;

      try {
        const { data: locations, error } = await supabase
          .from("student_locations")
          .select(
            `
    id,
    latitude,
    longitude,
    address,
    students!inner(
      id,
      student_id_number,
      profiles!inner(full_name, avatar_url),
      student_parents!inner(
        parent_id,
        relationship,
        parents:profiles!inner(full_name, avatar_url, role)
      )
    )
  `
          )
          .eq("driver_id", driverId);

        if (error) throw error;

        const formatted: Student[] = locations.map((loc: any) => ({
          id: loc.students.id,
          student_id_number: loc.students.student_id_number,
          profiles: {
            full_name: loc.students.profiles.full_name,
            avatar_url: loc.students.profiles.avatar_url,
          },
          address: loc.address,
          latitude: loc.latitude,
          longitude: loc.longitude,
          student_parents: loc.students.student_parents,
        }));

        setStudents(formatted);
      } catch (err) {
        console.error("Failed to fetch riders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  if (loading) return <div>Loading riders...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {students.length > 0 ? (
        students.map((student) => {
          // Get first parent name (or show "No parent" if empty)
          const parentName =
            student.student_parents?.[0]?.parents?.full_name ?? "No parent";

          return (
            <div
              key={student.id}
              className="
    card bg-base-100 shadow-lg 
    p-4 sm:p-5 md:p-6 
    flex flex-col sm:flex-row sm:items-center
    gap-4 sm:gap-5 md:gap-7 lg:gap-9
    transition-transform duration-200
    hover:scale-105 hover:shadow-xl
    w-full
    sm:max-w-[90%] md:max-w-[95%] lg:max-w-[1200px]
    mx-auto
  "
            >
              {/* Avatar */}
              <div className="avatar flex-shrink-0 self-center sm:self-auto">
                <div
                  className="
        rounded-full ring-2 ring-primary overflow-hidden
        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
      "
                >
                  <img
                    src={student.profiles.avatar_url || "/default-avatar.png"}
                    alt={student.profiles.full_name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-base sm:text-lg md:text-xl truncate">
                  {student.profiles.full_name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                  Parent:{" "}
                  {student.student_parents?.[0]?.parents?.full_name ??
                    "No parent"}
                </p>

                <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
                  Location: {student.address || "Address N/A"}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center col-span-full text-gray-500 py-8">
          No students assigned to your bus
        </p>
      )}
    </div>
  );
};

export default RiderList;
