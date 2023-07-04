const initSocket = (io) => {
  let publicRooms = [];

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("disconnect", () => {
      publicRooms = publicRooms.filter((room) => {
        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;

        if (numClients !== 0) return room;
      });

      console.log("A user disconnected", socket.id);
    });

    socket.on("roomList", (callback) => {
      if (publicRooms.length === 0) {
        callback([]);
      }

      const roomInfo = [];

      for (let i = 0; i < publicRooms.length; i += 1) {
        const clients = io.sockets.adapter.rooms.get(publicRooms[i]);
        const numClients = clients ? clients.size : 0;

        roomInfo.push({ roomName: publicRooms[i], playerCount: numClients });
      }

      callback([...roomInfo]);
    });

    socket.on("joinRoom", (roomName, callback) => {
      if (publicRooms.find((element) => element === roomName)) {
        socket.join(roomName);

        callback({ success: true, payload: roomName });
      } else {
        callback({ success: false });
      }
    });

    socket.on("createRoom", (roomName, callback) => {
      if (!publicRooms.find((element) => element === roomName)) {
        publicRooms.push(roomName);
        socket.join(roomName);
        callback({ success: true, payload: roomName });
      } else {
        callback({ success: false });
      }
    });

    socket.on("leaveRoom", (roomName) => {
      socket.leave(roomName);

      const clients = io.sockets.adapter.rooms.get(roomName);
      const numClients = clients ? clients.size : 0;

      if (numClients === 0) {
        publicRooms = publicRooms.filter((room) => room !== roomName);
      }
    });

    socket.on("sendHistory", (roomName) => {
      const clients = io.sockets.adapter.rooms.get(roomName);
      const firstClient = clients?.values().next().value;

      if (!firstClient) return;

      if (clients.size !== 1) {
        io.to(firstClient).emit("requestData", roomName);
      }
    });

    socket.on("callbackData", (roomName, data) => {
      socket.broadcast.to(roomName).emit("initCanvas", data);
    });

    socket.on("drawLine", (roomName, data) => {
      socket.broadcast.to(roomName).emit("draw", data);
    });

    socket.on("cursorPosition", (roomName, socketId, data) => {
      socket.broadcast.to(roomName).emit("cursorPosition", socketId, data);
    });
  });
};

const closeSocket = (io) => {
  io.close();
};

module.exports = { initSocket, closeSocket };
