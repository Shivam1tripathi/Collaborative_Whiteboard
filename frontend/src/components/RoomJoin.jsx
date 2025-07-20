import { useState, useEffect } from "react";
import axios from "axios";
import { useRoom } from "../context/RoomContext";

const RoomJoin = () => {
  const { setRoomId } = useRoom();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("join");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      }
    };
    fetchRooms();
  }, []);

  const handleJoin = async () => {
    if (!code.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/rooms/join", {
        roomId: code,
      });
      setRoomId(code);
    } catch (error) {
      alert("Invalid room code or server error.");
    }
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/rooms/create"
      );
      const newRoomId = response.data.roomId;
      setRoomId(newRoomId);
    } catch (error) {
      alert("Failed to create room.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {mode === "join" ? "Join a Whiteboard Room" : "Create a New Room"}
        </h2>

        {mode === "join" && (
          <>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 transition-all"
            />

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                Available Rooms:
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rooms.length === 0 ? (
                  <p className="text-gray-500 text-sm">No rooms available</p>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.roomId}
                      onClick={() => {
                        setRoomId(room.roomId);
                      }}
                      className="w-full py-2 px-3 bg-gray-100 cursor-pointer hover:bg-purple-100 rounded-lg text-left transition-all"
                    >
                      Room ID: <strong>{room.roomId}</strong>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <button
          onClick={mode === "join" ? handleJoin : handleCreate}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 cursor-pointer text-white rounded-lg font-semibold transition-all mb-3"
        >
          {mode === "join" ? "Join Room" : "Create Room"}
        </button>

        <button
          onClick={() => setMode(mode === "join" ? "create" : "join")}
          className="text-sm text-gray-600 hover:underline text-center w-full cursor-pointer"
        >
          {mode === "join"
            ? "Don't have a room? Create one"
            : "Already have a room? Join here"}
        </button>
      </div>
    </div>
  );
};

export default RoomJoin;
