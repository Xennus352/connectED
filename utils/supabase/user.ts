import { createClient } from "@/utils/supabase/client";

export async function getCurrentUserProfile() {
  const supabase = createClient();

  // Get auth user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    // get all user data 
    const { data: allUsers } = await supabase
  .from("profiles")
  .select("*");


  if (profileError) return null;

  return { user, profile ,allUsers };
}
