import { Redis } from "@upstash/redis";

// The Vercel <-> Upstash Marketplace integration injects these env vars
// automatically once you connect the database to your project. Some
// integration versions use the KV_REST_API_* names for backwards
// compatibility, others use UPSTASH_REDIS_REST_*, so we check both.
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ROOM_TTL_SECONDS = 60 * 60 * 12; // rooms expire after 12 hours

export async function getRoom(code) {
  return redis.get(`room:${code.toUpperCase()}`);
}

export async function saveRoom(room) {
  await redis.set(`room:${room.code}`, room, { ex: ROOM_TTL_SECONDS });
}
