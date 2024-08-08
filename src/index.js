const path = require("path");
const http = require("http");
const express = require("express");
const socket = require("socket.io");
const Bad = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const { addUser, getUser, getUsers, removeUser } = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    socket.join(room);
    socket.emit("message", generateMessage("Admin", "Welcome Buddy!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsers(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Bad();

    if (filter.isProfane(message)) {
      return callback("Use of vulgar words is not allowed");
    }

    // Emit the message to the specific room
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsers(user.room),
      });
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    if (
      typeof coords.latitude === "undefined" ||
      typeof coords.longitude === "undefined"
    ) {
      return callback("Values of geolocation are incorrect");
    }

    // Emit the location to the specific room
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
