import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useClassesList() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, academic_year, head_teacher_id, school_id");

      if (!error && data) {
        setClasses(data);
      } else if (error) {
        console.error("Error fetching classes:", error.message);
      }
    };

    fetchClasses();
  }, []);

  return classes;
}
