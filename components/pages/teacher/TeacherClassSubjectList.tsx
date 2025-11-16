"use client";

import LoadingCard from "@/components/ui/LoadingCard";
import { useTeacherClassList } from "@/hooks/useTeacherClassList";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import { useEffect, useState } from "react";

export default function TeacherClassSubjectList() {
  const assignments = useTeacherClassList();

  // current user information
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) {
        setUserData(data);
      }
    })();
  }, []);

  if (!userData)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingCard />
      </div>
    );

  // destructure profile for easier access
  const profile = userData.profile;

  // Filter assignments for the specific teacher
  const filteredAssignments = assignments.filter(
    (item) => item.teacher_id === profile.id
  );

  if (!filteredAssignments.length) return <p>No classes assigned.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Class and Subject List</h2>

      {filteredAssignments.map((item) => (
        <div
          key={`${item.teacher_id}-${item.class_id}-${item.subject_id}`}
          className="p-4 mb-3 border rounded-lg shadow-sm"
        >
          {/* Teacher Info */}
          <p className="font-bold text-lg">
            👨‍🏫 Teacher: {item.teachers?.profiles?.full_name ?? "Unknown Teacher"}
          </p>

          {/* Class Info */}
          <p className="text-gray-700">
            🏫 Class: {item.classes?.name ?? "No Class"} ({item.classes?.academic_year ?? "N/A"})
          </p>

          {/* Subject Info */}
          <p className="text-gray-700">
            📘 Subject: {item.subjects?.name ?? "No Subject"}
          </p>
        </div>
      ))}
    </div>
  );
}
