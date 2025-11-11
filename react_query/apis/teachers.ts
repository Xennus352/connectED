import axios from "@/axios.config";

// Create new teacher from UI
export const createTeacher = async (teacherData: {
  name: string;
  phone: string;
  address: string;
  subject: string;
  experienceYears: number;
  qualification: string;
  email: string;
  password: string;
  profileImage?: File; // optional
}) => {
  const URL = "/api/teachers"; // Endpoint for creating teacher with auth

  try {
    const formData = new FormData();
    formData.append("Name", teacherData.name);
    formData.append("Phone", teacherData.phone);
    formData.append("Address", teacherData.address);
    formData.append("Subject", teacherData.subject);
    formData.append("ExperienceYears", teacherData.experienceYears.toString());
    formData.append("Qualification", teacherData.qualification);
    formData.append("Email", teacherData.email);
    formData.append("Password", teacherData.password);

    if (teacherData.profileImage) {
      formData.append("ProfileImage", teacherData.profileImage);
    }

    const response = await axios.post(URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Return the created teacher data
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
  }
};

// get teacher
export const getTeacher = async () => {
  const URL = "/api/teachers"; // Endpoint for creating teacher with auth

  try {
    const response = await axios.get(URL);
    return response.data ?? []; // Return the created teacher data
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
    
  }
};
