import { type NextPage } from "next";
// import { api } from "~/utils/api";

import { useState, useEffect } from "react";
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react";
import { env } from "~/env.mjs";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call

const ChatContainer = () => {
  const pubnub = new PubNub({
    publishKey: env.NEXT_PUBLIC_PUBLISHER_KEY,
    subscribeKey: env.NEXT_PUBLIC_SUBSCRIBER_KEY,
    uuid: "myUniqueUUID",
  });

  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  );
};

const Chat = () => {
  const pubnub = usePubNub();
  const [channels] = useState(["awesome-channel"]);
  const [messages, addMessage] = useState([]);
  const [message, setMessage] = useState("");

  const handleMessage = (event) => {
    const message = event.message;
    if (typeof message === "string" || message.hasOwnProperty("text")) {
      const text = message.text || message;
      addMessage((messages) => [...messages, text]);
    }
  };

  const sendMessage = (message) => {
    if (message) {
      pubnub
        .publish({ channel: channels[0], message })
        .then(() => setMessage(""));
    }
  };

  useEffect(() => {
    pubnub.addListener({ message: handleMessage });
    pubnub.subscribe({ channels });
  }, [pubnub, channels]);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ event });
  };

  return (
    <div>
      <div>
        <div>React Chat Example</div>
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
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={(e) => {
              sendMessage(message);
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

const channels = [
  "channel-001",
  "channel-002",
  "channel-003",
  "channel-004",
  "channel-005",
];

const users = ["user-001", "user-002", "user-003", "user-004", "user-005"];

const chats = [
  {
    id: "chat-001",
    channel: "channel-001",
    participants: ["user-001", "user-002"],
  },
  {
    id: "chat-002",
    channel: "channel-002",
    participants: ["user-001", "user-002", "user-003"],
  },
  {
    id: "chat-003",
    channel: "channel-003",
    participants: ["user-002", "user-003"],
  },
];

const Home: NextPage = () => {
  const [currentUser, setCurrentUser] = useState("");
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      {/* select user */}
      <>
        {currentUser ? (
          <div>
            <h1>
              Welcome <strong>{currentUser}</strong>
            </h1>
            <button
              className="mr-2 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
              onClick={() => setCurrentUser("")}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <h1>Login as any of the following</h1>
            <div>
              {users.map((user) => (
                <button
                  className="mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  key={user}
                  onClick={() => setCurrentUser(user)}
                >
                  {user}
                </button>
              ))}
            </div>
          </div>
        )}
      </>

      {/* list chats */}
      <>
        {currentUser && (
          <div>
            <h2>Chats</h2>
            <div>
              {chats.map((chat) => (
                <div
                  className="mr-2 inline-block rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  key={chat.id}
                >
                  <>{chat.channel}</>
                  <ChatContainer />
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    </>
  );
};

export default Home;
