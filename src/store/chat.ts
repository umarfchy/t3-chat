import { create } from "zustand";

// internal imports
import type { Chat, Message, User } from "@prisma/client";

type ChatWithParticipants = Chat & { participants?: User[] };

// export type TChat = {
//   id: string;
//   channel: string;
//   participants: string[];
// };

// export type TMessage = {
//   type: "chat-message" | "notification";
//   senderId: string;
//   text: string;
//   chatRoomId: string;
// };

export type TChatStore = {
  messages: Message[];
  // notifications: Message[];
  selectedChat: ChatWithParticipants | null;
  setMessages: (messages: Message[]) => void;
  // setNotifications: (notifications: Message[]) => void;
  setSelectedChat: (chat: ChatWithParticipants) => void;
  clearChatHistory: () => void;
};

export const useChat = create<TChatStore>((set) => ({
  messages: [],
  notifications: [],
  selectedChat: null,
  setMessages: (messages) => set({ messages }),
  // setNotifications: (notifications) => set({ notifications }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  clearChatHistory: () =>
    set({
      messages: [],
      //  notifications: [],
      selectedChat: null,
    }),
}));
