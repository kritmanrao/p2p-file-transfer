import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  
    methods: ["GET", "POST"],
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("joinRoom", (roomId, callback) => {
    socket.join(roomId);
    socket.roomId = roomId;  
    callback({ status: "ok" });
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("chatMessage", ({ id, msg }) => {
    if (!msg || !socket.roomId) return;
    io.to(socket.roomId).emit("chatMessage", { id, msg });
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
