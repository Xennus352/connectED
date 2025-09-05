import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useSubjectsList() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchParents = async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
       

      if (!error && data) {
        setSubjects(data);
      }
    };
    fetchParents();
  }, []);

  return subjects;
}
