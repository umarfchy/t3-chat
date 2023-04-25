import { create } from "zustand";

export type TChat = {
  id: string;
  channel: string;
  participants: string[];
};

export type TMessage = {
  type: "chat-message" | "notification";
  senderId: string;
  text: string;
  chatRoomId: string;
};

export type TChatStore = {
  messages: TMessage[];
  notifications: TMessage[];
  selectedChat: TChat | null;
  setMessages: (messages: TMessage[]) => void;
  setNotifications: (notifications: TMessage[]) => void;
  setSelectedChat: (chat: TChat) => void;
  clearChatHistory: () => void;
};

export const useChat = create<TChatStore>((set) => ({
  messages: [],
  notifications: [],
  selectedChat: null,
  setMessages: (messages) => set({ messages }),
  setNotifications: (notifications) => set({ notifications }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  clearChatHistory: () =>
    set({ messages: [], notifications: [], selectedChat: null }),
}));
