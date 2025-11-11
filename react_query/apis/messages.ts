import axios from "@/axios.config";

// Interfaces
export interface Message {
  id: number;
  chatRoomId: number;
  senderId: number;
  messageText: string;
  timestamp: string;
}

// Create new chat room
export const createChatRoom = async (roomData: {
  name: string;
  memberIds: number[];
}) => {
  try {
    const response = await axios.post("/api/chatrooms", roomData);
    return response.data; // Created room
  } catch (error: any) {
    throw new Error(`Error creating chat room: ${error.message}`);
  }
};

// Fetch all visible rooms for user
export const getVisibleRooms = async (authId: number) => {
  try {
    const response = await axios.get(`/api/chatrooms/visible/${authId}`);
    return response.data ?? [];
  } catch (error: any) {
    throw new Error(`Error fetching rooms: ${error.message}`);
  }
};

// Fetch messages in a room
export const getMessages = async (roomId: number) => {
  try {
    const response = await axios.get(`/api/chatrooms/${roomId}/messages`);
    return response.data ?? [];
  } catch (error: any) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }
};

// Send message in a room
export const sendMessage = async (messageData: {
  chatRoomId: number;
  senderId: number;
  messageText: string;
}) => {
  try {
    const response = await axios.post(`/api/chatrooms/${messageData.chatRoomId}/messages`, {
      senderId: messageData.senderId,
      text: messageData.messageText,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Error sending message: ${error.message}`);
  }
};
