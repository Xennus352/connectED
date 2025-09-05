"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface SubjectCreateFormProps {
  schoolId: string;
}

interface Class {
  id: string;
  name: string;
  academic_year: string;
}

export default function SubjectCreateForm({ schoolId }: SubjectCreateFormProps) {
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  // Fetch classes for the dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, academic_year")
        .eq("school_id", schoolId);

      if (error) {
        console.error("Error fetching classes:", error);
      } else {
        setClasses(data || []);
      }
    };

    fetchClasses();
  }, [schoolId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("subjects").insert([
      {
        school_id: schoolId,
        name,
        grade_level: gradeLevel, // This now comes from dropdown selection
      },
    ]);

    if (error) {
      console.error("Error creating subject:", error.message);
      setMessage("❌ Failed to create subject: " + error.message);
    } else {
      setMessage("✅ Subject created successfully!");
      setName("");
      setGradeLevel("");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-base-200 rounded-xl shadow-md">
      <h2 className="text-lg font-bold">Create Subject</h2>

      <div>
        <label className="label">Subject Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Math"
          required
        />
      </div>

      <div>
        <label className="label">Grade Level</label>
        <select
          className="input input-bordered w-full"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          required
        >
          <option value="">Select Grade Level</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.name}>
              {cls.name} ({cls.academic_year})
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Create Subject"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
