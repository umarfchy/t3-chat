// external import
import PubNub, { type MessageEvent } from "pubnub";
import { useState, useEffect, type FormEvent } from "react";
import { PubNubProvider, usePubNub } from "pubnub-react";

// internal import
import { env } from "~/env.mjs";
import { useChat, type TMessage } from "~/store/chat";
import { useAuth } from "~/store/auth";

export const Chat = () => {
  const pubnub = usePubNub();
  const [text, setText] = useState("");
  const { currentUser: userId } = useAuth();
  const { messages, setMessages, selectedChat } = useChat();

  const handleMsgEvent = (event: MessageEvent) => {
    // console.log("chatEventFromSubscriber", { event });
    const message = event.message as TMessage;

    if (message.type !== "chat-message") return;
    setMessages([...messages, message]);
  };

  useEffect(() => {
    if (!selectedChat?.channel) return;
    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [selectedChat.channel] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [pubnub, selectedChat?.channel]);

  const handleSendMsg = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !selectedChat?.channel || !text) return;
    try {
      const chatMessage: TMessage = {
        type: "chat-message",
        text: text.trim(),
        senderId: userId,
        chatRoomId: selectedChat.channel,
      };

      await pubnub.publish({
        channel: selectedChat.channel,
        message: chatMessage,
      });

      const notificationMessage: TMessage = {
        type: "notification",
        text: text.trim(),
        senderId: userId,
        chatRoomId: selectedChat.channel,
      };

      await pubnub.publish({
        channel:
          selectedChat.participants.filter((id) => id !== userId)[0] ?? "",
        message: notificationMessage,
      });

      setText("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        {selectedChat?.channel && (
          <div className="mb-8">Chat Room {selectedChat.channel}</div>
        )}
        <div>
          {messages.length > 0 &&
            messages.map((message, index) => {
              return (
                <p
                  className={`my-1 rounded px-4 py-2 ${
                    message.senderId === userId ? "bg-green-300" : "bg-blue-300"
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
      </div>
    </div>
  );
};

// { userId: string; channel: string }

interface ChatProviderProps {
  children: JSX.Element[] | null;
  userId?: string;
}

export const ChatProvider = ({ children, userId }: ChatProviderProps) => {
  const pubnub = new PubNub({
    userId: userId || "",
    publishKey: env.NEXT_PUBLIC_PUBLISHER_KEY,
    subscribeKey: env.NEXT_PUBLIC_SUBSCRIBER_KEY,
  });

  return (
    <>
      <PubNubProvider client={pubnub}>{children}</PubNubProvider>
    </>
  );
};
export { TMessage };
