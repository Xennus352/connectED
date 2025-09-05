"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DriverRides() {
  const [driverId, setDriverId] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => {
    getDriverInfo();
  }, []);

  useEffect(() => {
    if (driverId) {
      loadData();
    }
  }, [driverId]);

  const getDriverInfo = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get driver ID based on the logged-in user
      const { data: driver } = await supabase
        .from("drivers")
        .select("id")
        .eq("driver_id_number", user.email || user.id) // Adjust based on your auth setup
        .single();

      if (driver) {
        setDriverId(driver.id);
      }
    } catch (error) {
      console.error("Error getting driver info:", error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get current active ride for this driver
      const { data: activeRide } = await supabase
        .from("rides")
        .select("*")
        .eq("driver_id", driverId)
        .in("status", ["scheduled", "in-progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (activeRide) {
        setCurrentRide(activeRide);

        // Get students assigned to this ride
        const { data: rideStudents } = await supabase
          .from("ride_students")
          .select(
            `
            *,
            student:student_id (
              student_id_number,
              profiles!inner (full_name, avatar_url)
            )
          `
          )
          .eq("ride_id", activeRide.id);

        if (rideStudents) {
          setAssignedStudents(rideStudents);
        }
      }

      // Get all available students (simplified - you might want to filter by location, school, etc.)
      const { data: students } = await supabase
        .from("students")
        .select(
          `
          id,
          student_id_number,
          profiles!inner (full_name, avatar_url)
        `
        )
        .limit(50);

      if (students) {
        setAvailableStudents(students);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewRide = async () => {
    try {
      const { data: ride, error } = await supabase
        .from("rides")
        .insert({
          driver_id: driverId,
          status: "scheduled",
          scheduled_start: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRide(ride);
    } catch (error) {
      console.error("Error creating ride:", error);
      alert("Failed to create new ride");
    }
  };

  const addStudentToRide = async (studentId) => {
    if (!currentRide) {
      alert("Please create a ride first");
      return;
    }

    try {
      const { error } = await supabase.from("ride_students").insert({
        ride_id: currentRide.id,
        student_id: studentId,
        status: "scheduled",
      });

      if (error) throw error;

      // Refresh the assigned students list
      loadData();
    } catch (error) {
      console.error("Error adding student to ride:", error);
      alert("Failed to add student to ride");
    }
  };

  const updateStudentStatus = async (rideStudentId, status) => {
    try {
      const { error } = await supabase
        .from("ride_students")
        .update({ status })
        .eq("id", rideStudentId);

      if (error) throw error;

      // Refresh the assigned students list
      loadData();
    } catch (error) {
      console.error("Error updating student status:", error);
      alert("Failed to update student status");
    }
  };

  const startRide = async () => {
    try {
      const { error } = await supabase
        .from("rides")
        .update({
          status: "in-progress",
          actual_start: new Date().toISOString(),
        })
        .eq("id", currentRide.id);

      if (error) throw error;

      setCurrentRide({ ...currentRide, status: "in-progress" });
    } catch (error) {
      console.error("Error starting ride:", error);
      alert("Failed to start ride");
    }
  };

  const completeRide = async () => {
    try {
      const { error } = await supabase
        .from("rides")
        .update({
          status: "completed",
          actual_end: new Date().toISOString(),
        })
        .eq("id", currentRide.id);

      if (error) throw error;

      setCurrentRide(null);
      setAssignedStudents([]);
    } catch (error) {
      console.error("Error completing ride:", error);
      alert("Failed to complete ride");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Student Ride Management
        </h1>

        {/* Ride Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Ride</h2>

          {!currentRide ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No active ride</p>
              <button
                onClick={createNewRide}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
              >
                Create New Ride
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-600">Ride ID: {currentRide.id}</p>
                  <p className="text-gray-600">
                    Status:
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        currentRide.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : currentRide.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {currentRide.status}
                    </span>
                  </p>
                </div>
                <div className="space-x-2">
                  {currentRide.status === "scheduled" && (
                    <button
                      onClick={startRide}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Start Ride
                    </button>
                  )}
                  {currentRide.status === "in-progress" && (
                    <button
                      onClick={completeRide}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Complete Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Assigned Students */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Assigned Students</h3>
                {assignedStudents.length === 0 ? (
                  <p className="text-gray-500">
                    No students assigned to this ride yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedStudents.map((rideStudent) => (
                      <div
                        key={rideStudent.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">
                            {rideStudent.student.profiles.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ID: {rideStudent.student.student_id_number}
                          </p>
                          <p className="text-sm">
                            Status:
                            <span
                              className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                rideStudent.status === "scheduled"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : rideStudent.status === "picked-up"
                                  ? "bg-blue-100 text-blue-800"
                                  : rideStudent.status === "dropped-off"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {rideStudent.status}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-2">
                          {rideStudent.status === "scheduled" && (
                            <button
                              onClick={() =>
                                updateStudentStatus(rideStudent.id, "picked-up")
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {rideStudent.status === "picked-up" && (
                            <button
                              onClick={() =>
                                updateStudentStatus(
                                  rideStudent.id,
                                  "dropped-off"
                                )
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Mark Dropped Off
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Available Students Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Students</h2>
          {availableStudents.length === 0 ? (
            <p className="text-gray-500">No students available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableStudents.map((student) => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">
                      {student.profiles.full_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ID: {student.student_id_number}
                    </p>
                  </div>
                  <button
                    onClick={() => addStudentToRide(student.id)}
                    disabled={
                      !currentRide ||
                      assignedStudents.some((s) => s.student_id === student.id)
                    }
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
                  >
                    {assignedStudents.some((s) => s.student_id === student.id)
                      ? "Added"
                      : "Add to Ride"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
