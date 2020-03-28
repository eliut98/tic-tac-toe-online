const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let positions = [];

function init() {
  for (let i = 0; i < 3; i++) positions[i] = new Array();
}

function checkWinner(x, y) {
  let winner;

  function check(arr, value) {
    return arr.join().match(new RegExp(`${value}`, "g"));
  }

  // Horizontal
  let hO = check(positions[x], "O");
  let hX = check(positions[x], "X");

  if (hX && hX.length === 3) winner = "X";
  if (hO && hO.length === 3) winner = "O";

  // Vertical
  let vertical = [];
  for (let i = 0; i < 3; i++) {
    vertical[i] = positions[i][y];
  }

  let vX = check(vertical, "X");
  let vO = check(vertical, "O");

  if (vX && vX.length === 3) winner = "X";
  if (vO && vO.length === 3) winner = "O";

  // Diagonal
  let tbr = [];
  if (x === y) {
    for (let i = 0; i < 3; i++) {
      tbr[i] = positions[i][i];
    }
  }

  let tbrX = check(tbr, "X");
  let tbrO = check(tbr, "O");

  if (tbrX && tbrX.length === 3) winner = "X";
  if (tbrO && tbrO.length === 3) winner = "O";

  let tbl = new Array(3);
  switch ([x, y].join("")) {
    case "02":
      updateTbl(positions);
      break;
    case "11":
      updateTbl(positions);
      break;
    case "20":
      updateTbl(positions);
      break;
  }

  function updateTbl(positions) {
    tbl[0] = positions[0][2];
    tbl[1] = positions[1][1];
    tbl[2] = positions[2][0];
  }

  let tblX = check(tbl, "X");
  let tblO = check(tbl, "O");

  if (tblX && tblX.length === 3) winner = "X";
  if (tblO && tblO.length === 3) winner = "O";

  return winner;
}

io.on("connection", function(socket) {
  const symbol = {
    O: "X",
    X: "O"
  };
  socket.on("symbol", data => {
    socket.broadcast.emit("symbol", symbol[data]);
    init();
    io.emit("turn", { turn: data, positions });
  });
  socket.on("turn", ({ turn, x, y, value }) => {
    if (!positions[x][y]) {
      positions[x][y] = value;
      io.emit("drawPosition", { x, y, value });
      io.emit("turn", { turn, positions });
      if (checkWinner(x, y)) {
        const winner = checkWinner(x, y);
        io.emit("message", winner);
      }
    }
  });
  socket.on("replay", data => {
    io.emit("replay", data);
  });
});

http.listen(1802, function() {
  console.log("listening on *:1802");
});
