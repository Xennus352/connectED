"use client";

import { useParentsList } from "@/hooks/useParentsList";
import { UserFormData } from "./AddUserForm";
import { useClassesList } from "@/hooks/useClassesList";

interface StepProps {
  formData: UserFormData;
  updateFormData: (data: Partial<UserFormData>) => void;
}

export default function Step2RoleDetails({
  formData,
  updateFormData,
}: StepProps) {
  const parents = useParentsList();
  const classes = useClassesList();

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "teacher":
        return (
          <div className="space-y-4">
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Teacher ID Number *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.teacher_id_number}
                onChange={(e) =>
                  updateFormData({ teacher_id_number: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Hire Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={formData.hire_date}
                onChange={(e) => updateFormData({ hire_date: e.target.value })}
                required
              />
            </div>
          </div>
        );

      case "student":
        return (
          <div className="space-y-4">
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Student ID Number *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.student_id_number}
                onChange={(e) =>
                  updateFormData({ student_id_number: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Assign Parent *</span>
              </label>
              <select
                multiple
                defaultValue={formData.assigned_parents || []}
                onChange={(e) =>
                  updateFormData({
                    assigned_parents: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
                className="select h-32 space-y-2"
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Assign Class *</span>
              </label>
              <select
                value={formData.class_id || ""}
                onChange={(e) =>
                  updateFormData({
                    class_id: e.target.value,
                  })
                }
                className="select "
              >
                <option value=''  disabled={true}>Select a class</option>

                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Date of Birth *</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={formData.date_of_birth}
                onChange={(e) =>
                  updateFormData({ date_of_birth: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Enrollment Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={formData.enrollment_date}
                onChange={(e) =>
                  updateFormData({ enrollment_date: e.target.value })
                }
                required
              />
            </div>
          </div>
        );

      case "driver":
        return (
          <div className="space-y-4">
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">License Number *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.license_number}
                onChange={(e) =>
                  updateFormData({ license_number: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">License Expiry Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={formData.license_expiry_date}
                onChange={(e) =>
                  updateFormData({ license_expiry_date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control flex items-center justify-between gap-2">
              <label className="label">
                <span className="label-text">Assigned Vehicle</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.assigned_vehicle}
                onChange={(e) =>
                  updateFormData({ assigned_vehicle: e.target.value })
                }
                placeholder="e.g., Bus 12 or License Plate"
              />
            </div>
          </div>
        );

      default:
        return (
          <p className="text-gray-500">
            No additional information required for {formData.role}.
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Role & Details</h2>

      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Role *</span>
        </label>
        <select
          className="select select-bordered"
          value={formData.role || ""}
          onChange={(e) =>
            updateFormData({
              role: e.target.value as UserFormData["role"],
              // Reset role-specific fields when role changes
              teacher_id_number: "",
              student_id_number: "",
              license_number: "",
              license_expiry_date: "",
              assigned_vehicle: "",
            })
          }
          required
        >
          <option value="">Select a Role</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
        </select>
      </div>

      {formData.role && renderRoleSpecificFields()}

      {/* <div className="flex justify-between mt-6">
        <button type="button" onClick={prevStep} className="btn btn-secondary">
          Back
        </button>
        <button type="button" onClick={nextStep} className="btn btn-primary">
          Next
        </button>
      </div> */}
    </div>
  );
}
