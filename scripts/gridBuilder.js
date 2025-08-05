"use strict";

(function () {
  // Handler para correr en Local y en GitHubPages sin problemas
  var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var base = document.createElement('base');
  base.href = isLocal ? '/' : '/Doomsweeper-Bassi_Regiardo/';
  document.head.appendChild(base);

  openGitHubPage();

  var rows = 0;
  var cols = 0;
  var bombs = 0;
  var flags = 0;
  var revealedCells = 0;
  var timerId = null;

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
    contadorBanderas();
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

  function openGitHubPage(){
    var nav = document.getElementById("GitHubPage");
    nav.addEventListener("click", function(event){
      event.preventDefault();
      window.open("https://github.com/RegiardoManuel3an/Doomsweeper-Bassi_Regiardo", "_blank");
    })
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

    var sonidoFlag = new Audio(base.href + "resources/audio/sfx/cellFlag.wav");
    sonidoFlag.currentTime = 0;
    sonidoFlag.play();
    
    if (cell.flagged) {
      cell.flagged = false;
      cell.element.className = cell.element.className.replace(' flagged', '');
      cell.element.innerHTML = '';
      flags += 1;
      contadorBanderas();
      return;
    }

    if (flags <= 0) {
      showModal('No te quedan banderas!', 'No puedes marcar más celdas.', 'flags');
      return;
    }

    cell.flagged = true;
    cell.element.className += ' flagged';
    flags -= 1;
    contadorBanderas();
  }

  function onRightClick(e) {
    e.preventDefault();
    var r = parseInt(this.dataset.row, 10);
    var c = parseInt(this.dataset.col, 10);
    flagCell(r, c);
  }

  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function startTimer() {
    var timer = document.getElementById('timerPlaceholder');
    var seconds = 0;
    if (timerId === null){
      timerId = setInterval(function() {
        seconds++;
        timer.innerHTML = formatTime(seconds);
      }, 1000); 
    }

    var input = document.querySelector("#usernameInput");
    input.disabled = true;
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    var input = document.querySelector("#usernameInput");
    input.disabled = false;
  }

  function onFirstClick(r, c, event) {

    var usercheck = checkUserName();
    if (!usercheck) {
      return;
    }

    var img = document.querySelector('.DoomGuyIMG');
    img.src = base.href + "resources/images/hudTextures/ingameAnimation.gif";
    
    var cell = grid[r][c];
    cell.revealed = true;
    cell.isBomb = false;
    placeBombs();
    calculateNeighbors();
    startTimer();
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
      stopTimer();
      var difficulty = document.getElementById("difficultySelect").value;
      var timeStr = document.getElementById("timerPlaceholder").innerText;
      saveGameRecord(timeStr, difficulty);
      var img = document.querySelector('.DoomGuyIMG');
      img.src = base.href + "resources/images/hudTextures/doomGuySmile.png";

      showModal('RIP AND TEAR!', '🎉 Has ganado el juego!', 'Win');
      revealAll();
    }
  }
  function saveGameRecord(timeStr, difficulty) {
  var input = document.getElementById("usernameInput");
  var name = input ? input.value.toUpperCase().trim() : "???";
  name = name.replace(/[^A-Z]/g, "").substring(0, 3);
  if (name.length < 3) {
    name = name.padEnd(3, "_"); // Ej: "A_" → "A__"
  }
  var date = new Date().toLocaleString();
  var record = { name, date, time: timeStr, difficulty };
  var history = JSON.parse(localStorage.getItem("doomsweeperHistory")) || [];
  history.push(record);
  localStorage.setItem("doomsweeperHistory", JSON.stringify(history));
}
  function revealCell(r, c) {
    var cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if(!checkUserName()){
      return;
    }

    if (revealedCells === 0) {
      onFirstClick(r, c, 'reveal');
    }
    
    var sonidoReveal = new Audio(base.href + "resources/audio/sfx/cellReveal.wav");
    var sonidoBomb = new Audio(base.href + "resources/audio/sfx/cellBomb.wav");

    cell.revealed = true;
    cell.element.className += ' revealed';
    revealedCells += 1;

    if (cell.isBomb) {
      cell.element.className += ' bomb';
      cell.element.style.backgroundColor = 'red';
      sonidoBomb.play();
      showModal('YOU ARE DEAD!', '💥 Encontraste un Caco!', 'Death');
      var img = document.querySelector('.DoomGuyIMG');
      img.src = base.href + "resources/images/hudTextures/doomGuyMelt.gif";
      stopTimer();
      revealAll();
      return;
    }

    sonidoReveal.currentTime = 0;
    sonidoReveal.play();

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

  function checkUserName(){
    var input = document.querySelector("#usernameInput");
    if (input == null || input.value.trim() === "") {
    showModal('Nombre invalido', 'Por favor, ingresa tu nombre (solo letras, maximo 3 caracteres).', 'NameError');
    input.style.borderColor = "red";
    input.style.borderStyle = "solid";
    input.style.borderWidth = "3px";
    return false;
    }
    input.style.borderColor = "black";
    return true;
  }

  function restartGame() {
  
    if(!checkUserName()){
    return;
    }

  var img = document.querySelector('.DoomGuyIMG');
  img.src = base.href + "resources/images/hudTextures/doomGuyIdle.png";
  stopTimer();
  changeDifficulty(); 
  flags = bombs; 
  revealedCells = 0;
  createGrid();
}
function openScoreboardModal() {
  var modal = document.getElementById("ScoreboardModal");
  var content = document.getElementById("scoreboardContent");
  var history = JSON.parse(localStorage.getItem("doomsweeperHistory")) || [];

  var html = "<h3>Historial de Partidas</h3>";
  if (history.length === 0) {
    html += "<p>No hay partidas registradas.</p>";
  } else {
    html += '<ul style="list-style-type: none; padding: 0;">';
    history.forEach(function(record) {
      html += '<li style="margin-bottom: 8px;">' +
        '<strong>' + record.name + '</strong> – ' + record.difficulty + ' – ' + record.time + ' – ' + record.date +
        '</li>';
    });
    html += '</ul>';
  }

  content.innerHTML = html;
  modal.style.display = "block";
}

function toSeconds(str) {
  var parts = str.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
function sortScoreboardBy(criteria) {
  var history = JSON.parse(localStorage.getItem("doomsweeperHistory")) || [];
  if (criteria === "date") {
    history.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }
  if (criteria === "time") {
    history.sort(function (a, b) {
      return toSeconds(a.time) - toSeconds(b.time);
    });
  }
  var content = document.getElementById("scoreboardContent");
  var html = "<h3>Historial de Partidas</h3>";
  if (history.length === 0) {
    html += "<p>No hay partidas registradas.</p>";
  } else {
    html += '<ul style="list-style-type: none; padding: 0;">';
    history.forEach(function(record) {
      html += '<li style="margin-bottom: 8px;">' +
        '<strong>' + record.name + '</strong> – ' + record.difficulty + ' – ' + record.time + ' – ' + record.date +
        '</li>';
    });
    html += '</ul>';
  }
  content.innerHTML = html;
}
window.sortScoreboardBy = sortScoreboardBy;

function closeScoreboardModal() {
  var modal = document.getElementById("ScoreboardModal");
  modal.style.display = "none";
}
window.closeScoreboardModal = closeScoreboardModal;
function contadorBanderas() {
    var contador = document.getElementById('flagsCount');
    if (contador) {
      contador.innerHTML = flags;
    }
}

  createGrid();

var doomGuy = document.querySelector('.DoomGuyIMG');
if (doomGuy) {
    doomGuy.addEventListener('click', restartGame);
}
var historyButton = document.getElementById("timerPlaceholder");
if (historyButton) {
  historyButton.addEventListener("click", openScoreboardModal);
}

})();