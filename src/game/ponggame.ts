// pongGame.ts

export interface PongOptions {
  canvas: HTMLCanvasElement;
  leftPlayer: string;
  rightPlayer: string;
  handleMatchEnd: (left: string, right: string, lScore: number, rScore: number) => void;
}

export function startPong({
  canvas,
  leftPlayer,
  rightPlayer,
  handleMatchEnd,
}: PongOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = 800;
  canvas.height = 400;

  const paddleHeight = 80;
  const paddleWidth = 10;

  let leftY = canvas.height / 2 - paddleHeight / 2;
  let rightY = canvas.height / 2 - paddleHeight / 2;
  const paddleSpeed = 6;

  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballSpeedX = 2;
  let ballSpeedY = 2;
  const ballRadius = 8;

  let leftScore = 0;
  let rightScore = 0;
  const winningScore = 5; // stop game at 5

  let gameOver = false;
  let animationId: number;

  function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // paddles
    ctx.fillStyle = "white";
    ctx.fillRect(20, leftY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 20 - paddleWidth, rightY, paddleWidth, paddleHeight);

    // ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // scores
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(leftScore.toString(), canvas.width / 4, 30);
    ctx.fillText(rightScore.toString(), (3 * canvas.width) / 4, 30);

    // === GAME OVER screen ===
    if (gameOver) {
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      ctx.textAlign = "center";

      let winner =
        leftScore > rightScore ? `${leftPlayer} Wins!` : `${rightPlayer} Wins!`;

      ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 60);
      ctx.fillText(winner, canvas.width / 2 + 120, canvas.height / 2 + 40);

      // Show "Back to Main Menu" button
      showMainMenuButton();
    }
  }

  function update() {
    if (gameOver) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
      ballSpeedY = -ballSpeedY;
    }

    if (
      ballX - ballRadius < 20 + paddleWidth &&
      ballY > leftY &&
      ballY < leftY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    if (
      ballX + ballRadius > canvas.width - 20 - paddleWidth &&
      ballY > rightY &&
      ballY < rightY + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }

    if (ballX - ballRadius < 0) {
      rightScore++;
      if (rightScore >= winningScore) {
        endGame();
        return;
      }
      resetBall();
    }

    if (ballX + ballRadius > canvas.width) {
      leftScore++;
      if (leftScore >= winningScore) {
        endGame();
        return;
      }
      resetBall();
    }
  }

  function gameLoop() {
    update();
    draw();
    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationId);
    handleMatchEnd(leftPlayer, rightPlayer, leftScore, rightScore);
    draw();
  }

  // === MAIN MENU BUTTON ===
  function showMainMenuButton() {
    let button = document.getElementById("mainMenuBtn") as HTMLButtonElement;

    if (!button) {
      button = document.createElement("button");
      button.id = "mainMenuBtn";
      button.innerText = "Back to Main Menu";

      // style
      button.style.position = "absolute";
      button.style.top = "50%";
      button.style.left = "50%";
      button.style.transform = "translate(-50%, -50%)";
      button.style.padding = "10px 20px";
      button.style.fontSize = "18px";
      button.style.backgroundColor = "indigo";
      button.style.border = "2px solid black";
      button.style.cursor = "pointer";

      // on click
      button.onclick = () => {
        window.location.href = "/";
      };

      document.body.appendChild(button);
    }
  }

  // Paddle movement
  const keys: Record<string, boolean> = {};
  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  function movePaddles() {
    if (keys["w"] && leftY > 0) leftY -= paddleSpeed;
    if (keys["s"] && leftY < canvas.height - paddleHeight) leftY += paddleSpeed;
    if (keys["ArrowUp"] && rightY > 0) rightY -= paddleSpeed;
    if (keys["ArrowDown"] && rightY < canvas.height - paddleHeight) rightY += paddleSpeed;

    if (!gameOver) requestAnimationFrame(movePaddles);
  }

  gameLoop();
  movePaddles();
}
