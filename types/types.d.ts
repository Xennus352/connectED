// This represents the user object from Supabase Auth
export interface User {
  id: string;
  email?: string;
  // Add other auth properties you might use
}

// The core profile for EVERY user in your app
export interface Profile {
  id: string; // Matches User.id
  username?: string | null;
  full_name: string;
  avatar_url?: string | null;
  role: "student" | "parent" | "teacher" | "admin" | "driver";
  phone?: string | null; // Added based on our discussion
  updated_at?: string; // ISO date string
}

// Use this type when inserting a new profile (e.g., from admin panel)
export type ProfileInsert = Omit<Profile, "id" | "updated_at">;

export interface School {
  id: string;
  name: string;
  address?: string | null;
  phone_number?: string | null;
  created_at?: string;
  created_by?: string; // UUID of the admin who created it
}

export type SchoolInsert = Omit<School, "id" | "created_at">;

export interface Class {
  id: string;
  school_id: string;
  name: string;
  academic_year?: string | null;
  head_teacher_id?: string | null; // UUID from profiles
  created_at?: string;
}

export type ClassInsert = Omit<Class, "id" | "created_at">;

export interface Student {
  id: string; // Matches Profile.id AND User.id
  student_id_number: string;
  date_of_birth?: string | null; // ISO date string
  enrollment_date?: string; // ISO date string
  class_id: string;
  created_at?: string;
}

// For inserting a new student into the 'students' table
// The 'id' comes from the created Profile
export type StudentInsert = Omit<Student, "id" | "created_at">;

export interface Teacher {
  id: string; // Matches Profile.id
  teacher_id_number: string;
  hire_date?: string; // ISO date string
  created_at?: string;
}

export type TeacherInsert = Omit<Teacher, "id" | "created_at">;

export interface Driver {
  id: string; // Matches Profile.id
  driver_id_number?: string | null;
  license_number: string;
  license_expiry_date?: string | null; // ISO date string
  assigned_vehicle?: string | null;
  hire_date?: string; // ISO date string
  created_at?: string;
}

export type DriverInsert = Omit<Driver, "id" | "created_at">;

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relationship?: string | null; // e.g., 'Mother', 'Father', 'Guardian'
}

export type StudentParentInsert = Omit<StudentParent, "id">;

export interface ClassTeacher {
  id: string;
  class_id: string;
  teacher_id: string;
  subject?: string | null;
}

export type ClassTeacherInsert = Omit<ClassTeacher, "id">;

export interface DriverAssignment {
  id: string;
  driver_id: string;
  student_id: string;
  // You can add fields like 'bus_route_number' here later
}

export type DriverAssignmentInsert = Omit<DriverAssignment, "id">;

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string; // ISO date string
  status: "present" | "absent" | "late" | "excused";
  noted_by?: string | null; // UUID of the teacher
}

export type AttendanceInsert = Omit<Attendance, "id">;

export interface Homework {
  id: string;
  class_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null; // ISO date string
  assigned_by: string; // UUID of the teacher
  created_at?: string;
}

export type HomeworkInsert = Omit<Homework, "id" | "created_at">;

export interface Event {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  event_date?: string | null; // ISO date string
  created_by?: string | null; // UUID
  created_at?: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export type EventInsert = Omit<Event, "id" | "created_at">;

export interface Message {
  id: string;
  sender_id: string;
  class_id?: string | null; // For group chats
  recipient_id?: string | null; // For 1-on-1 chats
  content: string;
  created_at?: string;
  sender?: Profile; // Added to match joined data from profiles table
}

export type MessageInsert = Omit<Message, "id" | "created_at">;

// A Student with their Profile info
export interface StudentWithProfile extends Student {
  profile: Pick<Profile, "full_name" | "phone">;
}

// A Parent (Profile) with their linked Students
export interface ParentWithStudents extends Profile {
  students: Array<{
    relationship?: string;
    student: StudentWithProfile;
  }>;
}

// A Driver with their Profile, professional details, and assignments
export interface DriverWithDetails extends Driver, Profile {
  assignments: Array<{
    student: StudentWithProfile;
  }>;
}

// A Class with its head teacher's profile
export interface ClassWithDetails extends Class {
  head_teacher?: Pick<Profile, "full_name">;
  school?: Pick<School, "name">;
}
export interface Subject {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
}

export interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

export interface UserMarker {
  id: string;
  position: [number, number];
  user: {
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  parents: {
    relationship: string;
    full_name: string;
    avatar_url?: string;
  }[];
  lastUpdate: string;
    reached?: boolean;
}


