import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function useTeacherHomeworks(teacherId: string) {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homeworks")
      .select("*")
      .eq("assigned_by", teacherId) // only homeworks created by current teacher
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching homeworks:", error.message);
      setHomeworks([]);
    } else {
      setHomeworks(data || []);
    }

    setLoading(false);
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) fetchHomeworks();
  }, [teacherId, fetchHomeworks]);

  return { homeworks, loading, fetchHomeworks };
}
