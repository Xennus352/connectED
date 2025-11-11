import axios from "@/axios.config";

// Create new parent from UI
export const createParent = async (ParentData: {
  name: string;
  phone: string;
  address: string;
  occupation: string;
  childrenCount: number;
  relation: string;
  email: string;
  password: string;
  profileImage?: File; // optional
}) => {
  const URL = "/api/parents"; // Endpoint for creating student with auth

  try {
    const formData = new FormData();
    formData.append("Name", ParentData.name);
    formData.append("Phone", ParentData.phone);
    formData.append("Address", ParentData.address);
    formData.append("Email", ParentData.email);
    formData.append("Occupation", ParentData.occupation);
    formData.append("Relation", ParentData.relation);
    formData.append("ChildrenCount", ParentData.childrenCount.toString());
    formData.append("Password", ParentData.password);

    if (ParentData.profileImage) {
      formData.append("ProfileImage", ParentData.profileImage);
    }

    const response = await axios.post(URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Return the created parent data
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
  }
};

// get parent
export const getParent = async () => {
  const URL = "/api/parents"; // Endpoint for creating parent with auth

  try {
    const response = await axios.get(URL);
    return response.data ?? []; // Return the created parent data
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
  }
};
