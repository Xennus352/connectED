"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import Swal from "sweetalert2";

import { CircleUserRound, House, Mail } from "lucide-react";
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
const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = usePathname();
  const buttonsRef = useRef<HTMLButtonElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const supabase = createClient();

  const fetchActivities = async () => {
    const [eventsRes, homeworksRes] = await Promise.all([
      supabase.from("events").select("id, title, description, created_at"),
      supabase.from("homeworks").select("id, title, description, created_at"),
    ]);

    const allActivities: Activity[] = [
      ...(eventsRes.data?.map((e) => ({
        id: e.id,
        type: "event" as const,
        title: e.title,
        description: e.description,
        created_at: e.created_at,
      })) || []),
      ...(homeworksRes.data?.map((h) => ({
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

    // Find the newest activity
    const newest = latest.find(
      (act) => !activities.some((prev) => prev.id === act.id)
    );

    if (newest) {
      setHasNewNotification(true);

      // Show toast only for the latest one
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: "info",
        title: `New notifications arrive!`,
        width: 250,
        padding: "0.5rem",
      });
    }

    // Update state
    const updated = latest.map((act) => ({
      ...act,
      isNew: act.id === newest?.id,
    }));

    setActivities(updated);
  };

  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel("activities")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          console.log("New event:", payload.new);
          fetchActivities();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "homeworks" },
        (payload) => {
          console.log("New homework:", payload.new);
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const tabs = [
    { label: "Home", path: "/student", icon: <House /> },
    { label: "Contact", path: "/student/message", icon: <Mail /> },
    { label: "Profile", path: "/student/profile", icon: <CircleUserRound /> },
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.path === pathName);
    if (
      activeIndex !== -1 &&
      indicatorRef.current &&
      buttonsRef.current[activeIndex]
    ) {
      const btn = buttonsRef.current[activeIndex];
      const { offsetLeft, offsetWidth } = btn;

      gsap.to(indicatorRef.current, {
        x: offsetLeft,
        width: offsetWidth,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [pathName]);
  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="h-full w-full">{children}</div>
      <div>
        <div className="dock dock-xl relative">
          {tabs.map((tab, i) => (
            <button
              key={tab.path}
              ref={(el) => {
                if (el) buttonsRef.current[i] = el;
              }}
              onClick={() => router.push(tab.path)}
              className="relative px-4 py-2"
            >
              <div>{tab.icon}</div>
              <span className="dock-label">{tab.label}</span>
            </button>
          ))}
          {/* Indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-1 bg-blue-500 rounded"
            style={{ width: 0, left: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
