"use client";
import React, { useEffect, useState } from "react";
import StatsCard from "../ui/StatsCard";
import { User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Activity = {
  id: string;
  type: "event" | "homework";
  title: string;
  description?: string;
  created_at: string;
  created_by?: string;
  isNew?: boolean;
};

const DashboardContainer = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const supabase = createClient();

  // stats data
  const statsData = [
    { name: "Teachers", percentage: 75, totalUsers: 150, Icon: <User /> },
    { name: "Parents", percentage: 75, totalUsers: 150, Icon: <User /> },
    { name: "Students", percentage: 75, totalUsers: 150, Icon: <User /> },
    { name: "Drivers", percentage: 75, totalUsers: 150, Icon: <User /> },
  ];

  // ---- LocalStorage helpers ----
  const saveActivitiesToLocalStorage = (activities: Activity[]) => {
    const data = {
      timestamp: new Date().getTime(),
      activities,
    };
    localStorage.setItem("recentActivities", JSON.stringify(data));
  };

  const loadActivitiesFromLocalStorage = (): Activity[] => {
    const data = localStorage.getItem("recentActivities");
    if (!data) return [];
    const parsed = JSON.parse(data);
    const now = new Date().getTime();
    if (now - parsed.timestamp < 3600000) {
      // 1 hour
      return parsed.activities;
    }
    return [];
  };

  // fetch recent activities
  const fetchActivities = async () => {
    const [events, homeworks] = await Promise.all([
      supabase.from("events").select("id, title, description, created_at"),
      supabase.from("homeworks").select("id, title, description, created_at"),
    ]);

    const allActivities: Activity[] = [
      ...(events.data?.map((e) => ({
        id: e.id,
        type: "event" as const,
        title: e.title,
        description: e.description,
        created_at: e.created_at,
      })) || []),
      ...(homeworks.data?.map((h) => ({
        id: h.id,
        type: "homework" as const,
        title: h.title,
        description: h.description,
        created_at: h.created_at,
      })) || []),
    ];

    allActivities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latest = allActivities.slice(0, 20);
    setActivities(latest);
    saveActivitiesToLocalStorage(latest);
  };

  // load cached activities on mount
  useEffect(() => {
    const cached = loadActivitiesFromLocalStorage();
    if (cached.length > 0) setActivities(cached);
    else fetchActivities();
  }, []);

  // realtime subscriptions with "NEW" flag
  useEffect(() => {
    const tables = ["events", "homeworks"];
    const channels: any[] = [];

    tables.forEach((table) => {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table },
          (payload) => {
            let activity: Activity;
            switch (table) {
              case "events":
                activity = {
                  id: payload.new.id,
                  type: "event",
                  title: payload.new.title,
                  description: payload.new.description,
                  created_at: payload.new.created_at,
                  isNew: true, // mark as new
                };
                break;
              case "homeworks":
                activity = {
                  id: payload.new.id,
                  type: "homework",
                  title: payload.new.title,
                  description: payload.new.description,
                  created_at: payload.new.created_at,
                  isNew: true,
                };
                break;
            }

            setActivities((prev) => {
              const updated = [activity, ...prev].slice(0, 20);
              saveActivitiesToLocalStorage(updated);

              // remove "NEW" after 10 seconds
              setTimeout(() => {
                setActivities((prev2) =>
                  prev2.map((a) =>
                    a.id === activity.id ? { ...a, isNew: false } : a
                  )
                );
              }, 10000);

              return updated;
            });
          }
        )
        .subscribe();
      channels.push(channel);
    });

    return () => {
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="w-full flex items-center">
        {statsData.map((stat, index) => (
          <div className="flex justify-around gap-3 w-full" key={index}>
            <StatsCard
              name={stat.name}
              percentage={stat.percentage}
              totalUsers={stat.totalUsers}
              Icon={stat.Icon}
            />
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="w-full mt-3 overflow-hidden rounded-lg rounded-t-none border-t p-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        </div>
        <div className="h-96 overflow-y-auto p-2">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`w-full border rounded-xl m-2 h-20 p-2 transition-all ${
                act.isNew ? "bg-green-100" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold">{act.title}</p>
                {act.isNew && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center px-3 mt-2">
                {act.description && (
                  <p className="text-gray-500">{act.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(act.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
