export interface PongOptions {
  canvas: HTMLCanvasElement;
  leftPlayer: string;
  rightPlayer: string;
  handleMatchEnd: (winner: string) => void;
  winScore?: number;
  map: "default" | "inverted";
  onScoreUpdate: (scores: { left: number; right: number }) => void;
}

let animationFrame: number | null = null;
let countdownInterval: NodeJS.Timeout | null = null;

export function startPong({
  canvas,
  leftPlayer,
  rightPlayer,
  handleMatchEnd,
  winScore = 5,
  map = "default",
  onScoreUpdate,
}: PongOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = {
    default: {
      background: "#000000",
      paddle: "#ffdf20",
      ball: "#ffdf20",
      text: "#ffdf20",
    },
    inverted: {
      background: "#ffdf20",
      paddle: "#000000",
      ball: "#000000",
      text: "#000000",
    },
  };

  const colorScheme = colors[map];

  // --- Game State ---
  const paddleWidth = 15;
  const paddleHeight = 100;
  const paddleSpeed = 8;

  const ballRadius = 10;
  const initialSpeed = 5;

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

  // --- Obstacles for the inverted map ---
  const obstacles =
    map === "inverted"
      ? [
          { x: canvas.width / 2 - 25, y: 150, width: 50, height: 50 },
          { x: canvas.width / 2 - 25, y: canvas.height - 200, width: 50, height: 50 },
        ]
      : [];


  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 0, // Initially zero
    dy: 0, // Initially zero
  };

  let leftScore = 0;
  let rightScore = 0;
  let gameOver = false;

  // New state for countdown and animations
  let countdown: number | null = 3;
  let isPausedForCountdown = true;
  let scoreToAnimate: { score: string; opacity: number } | null = null;


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
    if (gameOver || isPausedForCountdown) return;

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
      ball.dx < 0 &&
      ball.x - ballRadius <= leftPaddle.x + paddleWidth &&
      ball.y >= leftPaddle.y &&
      ball.y <= leftPaddle.y + paddleHeight
    ) {
      ball.x = leftPaddle.x + paddleWidth + ballRadius; // reposition
      const relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
      const normalized = relativeIntersectY / (paddleHeight / 2);
      const maxBounceAngle = Math.PI / 4; // 45°
      const bounceAngle = normalized * maxBounceAngle;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) * 1.02; // slight acceleration

      ball.dx = Math.abs(speed * Math.cos(bounceAngle));
      ball.dy = speed * Math.sin(bounceAngle);
    }

    // Right paddle
    if (
      ball.dx > 0 &&
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

    // --- Obstacle collisions ---
    obstacles.forEach((obstacle) => {
      // Find the closest point on the obstacle to the center of the ball
      const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
      const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));

      // Calculate the distance between the ball's center and this closest point
      const distanceX = ball.x - closestX;
      const distanceY = ball.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      // If the distance is less than the ball's radius, a collision has occurred
      if (distanceSquared < ballRadius * ballRadius) {
        const overlap = ballRadius - Math.sqrt(distanceSquared);
        const normX = distanceX / Math.sqrt(distanceSquared);
        const normY = distanceY / Math.sqrt(distanceSquared);

        // Move the ball out of the obstacle
        ball.x += normX * overlap;
        ball.y += normY * overlap;

        // Bounce the ball by reversing its velocity
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
          ball.dx *= -1;
        } else {
          ball.dy *= -1;
        }
      }
    });


    // --- Scoring ---
    if (ball.x + ballRadius < 0) {
      rightScore++;
      onScoreUpdate({ left: leftScore, right: rightScore });
      scoreToAnimate = { score: `${leftScore} - ${rightScore}`, opacity: 1.0 };
      resetRound("right");
    } else if (ball.x - ballRadius > canvas.width) {
      leftScore++;
      onScoreUpdate({ left: leftScore, right: rightScore });
      scoreToAnimate = { score: `${leftScore} - ${rightScore}`, opacity: 1.0 };
      resetRound("left");
    }

    if (leftScore >= winScore) {
      endGame(leftPlayer);
    } else if (rightScore >= winScore) {
      endGame(rightPlayer);
    }
  }

  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    isPausedForCountdown = true;
    countdown = 3;
    countdownInterval = setInterval(() => {
      countdown!--;
      if (countdown! <= 0) {
        clearInterval(countdownInterval!);
        countdownInterval = null;
        countdown = null;
        isPausedForCountdown = false;
      }
    }, 1000);
  }

  function resetRound(direction: "left" | "right") {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const dir = direction === "left" ? -1 : 1;
    ball.dx = dir * initialSpeed;
    ball.dy = (Math.random() - 0.5) * 4;
    startCountdown(); // Start countdown after scoring
  }

  function endGame(winner: string) {
    gameOver = true;
    if (countdownInterval) clearInterval(countdownInterval);
    cancelAnimationFrame(animationFrame!);
    handleMatchEnd(winner);
  }

  function updateScoreAnimation() {
    if (scoreToAnimate) {
      scoreToAnimate.opacity -= 0.01; // Fade out speed
      if (scoreToAnimate.opacity <= 0) {
        scoreToAnimate = null;
      }
    }
  }

  // --- Draw ---
  function draw() {
    ctx.fillStyle = colorScheme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = colorScheme.paddle;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

    // Draw obstacles
    if (map === "inverted") {
      ctx.fillStyle = colorScheme.paddle; // Same color as paddles
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    }


    // Draw ball
    if (!isPausedForCountdown) {
      ctx.fillStyle = colorScheme.ball;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw countdown
    if (countdown !== null && countdown > 0) {
      ctx.font = "100px Arial";
      ctx.fillStyle = colorScheme.text;
      ctx.textAlign = "center";
      ctx.fillText(String(countdown), canvas.width / 2, canvas.height / 2);
    }

    // Draw score animation
    if (scoreToAnimate) {
      ctx.font = "120px Arial";
      ctx.globalAlpha = scoreToAnimate.opacity;
      ctx.fillStyle = colorScheme.text;
      ctx.textAlign = "center";
      ctx.fillText(
        scoreToAnimate.score,
        canvas.width / 2,
        canvas.height / 2 - 200
      );
      ctx.globalAlpha = 1.0; // Reset alpha
    }
  }

  function loop() {
    update();
    updateScoreAnimation();
    draw();
    if (!gameOver) animationFrame = requestAnimationFrame(loop);
  }

  resetRound(Math.random() > 0.5 ? "left" : "right");
  loop();


  // Cleanup listeners when stopping
  return () => {
    if (countdownInterval) clearInterval(countdownInterval);
    document.removeEventListener("keydown", keyDown);
    document.removeEventListener("keyup", keyUp);
  };
}

export function stopPong() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}