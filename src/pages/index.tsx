// external import
import { type NextPage } from "next";

// internal import
// import { api } from "~/utils/api";
import { Chat, ChatProvider } from "~/components/Chat";
import { NotificationComponent } from "~/components/Notification";
import { useAuth } from "~/store/auth";
import { useChat } from "~/store/chat";

// const users = ["user-001", "user-002", "user-003", "user-004", "user-005"];
const users = ["user-001", "user-002"];

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
  // {
  //   id: "chat-003",
  //   channel: "channel-003",
  //   participants: ["user-002", "user-003"],
  // },
];

const Home: NextPage = () => {
  const { currentUser, setCurrentUser, clearCurrentUser } = useAuth();
  const { selectedChat, setSelectedChat, clearChatHistory } = useChat();
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
              onClick={() => {
                clearCurrentUser();
                clearChatHistory();
              }}
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
          <ChatProvider userId={currentUser}>
            {/* show notification */}
            <NotificationComponent />
            {/* show chat rooms */}
            <div>
              <h2 className="mt-6">Chats</h2>
              <div>
                {chats.map((chat) => (
                  <button
                    onClick={() => setSelectedChat(chat)}
                    className="m-2 inline-block rounded border-2 border-blue-500 px-4 py-2 font-bold hover:border-2 hover:border-blue-700"
                    key={chat.id}
                  >
                    {chat.channel}
                  </button>
                ))}
              </div>
            </div>

            {/* show chat messages */}
            <div className="mt-8 w-96">
              {selectedChat ? (
                <Chat
                // key={selectedChat.id}
                />
              ) : null}
            </div>
          </ChatProvider>
        )}
      </>
    </>
  );
};

export default Home;
