"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import LoadingCard from "@/components/ui/LoadingCard";
import HomeworkCreateForm from "@/components/pages/form/HomeworkCreateForm";

interface Homework {
  id: string;
  class_id: string;
  title: string;
  description: string;
  due_date: string;
  assigned_by: string;
  created_at: string;
  isDone: boolean;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

const AssignmentContainer = () => {
  const supabase = createClient();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // homeworks per page
  const totalPages = Math.ceil(homeworks.length / pageSize);
  const paginatedHomeworks = homeworks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const profileId = profile?.id;

  // Fetch homeworks assigned by current teacher
  const fetchHomeworks = useCallback(async () => {
    if (!profileId) return; // Guard against undefined
    try {
      const { data: homeworksData, error } = await supabase
        .from("homeworks")
        .select("*")
        .eq("assigned_by", profileId)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setHomeworks(homeworksData || []);
      setLoading(false);
    } catch (error) {
      console.error("Supabase error:", error);
      setLoading(false);
    }
  }, [profileId]);

  // Trigger fetch only after profile is loaded
  useEffect(() => {
    if (profile) fetchHomeworks();
  }, [profile, fetchHomeworks]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  // Get current user profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) setProfile(data.profile);
    })();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("homeworks-changes");

    const handleInsert = async (payload: any) => {
      const { data: creator } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", payload.new.assigned_by)
        .single();

      setHomeworks((prev) => [
        { ...payload.new, profiles: creator || { full_name: "Unknown" } },
        ...prev,
      ]);
    };

    const handleUpdate = (payload: any) => {
      const updated = payload.new;
      setHomeworks((prev) =>
        prev.map((hw) => (hw.id === updated.id ? { ...hw, ...updated } : hw))
      );
    };

    const handleDelete = (payload: any) => {
      const deleted = payload.old;
      setHomeworks((prev) => prev.filter((hw) => hw.id !== deleted.id));
    };

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "homeworks" },
      handleInsert
    );
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "homeworks" },
      handleUpdate
    );
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "homeworks" },
      handleDelete
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Delete homework
  const handleDeleteHomework = async (id: string) => {
    const { error } = await supabase.from("homeworks").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
  };

  // Edit homework
  const handleEditHomework = (homework: Homework) => {
    setEditingHomework(homework);
    const modal = document.getElementById(
      "edit_homework_modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };

  // mark home done
  const toggleHomeworkDone = async (id: string) => {
    // Get current value
    const { data, error: fetchErr } = await supabase
      .from("homeworks")
      .select("isDone")
      .eq("id", id)
      .single();

    if (fetchErr) {
      console.error("Fetch error:", fetchErr.message);
      return;
    }

    //Toggle the boolean
    const { error: updateErr } = await supabase
      .from("homeworks")
      .update({ isDone: !data.isDone })
      .eq("id", id);

    if (updateErr) {
      console.error("Toggle error:", updateErr.message);
    }
    fetchHomeworks();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingCard />
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: Create Form */}
      <div>
        <HomeworkCreateForm userId={profile ? profile.id : ""} />
      </div>

      {/* Right: Homeworks Table */}
      <div>
        <div className="overflow-x-auto">
          <table className="table table-pin-rows">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHomeworks.length > 0 ? (
                paginatedHomeworks.map((hw, index) => (
                  <tr key={hw.id} className="hover:bg-base-200">
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="font-semibold">{hw.title}</td>
                    <td>{hw.description}</td>

                    <td>
                      {hw.due_date
                        ? new Date(hw.due_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="flex gap-2">
                      <button
                        onClick={() => handleEditHomework(hw)}
                        className="btn btn-outline rounded-lg btn-sm btn-warning"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHomework(hw.id)}
                        className="btn btn-outline rounded-lg btn-sm btn-error"
                      >
                        Delete
                      </button>
                      <button
                        // disabled={hw.isDone}
                        onClick={() => toggleHomeworkDone(hw.id)}
                        className="btn btn-outline rounded-lg btn-sm btn-success"
                      >
                        {hw.isDone ? "Done" : "Mark"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No homeworks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
      </div>

      {/* Edit Modal */}
      <dialog
        id="edit_homework_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          className="modal-box"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingHomework) return;

            const titleInput = (
              document.getElementById("edit_hw_title") as HTMLInputElement
            ).value;
            const descInput = (
              document.getElementById(
                "edit_hw_description"
              ) as HTMLTextAreaElement
            ).value;
            const dueInput = (
              document.getElementById("edit_hw_due_date") as HTMLInputElement
            ).value;

            const { error } = await supabase
              .from("homeworks")
              .update({
                title: titleInput,
                description: descInput,
                due_date: dueInput,
              })
              .eq("id", editingHomework.id);

            if (error) console.error("Update failed:", error.message);
            else {
              setHomeworks((prev) =>
                prev.map((hw) =>
                  hw.id === editingHomework.id
                    ? {
                        ...hw,
                        title: titleInput,
                        description: descInput,
                        due_date: dueInput,
                      }
                    : hw
                )
              );
            }

            const modal = document.getElementById(
              "edit_homework_modal"
            ) as HTMLDialogElement;
            modal.close();
            setEditingHomework(null);
          }}
        >
          <h3 className="font-bold text-lg mb-2">Edit Homework</h3>
          <input
            id="edit_hw_title"
            defaultValue={editingHomework?.title || ""}
            placeholder="Title"
            className="input input-bordered w-full mb-2"
            required
          />
          <textarea
            id="edit_hw_description"
            defaultValue={editingHomework?.description || ""}
            placeholder="Description"
            className="textarea textarea-bordered w-full mb-2"
            required
          />
          <input
            id="edit_hw_due_date"
            type="date"
            defaultValue={editingHomework?.due_date?.slice(0, 10) || ""}
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
                  "edit_homework_modal"
                ) as HTMLDialogElement;
                modal.close();
                setEditingHomework(null);
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

export default AssignmentContainer;
