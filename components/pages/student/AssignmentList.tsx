"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  full_name: string;
  avatar_url?: string;
}

interface Homework {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_by?: Profile;
}

const AssignmentList: React.FC = () => {
  const supabase = createClient();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeworks = async () => {
    try {
      //  Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      //  Find the student's record
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("class_id")
        .eq("id", user.id)
        .single();

      if (studentError || !studentData)
        throw studentError || new Error("Student record not found");

      const classId = studentData.class_id;

      //  Fetch homeworks for the class
      const { data, error } = await supabase
        .from("homeworks")
        .select(
          `
          id,
          title,
          description,
          due_date,
          profiles:profiles!inner(full_name, avatar_url)
        `
        )
        .eq("class_id", classId)
        .order("due_date", { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map((hw: any) => ({
        id: hw.id,
        title: hw.title,
        description: hw.description,
        due_date: hw.due_date,
        assigned_by: hw.profiles
          ? {
              full_name: hw.profiles.full_name,
              avatar_url: hw.profiles.avatar_url,
            }
          : { full_name: "Unknown", avatar_url: "/default-avatar.png" },
      }));

      setHomeworks(formatted);
    } catch (err) {
      console.error("Failed to fetch homeworks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  if (loading) return <p>Loading homeworks...</p>;

  return (
    <div className="grid gap-4">
      {homeworks.length ? (
        homeworks.map((hw) => (
          <div
            key={hw.id}
            className=" shadow-lg rounded-2xl p-5 flex flex-col gap-3 transition-transform transform hover:-translate-y-1 hover:shadow-2xl border border-gray-200"
          >
            {/* Title */}
            <h3 className="font-bold text-xl text-indigo-500 truncate">
              {hw.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-md line-clamp-3">
              {hw.description || "No description"}
            </p>

            {/* Due Date */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-500">
                Due:{" "}
                <span className="text-red-500 font-semibold">
                  {hw.due_date
                    ? new Date(hw.due_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </span>

              {/* Badge for assigned by */}
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                {hw.assigned_by?.full_name || "Unknown"}
              </span>
            </div>

          </div>
        ))
      ) : (
        <p>No homeworks found</p>
      )}
    </div>
  );
};

export default AssignmentList;
