function Message({ chats, myId }) {
  if (!chats || chats.length === 0) return null;

  return (
    <ul id="messages">
      {chats.map((curr, i) => (
        <Chat msg={curr} key={curr.id || i} myId={myId} />
      ))}
    </ul>
  );
}

function Chat({ msg, myId }) {
  const style = msg.id === myId ? "sent" : "received";
  return <li className={style}>{msg.msg}</li>;
}

export default Message;
