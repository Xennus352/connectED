"use client";

import { UserFormData } from "./AddUserForm";

interface StepProps {
  formData: UserFormData;
  updateFormData: (data: Partial<UserFormData>) => void;

}

export default function Step1Identity({ formData, updateFormData }: StepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name || formData.password !== formData.confirmPassword) {
      alert("Please fill all required fields and ensure passwords match.");
      return;
    }
   
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">User Identity</h2>
      
      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Email Address *</span>
        </label>
        <input
          type="email"
          className="input input-bordered"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          required
        />
      </div>

      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Password *</span>
        </label>
        <input
          type="password"
          className="input input-bordered"
          value={formData.password}
          onChange={(e) => updateFormData({ password: e.target.value })}
          required
        />
      </div>

      <div className="form-control flex items-center justify-between gap-2 relative">
        <label className="label">
          <span className="label-text">Confirm Password *</span>
        </label>
        <input
          type="password"
          className="input input-bordered"
          value={formData.confirmPassword}
          onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
          required
        />
        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
          <span className="text-error text-sm absolute top-2 right-0">Passwords do not match</span>
        )}
      </div>

      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Full Name *</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={formData.full_name}
          onChange={(e) => updateFormData({ full_name: e.target.value })}
          required
        />
      </div>

      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Phone Number</span>
        </label>
        <input
          type="tel"
          className="input input-bordered"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
        />
      </div>

      <div className="form-control flex items-center justify-between gap-2">
        <label className="label">
          <span className="label-text">Profile Image URL</span>
        </label>
        <input
          type="url"
          className="input input-bordered"
          placeholder="https://example.com/avatar.jpg"
          value={formData.avatar_url}
          onChange={(e) => updateFormData({ avatar_url: e.target.value })}
        />
        {formData.avatar_url && (
          <div className="mt-2">
            <img 
              src={formData.avatar_url} 
              alt="Profile preview" 
              className="w-16 h-16 rounded-full object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* <button type="button" onClick={handleSubmit} className="btn btn-primary mt-4">
        Next
      </button> */}
    </div>
  );
}