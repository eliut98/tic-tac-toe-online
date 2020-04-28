const socket = io();

socket.on("turn", ({ turn }) => {
  const symbol = sessionStorage.getItem("symbol");
  sessionStorage.setItem("turn", turn);
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
      this.board.innerHTML += `<div class="row" data-id="${i}"></div>`;
      for (let j = 0; j < 3; j++) {
        const col = `<div class="col" data-id="${i}${j}"></div>`;
        document.querySelector(`[data-id="${i}"]`).innerHTML += col;
      }
    }
  }
  setPosition(x, y, value, symbol) {
    // Check if the column is empty and if it's my turn
    if (value === symbol) {
      // Toggle turn
      socket.emit("turn", {
        turn: value === "X" ? "O" : "X",
        x,
        y,
        value
      });
    }
  }
  drawPosition(x, y, value) {
    document.querySelector(
      `[data-id="${x}${y}"]`
    ).innerHTML = `<span class="${value}">${value}</span>`;
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

socket.on("drawPosition", ({ x, y, value }) => b.drawPosition(x, y, value));

socket.on("replay", () => window.location.reload());

socket.on("message", winner => {
  const symbol = sessionStorage.getItem("symbol");
  document.getElementById("message").innerHTML =
    winner === symbol ? "¡HAS GANADO!" : `¡HA GANADO ${winner}!`;
  document.getElementById("message").classList.add("win");
  document.querySelector("#board").remove();
  document.querySelector("button").style.display = "block";
  document.querySelector("button").classList.add("win");
});

socket.on("draw", () => {
  document.getElementById("message").innerHTML = "¡EMPATE!";
  document.getElementById("message").classList.add("win");
  document.querySelector("#board").remove();
  document.querySelector("button").style.display = "block";
  document.querySelector("button").classList.add("win");
});
