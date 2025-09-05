"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define a proper type for the form data
interface CreateUserFormData {
  email: string;
  password: string;
  role: "teacher" | "student" | "parent" | "admin" | "driver";
  full_name: string;
  phone?: string;
  avatar_url: string;
  // Teacher specific
  teacher_id_number?: string;
  hire_date?: string;
  assigned_classes?: string[]; // Array of class IDs
  // Student specific
  student_id_number?: string;
  date_of_birth?: string;
  enrollment_date?: string;
  class_id?: string;
  assigned_parents?: string[]; // Array of parent profile IDs
  // Driver specific
  driver_id_number?: string;
  license_number?: string;
  license_expiry_date?: string;
  assigned_vehicle?: string;
  assigned_students?: string[]; // Array of student profile IDs
}

export async function createUser(formData: FormData) {
  // 1. Extract and validate form data
  const rawFormData: CreateUserFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as CreateUserFormData["role"],
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    avatar_url: formData.get("avatar_url") as string,
    // Teacher fields
    teacher_id_number: formData.get("teacher_id_number") as string,
    hire_date: formData.get("hire_date") as string,
    assigned_classes: formData.getAll("assigned_classes") as string[],
    // Student fields
    student_id_number: formData.get("student_id_number") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    enrollment_date: formData.get("enrollment_date") as string,
    class_id: formData.get("class_id") as string,
    assigned_parents: formData.getAll("assigned_parents") as string[],
    // Driver fields
    driver_id_number: formData.get("driver_id_number") as string,
    license_number: formData.get("license_number") as string,
    license_expiry_date: formData.get("license_expiry_date") as string,
    assigned_vehicle: formData.get("assigned_vehicle") as string,
    assigned_students: formData.getAll("assigned_students") as string[],
  };

  const {
    email,
    password,
    role,
    full_name,
    phone,
    avatar_url,
    ...roleSpecificData
  } = rawFormData;

  // Basic validation
  if (!email || !password || !role || !full_name) {
    return { error: "Email, password, role, and full name are required." };
  }

  // 2. Create Supabase admin client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // CRITICAL: Use service role key
  );

  try {
    // 3. Create the user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: role,
          full_name: full_name,
          phone: phone,
          avatar_url: avatar_url,
        },
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      return { error: `Failed to create user: ${authError.message}` };
    }

    const newUserId = authData.user.id;
    console.log(`User created in auth with ID: ${newUserId}`);

    // 4. Wait a moment for the trigger to create the profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Insert into role-specific table based on the role
    switch (role) {
      case "student":
        if (!roleSpecificData.student_id_number || !roleSpecificData.class_id) {
          return { error: `Student ID and Class are required for students.` };
        }

        const { error: studentError } = await supabaseAdmin
          .from("students")
          .insert({
            id: newUserId,
            student_id_number: roleSpecificData.student_id_number,
            date_of_birth: roleSpecificData.date_of_birth,
            enrollment_date:
              roleSpecificData.enrollment_date ||
              new Date().toISOString().split("T")[0],
            class_id: roleSpecificData.class_id,
          });

        if (studentError) {
          console.error("Student insert error:", studentError);
          return {
            error: `Failed to create student record: ${studentError.message}`,
          };
        }

        // Handle parent assignments if any
        if (
          roleSpecificData.assigned_parents &&
          roleSpecificData.assigned_parents.length > 0
        ) {
          const parentLinks = roleSpecificData.assigned_parents.map(
            (parent_id) => ({
              student_id: newUserId,
              parent_id: parent_id,
              relationship: "Parent", // Default relationship
            })
          );

          const { error: parentLinkError } = await supabaseAdmin
            .from("student_parents")
            .insert(parentLinks);

          if (parentLinkError) {
            console.error("Parent link error:", parentLinkError);
            // Don't fail the whole operation, just log it
          }
        }
        break;

      case "teacher":
        if (!roleSpecificData.teacher_id_number) {
          return { error: "Teacher ID is required for teachers." };
        }

        const { error: teacherError } = await supabaseAdmin
          .from("teachers")
          .insert({
            id: newUserId,
            teacher_id_number: roleSpecificData.teacher_id_number,
            hire_date:
              roleSpecificData.hire_date ||
              new Date().toISOString().split("T")[0],
          });

        if (teacherError) {
          console.error("Teacher insert error:", teacherError);
          return {
            error: `Failed to create teacher record: ${teacherError.message}`,
          };
        }

        // Handle class assignments if any
        if (
          roleSpecificData.assigned_classes &&
          roleSpecificData.assigned_classes.length > 0
        ) {
          const classLinks = roleSpecificData.assigned_classes.map(
            (class_id) => ({
              class_id: class_id,
              teacher_id: newUserId,
            })
          );

          const { error: classLinkError } = await supabaseAdmin
            .from("class_teachers")
            .insert(classLinks);

          if (classLinkError) {
            console.error("Class link error:", classLinkError);
            // Don't fail the whole operation, just log it
          }
        }
        break;

      case "driver":
        if (!roleSpecificData.license_number) {
          return { error: "License number is required for drivers." };
        }

        const { error: driverError } = await supabaseAdmin
          .from("drivers")
          .insert({
            id: newUserId,
            driver_id_number: roleSpecificData.driver_id_number,
            license_number: roleSpecificData.license_number,
            license_expiry_date: roleSpecificData.license_expiry_date,
            assigned_vehicle: roleSpecificData.assigned_vehicle,
            hire_date:
              roleSpecificData.hire_date ||
              new Date().toISOString().split("T")[0],
          });

        if (driverError) {
          console.error("Driver insert error:", driverError);
          return {
            error: `Failed to create driver record: ${driverError.message}`,
          };
        }

        // Handle student assignments if any
        if (
          roleSpecificData.assigned_students &&
          roleSpecificData.assigned_students.length > 0
        ) {
          const driverAssignments = roleSpecificData.assigned_students.map(
            (student_id) => ({
              driver_id: newUserId,
              student_id: student_id,
            })
          );

          const { error: assignmentError } = await supabaseAdmin
            .from("driver_assignments")
            .insert(driverAssignments);

          if (assignmentError) {
            console.error("Driver assignment error:", assignmentError);
            // Don't fail the whole operation, just log it
          }
        }
        break;

      case "parent":
      case "admin":
        // No additional tables to insert into for these roles
        console.log(`${role} profile created successfully.`);
        break;

      default:
        return { error: `Unknown role: ${role}` };
    }

    // 6. Success - revalidate and redirect
    revalidatePath("/dashboard/admin/users");
    return {
      success: true,
      userId: newUserId,
      message: `User ${full_name} created successfully!`,
    };
  } catch (error: any) {
    console.error("Unexpected error in createUser:", error);
    return { error: `An unexpected error occurred: ${error.message}` };
  }
}
