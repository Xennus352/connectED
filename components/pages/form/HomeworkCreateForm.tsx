"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import useFetchCurrentTeacherClassSub from "@/hooks/useFetchCurrentTeacherClassSub";

interface HomeworkCreateFormProps {
  userId: string;
}

export default function HomeworkCreateForm({
  userId,
}: HomeworkCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // current teacher's related classes and subjects
  const [relatedClassSub, setRelatedClassSub] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await useFetchCurrentTeacherClassSub(userId);
      setRelatedClassSub(result);
    };
    loadData();
  }, [userId]);

  console.log(relatedClassSub);
  // Extract unique classes
  const classList = relatedClassSub
    .filter((a) => a.classes) // remove null classes
    .map((a) => ({ id: a.class_id, name: a.classes.name })); // use class_id as key

  // remove duplicates
  const uniqueClassList = classList.filter(
    (cls, index, arr) => arr.findIndex((x) => x.id === cls.id) === index
  );

  // fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("id, name");
      if (error) console.error(error);
      else setClasses(data || []);
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Insert homework
    const { data, error } = await supabase.from("homeworks").insert([
      {
        class_id: selectedClass,
        title,
        description,
        due_date: dueDate,
        assigned_by: userId,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error creating homework:", error.message);
      setMessage("❌ Failed to create homework: " + error.message);
    } else {
      setMessage("✅ Homework created successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 bg-base-200 rounded-xl shadow-md"
    >
      <h2 className="text-lg font-bold">Create Homework</h2>

      <div>
        <label className="label">Title</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="select select-bordered w-full mb-2"
        >
          <option value="">Select Class</option>

          {uniqueClassList.map((cls, index) => (
            <option key={index} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create Homework"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
