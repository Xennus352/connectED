"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";

type Student = {
  id: string;
  student_id_number: string;
  full_name: string;
};

type StudentLocationFormValues = {
  student_id: string;
  latitude: number;
  longitude: number;
  address: string;
};

export default function StudentLocationForm() {
  const supabase = createClient();
  const { register, handleSubmit, reset } = useForm<StudentLocationFormValues>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Fetch students list for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_id_number, profiles(full_name)");

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      if (data) {
        setStudents(
          data.map((s: any) => ({
            id: s.id,
            student_id_number: s.student_id_number,
            full_name: s.profiles?.full_name ?? "",
          }))
        );
      }
    };
    fetchStudents();
  }, [supabase]);

  const onSubmit = async (formData: StudentLocationFormValues) => {
    setLoading(true);
    setMessage(null);

    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in as a driver.");
      setLoading(false);
      return;
    }

    // find driver profile
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("id")
      .eq("id", user.id) // assumes drivers.id == auth.users.id
      .single();

    if (driverError || !driver) {
      setMessage("Driver profile not found.");
      setLoading(false);
      return;
    }

    // insert student location
    const { error } = await supabase.from("student_locations").insert({
      student_id: formData.student_id,
      driver_id: driver.id,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address,
    });

    if (error) {
      console.error("Insert error:", error);
      setMessage("Error saving student location.");
    } else {
      setMessage("✅ Student location saved successfully!");
      reset();
    }

    setLoading(false);
  };

  return (
    <div className="p-6 text-white rounded-xl shadow-md ">
      <h2 className="text-xl font-semibold mb-4">Add Student Home Location</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Student dropdown */}
        <div>
          <label className="block text-sm font-medium">Select Student</label>
          <select
            {...register("student_id", { required: true })}
            className="select select-bordered w-full"
          >
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Latitude</label>
          <input
            type="number"
            step="any"
            {...register("latitude", { required: true })}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Longitude</label>
          <input
            type="number"
            step="any"
            {...register("longitude", { required: true })}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            {...register("address")}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <button
          type="submit"
          className={`btn ${loading ? "btn-disabled" : "btn-primary"} rounded-lg w-full`}
        >
          {loading ? "Saving..." : "Save Location"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
