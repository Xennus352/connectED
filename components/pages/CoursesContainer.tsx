"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import LoadingCard from "../ui/LoadingCard";
import SubjectCreateForm from "./form/SubjectCreateForm"; 

interface Subject {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
  created_at?: string;
}

const CoursesContainer = () => {
  const supabase = createClient();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // number of subjects per page

  const totalPages = Math.ceil(subjects.length / pageSize);
  const paginatedSubjects = subjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("grade_level", { ascending: true })
      .order("name", { ascending: true });

    if (error) console.error("Error fetching subjects:", error.message);
    else setSubjects(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Get current user profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) setProfile(data.profile);
    })();
  }, []);

  // Realtime subscription
useEffect(() => {
  const channel = supabase
    .channel('subjects_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'subjects',
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        
        // Handle different types of changes with proper typing
        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) {
              // Safely convert to Subject type
              const newSubject: Subject = {
                id: payload.new.id,
                school_id: payload.new.school_id,
                name: payload.new.name,
                grade_level: payload.new.grade_level,
                // Add any other required properties with fallbacks
                created_at: payload.new.created_at || new Date().toISOString(),
                updated_at: payload.new.updated_at || new Date().toISOString(),
                // Handle optional properties
                ...(payload.new.description && { description: payload.new.description }),
                ...(payload.new.teacher_id && { teacher_id: payload.new.teacher_id }),
              };
              setSubjects(prev => [newSubject, ...prev]);
            }
            break;
            
          case 'UPDATE':
            if (payload.new) {
              setSubjects(prev =>
                prev.map(s => {
                  if (s.id === payload.new.id) {
                    // Merge existing subject with updated fields
                    return {
                      ...s,
                      ...payload.new,
                      // Ensure required fields are always present
                      id: payload.new.id || s.id,
                      school_id: payload.new.school_id || s.school_id,
                      name: payload.new.name || s.name,
                      grade_level: payload.new.grade_level || s.grade_level,
                    };
                  }
                  return s;
                })
              );
            }
            break;
            
          case 'DELETE':
            if (payload.old) {
              setSubjects(prev =>
                prev.filter(s => s.id !== payload.old.id)
              );
            }
            break;
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase]);

  // Delete subject
  const handleDeleteSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
  };

  // Edit subject
  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    const modal = document.getElementById("edit_subject_modal") as HTMLDialogElement;
    modal.showModal();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingCard />
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Create Form */}
      <div>
        <SubjectCreateForm schoolId={'e0477d0e-f057-439b-b91f-fb7bfa9a809b'} />
      </div>

      {/* Right: Subjects Table */}
      <div className="overflow-x-auto">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>#</th>
              <th>Subject Name</th>
              <th>Grade Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubjects.length > 0 ? (
              paginatedSubjects.map((subject, index) => (
                <tr key={subject.id} className="hover:bg-base-200">
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="font-semibold">{subject.name}</td>
                  <td>{subject.grade_level}</td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => handleEditSubject(subject)}
                      className="btn btn-outline rounded-lg btn-sm btn-warning"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="btn btn-outline rounded-lg btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-between mt-2">
          <button
            className="btn btn-sm btn-outline btn-primary rounded-lg"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          <span className="self-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline btn-primary rounded-lg"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for editing subject */}
      <dialog id="edit_subject_modal" className="modal modal-bottom sm:modal-middle">
        <form
          method="dialog"
          className="modal-box"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingSubject) return;

            const nameInput = (document.getElementById("edit_subject_name") as HTMLInputElement).value;
            const gradeInput = (document.getElementById("edit_subject_grade") as HTMLInputElement).value;

            const { error } = await supabase
              .from("subjects")
              .update({ name: nameInput, grade_level: gradeInput })
              .eq("id", editingSubject.id);

            if (error) console.error("Update failed:", error.message);
            else
              setSubjects((prev) =>
                prev.map((s) =>
                  s.id === editingSubject.id ? { ...s, name: nameInput, grade_level: gradeInput } : s
                )
              );

            const modal = document.getElementById("edit_subject_modal") as HTMLDialogElement;
            modal.close();
            setEditingSubject(null);
          }}
        >
          <h3 className="font-bold text-lg mb-2">Edit Subject</h3>
          <input
            id="edit_subject_name"
            defaultValue={editingSubject?.name || ""}
            placeholder="Subject Name"
            className="input input-bordered w-full mb-2"
            required
          />
          <input
            id="edit_subject_grade"
            defaultValue={editingSubject?.grade_level || ""}
            placeholder="Grade Level"
            className="input input-bordered w-full mb-4"
            required
          />
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const modal = document.getElementById("edit_subject_modal") as HTMLDialogElement;
                modal.close();
                setEditingSubject(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default CoursesContainer;
