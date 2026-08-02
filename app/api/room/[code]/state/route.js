import { getRoom } from "@/lib/store";
import { countCompletedLines, WIN_LINES_NEEDED } from "@/lib/gameLogic";

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  const room = await getRoom(params.code);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

  const me = room.players.find((p) => p.id === playerId);
  if (!me) return Response.json({ error: "You are not in this room" }, { status: 403 });

  const calledSet = new Set(room.calledNumbers);
  const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex] ?? null;

  const players = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    isYou: p.id === playerId,
    isHost: p.id === room.turnOrder[0],
    isTurn: p.id === currentTurnPlayerId,
    lineCount: countCompletedLines(p.card, calledSet),
  }));

  const winner = room.winnerId ? room.players.find((p) => p.id === room.winnerId) : null;

  return Response.json({
    code: room.code,
    status: room.status,
    players,
    myCard: me.card,
    myLineCount: countCompletedLines(me.card, calledSet),
    calledNumbers: room.calledNumbers,
    currentTurnPlayerId,
    isYourTurn: currentTurnPlayerId === playerId,
    winLinesNeeded: WIN_LINES_NEEDED,
    winnerName: winner ? winner.name : null,
    winnerIsYou: room.winnerId === playerId,
  });
}
