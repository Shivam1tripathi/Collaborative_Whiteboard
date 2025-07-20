import mongoose from "mongoose";

const drawingCommandSchema = new mongoose.Schema({
  type: String,
  data: Object,
  timestamp: Date,
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: [drawingCommandSchema],
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
