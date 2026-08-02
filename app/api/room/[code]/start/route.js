import { getRoom, saveRoom } from "@/lib/store";

export async function POST(request, { params }) {
  const { playerId } = await request.json();
  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.turnOrder[0] !== playerId) {
    return Response.json({ error: "Only the host can start the game" }, { status: 403 });
  }
  if (room.players.length < 2) {
    return Response.json({ error: "Need at least 2 players" }, { status: 400 });
  }
  if (room.status !== "waiting") {
    return Response.json({ error: "Game already started" }, { status: 400 });
  }

  room.status = "playing";
  room.currentTurnIndex = 0;
  await saveRoom(room);
  return Response.json({ ok: true });
}
