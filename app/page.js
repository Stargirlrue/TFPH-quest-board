"use client";
import { useEffect, useState } from "react";

const KEY = "tfph_user";

export default function Home() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [fpp, setFpp] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setUser(JSON.parse(saved));
    fetch("/api/teams").then((r) => r.json()).then((d) => setTeams(d.teams || []));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => {
      const me = (d.leaderboard || []).find((u) => u.id === user.id);
      if (me) setFpp(me.fpp);
    });
  }, [user]);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !whatsapp.trim() || !teamId) {
      setError("Fill in your name, WhatsApp, and pick a team.");
      return;
    }
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, whatsapp, teamId }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setUser(data.user);
    localStorage.setItem(KEY, JSON.stringify(data.user));
  }

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-1">Welcome</h1>
        <p className="text-center text-neutral-500 mb-6">Join and start earning FPPs</p>
        <form onSubmit={handleSignup} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="WhatsApp number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <select className="w-full border rounded-lg px-3 py-2" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Who recruited you? (pick their team)</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-accent text-white rounded-lg py-2 font-medium">Continue</button>
        </form>
      </main>
    );
  }

  const myTeam = teams.find((t) => t.id === user.team_id);

  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      {myTeam && <p className="mt-1" style={{ color: myTeam.color }}>{myTeam.name}</p>}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mt-6">
        <p className="text-sm text-neutral-500">Your Fadeproof Points</p>
        <p className="text-4xl font-bold text-accent mt-1">{fpp} FPP</p>
      </div>
      <div className="flex gap-3 mt-6 justify-center text-sm">
        <a href="/tasks" className="bg-ink text-white rounded-lg px-4 py-2">View Tasks</a>
        <a href="/leaderboard" className="border border-neutral-300 rounded-lg px-4 py-2">Leaderboard</a>
      </div>
    </main>
  );
                                                   }
