import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

export function useParentsList() {
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    const fetchParents = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "parent");

      if (!error && data) {
        setParents(data);
      }
    };
    fetchParents();
  }, []);

  return parents;
}
