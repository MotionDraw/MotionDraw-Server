const http = require("http");
const socketIO = require("socket.io");
const express = require("express");
const app = express();

const initSocket = () => {
  const server = http.createServer(app);
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  let publicRooms = [];

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    socket.on("room-list", (callback) => {
      callback([...publicRooms]);
    });

    socket.on("join-room", (roomName, callback) => {
      if (publicRooms.find((element) => element === roomName)) {
        socket.join(roomName);
        callback({ success: true, payload: roomName });
      } else {
        callback({ success: false });
      }
    });

    socket.on("create-room", (roomName, callback) => {
      if (!publicRooms.find((element) => element === roomName)) {
        publicRooms.push(roomName);
        socket.join(roomName);
        callback({ success: true, payload: roomName });
      } else {
        callback({ success: false });
      }
    });

    socket.on("leave-room", (roomName) => {
      socket.leave(roomName);

      const clients = io.sockets.adapter.rooms.get(roomName);
      const numClients = clients ? clients.size : 0;

      if (numClients === 0) {
        publicRooms = publicRooms.filter((room) => room !== roomName);
      }
    });
  });

  server.listen(4000, () => {
    console.log("Server started on port 4000");
  });
};

module.exports = { initSocket };
