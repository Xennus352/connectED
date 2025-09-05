"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; 


export default function EventCreateForm({ schoolId, userId }: { schoolId: string; userId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

 const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("events").insert([
      {
        school_id: schoolId,
        title,
        description,
        event_date: eventDate,
        created_by: userId,
      },
    ]);

    if (error) {
      console.error("Error creating event:", error.message);
      setMessage("❌ Failed to create event: " + error.message);
    } else {
      setMessage("✅ Event created successfully!");
      setTitle("");
      setDescription("");
      setEventDate("");
    }

    setLoading(false);
  };

  

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-base-200 rounded-xl shadow-md">
      <h2 className="text-lg font-bold">Create Event</h2>

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
        <label className="label">Event Date</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Create Event"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
