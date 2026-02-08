import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

// health route (for testing deployment)
app.get("/health", (req, res) => res.send("ok"));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// If ALLOWED_ORIGINS is empty, allow all (useful for first deploy)
const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow non-browser tools
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isOriginAllowed(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 connected:", socket.id);

  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    socket.emit("room:joined", { roomId });
    socket.to(roomId).emit("room:peer-joined", { id: socket.id });
    console.log(`👥 ${socket.id} joined room ${roomId}`);
  });

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
