"use client";
import React, { useEffect, useState } from "react";
import Tabs from "@/components/ui/Tabs";

import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/types";
import ChatBox from "@/app/dashboard/admin/message/ChatBox";

const TeacherMessage = () => {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  // fetch all users + current user
  useEffect(() => {
    const fetchUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data } = await supabase.from("profiles").select("*");
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  // fetch unread messages count per user
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);

      if (!error && data) {
        const counts: { [key: string]: number } = {};
        data.forEach((msg: any) => {
          counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    };

    fetchUnread();

    // subscribe to new messages realtime
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.recipient_id === currentUserId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // handle opening chat and mark messages as read
  const handleOpenChat = async (user: Profile) => {
    setSelectedUser(user);

    if (!currentUserId) return;

    // mark messages as read in DB
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", user.id)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    // reset unread count locally
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });
  };

  // filter by role
  const renderUserList = (role: string) => {
    const filtered = users.filter(
      (u) => u.role === role && u.id !== currentUserId
    );

    if (filtered.length === 0) {
      return (
        <div className="text-gray-400 p-4 text-center">No {role}s found</div>
      );
    }

    return (
      <div className="grid h-[calc(100vh-200px)] overflow-y-auto gap-2 p-2">
        {filtered.map((u) => (
          <button
            key={u.id}
            onClick={() => handleOpenChat(u)}
            className="flex items-center gap-3 p-2 border rounded-lg hover:bg-base-200 transition relative"
          >
            <div className="avatar relative">
              <div className="w-10 h-10 rounded-full">
                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  alt={u.full_name}
                />
              </div>
              {unreadCounts[u.id] > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 animate-pulse rounded-full"></span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">{u.full_name}</span>
              <span className="text-sm text-gray-500 capitalize">
                {u.role} {u.phone && `• ${u.phone}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const tabItems = [
    { label: "👥 Admins", content: renderUserList("admin") },
    { label: "👥 Teachers", content: renderUserList("teacher") },
    { label: "👥 Parents", content: renderUserList("parent") },
    { label: "👥 Students", content: renderUserList("student") },
    { label: "👥 Drivers", content: renderUserList("driver") },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h3
          className="bg-gradient-to-r from-[#56CCF2] to-[#2F80ED] bg-clip-text text-transparent 
          relative inline-block hover:before:w-full hover:before:transition-all hover:before:duration-300 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-[2px] before:bg-[#3273ff] before:transform before:-translate-x-1/2 font-bold text-2xl italic p-2 mb-2 cursor-alias"
        >
          Contact Lists
        </h3>
        <Tabs tabs={tabItems} defaultIndex={1} />
      </div>

      {/* ChatBox modal style */}
      {selectedUser && currentUserId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="w-[32rem] max-w-full bg-white rounded-xl shadow-lg">
            <ChatBox
              currentUserId={currentUserId}
              otherUser={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMessage;
