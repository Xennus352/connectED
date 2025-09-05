"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date?: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

const EventList: React.FC = () => {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultProfile = {
    full_name: "Unknown",
    avatar_url: "/default-avatar.png",
  };

  // Fetch initial events
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          event_date,
          assigned_by:profiles (
            full_name,
            avatar_url
          )
        `)
        .order("event_date", { ascending: true });

      if (error) throw error;

      const mappedEvents: Event[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        event_date: item.event_date,
        profile: item.assigned_by || defaultProfile, // assigned_by is an object, not array
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Realtime subscription
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload: any) => {
          const mapToEvent = (data: any): Event => ({
            id: data.id,
            title: data.title,
            description: data.description,
            event_date: data.event_date,
            profile: data.assigned_by || defaultProfile,
          });

          if (payload.eventType === "INSERT") {
            setEvents((prev) => [mapToEvent(payload.new), ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === payload.new.id ? mapToEvent(payload.new) : e
              )
            );
          } else if (payload.eventType === "DELETE") {
            setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <p>Loading events...</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {events.length > 0 ? (
        events.map((event) => (
          <div
            key={event.id}
            className="card bg-base-100 shadow-md p-4 flex flex-col gap-2 transition-transform hover:scale-105 hover:shadow-lg w-full"
          >
            <h3 className="font-semibold text-lg truncate">{event.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-3">
              {event.description || "No description"}
            </p>

            <p className="text-sm text-gray-500">
              <span className="font-medium">Date:</span>{" "}
              {event.event_date
                ? new Date(event.event_date).toLocaleDateString()
                : "N/A"}
            </p>

            <div className="flex items-center mt-2 gap-2">
              <img
                src={event.profile?.avatar_url || defaultProfile.avatar_url}
                alt={event.profile?.full_name || defaultProfile.full_name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-300">
                {event.profile?.full_name || defaultProfile.full_name}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-8 col-span-full">
          No events found
        </p>
      )}
    </div>
  );
};

export default EventList;
