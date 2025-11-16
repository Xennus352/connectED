import { createClient } from "@/utils/supabase/client";

export async function getCurrentUserProfile() {
  const supabase = createClient();

  // Get auth user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) return null;

  // Get all users
  const { data: allUsers } = await supabase.from("profiles").select("*");

  // Get all students belonging to this parent
  const { data: students, error: studentError } = await supabase
    .from("student_parents")
    .select(
      `
      id,
      relationship,
      students (
        id,
        student_id_number,
        date_of_birth,
        enrollment_date,
        class_id,
        profiles (
        full_name,
        avatar_url
      ),
      classes (
        id,
        name,
        academic_year,
        head_teacher_id
      )
      )
    `
    )
    .eq("parent_id", user.id);

  if (studentError) {
    console.error("Student fetch error:", studentError);
  }

  // Return everything together
  return {
    user,
    profile,
    allUsers,
    students,
  };
}
