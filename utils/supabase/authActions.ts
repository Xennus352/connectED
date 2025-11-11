"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    // Fetch user profile to check role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user?.id)
      .single();

    if (profileError) {
      alert("Failed to fetch user profile: " + profileError.message);
      return;
    }

    // Redirect based on role
    switch (profileData.role) {
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
        router.push(profileData.role);
    }
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Signup failed: " + error.message);
      return;
    }
    router.push("/login"); // After signup, redirect to login page
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout failed: " + error.message);
      return;
    }
    router.push("/login");
  };

  return { login, signup, signOut };
}
