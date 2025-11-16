import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useTeacherClassList() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data, error } = await supabase.from("teacher_classes").select(`
   teacher_id,
    class_id,
    subject_id,

    teachers:teacher_id (
      id,
      teacher_id_number,
      hire_date,
      profiles (
        id,
        full_name,
        avatar_url,
        role
      )
    ),

    classes:class_id (
      id,
      name,
      academic_year
    ),

    subjects:subject_id (
      id,
      name,
      grade_level
    )
`);

      if (error) {
        console.error("Error fetching teacher assignments:", error);
      } else {
        setAssignments(data);
      }
    };

    fetchAssignments();
  }, []);

  return assignments;
}
