import { create } from "zustand";

// internal imports
import type { Chat, Message, Notification, User } from "@prisma/client";

type ChatWithParticipants = Chat & { participants?: User[] };
export type PubSubMessage = Message & { type: "chat-message" | "notification" };

export type TChatStore = {
  messages: Message[];
  chatList: ChatWithParticipants[];
  notifications: Notification[];
  selectedChat: ChatWithParticipants | null;
  setMessages: (messages: Message[]) => void;
  setChatList: (chatList: ChatWithParticipants[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setSelectedChat: (chat: ChatWithParticipants | null) => void;
  clearChatHistory: () => void;
};

export const useChat = create<TChatStore>((set) => ({
  messages: [],
  chatList: [],
  notifications: [],
  selectedChat: null,
  setMessages: (messages) => set({ messages }),
  setChatList: (chatList) => set({ chatList }),
  setNotifications: (notifications) => set({ notifications }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  clearChatHistory: () =>
    set({
      messages: [],
      notifications: [],
      selectedChat: null,
    }),
}));
