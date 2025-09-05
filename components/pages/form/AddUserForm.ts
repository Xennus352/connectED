export type UserFormData = {
  // Step 1
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  avatar_url: string; // Added profile image URL field
  // Step 2
  role: 'teacher' | 'student' | 'parent' | 'admin' | 'driver' | null;
  // Teacher specific
  teacher_id_number: string;
  hire_date: string;
  assigned_classes: string;
  // Student specific
  student_id_number: string;
  date_of_birth: string;
  enrollment_date: string;
  class_id: string | null;
  assigned_parents: string[];
  // Driver specific
  driver_id_number: string;
  license_number: string;
  license_expiry_date: string;
  assigned_vehicle: string;
  assigned_students: string[];
};