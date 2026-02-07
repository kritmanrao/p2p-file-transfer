import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }, // dev only
});

io.on("connection", (socket) => {
  console.log("🔌 connected:", socket.id);

  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    socket.emit("room:joined", { roomId });
    socket.to(roomId).emit("room:peer-joined", { id: socket.id });
    console.log(`👥 ${socket.id} joined room ${roomId}`);
  });

  // WebRTC signaling relay
  socket.on("webrtc:offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc:offer", { offer });
  });

  socket.on("webrtc:answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc:answer", { answer });
  });

  socket.on("webrtc:ice", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc:ice", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running: http://localhost:3000");
});
