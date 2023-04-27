// external import
import { type NextPage } from "next";

// internal import
import { api } from "~/utils/api";
import { Chat, ChatProvider } from "~/components/Chat";
import { NotificationComponent } from "~/components/Notification";
import { useAuth } from "~/store/auth";
import { useChat } from "~/store/chat";

const Home: NextPage = () => {
  const { currentUser, setCurrentUser, clearCurrentUser } = useAuth();
  const { selectedChat, setSelectedChat, clearChatHistory } = useChat();
  const users = api.example.users.useQuery();
  const chats = api.example.chats.useQuery(
    { userId: currentUser?.id ?? "" },
    {
      enabled: !!currentUser?.id,
    }
  );

  return (
    <>
      {/* select user */}
      <>
        {currentUser ? (
          <div>
            <h1>
              Welcome <strong>{currentUser.name}</strong>
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
              {users.data &&
                users.data.map((user) => (
                  <button
                    className="mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    key={user.id}
                    onClick={() => setCurrentUser(user)}
                  >
                    {user.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </>

      {/* list chats */}
      <>
        {currentUser && (
          <ChatProvider>
            {/* show notification */}
            <NotificationComponent />
            {/* show chat rooms */}
            <div>
              <h2 className="mt-6">Chats</h2>
              <div>
                {chats.data &&
                  chats.data.map((chat) => (
                    <button
                      onClick={() => setSelectedChat(chat)}
                      className={`m-2 inline-block rounded px-4 py-2 font-bold ${
                        selectedChat?.id === chat.id
                          ? "bg-purple-300 text-white"
                          : "border-2 border-blue-500 hover:border-2 hover:border-blue-700"
                      }`}
                      key={chat.id}
                    >
                      {chat.name}
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
