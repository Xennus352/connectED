"use server";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

function excelDateToJSDate(
  serial: number | string | undefined | null
): string | null {
  if (!serial) return null;
  const maybeDate = new Date(serial);
  if (!isNaN(maybeDate.getTime())) return maybeDate.toISOString().split("T")[0];
  const excelSerial = Number(serial);
  if (isNaN(excelSerial)) return null;
  const utc_days = excelSerial - 25569;
  const utc_value = utc_days * 86400 * 1000;
  const date = new Date(utc_value);
  return date.toISOString().split("T")[0];
}

export async function importUserRow(row: Record<string, any>) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const normalized = {
    email: row.email,
    password: row.password,
    role: row.role,
    full_name: row.full_name || row["full _name"],
    phone: row.phone,
    avatar_url: row.avatar_url,
    // Teacher
    teacher_id_number: row.teacher_id_number,
    hire_date: row.hire_date,
    // Driver
    license_number: row.license_number,
    license_expiry_date: row.license_expiry_date,
    assigned_vehicle: row.assigned_vehicle,
    driver_id_number: row.driver_id_number,
    // Parent
    assigned_students: row.assigned_students,
    // Student
    student_id_number: row.student_id_number,
    date_of_birth: row.date_of_birth,
    enrollment_date: row.enrollment_date,
    class_id: row.class_id,
    assigned_parents: row.assigned_parents,
  };

  if (
    !normalized.email ||
    !normalized.password ||
    !normalized.role ||
    !normalized.full_name
  ) {
    throw new Error("Email, password, role, and full name are required.");
  }

  // 🔹 Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: normalized.email,
      password: normalized.password || "Password@123",
      email_confirm: true,
      user_metadata: {
        role: normalized.role,
        full_name: normalized.full_name,
        phone: normalized.phone,
        avatar_url: normalized.avatar_url,
      },
    });

  if (authError) throw new Error(`Auth creation failed: ${authError.message}`);
  const userId = authData.user?.id;
  if (!userId) throw new Error("User ID not returned from Supabase Auth.");

  // 🔹 Upsert into profiles
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    [
      {
        id: userId,
        username: normalized.email,
        full_name: normalized.full_name,
        avatar_url: normalized.avatar_url,
        role: normalized.role,
      },
    ],
    { onConflict: "id" }
  );
  if (profileError)
    throw new Error(`Profile upsert failed: ${profileError.message}`);

  // 🔹 Insert drivers
  if (normalized.role === "driver") {
    const licenseExpiry = excelDateToJSDate(normalized.license_expiry_date);
    const hireDate =
      excelDateToJSDate(normalized.hire_date) ||
      new Date().toISOString().split("T")[0];
    const driverInsert: any = {
      id: userId,
      license_number: normalized.license_number,
      license_expiry_date: licenseExpiry,
      assigned_vehicle: normalized.assigned_vehicle,
      hire_date: hireDate,
      created_at: new Date().toISOString(),
    };
    if (normalized.driver_id_number)
      driverInsert.driver_id_number = normalized.driver_id_number;
    try {
      const { data, error } = await supabaseAdmin
        .from("drivers")
        .insert([driverInsert])
        .select();
      if (error) throw error;
      console.log("Driver inserted:", data);
    } catch (error: any) {
      console.error("Driver insert failed:", error.message);
    }
  }

  // 🔹 Insert teachers
  if (normalized.role === "teacher") {
    const hireDate =
      excelDateToJSDate(normalized.hire_date) ||
      new Date().toISOString().split("T")[0];
    const teacherInsert: any = {
      id: userId,
      hire_date: hireDate,
      created_at: new Date().toISOString(),
    };
    if (normalized.teacher_id_number)
      teacherInsert.teacher_id_number = normalized.teacher_id_number;
    try {
      const { data, error } = await supabaseAdmin
        .from("teachers")
        .insert([teacherInsert])
        .select();
      if (error) throw error;
      console.log("Teacher inserted:", data);
    } catch (error: any) {
      console.error("Teacher insert failed:", error.message);
    }
  }

  // 🔹 Insert parents
  if (normalized.role === "parent") {
    const parentInsert: any = {
      id: userId,
      created_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabaseAdmin
        .from("parents")
        .insert([parentInsert])
        .select();
      if (error) throw error;
      console.log("Parent inserted:", data);
    } catch (error: any) {
      console.error("Parent insert failed:", error.message);
    }
  }

  // 🔹 Insert students
if (normalized.role === "student") {
  const dob = excelDateToJSDate(normalized.date_of_birth) || "1970-01-01";
  const enrollment = excelDateToJSDate(normalized.enrollment_date) || "1970-01-01";

  const studentInsert: any = {
    id: userId,
    student_id_number: normalized.student_id_number || uuidv4(),
    date_of_birth: dob,
    enrollment_date: enrollment,
    class_id: normalized.class_id || null,
    created_at: new Date().toISOString(),
  };

  // Insert student
  const { data: studentData, error: studentError } = await supabaseAdmin
    .from("students")
    .insert([studentInsert])
    .select();
  if (studentError) throw studentError;
  console.log("Student inserted:", studentData);

  // Connect student to parents using their emails (from profiles)
  if (normalized.assigned_parents) {
    let parentEmails: string[] = [];
    if (Array.isArray(normalized.assigned_parents)) {
      parentEmails = normalized.assigned_parents;
    } else if (typeof normalized.assigned_parents === "string") {
      // Split by comma or semicolon and trim
      parentEmails = normalized.assigned_parents
        .split(/[,;]+/)
        .map(e => e.trim())
        .filter(e => e); // remove empty strings
    }

    if (parentEmails.length > 0) {
      const studentParentInserts: any[] = [];
      console.log("Entered to assigned_parents");

      for (const parentEmail of parentEmails) {
        const { data: parentData, error: parentError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", parentEmail)
          .eq("role", "parent");

        if (parentError) {
          console.warn(`Parent lookup failed for email: ${parentEmail}`);
          continue;
        }

        if (!parentData || parentData.length === 0) {
          console.warn(`Parent not found in profiles: ${parentEmail}`);
          continue;
        }

        const parentId = parentData[0].id;
        studentParentInserts.push({
          student_id: userId,
          parent_id: parentId,
          relationship: "parent",
          created_at: new Date().toISOString(),
        });
      }

      if (studentParentInserts.length > 0) {
        const { data: spData, error: spError } = await supabaseAdmin
          .from("students_parents")
          .insert(studentParentInserts)
          .select();
        if (spError) throw spError;
        console.log("Students-Parents inserted:", spData);
      }
    }
  }
}

return { success: true, userId };
}
