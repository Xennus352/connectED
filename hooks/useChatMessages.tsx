import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Message, Profile } from "@/types/types";

export function useChatMessages(currentUserId: string, otherUser: Profile) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial conversation
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select(`*, sender:profiles!sender_id(*)`)
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUser.id}),` +
          `and(sender_id.eq.${otherUser.id},recipient_id.eq.${currentUserId})`
      )
      .is("class_id", null)
      .order("created_at", { ascending: true });

    if (!error) setMessages(data || []);
    setLoading(false);
  }, [currentUserId, otherUser.id, supabase]);

  // Real-time subscription
  useEffect(() => {
    fetchMessages(); // initial fetch

    const channel = supabase
      .channel(`chat:${currentUserId}-${otherUser.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (
            newMsg.class_id === null &&
            ((newMsg.sender_id === currentUserId &&
              newMsg.recipient_id === otherUser.id) ||
              (newMsg.sender_id === otherUser.id &&
                newMsg.recipient_id === currentUserId))
          ) {
            setMessages((prev) =>
              prev.some((msg) => msg.id === newMsg.id)
                ? prev
                : [...prev, newMsg]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, currentUserId, otherUser.id, supabase]);

  return { messages, setMessages, loading, fetchMessages };
}
