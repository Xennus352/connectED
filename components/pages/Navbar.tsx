"use client";
import { useAuth } from "@/utils/supabase/authActions";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile } from "@/utils/supabase/user";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const supabase = createClient();

type Activity = {
  id: string;
  type: "event" | "homework";
  title: string;
  description?: string;
  created_at: string;
  created_by?: string;
  isNew?: boolean;
};

const Navbar = () => {
  // get current login user
  const [profile, setProfile] = useState<any>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { signOut } = useAuth();

  // Fetch activities
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

    // Mark new activities
    const updated = latest.map((act) => ({
      ...act,
      isNew: !activities.some((prev) => prev.id === act.id),
    }));

    if (updated.some((act) => act.isNew)) setHasNewNotification(true);

    setActivities(updated);
  };

  // Subscribe to realtime events
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

  // get current user profile
  useEffect(() => {
    (async () => {
      const data = await getCurrentUserProfile();
      if (data) setProfile(data.profile);
    })();
  }, []);

  // realtime message notification
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`realtime-messages-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new;

          // ✅ Only mark as new if the message is for the current user
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

  // show dailog modal for profile
  const handleModelShow = () => {
    setShowProfileModal(true);
    const modal = document.getElementById("profile_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <nav>
      <div className="navbar bg-base-100 shadow-sm">
        {/* Title  */}
        <div className="flex-1">
          <Link
            href={"/dashboard/admin"}
            className="cursor-pointer text-3xl font-extrabold  rounded-lg"
          >
            <span
              className="bg-gradient-to-r from-[#56CCF2] to-[#2F80ED] bg-clip-text text-transparent 
          relative inline-block hover:before:w-full hover:before:transition-all hover:before:duration-300 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-[2px] before:bg-[#3273ff] before:transform before:-translate-x-1/2 
          "
            >
              Connect
              <span className="font-bold italic">ED</span>
            </span>
          </Link>
        </div>
        <div className="flex-none">
          {/* actions button  */}
          {/* <button
            onClick={() => setHasNewNotification(false)}
            className="btn relative btn-neutral btn-outline hover:btn-primary text-white rounded-lg mx-2 "
          >
            Notifications
            {hasNewNotification && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping"></span>
            )}
          </button> */}
          <Link
            onClick={() => setHasNewMessage(false)}
            href={"/dashboard/admin/message"}
            className="btn relative btn-neutral btn-outline hover:btn-primary text-white rounded-lg mx-2 "
          >
            Messages
            {hasNewMessage && (
              <span className="badge bg-indigo-400 absolute -top-2 -right-2">
                New
              </span>
            )}
          </Link>
          <Link
            href={"/dashboard/admin/add-user"}
            className="btn  btn-neutral btn-outline hover:btn-primary text-white rounded-lg mx-2 "
          >
            Add new user
          </Link>
          <Link
            href={"/dashboard/admin/map"}
            className="btn  btn-neutral btn-outline hover:btn-primary text-white rounded-lg mx-2 "
          >
            Map
          </Link>
          {/* logout button  */}
          <div
            className="btn btn-outline btn-error rounded-lg mx-2"
            onClick={() => {
              signOut();
            }}
          >
            Logout!
          </div>
          {/* profile part  */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              {/* image section  */}
              <div className="w-10 rounded-full">
                <img
                  alt={profile?.username}
                  src={profile?.avatar_url || "/default-avatar.png"}
                />
              </div>
            </div>
            {/* dropdown content */}
            <ul
              tabIndex={0}
              className="menu menu-lg dropdown-content bg-base-100 rounded-box z-1 mt-3 w-40 p-2 shadow"
            >
              <li>
                <a
                  className="justify-between"
                  onClick={() => handleModelShow()}
                >
                  Profile
                </a>
              </li>
            </ul>
            {showProfileModal && profile && (
              <dialog
                id="profile_modal"
                className="modal modal-bottom sm:modal-middle"
                open={showProfileModal}
              >
                <div className="modal-box p-0 overflow-hidden">
                  {/* Header with background and profile image */}
                  <div className="relative">
                    {/* Background header */}
                    <div className="h-24 bg-gradient-to-r from-primary to-secondary"></div>

                    {/* Profile image */}
                    <div className="absolute -bottom-12 left-6">
                      <div className="avatar">
                        <div className="w-24 h-24 rounded-full border-4 border-base-100 shadow-lg">
                          <img
                            src={profile.avatar_url || "/default-avatar.png"}
                            alt={profile.full_name}
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/default-avatar.png";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-16 px-6">
                    {/* Name and Role */}
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-2xl text-base-content">
                        {profile.full_name}
                      </h3>
                      <div className="badge badge-primary badge-lg mt-1 capitalize">
                        {profile.role}
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center p-3 bg-base-200 rounded-lg">
                        <div className="flex-shrink-0 w-8">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-base-content">
                            Full Name
                          </p>
                          <p className="text-base-content/80">
                            {profile.full_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-base-200 rounded-lg">
                        <div className="flex-shrink-0 w-8">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-base-content">
                            Username
                          </p>
                          <p className="text-base-content/80">
                            {profile.username || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-base-200 rounded-lg">
                        <div className="flex-shrink-0 w-8">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-base-content">
                            Phone
                          </p>
                          <p className="text-base-content/80">
                            {profile.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-base-200 rounded-lg">
                        <div className="flex-shrink-0 w-8">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-base-content">
                            Role
                          </p>
                          <p className="text-base-content/80 capitalize">
                            {profile.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-action p-6 bg-base-200">
                    <button
                      className="btn btn-primary rounded-lg px-8"
                      onClick={() => setShowProfileModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Backdrop click to close */}
                <div
                  className="modal-backdrop"
                  onClick={() => setShowProfileModal(false)}
                >
                  <button>close</button>
                </div>
              </dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
