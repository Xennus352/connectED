"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Event } from "@/types/types";
import EventCreateForm from "./form/EventCreateForm";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import LoadingCard from "../ui/LoadingCard";

const EventContainer = () => {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // number of events per page

  const totalPages = Math.ceil(events.length / pageSize);
  const paginatedEvents = events.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch events with creator profile
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        school_id,
        title,
        description,
        event_date,
        created_at,
        created_by,
        profiles:created_by (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error.message);
    } else {
      setEvents(
        (data || []).map((event: any) => ({
          ...event,
          profiles: Array.isArray(event.profiles)
            ? event.profiles[0]
            : event.profiles,
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Current user profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) setProfile(data.profile);
    })();
  }, []);

  // Realtime subscription for INSERT, UPDATE, DELETE
  useEffect(() => {
    const channel = supabase.channel("events-changes");

    const handleInsert = async (payload: any) => {
      const { data: creator } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", payload.new.created_by)
        .single();

      setEvents((prev) => [
        { ...payload.new, profiles: creator || { full_name: "Unknown" } },
        ...prev,
      ]);
    };

    const handleUpdate = (payload: any) => {
      const updated = payload.new;
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updated.id ? { ...ev, ...updated } : ev))
      );
    };

    const handleDelete = (payload: any) => {
      const deleted = payload.old;
      setEvents((prev) => prev.filter((ev) => ev.id !== deleted.id));
    };

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "events" },
      handleInsert
    );
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "events" },
      handleUpdate
    );
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "events" },
      handleDelete
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
  };

  // Edit event
  const handleEditEvent = (event: Event) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {/* Left: Create Form */}
      <div>
        <EventCreateForm
          schoolId="e0477d0e-f057-439b-b91f-fb7bfa9a809b"
          userId={profile ? profile.id : ""}
        />
      </div>

      {/* Right: Events Table */}
      <div>
        <div className="overflow-x-auto">
          <table className="table table-pin-rows">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Event Date</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event, index) => (
                  <tr key={event.id} className="hover:bg-base-200">
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="font-semibold">{event.title}</td>
                    <td>{event.description}</td>
                    <td>
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="flex items-center gap-2">
                      {event.profiles?.avatar_url && (
                        <img
                          src={event.profiles.avatar_url}
                          alt={event.profiles.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      {event.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="btn btn-outline rounded-lg btn-sm btn-warning"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn btn-outline rounded-lg btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No events found
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
              setEvents((prev) =>
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
              "edit_event_modal"
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

export default EventContainer;
