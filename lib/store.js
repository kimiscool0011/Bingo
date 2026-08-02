import { kv } from "@vercel/kv";

const ROOM_TTL_SECONDS = 60 * 60 * 12; // rooms expire after 12 hours

export async function getRoom(code) {
  return kv.get(`room:${code.toUpperCase()}`);
}

export async function saveRoom(room) {
  await kv.set(`room:${room.code}`, room, { ex: ROOM_TTL_SECONDS });
}
