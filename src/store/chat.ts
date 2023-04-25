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
  selectedChat: TChat | null;
  setMessages: (messages: TMessage[]) => void;
  setSelectedChat: (chat: TChat) => void;
};

export const useChat = create<TChatStore>((set) => ({
  messages: [],
  selectedChat: null,
  setMessages: (messages: TMessage[]) => set({ messages }),
  setSelectedChat: (chat: TChat) => set({ selectedChat: chat }),
}));
