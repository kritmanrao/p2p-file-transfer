import { useEffect, useState, useRef } from "react";
import { Message, Join } from "./components";
import socket from "./socket";

function App() {
  const [isJoin, setIsJoin] = useState(false);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setChats((prev) => [...prev, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => socket.off("chatMessage");
  }, []);

  function sendMessage() {
    if (!message.trim()) return;
    socket.emit("chatMessage", { id: socket.id, msg: message.trim() });
    setMessage("");
  }

  if (!isJoin) return <Join onJoin={setIsJoin} />;

  return (
    <>
      <h1>Your ID: {socket.id}</h1>
      <Message chats={chats} myId={socket.id} />
      <div ref={messagesEndRef} />
      <form
        id="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          id="input"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

export default App;
