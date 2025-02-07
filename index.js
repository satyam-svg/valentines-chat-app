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

// Store connected users and their rooms
const users = {};

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    users[socket.id] = roomId;
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Notify other users in the room
    socket.to(roomId).emit("user-connected", socket.id);
  });

  // Handle WebRTC signaling
  socket.on("signal", (data) => {
    const { target, signal } = data;
    console.log(`Sending signal from ${socket.id} to ${target}`);
    io.to(target).emit("signal", { sender: socket.id, signal });
  });

  // Handle chat messages
  socket.on("send-message", (msg) => {
    console.log("Message received from", socket.id, ":", msg);

    // Send message to all OTHER users in the same room
    const roomId = users[socket.id];
    if (roomId) {
      socket.to(roomId).broadcast.emit("receive-message", msg);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const roomId = users[socket.id];
    if (roomId) {
      console.log(`User ${socket.id} disconnected from room ${roomId}`);
      socket.to(roomId).emit("user-disconnected", socket.id);
      delete users[socket.id];
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});