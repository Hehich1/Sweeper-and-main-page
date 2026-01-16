// script.js
let gridSize = 10;
let mineCount = 10;
const game = document.getElementById('game');
const restartButton = document.getElementById('restart');

let cells = [];
let minePositions = [];

function startGame() {
  game.innerHTML = '';
  game.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
  game.style.gridTemplateRows = `repeat(${gridSize}, 30px)`;
  cells = [];
  minePositions = generateMines();
  createBoard();
}

function generateMines() {
  const positions = [];
  while (positions.length < mineCount) {
    const pos = Math.floor(Math.random() * gridSize * gridSize);
    if (!positions.includes(pos)) positions.push(pos);
  }
  return positions;
}

function createBoard() {
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    cell.addEventListener('click', () => revealCell(i));
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      toggleFlag(i);
    });

	cell.addEventListener('dblclick', () => chordCell(i));
    game.appendChild(cell);
    cells.push(cell);
  }
}

function revealCell(index) {
  const cell = cells[index];
  if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

  // Reveal this cell
  cell.classList.add('revealed');

  // If this cell is a mine — game over
  if (minePositions.includes(index)) {
    cell.classList.add('mine');
    revealAll();
    alert('Boom! Game Over.');
    return;
  }

  const mineCount = countAdjacentMines(index);

  if (mineCount > 0) {
    cell.textContent = mineCount;
	cell.dataset.num = mineCount;
  } else {
    // Flood fill from this empty cell
    revealEmptyCells(index);
  }

  checkWin();
}

function toggleFlag(index) {
  const cell = cells[index];
  if (cell.classList.contains('revealed')) return;
  cell.classList.toggle('flagged');
}

function countAdjacentMines(index) {
  const neighbors = getNeighbors(index);
  return neighbors.filter(n => minePositions.includes(n)).length;
}

function getNeighbors(index) {
  const neighbors = [];
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        neighbors.push(ny * gridSize + nx);
      }
    }
  }
  return neighbors;
}

function revealEmptyCells(index) {
  const stack = [index];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);

    const cell = cells[current];
    if (!cell || cell.classList.contains('flagged')) continue;

    const mineCount = countAdjacentMines(current);
    cell.classList.add('revealed');

    if (mineCount > 0) {
      cell.textContent = mineCount;
	  cell.dataset.num = mineCount;
    } else {
      // Expand into all 8 neighbors
      const neighbors = getNeighbors(current);
      neighbors.forEach(n => {
        const neighbor = cells[n];
        if (neighbor && !neighbor.classList.contains('revealed')) {
          stack.push(n);
        }
      });
    }
  }
}

function revealAll() {
  cells.forEach((cell, i) => {
    if (minePositions.includes(i)) {
      cell.classList.add('mine');
    }
  });
}

function chordCell(index) {
  const cell = cells[index];
  if (!cell.classList.contains('revealed')) return;

  const number = parseInt(cell.textContent);
  if (isNaN(number) || number === 0) return;

  const neighbors = getNeighbors(index);
  const flagged = neighbors.filter(n => cells[n].classList.contains('flagged')).length;

  // Only chord if the number of flags equals the cell number
  if (flagged === number) {
    neighbors.forEach(n => {
      const neighbor = cells[n];
      if (!neighbor.classList.contains('flagged') && !neighbor.classList.contains('revealed')) {
        // Reveal this cell
        if (minePositions.includes(n)) {
          neighbor.classList.add('mine');
          revealAll();
          alert('Boom! Better luck next time.');
          return;
        }
        revealCell(n);
      }
    });
  }
}


function checkWin() {
  const revealed = cells.filter(c => c.classList.contains('revealed')).length;
  if (revealed === gridSize * gridSize - mineCount) {
    alert('You Win!');
    revealAll();
  }
}

const sizeInput = document.getElementById("sizeInput");

restartButton.addEventListener("click", () => {
  const newSize = parseInt(sizeInput.value);

  if (newSize >= 5 && newSize <= 30) {
    gridSize = newSize;
    mineCount = Math.floor(newSize * newSize * 0.15); 
  }

  startGame();
});
startGame();
