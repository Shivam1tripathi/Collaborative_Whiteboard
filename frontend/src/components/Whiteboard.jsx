import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRoom } from "../context/RoomContext";

const socket = io("http://localhost:5000");

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { roomId, setRoomId } = useRoom();

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(2);
  const [cursors, setCursors] = useState({});
  const [userCount, setUserCount] = useState(1);

  useEffect(() => {
    console.log(roomId);
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    socket.emit("join-room", { roomId });

    const ctx = canvasRef.current.getContext("2d");

    const drawLine = ({ x0, y0, x1, y1, color, width, tool }) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = tool === "marker" ? `${color}80` : color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.stroke();
      ctx.closePath();
    };

    socket.on("draw-start", (data) => {
      lastPos.current = { x: data.x0, y: data.y0 };
    });

    socket.on("draw-move", (data) => {
      drawLine(data);
      lastPos.current = { x: data.x1, y: data.y1 };
    });

    socket.on("draw-end", () => {
      isDrawing.current = false;
    });

    socket.on("clear-canvas", () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    socket.on("cursor-move", ({ id, x, y }) => {
      setCursors((prev) => ({ ...prev, [id]: { x, y } }));
    });

    socket.on("user-count", setUserCount);

    return () => {
      socket.off("draw-start");
      socket.off("draw-move");
      socket.off("draw-end");
      socket.off("clear-canvas");
      socket.off("cursor-move");
      socket.off("user-count");
    };
  }, [roomId]);

  const getMouseCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const { x, y } = getMouseCoords(e);
    lastPos.current = { x, y };
    socket.emit("draw-start", { x0: x, y0: y, color, width, tool });
  };

  const handleMouseMove = (e) => {
    const pos = getMouseCoords(e);
    socket.emit("cursor-move", { id: socket.id, x: pos.x, y: pos.y });

    if (!isDrawing.current) return;
    const { x, y } = lastPos.current;
    const drawData = { x0: x, y0: y, x1: pos.x, y1: pos.y, color, width, tool };
    const ctx = canvasRef.current.getContext("2d");
    drawLine(drawData);
    lastPos.current = pos;
    socket.emit("draw-move", drawData);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      socket.emit("draw-end");
    }
    isDrawing.current = false;
  };

  const handleClearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit("clear-canvas");
  };

  const handleExitRoom = () => {
    socket.disconnect();
    setRoomId("");
  };

  const drawLine = ({ x0, y0, x1, y1, color, width, tool }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = tool === "marker" ? `${color}80` : color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
    ctx.stroke();
    ctx.closePath();
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-0 left-0 z-20 bg-white shadow-md p-3 flex flex-wrap items-center gap-4 w-full">
        <span className="font-bold text-gray-700">
          Room Code: <span className="text-blue-500">{roomId}</span>
        </span>
        <span className="text-sm text-gray-500">Users: {userCount}</span>

        <select
          value={tool}
          onChange={(e) => {
            const val = e.target.value;
            setTool(val);
            if (val === "pen") setWidth(2);
            if (val === "pencil") setWidth(1);
            if (val === "marker") setWidth(5);
            if (val === "eraser") setWidth(10);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="pen">Pen</option>
          <option value="pencil">Pencil</option>
          <option value="marker">Marker</option>
          <option value="eraser">Eraser</option>
        </select>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border rounded"
        />

        <input
          type="range"
          min="1"
          max="30"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        <span className="text-gray-600 text-sm">Width: {width}</span>

        <button
          className="px-3 py-1 rounded bg-red-500 text-white"
          onClick={handleClearCanvas}
        >
          Clear
        </button>

        <button
          className="px-3 py-1 rounded bg-gray-700 text-white"
          onClick={handleExitRoom}
        >
          Exit Room
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="bg-white w-full h-full absolute top-0 left-0 z-10"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />

      {Object.entries(cursors).map(([id, { x, y }]) => (
        <div
          key={id}
          className="absolute w-3 h-3 bg-blue-600 rounded-full z-30 pointer-events-none"
          style={{
            left: x + "px",
            top: y + "px",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

export default Whiteboard;
