const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", function(socket) {
  socket.on("drawPosition", data => {
    io.emit("drawPosition", data);
  });
  socket.on("turn", data => {
    io.emit("turn", data);
  });
});

http.listen(1802, function() {
  console.log("listening on *:1802");
});
