<<<<<<< HEAD
# Bingo Night — multiplayer

5×5 cards (numbers 1–25, no free space). Players take turns picking a number;
first to complete 5 lines (rows, columns, or either diagonal, any mix) wins.
Each player only ever sees their own card — the server never sends anyone
else's grid to their browser.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — but note it won't fully work locally until you
connect a KV database (see below), since game state lives there.

## Deploy to Vercel (step by step)

**1. Put the code on GitHub**
- Create a new repository on GitHub and push this folder to it
  (or use Vercel's "Import" flow below, which can create the repo for you
  if you upload via the Vercel CLI instead — either works).

**2. Import the project into Vercel**
- Go to vercel.com → **Add New… → Project**
- Select your GitHub repo → Vercel auto-detects Next.js → click **Deploy**
- The first deploy will succeed but the game itself won't work yet — it
  needs a database for room state (next step).

**3. Add a KV (Redis) database**
- In your Vercel project → **Storage** tab → **Create Database** → choose
  **KV** (this is Vercel's managed Redis, provided by Upstash)
- Once created, click **Connect Project** and select this project —
  Vercel automatically adds the required environment variables
  (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) for you. No manual `.env`
  editing needed.

**4. Redeploy**
- Go to the **Deployments** tab → click the **⋯** menu on the latest
  deployment → **Redeploy** (this picks up the new environment variables).

**5. Play**
- Open your deployed URL (e.g. `https://your-project.vercel.app`)
- Click **Create room**, enter your name — you're the host and get a
  5-letter room code
- Send the link `https://your-project.vercel.app/room/CODE` (or just the
  code) to up to 9 friends — they open it on their own phone/laptop, enter
  their name, and join
- Once everyone's in, the host clicks **Start game**
- On your turn, tap any unclaimed number 1–25 — it's marked on every
  player's card at once. First to 5 completed lines wins.

## Notes
- Rooms auto-expire from the database after 12 hours.
- The app polls for updates every 2 seconds — good enough for a casual
  game night, no WebSocket server required.
- Free tier of Vercel + Vercel KV comfortably covers a room of 10 players
  playing a game or two.
=======
# Bingo
>>>>>>> 915d8a8e03bb62d3bf0c52b371bf7070723c9950
