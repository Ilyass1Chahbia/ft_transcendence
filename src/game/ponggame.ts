export interface PongOptions {
  canvas: HTMLCanvasElement;
  leftPlayer: string;
  rightPlayer: string;
  handleMatchEnd: (winner: string) => void;
  winScore?: number;
}

let animationFrame: number | null = null;

export function startPong({
  canvas,
  leftPlayer,
  rightPlayer,
  handleMatchEnd,
  winScore = 5,
}: PongOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // --- Game State ---
  const paddleWidth = 15;
  const paddleHeight = 100;
  const paddleSpeed = 8;

  const ballRadius = 10;
  const initialSpeed = 6;

  const leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
  };

  const rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
  };

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: Math.random() > 0.5 ? initialSpeed : -initialSpeed,
    dy: (Math.random() - 0.5) * 4,
  };

  let leftScore = 0;
  let rightScore = 0;
  let gameOver = false;

  // --- Input ---
  const keys: Record<string, boolean> = {};
  function keyDown(e: KeyboardEvent) {
    keys[e.key] = true;
  }
  function keyUp(e: KeyboardEvent) {
    keys[e.key] = false;
  }
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  // --- Physics ---
  function update() {
    if (gameOver) return;

    // Move paddles
    if (keys["w"]) leftPaddle.y -= paddleSpeed;
    if (keys["s"]) leftPaddle.y += paddleSpeed;
    if (keys["ArrowUp"]) rightPaddle.y -= paddleSpeed;
    if (keys["ArrowDown"]) rightPaddle.y += paddleSpeed;

    // Clamp paddles inside canvas
    leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // --- Wall collisions (top/bottom) ---
    if (ball.y - ballRadius <= 0) {
      ball.y = ballRadius;
      ball.dy *= -1;
    } else if (ball.y + ballRadius >= canvas.height) {
      ball.y = canvas.height - ballRadius;
      ball.dy *= -1;
    }

    // --- Paddle collisions ---
    // Left paddle
    if (
      ball.x - ballRadius <= leftPaddle.x + paddleWidth &&
      ball.y >= leftPaddle.y &&
      ball.y <= leftPaddle.y + paddleHeight
    ) {
      ball.x = leftPaddle.x + paddleWidth + ballRadius; // reposition
      const relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
      const normalized = relativeIntersectY / (paddleHeight / 2);
      const maxBounceAngle = Math.PI / 4; // 45°
      const bounceAngle = normalized * maxBounceAngle;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.05; // slight acceleration

      ball.dx = Math.abs(speed * Math.cos(bounceAngle));
      ball.dy = speed * Math.sin(bounceAngle);
    }

    // Right paddle
    if (
      ball.x + ballRadius >= rightPaddle.x &&
      ball.y >= rightPaddle.y &&
      ball.y <= rightPaddle.y + paddleHeight
    ) {
      ball.x = rightPaddle.x - ballRadius; // reposition
      const relativeIntersectY = ball.y - (rightPaddle.y + paddleHeight / 2);
      const normalized = relativeIntersectY / (paddleHeight / 2);
      const maxBounceAngle = Math.PI / 4;
      const bounceAngle = normalized * maxBounceAngle;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.05;

      ball.dx = -Math.abs(speed * Math.cos(bounceAngle));
      ball.dy = speed * Math.sin(bounceAngle);
    }

    // --- Scoring ---
    if (ball.x + ballRadius < 0) {
      rightScore++;
      resetBall("right");
    } else if (ball.x - ballRadius > canvas.width) {
      leftScore++;
      resetBall("left");
    }

    if (leftScore >= winScore) {
      endGame(leftPlayer);
    } else if (rightScore >= winScore) {
      endGame(rightPlayer);
    }
  }

  function resetBall(direction: "left" | "right") {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const dir = direction === "left" ? -1 : 1;
    ball.dx = dir * initialSpeed;
    ball.dy = (Math.random() - 0.5) * 4;
  }

  function endGame(winner: string) {
    gameOver = true;
    cancelAnimationFrame(animationFrame!);
    handleMatchEnd(winner);
  }

  // --- Draw ---
  function draw() {
    ctx.fillStyle = "#020618";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#EAB308";
    ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = "24px Arial";
    ctx.fillText(`${leftPlayer}: ${leftScore}`, 50, 30);
    ctx.fillText(`${rightPlayer}: ${rightScore}`, canvas.width - 200, 30);
  }

  function loop() {
    update();
    draw();
    if (!gameOver) animationFrame = requestAnimationFrame(loop);
  }

  loop();

  // Cleanup listeners when stopping
  return () => {
    document.removeEventListener("keydown", keyDown);
    document.removeEventListener("keyup", keyUp);
  };
}

export function stopPong() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}
