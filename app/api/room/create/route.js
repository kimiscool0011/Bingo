import { randomUUID } from "crypto";
import { getRoom, saveRoom } from "@/lib/store";
import { makeCard, makeRoomCode } from "@/lib/gameLogic";

export async function POST(request) {
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  let code;
  for (let i = 0; i < 5; i++) {
    const candidate = makeRoomCode();
    if (!(await getRoom(candidate))) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    return Response.json({ error: "Could not allocate a room, try again" }, { status: 500 });
  }

  const hostId = randomUUID();
  const room = {
    code,
    status: "waiting", // waiting | playing | finished
    players: [
      { id: hostId, name: name.trim(), card: makeCard() },
    ],
    turnOrder: [hostId],
    currentTurnIndex: 0,
    calledNumbers: [],
    winnerId: null,
    createdAt: Date.now(),
  };

  await saveRoom(room);
  return Response.json({ code, playerId: hostId });
}
