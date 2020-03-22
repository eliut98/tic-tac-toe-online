import "./style.scss";

sessionStorage.setItem("turn", "X");

class Board {
  constructor() {
    this.positions = new Array();
    this.board = document.getElementById("board");
    this.turn = true;
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
  setPosition(x, y, value) {
    if (!this.positions[x][y]) {
      this.positions[x][y] = value;
      this.checkWinner(x, y);
      this.drawPosition(x, y, value);
      // Toggle turn
      sessionStorage.setItem("turn", value === "X" ? "O" : "X");
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

    console.log(this.positions);

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

    console.log(tbl);

    if (winner) this.showWinner(winner);
  }

  showWinner(winner) {
    alert(`${winner} wins!!!`);
  }
}

let b = new Board();
b.draw();

const cols = document.querySelectorAll(".col[data-id]");

cols.forEach(col => {
  col.addEventListener("click", function() {
    const index = this.dataset.id;
    const [x, y] = index;
    const turn = sessionStorage.getItem("turn");
    b.setPosition(Number(x), Number(y), turn);
  });
});
