import { nanoid } from "nanoid";
import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

// Create a new room
router.post("/create", async (req, res) => {
  try {
    const roomId = nanoid(8);
    const room = await Room.create({ roomId });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: "Room creation failed" });
  }
});

// Join a room
router.post("/join", async (req, res) => {
  const { roomId } = req.body;
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({ roomId });
  }
  res.status(200).json(room);
});

// Get room by ID
router.get("/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.status(200).json(room);
});

// ✅ Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

export default router;
