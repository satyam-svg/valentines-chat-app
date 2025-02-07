import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send-message", (msg) => {
    console.log("Message received from", socket.id, ":", msg);

    // Send message to all OTHER users (not the sender)
    socket.broadcast.emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
