import { type MessageEvent } from "pubnub";
import { useState, useEffect } from "react";
import { usePubNub } from "pubnub-react";

// internal import
import { type TMessage } from "~/components/Chat";

export const NotificationComponent = ({ userId = "", selectedChat = "" }) => {
  const userChannel = userId;
  // external import
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<TMessage[]>([]);

  const handleMsgEvent = (event: MessageEvent) => {
    console.log("notificationEventFromSubscriber", { event });
    const message = event.message as TMessage;

    if (
      message.msgType !== "notification" ||
      message.senderId === userId ||
      message.chatRoomId === selectedChat
    )
      return;
    setMessages((messages) => [...messages, message]);
  };

  useEffect(() => {
    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [userChannel] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [pubnub, userChannel]);

  return (
    <div>
      <p>{messages.length}</p>
      <pre>{JSON.stringify({ messages }, null, 2)}</pre>
    </div>
  );
};
