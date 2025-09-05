"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Profile, Message } from "@/types/types";
import {
  playNotificationSound,
  requestNotificationPermission,
  showNotification,
} from "@/components/ui/requestNotificationPermission";

interface ChatBoxProps {
  currentUserId: string;
  otherUser: Profile;
  onClose?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  currentUserId,
  otherUser,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const originalTitleRef = useRef(document.title);

  const supabase = createClient();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setHasNotificationPermission);
  }, []);

  // Update tab title for unread messages
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }

    return () => {
      document.title = originalTitleRef.current;
    };
  }, [unreadCount]);

  // Reset unread count when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUnreadCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch message history
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!sender_id(*)
      `
      )
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUser.id}),` +
          `and(sender_id.eq.${otherUser.id},recipient_id.eq.${currentUserId})`
      )
      .is("class_id", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, [currentUserId, otherUser.id]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert([
      {
        sender_id: currentUserId,
        recipient_id: otherUser.id,
        content: newMessage.trim(),
        class_id: null,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
      // Refetch to ensure we have the latest messages
      fetchMessages();
    }
    setSending(false);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Real-time subscription for new messages
  useEffect(() => {
    //   console.log("Setting up real-time subscription...");
    const channel = supabase
      .channel(`chat:${currentUserId}-${otherUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          //    console.log("Real-time message received:", payload);
          const newMsg = payload.new as Message;

          // Simple check - is this message for our conversation?
          if (
            newMsg.class_id === null &&
            ((newMsg.sender_id === currentUserId &&
              newMsg.recipient_id === otherUser.id) ||
              (newMsg.sender_id === otherUser.id &&
                newMsg.recipient_id === currentUserId))
          ) {
            //  console.log("Message is for our conversation, adding...");

            // Just add the message immediately, fetch sender details in background
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Fetch sender details separately
            const { data: sender } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newMsg.sender_id)
              .single();

            if (sender) {
              // Update the message with sender info
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === newMsg.id ? { ...msg, sender } : msg
                )
              );
              // 🔔 NOTIFICATION: Only notify if message is from other user
              if (newMsg.sender_id !== currentUserId) {
                // Play sound for all new messages from others
                playNotificationSound();

                // Show desktop notification only if tab is not focused
                if (hasNotificationPermission && document.hidden) {
                  showNotification(
                    "New Message",
                    newMsg.content,
                    sender.full_name
                  );
                }

                // Update unread count for tab title
                setUnreadCount((prev) => prev + 1);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        //    console.log("Subscription status:", status);
      });

    return () => {
      //  console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUser.id, supabase, hasNotificationPermission]);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="flex flex-col h-[650px] border rounded-lg bg-base-100">
      {/* Chat Header */}
      <div className="bg-base-200 p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img
                src={otherUser.avatar_url || "/default-avatar.png"}
                alt={otherUser.full_name}
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <div className="font-semibold">{otherUser.full_name}</div>
            <div className="text-sm text-gray-500 capitalize">
              {otherUser.role}
              {otherUser.phone && ` • ${otherUser.phone}`}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-md"></span>
            <span className="ml-2">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet</p>
            <p className="text-sm">
              Start a conversation with {otherUser.full_name}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${
                message.sender_id === currentUserId ? "chat-end" : "chat-start"
              }`}
            >
              {message.sender_id !== currentUserId && (
                <div className="chat-header opacity-70 mb-1">
                  {message.sender?.full_name}
                </div>
              )}
              <div
                className={`chat-bubble ${
                  message.sender_id === currentUserId
                    ? "chat-bubble-primary"
                    : "chat-bubble-base-200"
                }`}
              >
                {message.content}
              </div>
              <div className="chat-footer opacity-50 text-xs mt-1">
                {new Date(message.created_at!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
