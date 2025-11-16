import { createClient } from "@/utils/supabase/client";


const useFetchCurrentTeacherClassSub = async (teacherId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("teacher_classes")
    .select(
      `
      class_id,
      subject_id,
      classes (
        name,
        academic_year
      ),
      subjects (
        name,
        grade_level
      )
    `
    )
    .eq("teacher_id", teacherId);

  if (error) {
    console.error("Error loading teacher classes:", error.message);
    return [];
  }

  return data;
};

export default useFetchCurrentTeacherClassSub;
