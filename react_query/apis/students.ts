import axios from "@/axios.config";

export interface StudentData {
  name: string;
  className: string; // Student class
  rank: string;
  
  address: string;
  parentId: number; // Connect student to parent
  enrollmentDate: string; // ISO date string
  status: string;
  email: string;
  password: string;
  attendances?: string; // optional JSON string
  profileImage?: File; // optional
  role: string; // e.g., "student"
}

// Create new student from UI
export const createStudent = async (student: StudentData) => {
  const URL = "/api/students";

  try {
    const formData = new FormData();
    formData.append("Name", student.name);
    formData.append("Class", student.className);
    formData.append("Rank", student.rank);
    if (student.profileImage) {
      formData.append("ProfileImage", student.profileImage);
    }
    formData.append("ParentId", student.parentId.toString());
    formData.append("EnrollmentDate", student.enrollmentDate);
    formData.append("Status", student.status);
    formData.append("Email", student.email);
    formData.append("Password", student.password);

    if (student.attendances) {
      formData.append("Attendances", student.attendances);
    }

    const response = await axios.post(URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Return the created student
  } catch (error: any) {
    throw new Error(`Error creating student: ${error.message}`);
  }
};

// Get all students
export const getStudents = async () => {
  const URL = "/api/students";

  try {
    const response = await axios.get(URL);
    return response.data  ?? []; // Return list of students
  } catch (error: any) {
    throw new Error(`Error fetching students: ${error.message}`);
  }
};
