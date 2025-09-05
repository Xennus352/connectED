"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface ClassCreateFormProps {
  schoolId: string;
  userId: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

export default function ClassCreateForm({ schoolId, userId }: ClassCreateFormProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [headTeacherId, setHeadTeacherId] = useState<string | "">("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch teachers for dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "teacher");

      if (error) {
        console.error("Error fetching teachers:", error.message);
      } else {
        setTeachers(data || []);
      }
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("classes").insert([
      {
        school_id: schoolId,
        name,
        academic_year: academicYear,
        head_teacher_id: headTeacherId || null,
      },
    ]);

    if (error) {
      console.error("Error creating class:", error.message);
      setMessage("❌ Failed to create class: " + error.message);
    } else {
      setMessage("✅ Class created successfully!");
      setName("");
      setAcademicYear("");
      setHeadTeacherId("");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-base-200 rounded-xl shadow-md">
      <h2 className="text-lg font-bold">Create Class</h2>

      <div>
        <label className="label">Class Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Academic Year</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          placeholder="e.g., 2025-2026"
          required
        />
      </div>

      <div>
        <label className="label">Head Teacher</label>
        <select
          className="select select-bordered w-full"
          value={headTeacherId}
          onChange={(e) => setHeadTeacherId(e.target.value)}
        >
          <option value="">-- Select Head Teacher --</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Create Class"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
