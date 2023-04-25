import { type MessageEvent } from "pubnub";
import { useEffect } from "react";
import { usePubNub } from "pubnub-react";

// internal import
import { type TMessage } from "~/components/Chat";
import { useChat } from "~/store/chat";
import { useAuth } from "~/store/auth";

export const NotificationComponent = () => {
  const { currentUser } = useAuth();
  const { selectedChat } = useChat();

  const userChannel = currentUser;
  const pubnub = usePubNub();
  const { messages, setMessages, notifications, setNotifications } = useChat();

  useEffect(() => {
    console.log("I'm rendering from Notification.tsx");

    const handleMsgEvent = (event: MessageEvent) => {
      // console.log("notificationEventFromSubscriber", { event });
      const eventMessage = event.message as TMessage;

      console.log(
        "----",
        { eventMessage, currentUser, channel: selectedChat?.channel },
        "----"
      );

      if (
        eventMessage.type === "chat-message" ||
        eventMessage.senderId === currentUser ||
        eventMessage.chatRoomId === selectedChat?.channel
      )
        return;
      // * only set message if it's a notification,
      // * it's not from the current user, and not from the current chat
      setNotifications([eventMessage, ...notifications]);
    };

    if (!userChannel) return;

    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [userChannel] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [
    pubnub,
    currentUser,
    messages,
    setMessages,
    notifications,
    setNotifications,
    userChannel,
    selectedChat?.channel,
  ]);

  return (
    <div>
      <p>{messages.length}</p>
      <pre>{JSON.stringify({ notifications }, null, 2)}</pre>
    </div>
  );
};
