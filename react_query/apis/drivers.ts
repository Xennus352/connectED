import axios from "@/axios.config";

// Create new driver from UI
export const createDriver = async (driverData: {
  name: string;
  phone: string;
  address: string;
  vehicleNo: string;
  nrcNumber?: string;
  licenseNumber?: string;
  email: string;
  password: string;
  profileImage?: File; // optional
}) => {
  const URL = "/api/drivers"; // Endpoint for creating driver with auth

  try {
    const formData = new FormData();
    formData.append("Name", driverData.name);
    formData.append("Phone", driverData.phone);
    formData.append("Address", driverData.address);
    formData.append("VehicleNo", driverData.vehicleNo);

    if (driverData.nrcNumber) {
      formData.append("NrcNumber", driverData.nrcNumber);
    }
    if (driverData.licenseNumber) {
      formData.append("LicenseNumber", driverData.licenseNumber);
    }

    formData.append("Email", driverData.email);
    formData.append("Password", driverData.password);

    if (driverData.profileImage) {
      formData.append("ProfileImage", driverData.profileImage);
    }

    const response = await axios.post(URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Return the created driver data
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
  }
};

// Get all drivers
export const getDrivers = async () => {
  const URL = "/api/drivers";

  try {
    const response = await axios.get(URL);
    return response.data ?? [];
  } catch (error: any) {
    throw new Error(`Error during request: ${error.message}`);
  }
};
