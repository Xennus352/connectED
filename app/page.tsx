
"use client";

import Navbar from "@/components/pages/Navbar";
import LoadingCard from "@/components/ui/LoadingCard";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import { useEffect, useState } from "react";

export default function Home() {
  const pathName = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  // ✅ Fetch user once
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      setUserData(data);
    })();
  }, []);

  // ✅ Redirect AFTER userData is loaded
  useEffect(() => {
    if (!userData) return;
    const role = userData.profile?.role;
    if (!role || pathName !== "/") return;

    console.log("Redirecting user with role:", role);

    switch (role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "teacher":
        router.push("/teacher");
        break;
      case "parent":
        router.push("/parent");
        break;
      case "student":
        router.push("/student");
        break;
      case "driver":
        router.push("/driver");
        break;
      default:
        router.push("/login");
    }
  }, [userData, pathName, router]);

  return (
    <main>
      <Navbar />
      <h1 className="text-center text-3xl">Welcome from Connect ED</h1>
      <div className="flex items-center justify-center m-3">
        <LoadingCard />
      </div>
    </main>
  );
}
