import { createClient } from "@/utils/supabase/server";
// 🧩 Get parent profile by user ID
export async function getParentProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .eq("role", "parent")
    .single();
  return { data, error };
}

// Get children for a parent
export async function getChildrenOfParent(parentId: string) {
  const supabase = await createClient();

  try {
    //  Get all student IDs linked to this parent
    const { data: childLinks, error: linkError } = await supabase
      .from('student_parents')
      .select('student_id, relationship')
      .eq('parent_id', parentId);

    if (linkError) {
      console.error('Error fetching child links:', linkError);
      return { data: [], error: linkError };
    }

    if (!childLinks?.length) {
      console.log('No children found for this parent');
      return { data: [], error: null };
    }

    const studentIds = childLinks.map(link => link.student_id);

    //  Fetch student info from profiles
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, phone')
      .in('id', studentIds);

    if (studentError) {
      console.error('Error fetching student profiles:', studentError);
      return { data: [], error: studentError };
    }

    //  Merge relationship info with student profiles
    const children = childLinks.map(link => ({
      student_id: link.student_id,
      relationship: link.relationship,
      ...students.find(s => s.id === link.student_id)
    })).filter(Boolean);

    console.log('Children data:', children);
    return { data: children, error: null };
  } catch (err) {
    console.error('Unexpected error in getChildrenOfParent:', err);
    return { data: [], error: err as Error };
  }
}


// 📍 Get latest location for a student
export async function getLatestStudentLocation(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_locations")
    .select("latitude, longitude, address, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

// Get current user profile
export async function getCurrentUserProfileServer() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { user: null, profile: null, allUsers: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: allUsers } = await supabase.from("profiles").select("*");

  return { user, profile, allUsers: allUsers || [] };
}
