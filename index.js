import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Notify all users that a new user joined
  io.emit("user-connected", socket.id);

  // Listen for broadcastOffer from the caller
  socket.on("broadcastOffer", (offer) => {
    socket.broadcast.emit("offer", { offer, from: socket.id });
  });

  // Listen for answer from the callee and send to the caller
  socket.on("answer", (data) => {
    io.to(data.to).emit("answer", data.answer);
  });

  // Listen for ICE candidates and forward them
  socket.on("candidate", (data) => {
    io.to(data.to).emit("candidate", data.candidate);
  });

  // 🔥 Listen for chat messages and broadcast to all users
  socket.on("chatMessage", (message) => {
    io.emit("chatMessage", { text: message, sender: socket.id });
  });

  // Disconnect User
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    io.emit("user-disconnected", socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});