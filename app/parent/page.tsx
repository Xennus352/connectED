"use client";
import AssignmentGuide from "@/components/pages/parent/AssignmentGuide";
import ParentNav from "@/components/pages/parent/ParentNav";
import TrackMyChild from "@/components/pages/parent/TrackMyChild";

import EventList from "@/components/pages/student/EventList";
import Tabs from "@/components/ui/Tabs";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const ParentPage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [hasNewEvents, setHasNewEvents] = useState<number>(0);
  const [hasNewHomework, setHasNewHomework] = useState<number>(0);
const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  const parentId = user?.id;
  // Realtime events notification (hook always called)
  useEffect(() => {
    if (!parentId) return;

    // Subscribe to event inserts
    const channel = supabase
      .channel(`realtime-events-${parentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          const newEvent = payload.new;

          // Since only admins/teachers create events, just mark new events
          setHasNewEvents(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId]);

  // Realtime homeworks notification (hook always called)
  useEffect(() => {
    if (!parentId) return;

    // Subscribe to event inserts
    const channel = supabase
      .channel(`realtime-homeworks-${parentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "homeworks" },
        (payload) => {
          const newEvent = payload.new;

          // Since only teachers create events, just mark new events
          setHasNewHomework(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentId]);

useEffect(() => {
  if (activeTab === 0) setHasNewEvents(0);
  if (activeTab === 1) setHasNewHomework(0);
}, [activeTab]);


  const tabContent = [
    {
      label: (
        <div className="relative">
          💭 Events
          {hasNewEvents > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 animate-pulse bg-red-500 rounded-full"></span>
          )}
        </div>
      ),
      content: <EventList />,
    },
    {
      label: (
        <div className="relative">
          📚 Homeworks
          {hasNewHomework > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 animate-pulse bg-red-500 rounded-full"></span>
          )}
        </div>
      ),
      content: <AssignmentGuide parentId={parentId} />,
    },
    {
      label: "🛰️ Track My Child ",
      content: <TrackMyChild />,
    },
  ];
  return (
    <div>
      <ParentNav />
      {/* content  */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-200px)]">
        <Tabs tabs={tabContent} defaultIndex={0}  onChange={(index) => setActiveTab(index)}/>
      </div>
    </div>
  );
};

export default ParentPage;
