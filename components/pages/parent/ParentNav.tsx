"use client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const ParentNav = () => {
  // current user information
  const [userData, setUserData] = useState<any>(null);

  const [hasNewMessage, setHasNewMessage] = useState<{
    message: any;
    sender: any;
  } | null>(null);
  const supabase = createClient();
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) {
        setUserData(data);
      }
    })();
  }, []);

  console.log(hasNewMessage);
  // destructure profile for easier access
  const profile = userData?.profile;
  const profileId = userData?.profile?.id;
  // Realtime message notification
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`realtime-messages-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const newMsg = payload.new;
          if (newMsg.recipient_id === profile.id) {
            // Get sender profile details
            const { data: sender, error } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("id", newMsg.sender_id)
              .single();

            setHasNewMessage({
              message: newMsg,
              sender: sender || null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

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
            P-{profile.full_name}
          </p>
        </div>
        <div className=" px-2">
          {/*  Show sender name */}
          <div className="relative group cursor-pointer">
            <Bell size={22} />
            {hasNewMessage && (
              <>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                {/* Tooltip */}
                <div
                  className="
                         absolute left-1 -translate-x-1/2 top-8
                         whitespace-nowrap
                         bg-black text-white text-xs px-3 py-1 rounded-lg shadow-lg
                         opacity-0 group-hover:opacity-100
                         scale-95 group-hover:scale-100
                         transition-all duration-200
                       "
                >
                  📩{hasNewMessage?.sender?.full_name.slice(0, 8)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ParentNav;
