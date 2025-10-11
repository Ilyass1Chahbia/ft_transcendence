type TicTacToeOptions = {
  canvas: HTMLCanvasElement;
  playerX: string;
  playerO: string;
  handleGameEnd: (winner: string | null) => void;
};

let animationFrame: number | null = null;

export function startTicTacToe({
  canvas,
  playerX,
  playerO,
  handleGameEnd,
}: TicTacToeOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let currentPlayer = "X";
  const board: string[][] = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  const cellSize = canvas.width / 3;
  let gameEnded = false;

  // Draw board
  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#EAB308";
    ctx.lineWidth = 4;

    // Draw grid
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw X and O
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = j * cellSize + cellSize / 2;
        const y = i * cellSize + cellSize / 2;
        if (board[i][j] === "X") {
          ctx.strokeStyle = "#F76806";
          ctx.beginPath();
          ctx.moveTo(x - 40, y - 40);
          ctx.lineTo(x + 40, y + 40);
          ctx.moveTo(x + 40, y - 40);
          ctx.lineTo(x - 40, y + 40);
          ctx.stroke();
        } else if (board[i][j] === "O") {
          ctx.strokeStyle = "#337a9e";
          ctx.beginPath();
          ctx.arc(x, y, 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  function checkWinner(player: string): boolean {
    for (let i = 0; i < 3; i++) {
      if (
        board[i][0] === player &&
        board[i][1] === player &&
        board[i][2] === player
      )
        return true;
      if (
        board[0][i] === player &&
        board[1][i] === player &&
        board[2][i] === player
      )
        return true;
    }
    if (
      board[0][0] === player &&
      board[1][1] === player &&
      board[2][2] === player
    )
      return true;
    if (
      board[0][2] === player &&
      board[1][1] === player &&
      board[2][0] === player
    )
      return true;
    return false;
  }

  function isDraw(): boolean {
    return board.flat().every((c) => c !== "");
  }

  function handleClick(e: MouseEvent) {
    if (gameEnded) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const i = Math.floor(y / cellSize);
    const j = Math.floor(x / cellSize);

    if (board[i][j] === "") {
      board[i][j] = currentPlayer;
      drawBoard();

      if (checkWinner(currentPlayer)) {
        gameEnded = true;
        handleGameEnd(currentPlayer === "X" ? playerX : playerO);
        return;
      } else if (isDraw()) {
        gameEnded = true;
        handleGameEnd(null);
        return;
      }

      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  }

  drawBoard();
  canvas.addEventListener("click", handleClick);

  // Cleanup
  stopTicTacToe();
  animationFrame = requestAnimationFrame(drawBoard);
}

export function stopTicTacToe() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}
