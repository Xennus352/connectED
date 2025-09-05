"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  full_name: string;
  avatar_url?: string;
}

interface Homework {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  created_at: string;
  assigned_by: string;
  profiles: Profile; // teacher info
  teacher?: Profile;
}

interface ClassInfo {
  id: string;
  name: string; // e.g. "Grade-10"
  academic_year: string;
  homeworks: Homework[];
}

interface Student {
  id: string;
  student_id_number: string;
  class_id: string;
  profiles: Profile; // student info
  classes: ClassInfo;
}

const AssignmentGuide: React.FC<{ parentId: string }> = ({ parentId }) => {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeworks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("student_parents")
      .select(
        `
    students (
      id,
      student_id_number,
      class_id,
      profiles (
        full_name,
        avatar_url
      ),
      classes (
        id,
        name,
        academic_year,
        homeworks (
          id,
          title,
          description,
          due_date,
          created_at,
          assigned_by,
          profiles (
            full_name,
            avatar_url
          )
        )
      )
    )
  `
      )
      .eq("parent_id", parentId);

    if (error) {
      console.error("Failed to fetch homeworks:", error);
    } else {
      const formatted = data.map((row: any) => ({
        ...row.students,
        classes: {
          ...row.students.classes,
          homeworks: row.students.classes?.homeworks?.map((hw: any) => ({
            ...hw,
            teacher: hw.profiles
              ? {
                  full_name: hw.profiles.full_name,
                  avatar_url: hw.profiles.avatar_url,
                }
              : undefined,
          })),
        },
      }));
      setStudents(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="p-4 space-y-6">
      {students.map((student) => (
        <div
          key={student.id}
          className="p-4 border rounded-lg shadow  space-y-4"
        >
          <h2 className="text-lg font-bold">
            {student.profiles.full_name} – {student.classes?.name} (
            {student.classes?.academic_year})
          </h2>

          {student.classes?.homeworks?.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2">
              {student.classes.homeworks.map((hw) => (
                <li key={hw.id} className="text-sm space-y-2">
                  <p className="font-semibold text-xl">{hw.title}</p>
                  <p className="text-gray-600 text-lg">{hw.description}</p>
                  <p className="text-xs text-red-500">
                    Due: {new Date(hw.due_date).toLocaleDateString()}
                  </p>
                  {hw.teacher && (
                    <p className="text-xs italic text-blue-600 flex items-center gap-2">
                      <img
                        src={hw.teacher.avatar_url || "/default-avatar.png"}
                        alt="teacher avatar"
                        className="w-5 h-5 rounded-full"
                      />
                      {hw.teacher.full_name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No homework assigned yet.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssignmentGuide;
