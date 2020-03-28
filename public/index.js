const socket = io();
let positions = new Array();

socket.on("turn", ({ turn, positions }) => {
  const symbol = sessionStorage.getItem("symbol");
  sessionStorage.setItem("turn", turn);
  positions = positions;
  document.getElementById("message").innerHTML =
    symbol === turn ? "TU TURNO" : `TURNO DE ${turn}`;
});

class Board {
  constructor() {
    document.getElementById("board").innerHTML = "";
    this.board = document.getElementById("board");
  }

  draw() {
    for (let i = 0; i < 3; i++) {
      positions[i] = new Array();
      this.board.innerHTML += `<div class="row" data-id="${i}"></div>`;
      for (let j = 0; j < 3; j++) {
        const col = `<div class="col" data-id="${i}${j}"></div>`;
        document.querySelector(`[data-id="${i}"]`).innerHTML += col;
      }
    }
  }
  setPosition(x, y, value, symbol) {
    // Check if the column is empty and if it's my turn
    if (!positions[x][y] && value === symbol) {
      positions[x][y] = value;
      socket.emit("drawPosition", { x, y, value });
      // Toggle turn
      socket.emit("turn", {
        turn: value === "X" ? "O" : "X",
        positions
      });
      this.checkWinner(x, y);
    }
  }
  drawPosition(x, y, value) {
    document.querySelector(
      `[data-id="${x}${y}"]`
    ).innerHTML = `<span class="${value}">${value}</span>`;
  }
  checkWinner(x, y) {
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

    if (winner) socket.emit("message", `!${winner} HA GANADO!`);

    // if (count === 9) socket.emit("message", `!EMPATE!`);
  }
}

let b = new Board();
b.draw();

function selectSymbol(symbol) {
  sessionStorage.setItem("symbol", symbol);
  socket.emit("symbol", symbol);
  // Remove start screen
  document.querySelector(".start-screen").remove();
}

function reset() {
  sessionStorage.clear();
  socket.emit("replay", true);
}

socket.on("symbol", symbol => {
  sessionStorage.setItem("symbol", symbol);
  // Remove start screen
  document.querySelector(".start-screen").remove();
});

const cols = document.querySelectorAll(".col[data-id]");

cols.forEach(col => {
  col.addEventListener("click", function() {
    const index = this.dataset.id;
    const [x, y] = index;
    const turn = sessionStorage.getItem("turn");
    const symbol = sessionStorage.getItem("symbol");
    b.setPosition(Number(x), Number(y), turn, symbol);
  });
});

socket.on("drawPosition", ({ x, y, value }) => {
  b.drawPosition(x, y, value);
});

socket.on("replay", () => window.location.reload());

socket.on("message", message => {
  document.getElementById("message").innerHTML = message;
  document.querySelector("button").style.display = "block";
});
