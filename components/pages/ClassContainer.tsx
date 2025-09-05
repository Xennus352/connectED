"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import LoadingCard from "../ui/LoadingCard";
import ClassCreateForm from "./form/CreateClassForm";

const supabase = createClient();

interface ClassType {
  id: string;
  school_id: string;
  name: string;
  title: string;
  description: string;
  academic_year: string;
  head_teacher_id: string | null;
  head_teacher?: {
    id: string;
    full_name: string;
  };
  created_at?: string;
  event_date?: string;
}

const ClassContainer = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEvent, setEditingEvent] = useState<ClassType | null>(null);

  const pageSize = 4;

  const totalPages = Math.max(1, Math.ceil(classes.length / pageSize));
  const paginatedClasses = classes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        head_teacher:head_teacher_id (id, full_name)
      `
      )
      .order("name", { ascending: true });

    if (error) console.error("Error fetching classes:", error.message);
    else {
      setClasses(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) setProfile(data.profile);
    })();
  }, []);

  // Realtime subscription for classes
  useEffect(() => {
    const channel = supabase
      .channel("classes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classes" },
        (payload: any) => {
          const newClass = payload.new;
          switch (payload.eventType) {
            case "INSERT":
              setClasses((prev) => [newClass, ...prev]);
              break;
            case "UPDATE":
              setClasses((prev) =>
                prev.map((cls) => (cls.id === newClass.id ? newClass : cls))
              );
              break;
            case "DELETE":
              setClasses((prev) =>
                prev.filter((cls) => cls.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Cleanup must be synchronous
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteClass = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
  };

  // Edit event
  const handleEditEvent = (event: ClassType) => {
    setEditingEvent(event); // store the event to edit
    const modal = document.getElementById(
      "edit_event_modal"
    ) as HTMLDialogElement;
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
        <ClassCreateForm
          schoolId={"e0477d0e-f057-439b-b91f-fb7bfa9a809b"}
          userId={profile?.id || ""}
        />
      </div>

      {/* Right: Classes Table */}
      <div className="overflow-x-auto">
        <table className="table table-pin-rows">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Academic Year</th>
              <th>Head Teacher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClasses.length > 0 ? (
              paginatedClasses.map((cls, index) => (
                <tr key={cls.id} className="hover:bg-base-200">
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="font-semibold">{cls.name}</td>
                  <td>{cls.academic_year}</td>
                  <td>{cls.head_teacher?.full_name || "Not assigned"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm btn-warning rounded-lg"
                      onClick={() => handleEditEvent(cls)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="btn btn-outline btn-sm btn-error rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No classes found
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

      {/* Modal for editing event */}
      <dialog
        id="edit_event_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          className="modal-box"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingEvent) return;

            const titleInput = (
              document.getElementById("edit_title") as HTMLInputElement
            ).value;
            const descInput = (
              document.getElementById("edit_description") as HTMLTextAreaElement
            ).value;
            const dateInput = (
              document.getElementById("edit_date") as HTMLInputElement
            ).value;

            const { error } = await supabase
              .from("events")
              .update({
                title: titleInput,
                description: descInput,
                event_date: dateInput,
              })
              .eq("id", editingEvent.id);

            if (error) {
              console.error("Update failed:", error.message);
            } else {
              // Update UI immediately
              setClasses((prev) =>
                prev.map((ev) =>
                  ev.id === editingEvent.id
                    ? {
                        ...ev,
                        title: titleInput,
                        description: descInput,
                        event_date: dateInput,
                      }
                    : ev
                )
              );
            }

            const modal = document.getElementById(
              "edit_class_modal"
            ) as HTMLDialogElement;
            modal.close();
            setEditingEvent(null);
          }}
        >
          <h3 className="font-bold text-lg mb-2">Edit Event</h3>
          <input
            id="edit_title"
            defaultValue={editingEvent?.title || ""}
            placeholder="Title"
            className="input input-bordered w-full mb-2"
            required
          />
          <textarea
            id="edit_description"
            defaultValue={editingEvent?.description || ""}
            placeholder="Description"
            className="textarea textarea-bordered w-full mb-2"
            required
          />
          <input
            id="edit_date"
            type="date"
            defaultValue={editingEvent?.event_date?.slice(0, 10) || ""}
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
                const modal = document.getElementById(
                  "edit_event_modal"
                ) as HTMLDialogElement;
                modal.close();
                setEditingEvent(null);
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

export default ClassContainer;
