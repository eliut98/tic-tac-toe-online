const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", function(socket) {
  const symbol = {
    O: "X",
    X: "O"
  };
  socket.on("drawPosition", data => {
    io.emit("drawPosition", data);
  });
  socket.on("symbol", data => {
    socket.broadcast.emit("symbol", symbol[data]);
    io.emit("turn", { turn: data });
  });
  socket.on("turn", ({ turn, positions }) => {
    io.emit("turn", { turn, positions });
  });
  socket.on("message", data => {
    io.emit("message", data);
  });
  socket.on("replay", data => {
    io.emit("replay", data);
  });
});

http.listen(1802, function() {
  console.log("listening on *:1802");
});
