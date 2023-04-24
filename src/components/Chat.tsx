// external import
import PubNub, { type MessageEvent } from "pubnub";
import { useState, useEffect, type FormEvent, FC } from "react";
import { PubNubProvider, usePubNub } from "pubnub-react";

// internal import
import { env } from "~/env.mjs";

type TMessage = {
  senderId: string;
  text: string;
};

type TChatProps = {
  channel: string;
  userId: string;
};

export const Chat = ({ channel, userId }: TChatProps) => {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [text, setText] = useState("");

  // const handleMessage = (event: MessageEvent) => {
  //   console.log("eventFromSubscriber", { event });
  //   const message = event.message;
  //   if (typeof message === "string" || message.hasOwnProperty("text")) {
  //     const text = message.text || message;
  //     addMessage((messages) => [...messages, text]);
  //   }
  // };

  // useEffect(() => {
  //   pubnub.addListener({ message: handleMessage });
  //   pubnub.subscribe({ channels: [channel] });
  // }, [pubnub, channel]);

  const handleSendMsg = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ event });

    if (!text) return;

    await pubnub
      .publish({
        channel,
        message: {
          text,
          senderId: userId,
        },
      })
      .then(() => {
        setMessages((messages) => [...messages, { text, senderId: userId }]);
        setText("");
      });
  };

  return (
    <div>
      <div>
        <div className="mb-8">Chat Room {channel}</div>
        <div>
          {messages.map((message, index) => {
            return (
              <p
                className={`my-1 px-2 py-1 ${
                  message.senderId === userId ? "bg-gray-300" : "bg-gray-100"
                }`}
                key={`message-${index}`}
              >
                {message.text}
              </p>
            );
          })}
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSendMsg}>
          <input
            className="w-full border-2 border-gray-300 p-2"
            type="text"
            placeholder="Type your message"
            value={text}
            onChange={(e) => setText(e.target.value.trim())}
          />
          <button className="rounded bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-700">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

// { userId: string; channel: string }

type TChatContainerProps = {
  [key: string]: string;
};

export const ChatContainer = (props: TChatContainerProps) => {
  const pubnub = new PubNub({
    userId: props?.userId || "user-001",
    publishKey: env.NEXT_PUBLIC_PUBLISHER_KEY,
    subscribeKey: env.NEXT_PUBLIC_SUBSCRIBER_KEY,
  });

  return (
    <PubNubProvider client={pubnub}>
      <Chat {...props} />
    </PubNubProvider>
  );
};
