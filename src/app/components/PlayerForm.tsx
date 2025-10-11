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
      className="flex flex-col items-center space-y-4 p-6 py-4 bg-yellow-500 rounded-xl shadow-neutral-900"
    >
      <h1 className="text-2xl flex mb-15 border p-1 border-slate-950 font-bold text-slate-950">Enter Players</h1>

      {players.map((player, i) => (
        <div key={i} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Player ${i + 1}`}
            value={player}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-64 p-2 border text-slate-950 border-b-slate-950 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removePlayer(i)}
            className="px-2 py-1 border text-slate-950 rounded hover:bg-slate-950 hover:text-yellow-500 transition duration-600"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addPlayer}
        className="px-12.5 py-2 border text-slate-950 rounded hover:bg-slate-950 hover:text-yellow-500 transition duration-600"
      >
        Add Player
      </button>

      <button
        type="submit"
        className="px-7 py-2 border text-slate-950 rounded hover:bg-slate-950 hover:text-yellow-500 transition duration-600"
      >
        Start Tournament
      </button>
    </form>
  );
}
