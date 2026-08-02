import { randomUUID } from "crypto";
import { getRoom, saveRoom } from "@/lib/store";
import { makeCard } from "@/lib/gameLogic";

export async function POST(request, { params }) {
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.status !== "waiting") {
    return Response.json({ error: "This game has already started" }, { status: 400 });
  }
  if (room.players.length >= 10) {
    return Response.json({ error: "Room is full (10 players max)" }, { status: 400 });
  }

  const playerId = randomUUID();
  room.players.push({ id: playerId, name: name.trim(), card: makeCard() });
  room.turnOrder.push(playerId);
  await saveRoom(room);

  return Response.json({ playerId });
}
