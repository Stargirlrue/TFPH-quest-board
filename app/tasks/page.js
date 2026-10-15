"use client";
import { useEffect, useState } from "react";

export default function Tasks() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("tfph_user");
    if (saved) setUser(JSON.parse(saved));
    fetch("/api/tasks").then((r) => r.json()).then((d) => setTasks(d.tasks || []));
  }, []);

  function fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(taskId, file) {
    if (!user || !file) return;
    setStatus((s) => ({ ...s, [taskId]: "loading" }));
    const base64 = await fileToBase64(file);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        questId: taskId,
        proofImageBase64: base64,
        proofFileName: file.name,
        proofType: file.type,
      }),
    });
    const data = await res.json();
    setStatus((s) => ({ ...s, [taskId]: res.ok ? "submitted" : data.error }));
  }

  if (!user) {
    return <main className="max-w-md mx-auto px-4 py-16 text-center">
      <p>Please <a href="/" className="text-accent underline">sign in on the home page</a> first.</p>
    </main>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Tasks</h1>
      {tasks.length === 0 && <p className="text-neutral-500">No tasks live right now, check back soon.</p>}
      {tasks.map((t) => (
        <div key={t.id} className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{t.title}</h3>
            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">{t.fpp_value} FPP</span>
          </div>
          {t.description && <p className="text-sm text-neutral-500 mt-1">{t.description}</p>}
          {status[t.id] === "submitted" ? (
            <p className="text-green-600 text-sm mt-3 font-medium">Submitted — pending review.</p>
          ) : (
            <div className="mt-3 space-y-2">
              <input type="file" accept="image/*" onChange={(e) => handleSubmit(t.id, e.target.files[0])} />
              {status[t.id] && status[t.id] !== "loading" && <p className="text-red-600 text-xs">{status[t.id]}</p>}
              {status[t.id] === "loading" && <p className="text-xs text-neutral-400">Uploading...</p>}
            </div>
          )}
        </div>
      ))}
    </main>
  );
            }
