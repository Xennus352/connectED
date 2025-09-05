"use client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bell } from "lucide-react";

const DriverNav = () => {
  const [userData, setUserData] = useState<any>(null);
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);

  const supabase = createClient();

  // Load current user profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) {
        setUserData(data);
      }
    })();
  }, []);

  const profile = userData?.profile;

  // Realtime message notification (hook always called)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`realtime-messages-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.recipient_id === profile.id) {
            setHasNewMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);


  if (!userData)
    return (
      <div className="flex justify-center items-center h-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <nav>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-none px-1">
          <p
            className="bg-gradient-to-r from-[#56CCF2] to-[#2F80ED] bg-clip-text text-transparent 
          relative inline-block hover:before:w-full hover:before:transition-all hover:before:duration-300 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-[2px] before:bg-[#3273ff] before:transform before:-translate-x-1/2 font-bold text-2xl italic cursor-alias"
          >
            {profile.full_name}
          </p>
        </div>
        <div className="flex-1 px-2 ">
          {hasNewMessage && (
            <p className="text-sm animate-pulse flex items-center gap-2">
              {" "}
              <Bell /> New Message arrive!
            </p>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DriverNav;
