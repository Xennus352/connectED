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
  const tabContent = [
    {
      label: "💭 Events",
      content: <EventList />,
    },
    {
      label: "📚 Homeworks ",
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
        <Tabs tabs={tabContent} defaultIndex={0} />
      </div>
    </div>
  );
};

export default ParentPage;
