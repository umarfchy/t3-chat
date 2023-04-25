// external import
import PubNub, { type MessageEvent } from "pubnub";
import { useState, useEffect, type FormEvent } from "react";
import { PubNubProvider, usePubNub } from "pubnub-react";

// internal import
import { env } from "~/env.mjs";

export type TMessage = {
  msgType: "chat-message" | "notification";
  senderId: string;
  text: string;
  chatRoomId: string;
};

export type TChatProps = {
  channel: string;
  userId: string;
  chatInfo: {
    id: string;
    channel: string;
    participants: string[];
  };
};

export const Chat = ({ channel, userId, chatInfo }: TChatProps) => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [text, setText] = useState("");

  const handleMsgEvent = (event: MessageEvent) => {
    console.log("chatEventFromSubscriber", { event });
    const message = event.message as TMessage;

    if (message.msgType !== "chat-message") return;
    setMessages((messages) => [...messages, message]);
  };

  useEffect(() => {
    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [channel] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [pubnub, channel]);

  const handleSendMsg = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text) return;
    try {
      await pubnub.publish({
        channel,
        message: {
          msgType: "chat-message",
          text: text.trim(),
          senderId: userId,
          chatRoomId: channel,
        },
      });

      await pubnub.publish({
        channel: chatInfo.participants.filter((id) => id !== userId)[0] ?? "",
        message: {
          msgType: "notification",
          text: text.trim(),
          senderId: userId,
          chatRoomId: channel,
        },
      });

      setText("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <div className="mb-8">Chat Room {channel}</div>
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
