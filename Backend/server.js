import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import roomRoutes from "./routes/roomRoutes.js"; // use `.js` extension
import socketHandler from "./socket/socketHandler.js"; // use `.js` extension

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let activeUsers = 0;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  activeUsers++;
  io.emit("userCount", activeUsers);

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });

  socket.on("cursor", (data) => {
    socket.broadcast.emit("cursor", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    activeUsers--;
    io.emit("userCount", activeUsers);
  });
});

socketHandler(io);

mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB error:", err));
