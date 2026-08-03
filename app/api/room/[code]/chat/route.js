import { randomUUID } from "crypto";
import { getRoom, saveRoom } from "@/lib/store";

const MAX_MESSAGES = 50;
const MAX_LENGTH = 200;

export async function POST(request, { params }) {
  const { playerId, text } = await request.json();

  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

  const sender = room.players.find((p) => p.id === playerId);
  if (!sender) return Response.json({ error: "You are not in this room" }, { status: 403 });

  const trimmed = (text || "").trim().slice(0, MAX_LENGTH);
  if (!trimmed) return Response.json({ error: "Message is empty" }, { status: 400 });

  if (!room.messages) room.messages = [];
  room.messages.push({
    id: randomUUID(),
    playerId: sender.id,
    name: sender.name,
    text: trimmed,
    ts: Date.now(),
  });
  if (room.messages.length > MAX_MESSAGES) {
    room.messages = room.messages.slice(-MAX_MESSAGES);
  }

  await saveRoom(room);
  return Response.json({ ok: true });
}
