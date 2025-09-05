"use client";

import { useParentsList } from "@/hooks/useParentsList";
import { UserFormData } from "./AddUserForm";

import { useState } from "react";
import { useClassesList } from "@/hooks/useClassesList";

interface StepProps {
  formData: UserFormData;
}

export default function Step3Review({ formData }: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const parents = useParentsList();
  const classes = useClassesList();

  // const handleSubmit = async () => {
  //   setIsLoading(true);
  //   const formDataObj = new FormData();
  //   Object.entries(formData).forEach(([key, value]) => {
  //     if (Array.isArray(value)) {
  //       value.forEach((v) => formDataObj.append(key, v));
  //     } else if (value !== null && value !== undefined) {
  //       formDataObj.append(key, value.toString());
  //     }
  //   });

  //   try {
  //     const result = await createUserAction(formDataObj);
  //     if (result.error) {
  //       alert(`Error: ${result.error}`);
  //     } else {
  //       alert(`User created successfully! User ID: ${result.userId}`);
  //     }
  //   } catch (error) {
  //     alert("An unexpected error occurred");
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const parentName =
    formData.assigned_parents
      ?.map((pid) => parents.find((p) => p.id === pid)?.full_name)
      .filter(Boolean)
      .join(", ") || "Not assigned";

  const className =
    classes.find((c) => c.id === formData.class_id)?.name ||
    "Not assigned";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Review & Create</h2>

      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Account Information</h3>
        <p>
          <strong>Email:</strong> {formData.email}
        </p>
        <p>
          <strong>Full Name:</strong> {formData.full_name}
        </p>
        <p>
          <strong>Phone:</strong> {formData.phone || "Not provided"}
        </p>
        <p>
          <strong>Role:</strong> {formData.role}
        </p>
        {formData.avatar_url && (
          <div className="mt-2">
            <strong>Profile Image:</strong>
            <img
              src={formData.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-full mt-1"
            />
          </div>
        )}
      </div>

      {formData.role === "teacher" && formData.teacher_id_number && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Teacher Details</h3>
          <p>
            <strong>Teacher ID:</strong> {formData.teacher_id_number}
          </p>
          <p>
            <strong>Hire Date:</strong> {formData.hire_date}
          </p>
        </div>
      )}

      {formData.role === "student" && formData.student_id_number && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Student Details</h3>
          <p>
            <strong>Student ID:</strong> {formData.student_id_number}
          </p>
          <p>
            <strong>Date of Birth:</strong> {formData.date_of_birth}
          </p>
          <p>
            <strong>Enrollment Date:</strong> {formData.enrollment_date}
          </p>
          <p>
            <strong>Parent Name:</strong> {parentName || "Not assigned"}
          </p>
          <p>
            <strong>Class Name:</strong> {className || "Not assigned"}
          </p>
        </div>
      )}

      {formData.role === "driver" && formData.license_number && (
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Driver Details</h3>
          <p>
            <strong>License Number:</strong> {formData.license_number}
          </p>
          <p>
            <strong>License Expiry:</strong> {formData.license_expiry_date}
          </p>
          <p>
            <strong>Assigned Vehicle:</strong>{" "}
            {formData.assigned_vehicle || "Not assigned"}
          </p>
        </div>
      )}

      {/* <div className="flex justify-between mt-6">
        <button
          type="button"
          // onClick={handleSubmit}
          className="btn btn-success"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create User"}
        </button>
      </div> */}
    </div>
  );
}
