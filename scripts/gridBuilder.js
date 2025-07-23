"use strict";

(function () {
  var rows = 0;
  var cols = 0;
  var bombs = 0;
  var flags = 0;
  var revealedCells = 0;

  function changeDifficulty() {
    var difficulty = document.getElementById('difficultySelect').value;
    switch (difficulty) {
      case 'easy':
        rows = 8;
        cols = 8;
        bombs = 10;
        break;
      case 'medium':
        rows = 12;
        cols = 12;
        bombs = 25;
        break;
      case 'hard':
        rows = 16;
        cols = 16;
        bombs = 40;
        break;
      default:
        rows = 8;
        cols = 8;
        bombs = 10;
    }
    flags = bombs;
  }
  
  var difficultySelect = document.getElementById('difficultySelect');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', changeDifficulty);
  }

  var gameContainer = document.getElementById('GameGrid');
  var grid = [];

  function createGrid() {
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    gameContainer.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    grid = [];

    for (var r = 0; r < rows; r++) {
      grid[r] = [];
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        gameContainer.appendChild(cell);
        grid[r][c] = {
          element: cell,
          isBomb: false,
          revealed: false,
          flagged: false,
          neighborBombs: 0
        };
        cell.addEventListener('click', onCellClick);
        cell.addEventListener('contextmenu', onRightClick);
      }
    }
  }

  function placeBombs() {
    var placed = 0;
    while (placed < bombs) {
      var r = Math.floor(Math.random() * rows);
      var c = Math.floor(Math.random() * cols);
      if (!grid[r][c].isBomb && !grid[r][c].revealed) {
        grid[r][c].isBomb = true;
        placed++;
      }
    }
  }

  function calculateNeighbors() {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (grid[r][c].isBomb) continue;

        var count = 0;
        for (var i = -1; i <= 1; i++) {
          for (var j = -1; j <= 1; j++) {
            var nr = r + i;
            var nc = c + j;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (grid[nr][nc].isBomb) {
                count++;
              }
            }
          }
        }
        grid[r][c].neighborBombs = count;
      }
    }
  }

  function flagCell(r, c) {
    var cell = grid[r][c];
    if (cell.revealed) return;
    
    if (cell.flagged) {
      cell.flagged = false;
      cell.element.className = cell.element.className.replace(' flagged', '');
      cell.element.innerHTML = '';
      flags += 1;
      return;
    }

    if (flags <= 0) {
      showModal('No te quedan banderas!', 'No puedes marcar más celdas.', 'flags');
      return;
    }

    cell.flagged = true;
    cell.element.className += ' flagged';
    flags -= 1;
  }

  function onRightClick(e) {
    e.preventDefault();
    var r = parseInt(this.dataset.row, 10);
    var c = parseInt(this.dataset.col, 10);
    flagCell(r, c);
  }

  function onFirstClick(r, c, event) {
    var img = document.querySelector('.DoomGuyIMG');
    img.src = '.../resources/images/hudTextures/ingameAnimation.gif';
    
    var cell = grid[r][c];
    cell.revealed = true;
    cell.isBomb = false;
    placeBombs();
    calculateNeighbors();
    
    // TBD: Crear Timer
  }
  
  function revealAll() {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = grid[r][c];
        if (!cell.revealed) {
          cell.revealed = true;
          cell.element.className += ' revealed';
          if (cell.isBomb) {
            cell.element.className += ' bomb';
          } else if (cell.neighborBombs > 0 && !cell.flagged) {
            cell.element.innerHTML = cell.neighborBombs;
            cell.element.setAttribute('data-value', cell.neighborBombs);
          }
        }
      }
    }
  }

  function checkWinCondition(){
    var cells = rows * cols;
    var nonBombCells = cells - bombs;
    if (revealedCells === nonBombCells) {
      showModal('RIP AND TEAR!', '🎉 Has ganado el juego!', 'Win');
      revealAll();
    }
  }

  function revealCell(r, c) {
    var cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if (revealedCells === 0) {
      onFirstClick(r, c, 'reveal');
    }

    cell.revealed = true;
    cell.element.className += ' revealed';
    revealedCells += 1;

    if (cell.isBomb) {
      cell.element.className += ' bomb';
      cell.element.style.backgroundColor = 'red';
      showModal('YOU ARE DEAD!', '💥 Encontraste un Caco!', 'Death');
      revealAll();
      return;
    }

    if (cell.neighborBombs > 0) {
      cell.element.innerHTML = cell.neighborBombs;
      cell.element.setAttribute('data-value', cell.neighborBombs);
    } else {
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          var nr = r + i;
          var nc = c + j;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            revealCell(nr, nc);
          }
        }
      }
    }
    checkWinCondition();
  }

  function onCellClick(e) {
    var r = parseInt(this.dataset.row, 10);
    var c = parseInt(this.dataset.col, 10);
    revealCell(r, c);
  }


function restartGame() {
  var img = document.querySelector('.DoomGuyIMG');
  img.src = '.../resources/images/hudTextures/doomGuyIdle.png';
  changeDifficulty(); 
  flags = bombs; 
  revealedCells = 0;
  createGrid();
}

  createGrid();

  var doomGuy = document.querySelector('.DoomGuyIMG');
  if (doomGuy) {
    doomGuy.addEventListener('click', restartGame);
  }
})();