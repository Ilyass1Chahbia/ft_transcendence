"use client";

import { useState } from "react";

export default function PlayerForm({
  onSubmit,
}: {
  onSubmit: (players: string[]) => void;
}) {
  const [players, setPlayers] = useState([""]);

  const handleChange = (index: number, value: string) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  const addPlayer = () => setPlayers([...players, ""]);
  const removePlayer = (index: number) => {
    if (players.length === 1) return; // keep at least 1 player
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredPlayers = players.filter((p) => p.trim() !== "");
    if (filteredPlayers.length < 2) {
      alert("You need at least 2 players!");
      return;
    }
    onSubmit(filteredPlayers);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-4 p-6 bg-yellow-500 rounded-xl shadow-neutral-900"
    >
      <h1 className="text-2xl font-bold text-gray-700">Enter Players</h1>

      {players.map((player, i) => (
        <div key={i} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Player ${i + 1}`}
            value={player}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-64 p-2 border text-black border-b-cyan-950 rounded-lg"
          />
          <button
            type="button"
            onClick={() => removePlayer(i)}
            className="px-2 py-1 bg-red-500 text-cyan-950 rounded hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addPlayer}
        className="px-4 py-2 bg-green-500 text-cyan-950 rounded hover:bg-green-600 transition"
      >
        Add Player
      </button>

      <button
        type="submit"
        className="px-6 py-2 bg-indigo-700 text-cyan-950 rounded-lg hover:bg-blue-600 transition"
      >
        Start Tournament
      </button>
    </form>
  );
}
