function GameBoard() {
  const size = 3;
  let board;
  reset();

  function reset() {
    board = [];
    for (let i = 0; i < size; i++) {
      board.push([]);
      for (let j = 0; j < size; j++) {
        board[i].push(0);
      }
    }
  }

  function placeMark(row, col, mark) {
    if (board[row][col]) return false;

    board[row][col] = mark;
    return true;
  }

  function print() {
    console.table(board);
  }

  function isFull() {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  function isWinner(mark) {
    for (let i = 0; i < size; i++) {
      if (board[i].every((cell) => cell === mark)) return true;
    }

    for (let j = 0; j < size; j++) {
      let colWin = true;
      for (let i = 0; i < size; i++) {
        if (board[i][j] !== mark) {
          colWin = false;
          break;
        }
      }
      if (colWin) return true;
    }

    let diagWin1 = true;
    for (let i = 0; i < size; i++) {
      if (board[i][i] !== mark) {
        diagWin1 = false;
        break;
      }
    }
    if (diagWin1) return true;

    let diagWin2 = true;
    for (let i = 0; i < size; i++) {
      if (board[i][size - 1 - i] !== mark) {
        diagWin2 = false;
        break;
      }
    }
    if (diagWin2) return true;

    return false;
  }

  const getBoard = () => board;

  return { reset, print, placeMark, isWinner, isFull, getBoard };
}

function Player(name, mark) {
  let score = 0;
  const getScore = () => score;
  const upScore = () => score++;
  return { name, mark, getScore, upScore };
}

function GameController(p1Name = "Player 1", p2Name = "Player 2") {
  const [ONGOING, P1WON, P2WON, TIE] = [0, 1, 2, 3];
  const board = GameBoard();
  const player1 = Player(p1Name, 1);
  const player2 = Player(p2Name, 2);
  let status;

  let activePlayer = player1;
  reset();

  function getInfo() {
    return {
      board: board.getBoard(),
      status,
      activePlayer: activePlayer.name,
      score: [player1.getScore(), player2.getScore()],
      players: [player1.name, player2.name],
    };
  }

  function setPlayerName(playerNumber, newName) {
    const player = playerNumber === 1 ? player1 : player2;
    player.name = newName;
  }

  function switchPlayerTurn() {
    activePlayer = activePlayer === player1 ? player2 : player1;
  }

  function switchPlayersMarks() {
    [player1.mark, player2.mark] = [player2.mark, player1.mark];
  }

  function playTurn(row, col) {
    if (status === ONGOING) {
      const isValidMove = board.placeMark(row, col, activePlayer.mark);

      if (isValidMove) {
        if (board.isFull()) {
          status = TIE;
        }

        if (board.isWinner(activePlayer.mark)) {
          status = activePlayer === player1 ? P1WON : P2WON;
          activePlayer.upScore();
        }

        switchPlayerTurn();
        if (status !== ONGOING) {
          if (activePlayer.mark === 2) switchPlayersMarks();
        }
      }
    }
  }

  function reset() {
    board.reset();
    status = 0;
  }

  return {
    playTurn,
    reset,
    getInfo,
    setPlayerName,
  };
}

function DOMController() {
  const h2Status = document.querySelector(".status");
  const divBoard = document.querySelector(".board");
  const h3Score = document.querySelector(".score");
  const btnReset = document.querySelector(".reset");
  const game = GameController();

  divBoard.addEventListener("click", handleBoardClick);
  btnReset.addEventListener("click", handleBtnResetClick);
  updateDivBoard();

  function handleBoardClick(e) {
    if (e.target.dataset.row) {
      const btn = e.target;
      game.playTurn(btn.dataset.row, btn.dataset.col);
      updateDivBoard();
    }
  }

  function handlePlayerNameEnter(e) {
    const enteredName = e.target.value;
    const playerId = e.target.dataset.player;
    game.setPlayerName(+playerId, enteredName);
    updateDivBoard();
  }

  function handleBtnResetClick(e) {
    game.reset();
    updateDivBoard();
  }

  function updateDivBoard() {
    const { board, status, activePlayer, score, players } = game.getInfo();

    const cells = [];
    for (const i in board) {
      for (const j in board[i]) {
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;
        if (board[i][j] === 1) cell.className += " x";
        if (board[i][j] === 2) cell.className += " o";
        cells.push(cell);
      }
    }
    divBoard.replaceChildren(...cells);

    let statusText;
    if (status === 0) statusText = `${activePlayer}'s turn:`;
    else if (status === 1) statusText = `${players[0]} won!`;
    else if (status === 2) statusText = `${players[1]} won!`;
    else if (status === 3) statusText = "It's a tie!";
    h2Status.textContent = statusText;

    const inputP1 = document.createElement("input");
    const inputP2 = document.createElement("input");
    const textScore = document.createTextNode(` ${score[0]} - ${score[1]} `);
    inputP1.value = `${players[0]}`;
    inputP2.value = `${players[1]}`;
    inputP1.dataset.player = 1;
    inputP2.dataset.player = 2;
    inputP1.addEventListener("blur", handlePlayerNameEnter);
    inputP2.addEventListener("blur", handlePlayerNameEnter);
    inputP1.addEventListener(`focus`, () => inputP1.select());
    inputP2.addEventListener(`focus`, () => inputP2.select());

    h3Score.replaceChildren(inputP1, textScore, inputP2);

    if (status === 0) {
      if (!btnReset.className.includes("hidden")) {
        btnReset.className += " hidden";
      }
    } else {
      btnReset.className = btnReset.className.replace(" hidden", "");
    }
  }
}

const app = DOMController();

/*

controller.playTurn(pos)
controller.resetGame
controller.getActivePlayer
controller.getBoard

DOMController (){

  controller
  divActivePlayer
  divBoard
  divResult
  divScore

  divBoard.addEventListener(
    pos = getPosFromTarget
    board.playTurn(pos)
  )

  updateDivBoard() {
  divActivePlayer: getActivePlayers's turn...
  divBoard: <buttons row="" col="">
  switch board.GameStatus()
  0:
    divResult: 
  1: 
    divResult....

  

  divScore: getScore()
  }




}






*/
