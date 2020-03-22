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
}

let b = new Board();
b.draw();

const cols = document.querySelectorAll(".col[data-id]");

cols.forEach(col => {
  col.addEventListener("click", function() {
    const index = this.dataset.id;
    const [x, y] = index;
    const turn = sessionStorage.getItem("turn");

    b.setPosition(x, y, turn);

    console.log(b.positions);
  });
});
