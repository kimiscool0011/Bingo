"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

const AVATAR_COLORS = ["#D9835A", "#4C8C6D", "#E3AE3D", "#C5432E", "#3D7A5F", "#B87BAC", "#5B87B0", "#D4A24C", "#8FA34D", "#C06B5C"];
const TOAST_DURATION = 4000;

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <b>{t.name}:</b> {t.text}
        </div>
      ))}
    </div>
  );
}

function ChatPanel({ messages, chatText, setChatText, sendChat, sendingChat }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">💬 Chat</div>
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && <div className="chat-empty">No messages yet — say hi!</div>}
        {messages.map((m) => (
          <div className="chat-msg" key={m.id}>
            <span className="name">{m.name}:</span> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-bar">
        <input
          type="text"
          placeholder="Type message…"
          value={chatText}
          maxLength={200}
          onChange={(e) => setChatText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
        />
        <button onClick={sendChat} disabled={!chatText.trim() || sendingChat}>
          Send
        </button>
      </div>
    </div>
  );
}
export default function RoomPage() {
  const { code } = useParams();
  const router = useRouter();
  const [playerId, setPlayerId] = useState(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const [state, setState] = useState(null);
  const [actionError, setActionError] = useState("");
  const [starting, setStarting] = useState(false);
  const [calling, setCalling] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [toasts, setToasts] = useState([]);
  const seenMessageIds = useRef(new Set());
  const firstLoadDone = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(`bingo:${code}`);
    setPlayerId(stored);
    setCheckedStorage(true);
  }, [code]);

  const fetchState = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/room/${code}/state?playerId=${playerId}`);
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Something went wrong");
        return;
      }
      setState(data);

      // Detect new chat messages and pop them up as toasts.
      const incoming = data.messages || [];
      if (!firstLoadDone.current) {
        // Don't toast the whole history on first load, just mark it as seen.
        incoming.forEach((m) => seenMessageIds.current.add(m.id));
        firstLoadDone.current = true;
      } else {
        const fresh = incoming.filter((m) => !seenMessageIds.current.has(m.id));
        if (fresh.length) {
          fresh.forEach((m) => seenMessageIds.current.add(m.id));
          setToasts((prev) => [...prev, ...fresh]);
          fresh.forEach((m) => {
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== m.id));
            }, TOAST_DURATION);
          });
        }
      }
    } catch {
      // silent - will retry on next poll
    }
  }, [code, playerId]);

  useEffect(() => {
    if (!playerId) return;
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [playerId, fetchState]);

  const doJoin = async () => {
    if (!joinName.trim()) return;
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/room/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: joinName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not join");
      localStorage.setItem(`bingo:${code}`, data.playerId);
      setPlayerId(data.playerId);
    } catch (e) {
      setJoinError(e.message);
    } finally {
      setJoining(false);
    }
  };

  const startGame = async () => {
    setStarting(true);
    setActionError("");
    try {
      const res = await fetch(`/api/room/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchState();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const replayGame = async () => {
    setReplaying(true);
    setActionError("");
    try {
      const res = await fetch(`/api/room/${code}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchState();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setReplaying(false);
    }
  };

  const goHome = () => {
    router.push("/");
  };

  const callNumber = async (n) => {
    setCalling(true);
    setActionError("");
    try {
      const res = await fetch(`/api/room/${code}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, number: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchState();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setCalling(false);
    }
  };

  const sendChat = async () => {
    const text = chatText.trim();
    if (!text) return;
    setSendingChat(true);
    setChatText("");
    try {
      const res = await fetch(`/api/room/${code}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchState();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSendingChat(false);
    }
  };

  if (!checkedStorage) return null;

  // ---- Join screen (no local playerId for this room yet) ----
  if (!playerId) {
    return (
      <div className="wrap">
        <h1 className="title stamp">BINGO NIGHT</h1>
        <div className="panel">
          <p className="subtitle" style={{ marginBottom: 10 }}>
            Joining room <span className="code-badge" style={{ fontSize: "1rem", padding: "4px 10px" }}>{code}</span>
          </p>
          <input
            type="text"
            placeholder="Your name"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doJoin()}
            style={{ marginBottom: 12 }}
          />
          <button className="btn gold" onClick={doJoin} disabled={!joinName.trim() || joining}>
            {joining ? "Joining…" : "Join room"}
          </button>
          {joinError && <p style={{ color: "#ffb3a3", marginTop: 10 }}>{joinError}</p>}
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="wrap">
        <p className="subtitle">Loading room…</p>
      </div>
    );
  }

  // ---- Lobby ----
  if (state.status === "waiting") {
    const me = state.players.find((p) => p.isYou);
    return (
      <div className="wrap">
        <ToastStack toasts={toasts} />
        <h1 className="title stamp">BINGO NIGHT</h1>
        <p className="subtitle" style={{ marginBottom: 20 }}>
          Room code — share this with everyone playing:
        </p>
        <div className="code-badge" style={{ marginBottom: 20 }}>{code}</div>

        <div className="panel">
          <h2 className="stamp" style={{ marginTop: 0 }}>Players ({state.players.length}/10)</h2>
          <div>
            {state.players.map((p, i) => (
              <span className="player-chip" key={p.id}>
                <span className="avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {p.name[0]?.toUpperCase()}
                </span>
                {p.name} {p.isHost && "★"} {p.isYou && "(you)"}
              </span>
            ))}
          </div>
        </div>

        {me?.isHost ? (
          <button className="btn gold" onClick={startGame} disabled={state.players.length < 2 || starting}>
            {starting ? "Starting…" : state.players.length < 2 ? "Waiting for more players…" : "Start game"}
          </button>
        ) : (
          <p className="subtitle">Waiting for the host to start the game…</p>
        )}
        {actionError && <p style={{ color: "#ffb3a3", marginTop: 10 }}>{actionError}</p>}

        <div style={{ marginTop: 20 }}>
          <ChatPanel
            messages={state.messages || []}
            chatText={chatText}
            setChatText={setChatText}
            sendChat={sendChat}
            sendingChat={sendingChat}
          />
        </div>
      </div>
    );
  }

  // ---- Playing / Finished ----
  const calledSet = new Set(state.calledNumbers);
  const currentTurnName = state.players.find((p) => p.id === state.currentTurnPlayerId)?.name;

  return (
    <div className="wrap" style={{ maxWidth: 900 }}>
      <ToastStack toasts={toasts} />
      <h1 className="title stamp">BINGO NIGHT</h1>

      {state.status === "finished" && (
        <div className="banner">
          {state.winnerName
            ? `🎉 ${state.winnerIsYou ? "You" : state.winnerName} completed ${state.winLinesNeeded} lines — BINGO!`
            : "All 25 numbers called — no one reached 5 lines. It's a draw."}
        </div>
      )}

      {state.status === "finished" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {state.players.find((p) => p.isYou)?.isHost && (
            <button className="btn gold" onClick={replayGame} disabled={replaying}>
              {replaying ? "Starting…" : "Play again"}
            </button>
          )}
          <button className="btn ghost" onClick={goHome}>
            Go to home
          </button>
        </div>
      )}

      {state.status === "playing" && (
        <div className="turn-strip">
          {state.isYourTurn ? (
            <strong>Your turn — tap a number on your board to call it</strong>
          ) : (
            <>Waiting for <strong>{currentTurnName}</strong> to pick a number…</>
          )}
        </div>
      )}

      <div className="game-layout">
        <div>
          <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Your lines</div>
              <div className="stamp" style={{ fontSize: "1.6rem", color: "var(--gold)" }}>
                {state.myLineCount} / {state.winLinesNeeded}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Called so far</div>
              <div className="stamp" style={{ fontSize: "1.6rem" }}>{state.calledNumbers.length} / 25</div>
            </div>
          </div>

          {/* My card - tap a cell to call that number */}
          <div className="card-panel" style={{ marginBottom: 20 }}>
            <div style={{ textAlign: "center", fontFamily: "'Baloo 2', cursive", fontWeight: 700, marginBottom: 10 }}>
              Bingo Board
            </div>
            <div className="grid5">
              {state.myCard.flat().map((val, i) => {
                const marked = calledSet.has(val);
                const clickable = state.status === "playing" && state.isYourTurn && !marked && !calling;
                return (
                  <div
                    key={i}
                    className={`cell ${marked ? "marked" : ""} ${clickable ? "clickable" : ""} ${
                      state.status === "playing" && !state.isYourTurn && !marked ? "disabled" : ""
                    }`}
                    onClick={() => clickable && callNumber(val)}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standings */}
          <div className="panel">
            <h2 className="stamp" style={{ marginTop: 0, fontSize: "1.1rem" }}>Standings</h2>
            {[...state.players]
              .sort((a, b) => b.lineCount - a.lineCount)
              .map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.9rem" }}>
                  <span>{p.name} {p.isYou && "(you)"}</span>
                  <span style={{ opacity: 0.8 }}>{p.lineCount}/{state.winLinesNeeded} lines</span>
                </div>
              ))}
          </div>

          {actionError && <p style={{ color: "#ffb3a3" }}>{actionError}</p>}
        </div>

        <ChatPanel
          messages={state.messages || []}
          chatText={chatText}
          setChatText={setChatText}
          sendChat={sendChat}
          sendingChat={sendingChat}
        />
      </div>
    </div>
  );
}
