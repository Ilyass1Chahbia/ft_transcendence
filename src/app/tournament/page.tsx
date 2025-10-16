"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { startPong, stopPong } from "../../game/ponggame";
import { startTicTacToe, stopTicTacToe } from "../../game/tictactoe";

export default function Tournament() {
  const searchParams = useSearchParams();
  const [matches, setMatches] = useState<[string, string][] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const map = searchParams?.get("map") as "default" | "inverted" | null;

  useEffect(() => {
    const matchesParam = searchParams.get("matches");
    if (matchesParam) {
      try {
        const decoded = decodeURIComponent(matchesParam);
        const parsedMatches = JSON.parse(decoded);
        if (Array.isArray(parsedMatches) && parsedMatches.length > 0) {
          setMatches(parsedMatches);
        }
      } catch (err) {
        console.error("Failed to parse matches from searchParams", err);
        setMatches([["Player 1", "Player 2"]]); // Fallback
      }
    } else {
      setMatches([["Player 1", "Player 2"]]); // Fallback
    }
    setIsLoading(false);
  }, [searchParams]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchEnded, setMatchEnded] = useState(false);
  const [gameType, setGameType] = useState<"pong" | "xo">("pong");
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [winnerInfo, setWinnerInfo] = useState<{ winner: string; score: string } | null>(null);

  const currentMatch = matches ? matches[currentMatchIndex] : null;

  const handleMatchEnd = (winner: string | null) => {
    setMatchEnded(true);
    const finalScore = `${scores.left} - ${scores.right}`;
    if (winner) {
      setWinnerInfo({ winner, score: finalScore });
    } else {
      setWinnerInfo({ winner: "Draw!", score: finalScore });
    }
  };

  useEffect(() => {
    if (isLoading || !canvasRef.current || !currentMatch) return;

    stopPong();
    stopTicTacToe();

    setMatchEnded(false);
    setScores({ left: 0, right: 0 });
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const [player1, player2] = currentMatch;

    console.log("Current players are:", player1, "and", player2);

    if (gameType === "pong") {
      startPong({
        canvas: canvasRef.current,
        leftPlayer: player1,
        rightPlayer: player2,
        handleMatchEnd,
        winScore: 5,
        map: map || "default",
        onScoreUpdate: setScores,
      });
    } else {
      startTicTacToe({
        canvas: canvasRef.current,
        playerX: player1,
        playerO: player2,
        handleGameEnd: handleMatchEnd,
      });
    }

    return () => {
      stopPong();
      stopTicTacToe();
    };
  }, [currentMatch, gameType, map, isLoading]);

  const handleNextMatch = () => {
    if (matches && currentMatchIndex + 1 < matches.length) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      alert("Tournament finished!");
      setCurrentMatchIndex(0);
    }
    setScores({ left: 0, right: 0 });
    setWinnerInfo(null);
  };

  const handleRestart = () => {
    if (!currentMatch || !canvasRef.current) return;
    setMatchEnded(false);
    setScores({ left: 0, right: 0 });
    setWinnerInfo(null);

    const [player1, player2] = currentMatch;

    if (gameType === "pong") {
      startPong({
        canvas: canvasRef.current,
        leftPlayer: player1,
        rightPlayer: player2,
        handleMatchEnd,
        winScore: 5,
        map: map || "default",
        onScoreUpdate: setScores,
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-3xl font-bold text-yellow-300 mb-4">Tournament</h1>

      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${gameType === "pong" ? "bg-yellow-300 text-black" : "bg-black text-yellow-300 border border-yellow-500 hover:bg-yellow-300 hover:text-black transition duration-600"}`}
          onClick={() => setGameType("pong")}
        >
          Play Pong
        </button>
        <button
          className={`px-4 py-2 rounded ${gameType === "xo" ? "bg-yellow-300 text-black" : "bg-black text-yellow-300 border border-yellow-500 hover:bg-yellow-300 hover:text-black transition duration-600"}`}
          onClick={() => setGameType("xo")}
        >
          Play X-O
        </button>
      </div>

      {currentMatch && currentMatch.length === 2 && (
        <div className="w-full max-w-[600px] flex justify-between items-center mb-6 px-4">
          <div className="text-2xl text-yellow-300 font-bold text-left flex-1">
            {currentMatch[0]}
          </div>
          <div className="text-4xl text-yellow-300 font-bold">
            {scores.left} - {scores.right}
          </div>
          <div className="text-2xl text-yellow-300 font-bold text-right flex-1">
            {currentMatch[1]}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border border-yellow-500 bg-black mb-4"
      />

      {/* Winner Pop-up */}
      {winnerInfo && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-yellow-300 text-black p-10 rounded-lg text-center shadow-lg">
            <h2 className="text-4xl font-bold mb-4">
              {winnerInfo.winner === "Draw!" ? "It's a Draw!" : `${winnerInfo.winner} Wins!`}
            </h2>
            <p className="text-2xl mb-6">Final Score: {winnerInfo.score}</p>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-black hover:bg-slate-800 text-yellow-300 px-6 py-3 rounded font-bold"
                onClick={handleRestart}
              >
                Restart Match
              </button>
              <button
                className="bg-black hover:bg-slate-800 text-yellow-300 px-6 py-3 rounded font-bold"
                onClick={handleNextMatch}
              >
                Next Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}