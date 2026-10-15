"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: "", color: "#9c6b30" });
  const [newTask, setNewTask] = useState({ title: "", description: "", fppValue: 600 });
  const [busy, setBusy] = useState(null);

  async function login(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (!res.ok) return setLoginError("Wrong passcode.");
    setAuthed(true);
    load();
  }

  async function load() {
    const [s, t] = await Promise.all([
      fetch("/api/admin/submissions").then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]);
    setSubmissions(s.submissions || []);
    setTeams(t.teams || []);
  }

  async function decide(id, decision) {
    setBusy(id);
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id, decision }),
    });
    await load();
    setBusy(null);
  }

  async function addTeam(e) {
    e.preventDefault();
    await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeam),
    });
    setNewTeam({ name: "", color: "#9c6b30" });
    load();
  }

  async function addTask(e) {
    e.preventDefault();
    await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask({ title: "", description: "", fppValue: 600 });
    load();
  }

  if (!authed) {
    return (
      <main className="max-w-sm mx-auto px-4 py-20">
        <form onSubmit={login} className="bg-white border rounded-xl p-6 space-y-4">
          <h1 className="font-semibold text-lg">Admin</h1>
          <input type="password" className="w-full border rounded-lg px-3 py-2" placeholder="Passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button className="w-full bg-ink text-white rounded-lg py-2 font-medium">Enter</button>
        </form>
      </main>
    );
  }

  const pending = submissions.filter((s) => s.status === "pending");

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section>
        <h2 className="font-semibold mb-3">Pending ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((s) => (
            <div key={s.id} className="bg-white border rounded-xl p-4 flex gap-4">
              <img src={s.proof_url} className="w-20 h-20 object-cover rounded-lg border" />
              <div className="flex-1">
                <p className="font-medium">{s.users?.name} <span className="text-xs text-neutral-400">{s.users?.whatsapp}</span></p>
                <p className="text-sm" style={{ color: s.users?.teams?.color }}>{s.users?.teams?.name}</p>
                <p className="text-sm text-neutral-600">{s.quests?.title} — {s.quests?.fpp_value} FPP</p>
                <div className="flex gap-2 mt-2">
                  <button disabled={busy === s.id} onClick={() => decide(s.id, "approved")} className="bg-green-600 text-white rounded-lg px-3 py-1 text-sm">Approve</button>
                  <button disabled={busy === s.id} onClick={() => decide(s.id, "rejected")} className="bg-red-500 text-white rounded-lg px-3 py-1 text-sm">Reject</button>
                </div>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-neutral-500 text-sm">Nothing pending.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Teams</h2>
        <form onSubmit={addTeam} className="bg-white border rounded-xl p-4 flex gap-2 mb-3">
          <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Team name" value={newTeam.name} onChange={(e) => setNewTeam((t) => ({ ...t, name: e.target.value }))} />
          <input type="color" value={newTeam.color} onChange={(e) => setNewTeam((t) => ({ ...t, color: e.target.value }))} />
          <button className="bg-accent text-white rounded-lg px-4 text-sm">Add</button>
        </form>
        {teams.map((t) => (
          <p key={t.id} className="text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }}></span>{t.name}</p>
        ))}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Add a task</h2>
        <form onSubmit={addTask} className="bg-white border rounded-xl p-4 space-y-2">
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={newTask.title} onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))} />
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))} />
          <input type="number" className="border rounded-lg px-3 py-1 text-sm w-28" value={newTask.fppValue} onChange={(e) => setNewTask((t) => ({ ...t, fppValue: e.target.value }))} />
          <button className="bg-accent text-white rounded-lg px-4 py-1.5 text-sm">Add task</button>
        </form>
      </section>
    </main>
  );
    }
