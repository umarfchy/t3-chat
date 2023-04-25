import { create } from "zustand";

export type TChat = {
  id: string;
  channel: string;
  participants: string[];
};

export type TMessage = {
  msgType: "chat-message" | "notification";
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
  clearSelectedChat: () => void;
  clearMessages: () => void;
};

export const useChat = create<TChatStore>((set) => ({
  messages: [],
  notifications: [],
  selectedChat: null,
  setMessages: (messages) => set({ messages }),
  setNotifications: (notifications) => set({ notifications }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  clearSelectedChat: () => set({ selectedChat: null }),
  clearMessages: () => set({ messages: [] }),
}));
