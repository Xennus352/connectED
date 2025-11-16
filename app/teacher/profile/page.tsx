"use client";
import LoadingCard from "@/components/ui/LoadingCard";
import UserProfileCard from "@/components/ui/UserProfileCard";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import React, { useEffect, useState } from "react";

const TeacherProfile = () => {
  // current user information
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) {
        setUserData(data);
      }
    })();
  }, []);

  if (!userData)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingCard />
      </div>
    );

  // destructure profile for easier access
  const profile = userData.profile;
  const students = userData.students;

  return (

    <div>
      <UserProfileCard profile={profile} students={students} />
    </div>
  );
};

export default TeacherProfile;
