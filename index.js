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

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send-message", (msg) => {
    console.log("Message received from", socket.id, ":", msg);
    socket.broadcast.emit("receive-message", msg);
  });

  socket.on("broadcastOffer", (offer) => {
    socket.broadcast.emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", (data) => {
    io.to(data.to).emit("answer", data.answer);
  });


  
  // Listen for ICE candidates and forward them
  socket.on("candidate", (data) => {
    io.to(data.to).emit("candidate", data.candidate);
  });



  // Video Call Signaling Events
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.broadcast.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("signal", (data) => {
    io.to(data.userToSignal).emit("signal", {
      signal: data.signal,
      from: data.from,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
