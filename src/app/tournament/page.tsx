"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { startPong } from "../../game/ponggame";

export default function Tournament() {
  const searchParams = useSearchParams();

  // Parse matches from search params or use default
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
  const [matches, setMatches] = useState<[string, string][]>(initialMatches);
  const [matchEnded, setMatchEnded] = useState(false);

  const currentMatch = matches[currentMatchIndex] || null;

  // ✅ Fix: Correct signature
  const handleMatchEnd = (
    left: string,
    right: string,
    leftScore: number,
    rightScore: number
  ) => {
    setMatchEnded(true);
    console.log(`${left} ${leftScore} - ${rightScore} ${right}`);
  };

  useEffect(() => {
    if (!canvasRef.current || !currentMatch) return;

    setMatchEnded(false);
    const leftPlayer = currentMatch[0];
    const rightPlayer = currentMatch[1];

    startPong({
      canvas: canvasRef.current!,
      leftPlayer,
      rightPlayer,
      handleMatchEnd,
      winScore: 5,
    });
  }, [currentMatch]);

  const handleNextMatch = () => {
    if (currentMatchIndex + 1 < matches.length) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      alert("Tournament finished!");
      setCurrentMatchIndex(0);
    }
  };

  const handleRestart = () => {
    if (currentMatch && canvasRef.current) {
      setMatchEnded(false);
      startPong({
        canvas: canvasRef.current!,
        leftPlayer: currentMatch[0],
        rightPlayer: currentMatch[1],
        handleMatchEnd,
        winScore: 5,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-500">
      <h1 className="text-3xl bg-yellow-500 font-bold text-cyan-950 mb-4">Tournament</h1>
      {currentMatch && (
        <p className="mb-4 text-xl text-blue-950 font-bold">
          {currentMatch[0]} vs {currentMatch[1]}
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border bg-cyan-950 mb-4"
      ></canvas>

      {matchEnded && (
        <div className="flex gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleRestart}
          >
            Restart Match
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleNextMatch}
          >
            Next Match
          </button>
        </div>
      )}
    </div>
  );
}
