const socket = io();

socket.on("turn", turn => {
  sessionStorage.setItem("turn", turn);
});

class Board {
  constructor(positions) {
    document.getElementById("board").innerHTML = "";
    this.positions = positions;
    this.board = document.getElementById("board");
  }

  draw() {
    for (let i = 0; i < 3; i++) {
      this.positions[i] = new Array();
      this.board.innerHTML += `<div class="row" data-id="${i}"></div>`;
      for (let j = 0; j < 3; j++) {
        const col = `<div class="col" data-id="${i}${j}"></div>`;
        document.querySelector(`[data-id="${i}"]`).innerHTML += col;
      }
    }
  }
  setPosition(x, y, value, symbol) {
    // Check if the column is empty and if it's my turn
    if (!this.positions[x][y] && value === symbol) {
      this.positions[x][y] = value;

      socket.emit("drawPosition", { x, y, value });

      // Toggle turn
      socket.emit("turn", value === "X" ? "O" : "X");

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
    let hO = check(this.positions[x], "O");
    let hX = check(this.positions[x], "X");

    if (hX && hX.length === 3) winner = "X";
    if (hO && hO.length === 3) winner = "O";

    // Vertical
    let vertical = [];
    for (let i = 0; i < 3; i++) {
      vertical[i] = this.positions[i][y];
    }

    let vX = check(vertical, "X");
    let vO = check(vertical, "O");

    if (vX && vX.length === 3) winner = "X";
    if (vO && vO.length === 3) winner = "O";

    // Diagonal
    let tbr = [];
    if (x === y) {
      for (let i = 0; i < 3; i++) {
        tbr[i] = this.positions[i][i];
      }
    }

    let tbrX = check(tbr, "X");
    let tbrO = check(tbr, "O");

    if (tbrX && tbrX.length === 3) winner = "X";
    if (tbrO && tbrO.length === 3) winner = "O";

    let tbl = new Array(3);
    switch ([x, y].join("")) {
      case "02":
        updateTbl(this.positions);
        break;
      case "11":
        updateTbl(this.positions);
        break;
      case "20":
        updateTbl(this.positions);
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

    let count = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.positions[i][j] === "X" || this.positions[i][j] === "O")
          count++;
      }
    }

    if (count === 9) socket.emit("message", `!EMPATE!`);
  }
}

let b = new Board(new Array());
b.draw();

function selectSymbol(symbol) {
  sessionStorage.setItem("symbol", symbol);
  socket.emit("symbol", symbol);
  // Remove start screen
  document.querySelector(".start-screen").remove();
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
