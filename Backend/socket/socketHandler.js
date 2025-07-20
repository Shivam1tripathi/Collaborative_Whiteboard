const users = {}; // { socketId: roomId }

function socketHandler(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      users[socket.id] = roomId;

      const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 1;
      io.to(roomId).emit("user-count", userCount);
    });

    socket.on("draw-start", (data) => {
      const roomId = users[socket.id];

      if (roomId) {
        socket.to(roomId).emit("draw-start", { ...data, id: socket.id });
      }
    });

    socket.on("draw-move", (data) => {
      const roomId = users[socket.id];

      if (roomId) {
        socket.to(roomId).emit("draw-move", { ...data, id: socket.id });
      }
    });

    socket.on("draw-end", (data) => {
      const roomId = users[socket.id];

      if (roomId) {
        socket.to(roomId).emit("draw-end", { ...data, id: socket.id });
      }
    });

    socket.on("cursor-move", (data) => {
      socket.broadcast.emit("cursor-move", data);
    });

    socket.on("clear-canvas", () => {
      const roomId = users[socket.id];

      if (roomId) {
        io.to(roomId).emit("clear-canvas");
      }
    });

    socket.on("disconnect", () => {
      const roomId = users[socket.id];

      delete users[socket.id];
      socket.leave(roomId);

      const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("user-count", userCount);
    });
  });
}

export default socketHandler;
