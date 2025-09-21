import { useState } from "react";
import socket from "../socket";

function Join({ onJoin }) {
  const [roomId, setRoomId] = useState("");

  function joinRoom() {
    const trimmedRoom = roomId.trim();
    if (!trimmedRoom) return;

    socket.emit("joinRoom", trimmedRoom, (res) => {
      if (res && res.status === "ok") {
        onJoin(true);
      } else {
        alert("Something went wrong!");
      }
    });
  }

  return (
    <form
      id="form"
      onSubmit={(e) => {
        e.preventDefault();
        joinRoom();
      }}
    >
      <input
        id="input"
        type="text"
        name="roomId"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room ID"
        required
      />
      <button type="submit">Join/Create</button>
    </form>
  );
}

export default Join;
