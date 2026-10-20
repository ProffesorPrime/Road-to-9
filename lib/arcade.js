// Quick-fire mental maths for the Arcade. Gets harder as the score climbs. Shared by browser and tests.
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmtN = n => (n < 0 ? `−${-n}` : `${n}`);

const MAKERS = [
  // level 0+
  [0, () => { const a = R(2, 9), b = R(2, 9); return { q: `${a} × ${b}`, a: a * b }; }],
  [0, () => { const a = R(11, 60), b = R(5, 39); return { q: `${a} + ${b}`, a: a + b }; }],
  [0, () => { const a = R(30, 99), b = R(5, 29); return { q: `${a} − ${b}`, a: a - b }; }],
  [0, () => { const a = R(2, 40) * 2; return { q: `Half of ${a}`, a: a / 2 }; }],
  // level 1+
  [1, () => { const a = R(6, 12), b = R(6, 12); return { q: `${a} × ${b}`, a: a * b }; }],
  [1, () => { const d = R(3, 9), q = R(3, 12); return { q: `${d * q} ÷ ${d}`, a: q }; }],
  [1, () => { const a = R(-9, 9) || 4, b = R(-9, 9) || -3; return { q: `${fmtN(a)} + ${b < 0 ? `(${fmtN(b)})` : b}`, a: a + b }; }],
  [1, () => { const n = R(2, 12); return { q: `${n}²`, a: n * n }; }],
  // level 2+
  [2, () => { const p = pick([10, 20, 25, 50, 5]), n = pick([20, 40, 60, 80, 120, 200, 240]); return { q: `${p}% of ${n}`, a: (p * n) / 100 }; }],
  [2, () => { const a = R(-9, -2), b = R(2, 9); return { q: `${fmtN(a)} × ${b}`, a: a * b }; }],
  [2, () => { const n = R(2, 5); return { q: `${n}³`, a: n ** 3 }; }],
  [2, () => { const r = R(2, 15); return { q: `√${r * r}`, a: r }; }],
  // level 3+
  [3, () => { const a = R(12, 25), b = R(3, 9); return { q: `${a} × ${b}`, a: a * b }; }],
  [3, () => { const d = pick([2, 3, 4, 5]), n = R(1, d - 1), m = d * R(3, 12); return { q: `${n}/${d} of ${m}`, a: (m / d) * n }; }],
  [3, () => { const x = R(2, 12), a = R(2, 6), b = R(1, 15); return { q: `${a}x + ${b} = ${a * x + b}. x = ?`, a: x }; }],
  [3, () => { const a = R(-12, -2), b = R(2, 12); return { q: `${fmtN(a)} − ${b}`, a: a - b }; }],
];

export function arcadeQuestion(score) {
  const level = Math.min(3, Math.floor(score / 5));
  const pool = MAKERS.filter(([lv]) => lv <= level).map(([, f]) => f);
  // lean towards the newest level's questions
  const fresh = MAKERS.filter(([lv]) => lv === level).map(([, f]) => f);
  const f = Math.random() < 0.55 && fresh.length ? pick(fresh) : pick(pool);
  return f();
}

export const ARCADE_SECONDS = 60;
