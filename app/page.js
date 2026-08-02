"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const createRoom = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create room");
      localStorage.setItem(`bingo:${data.code}`, data.playerId);
      router.push(`/room/${data.code}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <h1 className="title stamp">BINGO NIGHT</h1>
      <p className="subtitle">
        5×5 cards, numbers 1–25, everyone takes a turn calling the next number.
        First to complete 5 lines wins.
      </p>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="stamp" style={{ marginTop: 0 }}>Host a new game</h2>
        <p className="subtitle" style={{ marginBottom: 14 }}>
          You'll get a room code — send it to up to 9 other players and have
          them open this same site and enter the code.
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createRoom()}
          style={{ marginBottom: 12 }}
        />
        <button className="btn gold" onClick={createRoom} disabled={!name.trim() || loading}>
          {loading ? "Creating…" : "Create room"}
        </button>
        {error && <p style={{ color: "#ffb3a3", marginTop: 10 }}>{error}</p>}
      </div>

      <div className="panel">
        <h2 className="stamp" style={{ marginTop: 0 }}>Joining a game?</h2>
        <p className="subtitle">
          Ask your host for the link, or go to <code>/room/CODE</code> using
          the 5-letter code they gave you.
        </p>
      </div>
    </div>
  );
}
