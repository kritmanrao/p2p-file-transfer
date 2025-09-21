// src/socket.js
import { io } from "socket.io-client";
 
const URL = import.meta.env.VITE_URL || "http://localhost:3000";
 
const socket = io(URL);
 
socket.on("connect", () => {
  console.log("Socket connected with id:", socket.id);
});
 
socket.on("disconnect", () => {
  console.log("Socket disconnected ");
});
 
socket.on("connect_error", (err) => console.error("Connect Error:", err));
 
socket.on("reconnect_attempt", (attempt) =>
  console.log("Reconnecting attempt:", attempt)
);

export default socket;
