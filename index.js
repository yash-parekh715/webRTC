const http = require("http");
const express = require("express");
const { Server: SocketIO } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server);
const PORT = process.env.PORT || 8000;

const users = new Map();

io.on("connection", (socket) => {
  console.log(`device connected ${socket.id}`);
  users.set(socket.id, socket.id);

  socket.broadcast.emit("user:joined", { id: socket.id });
  socket.emit("hello", { id: socket.id });

  socket.on("outgoing:call", (data) => {
    const { fromOffer, to } = data;

    socket.to(to).emit("incoming:call", { from: socket.id, offer: fromOffer });
  });

  socket.on("call:accepted", (data) => {
    const { answere, to } = data;
    socket.to(to).emit("incoming:answere", { from: socket.id, offer: answere });
  });

  socket.on("disconnected", () => {
    console.log(`device disconnected ${socket.id}`);
    users.delete(socket.id);
    socket.broadcast.emit("user:disconnected", { id: socket.id });
  });
});

app.get("/users", (req, res) => {
  return res.json(Array.from(users));
});

app.use(express.static(path.resolve("./public")));
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
