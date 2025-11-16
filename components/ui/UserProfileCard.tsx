import { ParentStudentRelation } from "@/types/Type";
import { Profile } from "@/types/types";
import { useAuth } from "@/utils/supabase/authActions";

import { LogOut } from "lucide-react";
import React from "react";

const UserProfileCard = ({
  profile,
  students,
}: {
  profile: Profile;
  students?: ParentStudentRelation[];
}) => {
  const { signOut } = useAuth();

  return (
    <div className="p-0 overflow-hidden">
      {/* Header with background and profile image */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="absolute -bottom-12 left-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full border-4 border-base-100 shadow-lg">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.full_name}
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-6">
        <div className="text-center mb-2">
          <h3 className="font-bold text-2xl text-base-content">
            {profile.full_name}
          </h3>
          <div className="badge badge-primary badge-lg mt-1 capitalize">
            {profile.role}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex items-center p-3 bg-base-200 rounded-lg">
            <div className="flex-shrink-0 w-8">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content">Full Name</p>
              <p className="text-base-content/80">{profile.full_name}</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-base-200 rounded-lg">
            <div className="flex-shrink-0 w-8">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content">Username</p>
              <p className="text-base-content/80">
                {profile.username || "Not set"}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-base-200 rounded-lg">
            <div className="flex-shrink-0 w-8">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content">Phone</p>
              <p className="text-base-content/80">
                {profile.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-base-200 rounded-lg">
            <div className="flex-shrink-0 w-8">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content">Role</p>
              <p className="text-base-content/80 capitalize">{profile.role}</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-base-200 rounded-lg">
            <div className="flex-shrink-0 w-8">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-base-content">Child</p>
              <div className="text-base-content/80 capitalize">
                {students && students.length > 0
                  ? students.map((item) => (
                      <div key={item.id} className="mb-2">
                        {item.students?.profiles?.full_name} -{" "}
                        {item.students?.classes?.name}
                      </div>
                    ))
                  : "None"}
              </div>
            </div>
          </div>
          {/* sign out button  */}
          <div>
            <button
              onClick={() => {
                signOut();
              }}
              className="btn btn-outline btn-error w-full mt-1 rounded-lg"
            >
              <LogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
