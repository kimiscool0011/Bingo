import { getRoom, saveRoom } from "@/lib/store";
import { makeCard } from "@/lib/gameLogic";

export async function POST(request, { params }) {
  const { playerId } = await request.json();
  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.turnOrder[0] !== playerId) {
    return Response.json({ error: "Only the host can start a new game" }, { status: 403 });
  }
  if (room.status !== "finished") {
    return Response.json({ error: "Game isn't finished yet" }, { status: 400 });
  }

  room.players = room.players.map((p) => ({ ...p, card: makeCard() }));
  room.calledNumbers = [];
  room.currentTurnIndex = 0;
  room.winnerId = null;
  room.status = "waiting";
  // chat history (room.messages) is intentionally kept across games

  await saveRoom(room);
  return Response.json({ ok: true });
}
