// external import
import PubNub, { type PubnubConfig, type MessageEvent } from "pubnub";
import { useState, useEffect, type FormEvent } from "react";
import { PubNubProvider, usePubNub } from "pubnub-react";

// internal import
import { env } from "~/env.mjs";

export const Chat = ({ channel }: { channel: string }) => {
  const pubnub = usePubNub();
  const [messages, addMessage] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const handleMessage = (event: MessageEvent) => {
    console.log("eventFromSubscriber", { event });
    const message = event.message;
    if (typeof message === "string" || message.hasOwnProperty("text")) {
      const text = message.text || message;
      addMessage((messages) => [...messages, text]);
    }
  };

  useEffect(() => {
    pubnub.addListener({ message: handleMessage });
    pubnub.subscribe({ channels: [channel] });
  }, [pubnub, channel]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ event });

    if (message) {
      pubnub.publish({ channel, message }).then(() => {
        // addMessage((messages) => [...messages, message]);
        setMessage("");
      });
    }
  };

  return (
    <div>
      <div>
        <div>Chat Room {channel}</div>
        <div>
          {messages.map((message, index) => {
            return <div key={`message-${index}`}>{message}</div>;
          })}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="text-black"
            type="text"
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value.trim())}
          />
          <button>Send Message</button>
        </form>
      </div>
    </div>
  );
};

export const ChatContainer = (props: { userId: string; channel: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const pubnub = new PubNub({
    userId: props.userId,
    publishKey: env.NEXT_PUBLIC_PUBLISHER_KEY,
    subscribeKey: env.NEXT_PUBLIC_SUBSCRIBER_KEY,
  });

  return (
    <PubNubProvider client={pubnub}>
      <Chat {...props} />
    </PubNubProvider>
  );
};
