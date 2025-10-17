"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function MapSelection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playersParam = searchParams.get("players");

  const handleMapSelection = (map: string) => {
    if (playersParam) {
      try {
        const players: string[] = JSON.parse(playersParam);

        // Group players into matches of 2
        const matches: [string, string][] = [];
        for (let i = 0; i < players.length; i += 2) {
          if (i + 1 < players.length) {
            matches.push([players[i], players[i + 1]]);
          } else {
            matches.push([players[i], "Bye"]); // Handle odd number of players
          }
        }

        const matchesParam = encodeURIComponent(JSON.stringify(matches));
        // This line now correctly includes both the matches and the map
        router.push(`/tournament?matches=${matchesParam}&map=${map}`);
      } catch (error) {
        console.error("Failed to parse players or create matches", error);
        // Fallback to home page on error
        router.push("/");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8">
        Choose a Map
      </h1>
      <div className="flex gap-8">
        <div
          className="cursor-pointer"
          onClick={() => handleMapSelection("default")}
        >
          <h2 className="text-xl text-center text-yellow-400 mb-2">
            Default Map
          </h2>
          <div className="w-64 h-48 border-4 border-yellow-400 bg-black flex items-center justify-between p-2">
            <div className="w-4 h-16 bg-yellow-400"></div>
            <div className="w-4 h-16 bg-yellow-400"></div>
          </div>
        </div>
        <div
          className="cursor-pointer"
          onClick={() => handleMapSelection("inverted")}
        >
          <h2 className="text-xl text-center text-yellow-400 mb-2">
            Inverted Map
          </h2>
          <div className="w-64 h-48 border-4 border-black bg-yellow-400 flex items-center justify-between p-2">
            <div className="w-4 h-16 bg-black"></div>
            <div className="w-4 h-16 bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
}