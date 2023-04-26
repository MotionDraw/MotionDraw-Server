const {
  beforeEach,
  afterEach,
  describe,
  test,
  expect,
} = require("@jest/globals");
const Client = require("socket.io-client");
const { server, initSocket, closeSocket } = require("../utils/socket");

describe("socket test", () => {
  let client1, client2;

  beforeEach((done) => {
    initSocket();
    const port = server.address().port;

    client1 = Client.connect(`http://localhost:${port}`);
    client2 = Client.connect(`http://localhost:${port}`);

    client1.on("connect", () => {
      expect(client1.connected).toBe(true);
      client2.on("connect", () => {
        expect(client2.connected).toBe(true);
        console.log("클라2 연결됨");
        done();
      });
    });
  });

  afterEach(() => {
    client1.disconnect();
    client2.disconnect();
    server.close();
    closeSocket();
  });

  test("roomList", (done) => {
    client1.emit("roomList", (callback) => {
      expect(callback).toStrictEqual([]);
      done();
    });
  });

  test("createRoom", (done) => {
    console.log("createRoom, test");
    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });

    client1.emit("roomList", (callback) => {
      expect(callback).toStrictEqual([
        { roomName: "test-name", playerCount: 1 },
      ]);
      done();
    });
  });

  test("중복 createRoom", (done) => {
    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });

    client2.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(false);
      done();
    });

    client1.emit("roomList", (callback) => {
      expect(callback).toStrictEqual([
        { roomName: "test-name", playerCount: 1 },
      ]);
      done();
    });
  });

  test("joinRoom", (done) => {
    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });

    client1.emit("joinRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client1.emit("roomList", (callback) => {
      expect(callback).toStrictEqual([
        { roomName: "test-name", playerCount: 1 },
      ]);
      done();
    });
  });

  test("방없음 joinRoom", (done) => {
    function joinRoomCallback(arg) {
      expect(arg.success).toBe(false);
    }

    function mockFunction(arg) {
      expect(arg).toStrictEqual([]);
      done();
    }

    client1.emit("joinRoom", "test-name", joinRoomCallback);
    client1.emit("roomList", mockFunction);
  });

  test("방 떠나기", (done) => {
    client1.emit("createRoom", "test-name1", (arg) => {
      expect(arg.success).toBe(true);
      expect(arg.payload).toBe("test-name1");
    });
    client1.emit("createRoom", "test-name2", (arg) => {
      expect(arg.success).toBe(true);
      expect(arg.payload).toBe("test-name2");
    });
    client1.emit("roomList", (arg) => {
      expect(arg).toStrictEqual([
        { roomName: "test-name1", playerCount: 1 },
        { roomName: "test-name2", playerCount: 1 },
      ]);
    });

    client1.emit("leaveRoom", "test-name1");

    client1.emit("roomList", (arg) => {
      expect(arg).toStrictEqual([{ roomName: "test-name2", playerCount: 1 }]);
      done();
    });
  });

  test("sendHistory", (done) => {
    client1.on("requestData", (roomName) => {
      expect(roomName).toBe("test-name");
      done();
    });

    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client2.emit("joinRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client1.emit("sendHistory", "test-name");
  });

  test("callbackData", (done) => {
    client2.on("initCanvas", (data) => {
      expect(data).toBe("test-data");
      done();
    });

    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client2.emit("joinRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client1.emit("callbackData", "test-name", "test-data");
  });

  test("drawLine", (done) => {
    client2.on("draw", (data) => {
      expect(data).toBe("test-data");
      done();
    });

    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client2.emit("joinRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client1.emit("drawLine", "test-name", "test-data");
  });

  test("cursorPosition", (done) => {
    client2.on("cursorPosition", (socketId, data) => {
      expect(socketId).toBe("test-socketId");
      expect(data).toBe("test-data");
      done();
    });

    client1.emit("createRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client2.emit("joinRoom", "test-name", (callback) => {
      expect(callback.success).toBe(true);
      expect(callback.payload).toBe("test-name");
    });
    client1.emit("cursorPosition", "test-name", "test-socketId", "test-data");
  });
});
