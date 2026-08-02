import { getRoom, saveRoom } from "@/lib/store";
import { countCompletedLines, WIN_LINES_NEEDED } from "@/lib/gameLogic";

export async function POST(request, { params }) {
  const { playerId, number } = await request.json();
  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.status !== "playing") {
    return Response.json({ error: "Game is not in progress" }, { status: 400 });
  }

  const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
  if (currentTurnPlayerId !== playerId) {
    return Response.json({ error: "It's not your turn" }, { status: 403 });
  }

  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 25) {
    return Response.json({ error: "Number must be between 1 and 25" }, { status: 400 });
  }
  if (room.calledNumbers.includes(n)) {
    return Response.json({ error: "That number was already called" }, { status: 400 });
  }

  room.calledNumbers.push(n);

  const calledSet = new Set(room.calledNumbers);
  let winner = null;
  for (const p of room.players) {
    if (countCompletedLines(p.card, calledSet) >= WIN_LINES_NEEDED) {
      winner = p;
      break;
    }
  }

  if (winner) {
    room.status = "finished";
    room.winnerId = winner.id;
  } else if (room.calledNumbers.length >= 25) {
    room.status = "finished"; // all numbers called, nobody hit 5 lines
  } else {
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
  }

  await saveRoom(room);
  return Response.json({ ok: true });
}
