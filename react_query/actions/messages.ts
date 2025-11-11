import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createChatRoom,
  getVisibleRooms,
  getMessages,
  sendMessage,
  Message,
} from "../apis/messages";

// --- Chat Rooms --- //

// Fetch all visible chat rooms for a user
export const useGetRooms = (authId: number) => {
  return useQuery({
    queryKey: ["rooms", authId],
    queryFn: () => getVisibleRooms(authId),
  });
};

// Create a new chat room
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: () => {
      // Refresh rooms after creating a new one
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

// --- Messages --- //

// Fetch messages for a specific room
export const useGetMessages = (roomId: number) => {
  return useQuery<Message[]>({
    queryKey: ["messages", roomId],
    queryFn: () => getMessages(roomId),
  });
};

// Send a message in a room
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Refresh messages after sending a new one
      queryClient.invalidateQueries({
        queryKey: ["messages", data.chatRoomId],
      });
    },
  });
};
