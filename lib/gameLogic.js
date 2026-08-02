export const WIN_LINES_NEEDED = 5;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 5x5 grid containing every number 1-25 exactly once, in random cells.
export function makeCard() {
  const nums = shuffle(Array.from({ length: 25 }, (_, i) => i + 1));
  const grid = [];
  for (let r = 0; r < 5; r++) {
    grid.push(nums.slice(r * 5, r * 5 + 5));
  }
  return grid;
}

// Returns how many of the 12 possible lines (5 rows + 5 cols + 2 diagonals)
// are fully covered by calledSet.
export function countCompletedLines(card, calledSet) {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push(card[r]);
  for (let c = 0; c < 5; c++) lines.push(card.map((row) => row[c]));
  lines.push([0, 1, 2, 3, 4].map((i) => card[i][i]));
  lines.push([0, 1, 2, 3, 4].map((i) => card[i][4 - i]));
  return lines.filter((line) => line.every((v) => calledSet.has(v))).length;
}

export function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
