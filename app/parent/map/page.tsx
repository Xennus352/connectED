"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import RoleGuard from "@/components/pages/RoleGuard";
import RealTimeMap from "@/components/pages/driver/RealtimeMap";

export default function ParentMapPage() {
  const [parentId, setParentId] = useState("");
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    getParentId();
  }, []);

  const getParentId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setParentId(user.id);
  };

  return (
    <RoleGuard allowedRoles={["parent"]}>
      <div className="h-screen flex flex-col">
        <header className="bg-purple-600 text-white p-4">
          <h1 className="text-xl font-bold">Parent Live Tracking</h1>
          <p>Viewing your children's locations</p>
        </header>
        <RealTimeMap role="parent" userId={parentId} />
      </div>
    </RoleGuard>
  );
}
