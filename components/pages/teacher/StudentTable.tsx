"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/types";
import Image from "next/image";

interface TeacherAssignedClass {
  id: string;
  name: string;
  academic_year: string;
}

interface StudentsTableProps {
  searchTerm?: string;
  teacherAssignedClasses: TeacherAssignedClass[];
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  searchTerm = "",
  teacherAssignedClasses,
}) => {
  const supabase = createClient();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);

  const assignedClassIds = teacherAssignedClasses.map((t) => t.id);

  // Fetch students only in teacher-assigned classes
  const fetchStudents = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from("students")
        .select("*")
        .in("class_id", assignedClassIds)
        .order("student_id_number");

      if (error) throw error;

      const enrichedStudents = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: classData } = await supabase
            .from("classes")
            .select("name")
            .eq("id", student.class_id)
            .single();

          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, username, phone")
            .eq("id", student.id)
            .single();

          const { data: parentsData } = await supabase
            .from("student_parents")
            .select("parent_id, relationship")
            .eq("student_id", student.id);

          const parentsWithProfiles = await Promise.all(
            (parentsData || []).map(async (pr) => {
              const { data: parentProfile } = await supabase
                .from("profiles")
                .select("full_name, id")
                .eq("id", pr.parent_id)
                .single();
              return parentProfile ? { ...pr, ...parentProfile } : null;
            })
          );

          return {
            ...student,
            class: classData || { name: "No Class" },
            profile: profileData || {
              full_name: "Unknown",
              avatar_url: null,
              username: "",
              phone: "",
            },
            parents: parentsWithProfiles.filter(Boolean),
          };
        })
      );

      setStudents(enrichedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [teacherAssignedClasses]);

  // Filter students by search term
  const filteredStudents = students.filter(
    (s) =>
      s.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) console.error(error);
    else setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-pin-rows">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.length > 0 ? (
            currentStudents.map((student, index) => (
              <tr
                key={student.id}
                className="cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <td>{indexOfFirst + index + 1}</td>
                <td>{student.profile.full_name}</td>
                <td>{student.class.name}</td>
                <td className="flex flex-col gap-2">
                  <button
                    className="btn btn-sm btn-outline btn-warning rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStudent(student);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-error rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(student.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-gray-500">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

      {/* View Student Modal */}
      {selectedStudent && (
        <dialog className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box">
            <div className="grid grid-cols-2 w-full h-full">
              <div>
                <Image
                  className="avatar"
                  width={170}
                  height={170}
                  alt={selectedStudent.profile.full_name}
                  src={
                    selectedStudent.profile.avatar_url || "/default-avatar.png"
                  }
                />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  {selectedStudent.profile.full_name}
                </h3>
                <p>
                  <strong>Class:</strong> {selectedStudent.class.name}
                </p>
                <p>
                  <strong>Student ID:</strong>{" "}
                  {selectedStudent.student_id_number}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {selectedStudent.date_of_birth}
                </p>
                <p>
                  <strong>Enrollment Date:</strong>{" "}
                  {selectedStudent.enrollment_date}
                </p>
                <p>
                  <strong>Parents:</strong>{" "}
                  {selectedStudent.parents.length > 0
                    ? selectedStudent.parents
                        .map((p: Profile) => p.full_name)
                        .join(", ")
                    : "No parents assigned"}
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <dialog
          id="edit_user_modal"
          className="modal modal-bottom sm:modal-middle"
          open
        >
          <form
            className="modal-box"
            onSubmit={async (e) => {
              e.preventDefault();
              const fullName = (
                document.getElementById("edit_fullname") as HTMLInputElement
              ).value;
              const username = (
                document.getElementById("edit_username") as HTMLInputElement
              ).value;
              const phone = (
                document.getElementById("edit_phone") as HTMLInputElement
              ).value;
              const studentIdNumber = (
                document.getElementById("edit_student_id") as HTMLInputElement
              ).value;
              const dateOfBirth = (
                document.getElementById("edit_dob") as HTMLInputElement
              ).value;
              const enrollmentDate = (
                document.getElementById("edit_enrollment") as HTMLInputElement
              ).value;

              // Update profile (user data)
              const { error: profileError } = await supabase
                .from("profiles")
                .update({ full_name: fullName, username, phone })
                .eq("id", editingStudent.id);

              // Update student data
              const { error: studentError } = await supabase
                .from("students")
                .update({
                  student_id_number: studentIdNumber,
                  date_of_birth: dateOfBirth,
                  enrollment_date: enrollmentDate,
                })
                .eq("id", editingStudent.id);

              if (profileError || studentError) {
                console.error("Update error:", profileError || studentError);
              } else {
                setStudents((prev) =>
                  prev.map((s) =>
                    s.id === editingStudent.id
                      ? {
                          ...s,
                          profile: {
                            ...s.profile,
                            full_name: fullName,
                            username,
                            phone,
                          },
                          student_id_number: studentIdNumber,
                          date_of_birth: dateOfBirth,
                          enrollment_date: enrollmentDate,
                        }
                      : s
                  )
                );
              }

              setEditingStudent(null);
            }}
          >
            <h3 className="font-bold text-lg mb-4">Edit Student</h3>

            <div className="space-y-3">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Full Name</legend>
                <input
                  id="edit_fullname"
                  defaultValue={editingStudent.profile?.full_name}
                  className="input input-bordered w-full"
                  placeholder="Full Name"
                  required
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Username</legend>
                <input
                  id="edit_username"
                  defaultValue={editingStudent.profile?.username}
                  className="input input-bordered w-full"
                  placeholder="Username"
                  required
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Phone</legend>
                <input
                  id="edit_phone"
                  defaultValue={editingStudent.profile?.phone}
                  className="input input-bordered w-full"
                  placeholder="Phone"
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Student ID</legend>
                <input
                  id="edit_student_id"
                  defaultValue={editingStudent.student_id_number}
                  className="input input-bordered w-full"
                  placeholder="Student ID"
                  required
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Date of Birth</legend>
                <input
                  id="edit_dob"
                  type="date"
                  defaultValue={editingStudent.date_of_birth}
                  className="input input-bordered w-full"
                  placeholder="Date of Birth"
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Enrollment Date</legend>
                <input
                  id="edit_enrollment"
                  type="date"
                  defaultValue={editingStudent.enrollment_date}
                  className="input input-bordered w-full"
                  placeholder="Enrollment Date"
                />
              </fieldset>
            </div>

            <div className="modal-action mt-4">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditingStudent(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default StudentsTable;
