"use client";
import React, { useEffect, useState } from "react";

import LoadingCard from "@/components/ui/LoadingCard";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import { createClient } from "@/utils/supabase/client";
import StudentsTable from "./StudentTable";

const StudentContainer = ({ searchTerm }: { searchTerm: string }) => {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //  Get current teacher profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data?.profile) setProfile(data.profile);
    })();
  }, []);

  //  Fetch teacher_classes once profile is ready
  useEffect(() => {
    if (!profile?.id) return;

    (async () => {
      try {
        const { data: tClasses, error } = await supabase
          .from("teacher_classes")
          .select("class_id")
          .eq("teacher_id", profile.id);

        if (error) throw error;
        if (!tClasses || tClasses.length === 0) {
          setTeacherClasses([]);
          setLoading(false);
          return;
        }

        const classIds = tClasses.map((tc: any) => tc.class_id).filter(Boolean);
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("id, name, academic_year")
          .in("id", classIds);

        if (classesError) throw classesError;

        setTeacherClasses(classesData || []);
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingCard />
      </div>
    );
  return (
    <div>
      <StudentsTable
        searchTerm={searchTerm}
        teacherAssignedClasses={teacherClasses}
      />
    </div>
  );
};

export default StudentContainer;
