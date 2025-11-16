"use client";

import { useTeacherClassList } from "@/hooks/useTeacherClassList";

export default function AllTeacherClassSubject() {
  const assignments = useTeacherClassList();

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((item) => (
          <div
            key={`${item.teacher_id}-${item.class_id}-${item.subject_id}`}
            className="p-4 border rounded-lg shadow-sm "
          >
            {/* Teacher Info */}
            <p className="font-bold text-lg">
              👨‍🏫 Teacher: {item.teachers?.profiles?.full_name ?? "Unknown Teacher"}
            </p>

            {/* Class Info */}
            <p className="text-gray-500">
              🏫 Class: {item.classes?.name ?? "No Class"} (
              {item.classes?.academic_year ?? "N/A"})
            </p>

            {/* Subject Info */}
            <p className="text-gray-500">
              📘 Subject: {item.subjects?.name ?? "No Subject"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
