// Topic list, badges and progress maths. Shared by the browser and the server.

export const NEED = 5; // correct answers needed to clear a stop

export const TOPICS = [
  { id: "pct", name: "Percentages", grade: 4, strand: "Number" },
  { id: "ratio", name: "Sharing in a ratio", grade: 4, strand: "Ratio" },
  { id: "ind", name: "Laws of indices", grade: 5, strand: "Algebra" },
  { id: "lin", name: "Linear equations", grade: 5, strand: "Algebra" },
  { id: "circ", name: "Circles", grade: 5, strand: "Geometry", calc: true },
  { id: "prob", name: "Probability", grade: 5, strand: "Probability" },
  { id: "pyth", name: "Pythagoras' theorem", grade: 6, strand: "Geometry", calc: true },
  { id: "sim", name: "Simultaneous equations", grade: 6, strand: "Algebra" },
  { id: "quad", name: "Solving quadratics", grade: 7, strand: "Algebra" },
  { id: "trig", name: "Trigonometry (SOH CAH TOA)", grade: 7, strand: "Geometry", calc: true },
  { id: "func", name: "Composite functions", grade: 8, strand: "Algebra" },
];
export const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));

export const BADGES = [
  { id: "first", short: "1", name: "First Step", desc: "First correct answer" },
  { id: "hat", short: "3", name: "Hat-trick", desc: "3 correct in a row" },
  { id: "clean", short: "5", name: "Clean Sheet", desc: "5 in a row, no help" },
  { id: "cleared", short: "✓", name: "Stop Cleared", desc: "Mastered a topic" },
  { id: "lab", short: "P", name: "Lab Partner", desc: "Asked Prime for help" },
  { id: "half", short: "½", name: "Halfway There", desc: "Cleared 6 stops" },
];

export const EMPTY_PROGRESS = { xp: 0, day_streak: 0, last_day: null, clean_run: 0, combo: 0, badges: [], topics: {} };

export const topicStats = (progress, id) => (progress?.topics?.[id]) || { c: 0, a: 0, h: 0 };
export const mastery = (progress, id) => Math.min(topicStats(progress, id).c, NEED) / NEED;
export const clearedCount = progress => TOPICS.filter(t => mastery(progress, t.id) >= 1).length;
export const nextTopic = progress => TOPICS.find(t => mastery(progress, t.id) < 1) || TOPICS[TOPICS.length - 1];

export function workingGrade(progress) {
  let wg = 3;
  for (const g of [4, 5, 6, 7, 8]) {
    const ts = TOPICS.filter(t => t.grade <= g);
    const avg = ts.reduce((s, t) => s + mastery(progress, t.id), 0) / ts.length;
    if (avg >= 0.6) wg = g;
    else break;
  }
  if (wg === 8 && TOPICS.every(t => mastery(progress, t.id) >= 0.8)) wg = 9;
  return wg;
}

export function totals(progress) {
  let c = 0, a = 0, h = 0;
  TOPICS.forEach(t => { const s = topicStats(progress, t.id); c += s.c; a += s.a; h += s.h; });
  return { c, a, h, acc: a ? Math.round((c / a) * 100) : 0 };
}

export function focusList(progress) {
  const started = TOPICS
    .filter(t => topicStats(progress, t.id).a > 0 && mastery(progress, t.id) < 1)
    .sort((x, y) => mastery(progress, x.id) - mastery(progress, y.id) || x.grade - y.grade);
  const items = started.slice(0, 3).map(t => {
    const s = topicStats(progress, t.id);
    const acc = s.a ? Math.round((s.c / s.a) * 100) : 0;
    return { topic: t, why: `${Math.min(s.c, NEED)}/${NEED} correct, ${acc}% accuracy${s.h ? `, needed help ${s.h} time${s.h > 1 ? "s" : ""}` : ""}` };
  });
  const fresh = TOPICS.find(t => !topicStats(progress, t.id).a);
  if (items.length < 3 && fresh) items.push({ topic: fresh, why: "Not started yet" });
  return items;
}
