"use client";
import { useEffect, useRef } from "react";
import { startPong } from "./ponggame";
import { useSearchParams, useRouter } from "next/navigation";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const player1 = searchParams.get("player1") || "Player 1";
  const player2 = searchParams.get("player2") || "Player 2";

  useEffect(() => {
    if (canvasRef.current) {
      startPong(canvasRef.current, player1, player2);
    }
  }, [player1, player2]);

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">Pong Match</h1>
      <p className="mb-4">{player1} vs {player2}</p>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-yellow-500 bg-slate-950"
      />
      <button
        className="mt-6 bg-red-500 hover:bg-red-600 px-6 py-3 rounded font-bold text-black"
        onClick={() => router.push("/")}
      >
        Back to Home
      </button>
    </main>
  );
}
