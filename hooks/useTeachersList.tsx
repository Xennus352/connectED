import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useTeachersList() {
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchParents = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "teacher");

      if (!error && data) {
        setTeachers(data);
      }
    };
    fetchParents();
  }, []);

  return teachers;
}
