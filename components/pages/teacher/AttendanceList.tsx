"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface AttendanceListProps {
  searchTerm: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ searchTerm = "" }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;

  const today = new Date().toISOString().split("T")[0];

  const fetchStudents = async () => {
    setLoading(true);

    //  Get logged-in teacher profile
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "teacher") {
      setStudents([]);
      setLoading(false);
      return;
    }

    //  Get teacher’s assigned classes
    const { data: teacherClasses } = await supabase
      .from("teacher_classes")
      .select("class_id")
      .eq("teacher_id", profile.id);

    if (!teacherClasses || teacherClasses.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const classIds = teacherClasses.map((tc) => tc.class_id);

    //  Fetch students
    const { data: studentsData, error } = await supabase
      .from("students")
      .select(
        `
        id,
        student_id_number,
        class_id,
        profiles (
          full_name,
          avatar_url
        ),
        classes (
          name
        ),
        attendances (
          id,
          status,
          date
        )
      `
      )
      .in("class_id", classIds);

    if (error) {
      console.error("Error fetching students:", error.message);
      setStudents([]);
    } else {
      // Map today's attendance status
      const studentsWithStatus = (studentsData || []).map((s) => {
        const todayAttendance = s.attendances?.find(
          (a: any) => a.date === today
        );
        return { ...s, todayStatus: todayAttendance?.status || null };
      });
      setStudents(studentsWithStatus);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);
  // Filtering
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();

    const fullName = (student.profiles?.full_name || "").toLowerCase();
    const className = (student.classes?.name || "").toLowerCase();

    // return true if either name or class matches the search term
    return fullName.includes(term) || className.includes(term);
  });

  // Pagination
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Select / Unselect
  const toggleSelect = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = currentStudents.map((s) => s.id);
    if (ids.every((id) => selectedStudents.includes(id))) {
      setSelectedStudents((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedStudents((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // Mark attendance with upsert
  const markAttendance = async (status: "present" | "absent") => {
    if (selectedStudents.length === 0)
      return console.log("Select students first!");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const rows = students
      .filter((s) => selectedStudents.includes(s.id))
      .map((s) => ({
        student_id: s.id,
        class_id: s.class_id,
        date: today,
        status,
        noted_by: profile.id,
      }));

    const { error } = await supabase
      .from("attendances")
      .upsert(rows, { onConflict: "student_id,date,class_id" });

    if (error) {
      console.error(error);
      console.log("Error saving attendance");
    } else {
      console.log(`Marked ${status} for ${rows.length} students`);
      setSelectedStudents([]);
      fetchStudents(); // Refresh statuses
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={
                    currentStudents.length > 0 &&
                    currentStudents.every((s) =>
                      selectedStudents.includes(s.id)
                    )
                  }
                  onChange={toggleSelectAll}
                />
              </label>
            </th>
            <th>Name</th>
            <th>Class</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center">
                Loading...
              </td>
            </tr>
          ) : currentStudents.length > 0 ? (
            currentStudents.map((student) => (
              <tr key={student.id}>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelect(student.id)}
                    />
                  </label>
                </th>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src={
                            student.profiles?.avatar_url ||
                            "/default-avatar.png"
                          }
                          alt={student.profiles?.full_name}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">
                        {student.profiles?.full_name || "No Name"}
                      </div>
                      <div className="text-sm opacity-50">
                        {student.classes?.name || "No Class"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{student.classes?.name || "No Class"}</td>
                <td className="uppercase">
                  {student.todayStatus || "Not marked"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          className="btn btn-sm btn-outline btn-success rounded-lg"
          onClick={() => markAttendance("present")}
        >
          Mark Present
        </button>
        <button
          className="btn btn-sm btn-outline btn-error rounded-lg"
          onClick={() => markAttendance("absent")}
        >
          Mark Absent
        </button>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-sm btn-outline btn-primary rounded-lg"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline btn-primary rounded-lg"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AttendanceList;
