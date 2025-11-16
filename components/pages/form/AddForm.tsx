"use client";

import { useState } from "react";
import { UserFormData } from "./AddUserForm";
import Step1Identity from "./Step1Identity";
import Step2RoleDetails from "./Step2RoleDetails";
import Step3Review from "./Step3Review";
import MultiStepFormContainer from "../../ui/MultiStepFormContainer";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function AddForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    avatar_url: "", // Added profile image field
    role: null,
    teacher_id_number: "",
    hire_date: new Date().toISOString().split("T")[0],
    assigned_classes: "",
    student_id_number: "",
    date_of_birth: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    class_id: "",
    assigned_parents: [],
    driver_id_number: "",
    license_number: "",
    license_expiry_date: "",
    assigned_vehicle: "",
    assigned_students: [],
  });

  const updateFormData = (newData: Partial<UserFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const steps = [
    <Step1Identity
      key="step1"
      formData={formData}
      updateFormData={updateFormData}
    />,
    <Step2RoleDetails
      key="step2"
      formData={formData}
      updateFormData={updateFormData}
    />,
    <Step3Review key="step3" formData={formData} />,
  ];

  const stepLabels = ["Identity", "Role & Details", "Review"];

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formDataObj.append(key, v));
      } else if (value !== null && value !== undefined) {
        formDataObj.append(key, value.toString());
      }
    });

    try {
      // Import and call the server action
      const { createUser } = await import("../../../actions/createUser");
      const result = await createUser(formDataObj);

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
       // alert(`User created successfully! User ID: ${result.userId}`);
        // Show toast only for the latest one
       
              Swal.fire({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                icon: "info",
                title: `${result.message}`,
                width: 250,
                padding: "0.5rem",
              });
        //  Reset the form after successful submission
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          full_name: "",
          phone: "",
          avatar_url: "",
          role: null,
          teacher_id_number: "",
          hire_date: new Date().toISOString().split("T")[0],
          assigned_classes: "",
          student_id_number: "",
          date_of_birth: "",
          enrollment_date: new Date().toISOString().split("T")[0],
          class_id: null,
          assigned_parents: [],
          driver_id_number: "",
          license_number: "",
          license_expiry_date: "",
          assigned_vehicle: "",
          assigned_students: [],
        });
        router.refresh();
      }
    } catch (error) {
      alert("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>
      <MultiStepFormContainer
        steps={steps}
        onSubmit={handleSubmit}
        stepLabels={stepLabels}
      />
    </div>
  );
}
export default AddForm;
