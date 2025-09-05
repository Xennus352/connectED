import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useStudentsList() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select(`
          id,
          student_id_number,
          date_of_birth,
          enrollment_date,
          class_id,
          student_parents (
            parent_id,
            relationship
          )
        `);

      if (!studentsError && studentsData) {
        setStudents(studentsData);
      } else if (studentsError) {
        console.error("Error fetching students:", studentsError.message);
      }
    };

    fetchStudents();
  }, []);

  return students;
}
