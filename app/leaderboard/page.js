"use client";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => setList(d.leaderboard || []));
  }, []);

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Leaderboard</h1>
      <ol className="space-y-2">
        {list.map((u, i) => (
          <li key={u.id} className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="text-neutral-400 w-6">{i + 1}</span>
              <span className="w-2 h-2 rounded-full" style={{ background: u.teams?.color || "#ccc" }}></span>
              {u.name}
            </span>
            <span className="font-semibold">{u.fpp} FPP</span>
          </li>
        ))}
        {list.length === 0 && <p className="text-center text-neutral-400">No one's on the board yet.</p>}
      </ol>
    </main>
  );
    }
