// 🔹 Base Auth table (only login info)
export interface Auth {
  id: number;
  email: string;
  password: string;
  role: "Student" | "Teacher" | "Parent" | "Driver" | "Admin";
}

// 🔹 Teacher specific data
export interface Teacher {
  id: number;
  authId: number;
  auth: Auth;
  name: string;
  email: string; // convenience copy
  phone: string;
  address: string;
  qualification: string;
  subject: string;
  experienceYears: number;
  profileImage: string | null;
  profileImageUrl: string | null;
}

// 🔹 Parent specific data
export interface Parent {
  id: number;
  authId: number;
  auth: Auth;
  name: string;
  email: string;
  phone: string;
  address: string;
  relation: string;
  occupation: string;
  childrenCount: number;
  profileImage: string | null;
  profileImageUrl: string | null;
}

// 🔹 Student specific data
export interface Student {
  id: number;
  authId: number;
  auth: Auth;
  name: string;
  class: string; // e.g., "Class 1"
  rank: string;
  parentId: number;
  parent?: Parent | null;
  enrollmentDate: string; // ISO string
  status: string; // Active | Graduated | Suspended
  attendances?: string | null;
  profileImage: string | null;
  profileImageUrl: string | null;
}

// 🔹 Driver specific data
export interface Driver {
  id: number;
  authId: number;
  auth: Auth;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleNo: string;
  nrcNumber?: string | null;
  licenseNumber?: string | null;
  profileImage: string | null;
  profileImageUrl: string | null;
}

// 🔹 Chat system
export interface Message {
  id: number;
  chatRoomId: number;
  senderId: number;
  messageText: string;
  content_type: "text" | "image"; // extend later if needed
  timestamp: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  isGroup: boolean;
  createdByAuthId: number;
}

export type User = Teacher | Parent | Student | Driver ;
