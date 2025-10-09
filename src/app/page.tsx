"use client";

import PlayerForm from "./components/PlayerForm";

export default function Home() {
  const handleStart = (players: string[]) => {
    // Group players into matches of 2
    const matches: [string, string][] = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) matches.push([players[i], players[i + 1]]);
      else matches.push([players[i], "Bye"]); // optional for odd players
    }

    // Encode matches as a JSON string
    const matchesParam = encodeURIComponent(JSON.stringify(matches));

    // Redirect to tournament page
    window.location.href = `/tournament?matches=${matchesParam}`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-800">
      <PlayerForm onSubmit={handleStart} />
    </main>
  );
}
