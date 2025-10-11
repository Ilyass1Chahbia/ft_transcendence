"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { startPong, stopPong } from "../../game/ponggame"; // stopPong to cancel Pong loop
import { startTicTacToe, stopTicTacToe } from "../../game/tictactoe"; // stopTicTacToe to cancel X-O loop

export default function Tournament() {
  const searchParams = useSearchParams();

  const initialMatchesParam = searchParams?.get("matches");
  let initialMatches: [string, string][] = [
    ["Alice", "Bob"],
    ["Charlie", "Dave"],
  ];
  if (initialMatchesParam) {
    try {
      const decoded = decodeURIComponent(initialMatchesParam);
      initialMatches = JSON.parse(decoded);
    } catch (err) {
      console.error("Failed to parse matches from searchParams", err);
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches] = useState<[string, string][]>(initialMatches);
  const [matchEnded, setMatchEnded] = useState(false);
  const [gameType, setGameType] = useState<"pong" | "xo">("pong");

  const currentMatch = matches[currentMatchIndex] || null;

  const handleMatchEnd = (winner: string | null) => {
    setMatchEnded(true);
    if (winner) {
      alert(`${winner} won!`);
    } else {
      alert("Draw!");
    }
  };

  // Start / switch game
  useEffect(() => {
    if (!canvasRef.current || !currentMatch) return;

    // Stop previous game
    stopPong();
    stopTicTacToe();

    setMatchEnded(false);
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const [player1, player2] = currentMatch;

    if (gameType === "pong") {
      startPong({
        canvas: canvasRef.current,
        leftPlayer: player1,
        rightPlayer: player2,
        handleMatchEnd,
        winScore: 5,
      });
    } else {
      startTicTacToe({
        canvas: canvasRef.current,
        playerX: player1,
        playerO: player2,
        handleGameEnd: handleMatchEnd,
      });
    }

    // Cleanup when component unmounts
    return () => {
      stopPong();
      stopTicTacToe();
    };
  }, [currentMatch, gameType]);

  const handleNextMatch = () => {
    if (currentMatchIndex + 1 < matches.length) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      alert("Tournament finished!");
      setCurrentMatchIndex(0);
    }
  };

  const handleRestart = () => {
    if (!currentMatch || !canvasRef.current) return;
    setMatchEnded(false);

    const [player1, player2] = currentMatch;

    if (gameType === "pong") {
      startPong({
        canvas: canvasRef.current,
        leftPlayer: player1,
        rightPlayer: player2,
        handleMatchEnd,
        winScore: 5,
      });
    } else {
      startTicTacToe({
        canvas: canvasRef.current,
        playerX: player1,
        playerO: player2,
        handleGameEnd: handleMatchEnd,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <h1 className="text-3xl font-bold text-yellow-500 mb-4">Tournament</h1>

      {/* Game Type Switch */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${gameType === "pong" ? "bg-yellow-500 text-slate-950" : "bg-slate-950 text-yellow-500 border border-yellow-500"}`}
          onClick={() => setGameType("pong")}
        >
          Play Pong
        </button>
        <button
          className={`px-4 py-2 rounded ${gameType === "xo" ? "bg-yellow-500 text-slate-950" : "bg-slate-950 text-yellow-500 border border-yellow-500"}`}
          onClick={() => setGameType("xo")}
        >
          Play X-O
        </button>
      </div>

      {currentMatch && (
        <p className="mb-4 text-xl text-yellow-500 font-bold">
          {currentMatch[0]} vs {currentMatch[1]}
        </p>
      )}

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border border-yellow-500 bg-slate-950 mb-4"
      />

      {matchEnded && (
        <div className="flex gap-4">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 px-4 py-2 rounded"
            onClick={handleRestart}
          >
            Restart Match
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 px-4 py-2 rounded"
            onClick={handleNextMatch}
          >
            Next Match
          </button>
        </div>
      )}
    </div>
  );
}
