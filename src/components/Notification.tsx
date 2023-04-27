import { useEffect } from "react";
import { usePubNub } from "pubnub-react";
import { type MessageEvent } from "pubnub";

// internal import
// import { type TMessage } from "~/components/Chat";
import type { Notification } from "@prisma/client";
import { useAuth } from "~/store/auth";
import { useChat, type PubSubMessage } from "~/store/chat";

export const NotificationComponent = () => {
  const pubnub = usePubNub();
  const { currentUser } = useAuth();
  const {
    messages,
    setMessages,
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
    chatList,
  } = useChat();

  const userChannel = currentUser?.id;
  const currentChatChannel = selectedChat?.id;

  useEffect(() => {
    console.log("I'm rendering from Notification.tsx");

    const handleMsgEvent = (event: MessageEvent) => {
      // console.log("notificationEventFromSubscriber", { event });
      const eventMessage = event.message as PubSubMessage;

      console.log(
        "----",
        { eventMessage, currentUser, channel: currentChatChannel },
        "----"
      );

      if (
        eventMessage.type === "chat-message" ||
        eventMessage.chatId === currentChatChannel ||
        eventMessage.senderId === userChannel
      )
        return;

      const { type, ...rest } = eventMessage;
      // * only set message if it's a notification,
      // * it's not from the current user, and not from the current chat
      setNotifications([rest, ...notifications]);
    };

    if (!userChannel) return;

    pubnub.addListener({ message: handleMsgEvent });
    pubnub.subscribe({ channels: [userChannel ?? ""] });

    return () => {
      pubnub.removeListener({ message: handleMsgEvent });
      pubnub.unsubscribeAll();
    };
  }, [
    pubnub,
    messages,
    setMessages,
    currentUser,
    notifications,
    setNotifications,
    userChannel,
    currentChatChannel,
  ]);

  const handleNotificationClick = (notification: Notification) => {
    const newlySelectedChat = chatList.find(
      (chat) => chat.id === notification.chatId
    );
    setSelectedChat(newlySelectedChat ?? null);
  };

  return (
    <div>
      <p>{notifications.length}</p>
      {notifications &&
        notifications.map((notification) => (
          <div key={notification.id} className="bg-gray-300">
            <p
              className="my-2 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              {notification.id} - {notification.text}
            </p>
          </div>
        ))}
    </div>
  );
};
