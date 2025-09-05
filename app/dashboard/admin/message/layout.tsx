"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ChatBox from "./ChatBox";
import Tabs from "@/components/ui/Tabs";
import { Profile } from "@/types/types";

const supabase = createClient();

const roles = ["admin", "teacher", "parent", "student", "driver"] as const;

const MessageLayout = () => {
  const [usersByRole, setUsersByRole] = useState<Record<string, Profile[]>>({});
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch all users by role
  const fetchAllUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      // Group users by role
      const groupedUsers = roles.reduce((acc, role) => {
        acc[role] = data?.filter((user) => user.role === role) || [];
        return acc;
      }, {} as Record<string, Profile[]>);
      
      setUsersByRole(groupedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Real-time subscription for user changes
  useEffect(() => {
    const channel = supabase
      .channel("profiles_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          // Refresh the user list when profiles change
          fetchAllUsers();

          // If the selected user was updated, refresh their data
          if (selectedUser && payload.new && 'id' in payload.new && typeof payload.new.id === 'string' && payload.new.id === selectedUser.id) {
            setSelectedUser(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  const tabItems = roles.map((role) => ({
    label: `${role.charAt(0).toUpperCase() + role.slice(1)}s`,
    content: (
      <div className="p-3 h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : usersByRole[role]?.length > 0 ? (
          <div className="space-y-2">
            {usersByRole[role].map((user) => (
              <div
                key={user.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id 
                    ? "bg-primary/10 border-primary" 
                    : "hover:bg-base-200 border-base-300"
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={user.avatar_url || "/default-avatar.png"}
                        alt={user.full_name}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{user.full_name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user.role}
                      {user.phone && ` • ${user.phone}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-2">👥</div>
            <p>No {role}s found</p>
          </div>
        )}
      </div>
    ),
  }));

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Left: User List */}
      <div className="lg:col-span-1">
        <div className=" rounded-lg border border-base-300 shadow-sm">
          <div className="p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <p className="text-sm text-gray-500">Select a user to chat with</p>
          </div>
          <Tabs
            tabs={tabItems}
            defaultIndex={0}
            onChange={() => setSelectedUser(null)}
          />
        </div>
      </div>

      {/* Right: Chat Area */}
      <div className="lg:col-span-3">
        {selectedUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Chat with {selectedUser.full_name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-sm btn-ghost"
              >
                ← Back to contacts
              </button>
            </div>
            <ChatBox
              currentUserId={currentUser.id}
              otherUser={selectedUser}
            />
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center rounded-lg border border-base-300">
            <div className="text-center text-gray-400 mb-8">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Messages</h3>
              <p>Select a contact from the sidebar to start chatting</p>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Contacts</div>
                <div className="stat-value">
                  {Object.values(usersByRole).reduce((total, users) => total + users.length, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageLayout;