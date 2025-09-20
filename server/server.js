import express, { urlencoded } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("connected : " + socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnect : " + socket.id);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} join room ${roomId}`);
  });
  socket.on("chatMessage", ({ roomId, id, msg }) => {
    if (!roomId || !msg) return;
    io.to(roomId).emit("chatMessage", { id, msg });
  });
});

server.listen(3000, function () {
  console.log(`http://localhost:3000`);
});
