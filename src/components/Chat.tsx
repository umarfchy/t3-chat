// external import
import PubNub, { type MessageEvent } from "pubnub";
import { useState, useEffect, type FormEvent } from "react";
import { PubNubProvider, usePubNub } from "pubnub-react";
import { createId } from "@paralleldrive/cuid2";

// internal import
import type { Message, Notification } from "@prisma/client";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";
import { useChat } from "~/store/chat";
import { useAuth } from "~/store/auth";

type PubSubMessage = Message & { type: "chat-message" | "notification" };

export const Chat = () => {
  const pubnub = usePubNub();
  const [text, setText] = useState("");
  const { currentUser } = useAuth();
  const { messages, setMessages, selectedChat } = useChat();
  const messageList = api.example.messages.useQuery(
    { chatId: selectedChat?.id ?? "" },
    {
      enabled: !!selectedChat?.id,
      onSuccess: setMessages,
    }
  );

  useEffect(() => {
    const handleMsgEvent = (event: MessageEvent) => {
      console.log("I'm rendering from Chat.tsx");
      // console.log("chatEventFromSubscriber", { event });
      const message = event.message as PubSubMessage;

      if (message.type === "notification") return;
      setMessages([...messages, message]);
    };

    if (!selectedChat?.id) return;
    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [selectedChat.id] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [messages, pubnub, selectedChat?.id, setMessages]);

  const handleSendMsg = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !currentUser ||
      !selectedChat?.id ||
      !selectedChat?.participants ||
      !text
    )
      return;
    try {
      const chatMessage: PubSubMessage = {
        id: createId(),
        timestamp: new Date(),
        type: "chat-message",
        text: text.trim(),
        senderId: currentUser.id,
        chatId: selectedChat.id,
      };

      const messagePromise = pubnub.publish({
        channel: selectedChat.id,
        message: chatMessage,
      });

      const notificationMessage: PubSubMessage = {
        id: createId(),
        timestamp: new Date(),
        type: "notification",
        text: text.trim(),
        senderId: currentUser.id,
        chatId: selectedChat.id,
      };

      const notificationPromise = selectedChat.participants.map(
        (participant) => {
          return pubnub.publish({
            channel: participant.id,
            message: notificationMessage,
          });
        }
      );

      await Promise.all([messagePromise, ...notificationPromise]);

      setText("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        {currentUser?.id && selectedChat?.id && (
          <>
            <div className="mb-8">
              Chat Room - <span className="font-bold">{selectedChat.name}</span>
            </div>
            <div>
              {messages.length > 0 &&
                messages.map((message, index) => {
                  return (
                    <p
                      className={`my-1 rounded px-4 py-2 ${
                        message.senderId === currentUser.id
                          ? "bg-green-300"
                          : "bg-blue-300"
                      }`}
                      key={`message-${index}`}
                    >
                      {message.text}
                    </p>
                  );
                })}
            </div>
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSendMsg}
              className="flex items-center justify-center gap-2"
            >
              <input
                className="w-full border-2 border-gray-300 p-2"
                type="text"
                placeholder="Type your message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-700">
                ➤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

interface ChatProviderProps {
  children: JSX.Element[] | null;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { currentUser } = useAuth();

  const pubnub = new PubNub({
    userId: currentUser?.id || "",
    publishKey: env.NEXT_PUBLIC_PUBLISHER_KEY,
    subscribeKey: env.NEXT_PUBLIC_SUBSCRIBER_KEY,
  });

  return (
    <>
      <PubNubProvider client={pubnub}>{children}</PubNubProvider>
    </>
  );
};
