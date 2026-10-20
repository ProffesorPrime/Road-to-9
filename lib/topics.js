// Topic list (grades 1–9, following the Maths Genie IGCSE grade list), badges and
// progress maths. Shared by the browser and the server.
// Topic ids are stored with each student's progress, so never rename an existing id.

export const NEED = 5; // correct answers needed to clear a stop

export const GRADES = [
  { grade: 1, title: "Number basics", band: "Foundation" },
  { grade: 2, title: "Building blocks", band: "Foundation" },
  { grade: 3, title: "Proportion and equations", band: "Foundation" },
  { grade: 4, title: "Standard pass", band: "Foundation and Higher" },
  { grade: 5, title: "Strong pass", band: "Foundation and Higher" },
  { grade: 6, title: "Into Higher", band: "Higher only" },
  { grade: 7, title: "The old A grade", band: "Higher only" },
  { grade: 8, title: "Top grades", band: "Higher only" },
  { grade: 9, title: "The summit", band: "Higher only" },
];

export const TOPICS = [
  // Grade 1
  { id: "neg", name: "Negative numbers", grade: 1, strand: "Number" },
  { id: "round", name: "Rounding", grade: 1, strand: "Number" },
  { id: "bidmas", name: "BIDMAS", grade: 1, strand: "Number" },
  { id: "pow", name: "Powers and roots", grade: 1, strand: "Number" },
  // Grade 2
  { id: "fracamt", name: "Fractions of an amount", grade: 2, strand: "Number" },
  { id: "onestep", name: "One-step equations", grade: 2, strand: "Algebra" },
  { id: "angles", name: "Angles", grade: 2, strand: "Geometry" },
  { id: "avg", name: "Averages", grade: 2, strand: "Statistics" },
  { id: "prob", name: "Probability", grade: 2, strand: "Probability" },
  // Grade 3
  { id: "pct", name: "Percentages", grade: 3, strand: "Number" },
  { id: "pctch", name: "Percentage change", grade: 3, strand: "Number" },
  { id: "ratio", name: "Ratio", grade: 3, strand: "Ratio" },
  { id: "sub", name: "Substitution", grade: 3, strand: "Algebra" },
  { id: "lin", name: "Solving equations", grade: 3, strand: "Algebra" },
  { id: "circ", name: "Area and circumference of circles", grade: 3, strand: "Geometry", calc: true },
  // Grade 4
  { id: "ind", name: "Indices", grade: 4, strand: "Algebra" },
  { id: "hcf", name: "HCF and LCM", grade: 4, strand: "Number" },
  { id: "nth", name: "Sequences (nth term)", grade: 4, strand: "Algebra" },
  { id: "ci", name: "Compound interest and depreciation", grade: 4, strand: "Number", calc: true },
  { id: "polyang", name: "Angles in polygons", grade: 4, strand: "Geometry" },
  { id: "pyth", name: "Pythagoras", grade: 4, strand: "Geometry", calc: true },
  // Grade 5
  { id: "revpct", name: "Reverse percentages", grade: 5, strand: "Number" },
  { id: "stdform", name: "Standard form", grade: 5, strand: "Number" },
  { id: "speed", name: "Speed and density", grade: 5, strand: "Ratio" },
  { id: "sim", name: "Simultaneous equations", grade: 5, strand: "Algebra" },
  { id: "quad", name: "Solving quadratics", grade: 5, strand: "Algebra" },
  { id: "trig", name: "SOHCAHTOA (trigonometry)", grade: 5, strand: "Geometry", calc: true },
  // Grade 6
  { id: "fracind", name: "Fractional and negative indices", grade: 6, strand: "Number" },
  { id: "grad", name: "Gradient and equation of a line", grade: 6, strand: "Algebra" },
  { id: "sector", name: "Sector areas and arc lengths", grade: 6, strand: "Geometry", calc: true },
  { id: "cone", name: "Spheres and cones", grade: 6, strand: "Geometry", calc: true },
  { id: "ptree", name: "Probability trees", grade: 6, strand: "Probability" },
  // Grade 7
  { id: "surds", name: "Surds", grade: 7, strand: "Number" },
  { id: "bounds", name: "Bounds", grade: 7, strand: "Number" },
  { id: "qform", name: "Quadratic formula", grade: 7, strand: "Algebra", calc: true },
  { id: "sinerule", name: "The sine rule", grade: 7, strand: "Geometry", calc: true },
  { id: "cosrule", name: "The cosine rule", grade: 7, strand: "Geometry", calc: true },
  { id: "triarea", name: "Area of any triangle", grade: 7, strand: "Geometry", calc: true },
  // Grade 8
  { id: "csq", name: "Completing the square", grade: 8, strand: "Algebra" },
  { id: "func", name: "Composite functions", grade: 8, strand: "Algebra" },
  { id: "finv", name: "Inverse functions", grade: 8, strand: "Algebra" },
  { id: "qseq", name: "Quadratic sequences", grade: 8, strand: "Algebra" },
  // Grade 9
  { id: "diff", name: "Differentiation", grade: 9, strand: "Calculus" },
  { id: "qsim", name: "Quadratic simultaneous equations", grade: 9, strand: "Algebra" },
  { id: "gtrans", name: "Transforming graphs", grade: 9, strand: "Algebra" },
];
export const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
export const topicsInGrade = g => TOPICS.filter(t => t.grade === g);

export const BADGES = [
  { id: "first", short: "1", name: "First Step", desc: "First correct answer" },
  { id: "hat", short: "3", name: "Hat-trick", desc: "3 correct in a row" },
  { id: "clean", short: "5", name: "Clean Sheet", desc: "5 in a row, no help" },
  { id: "cleared", short: "✓", name: "Stop Cleared", desc: "Mastered a topic" },
  { id: "lab", short: "P", name: "Lab Partner", desc: "Asked Prime for help" },
  { id: "half", short: "G", name: "Grade Cleared", desc: "Cleared every stop in a grade" },
  { id: "scholar", short: "L", name: "Lesson Learner", desc: "Finished a lesson with Prime" },
  { id: "speed", short: "A", name: "Arcade Ace", desc: "Scored 20+ in the Arcade" },
];

// Foundation (and Cambridge Core) papers stop at grade 5.
export const maxGradeFor = tier => (tier === "Foundation" || tier === "Core" ? 5 : 9);
export const topicsFor = tier => TOPICS.filter(t => t.grade <= maxGradeFor(tier));

export const EMPTY_PROGRESS = { xp: 0, day_streak: 0, last_day: null, clean_run: 0, combo: 0, badges: [], topics: {} };

export const topicStats = (progress, id) => (progress?.topics?.[id]) || { c: 0, a: 0, h: 0 };
export const mastery = (progress, id) => Math.min(topicStats(progress, id).c, NEED) / NEED;
export const clearedCount = (progress, tier) => topicsFor(tier).filter(t => mastery(progress, t.id) >= 1).length;
export const gradeCleared = (progress, g) => topicsInGrade(g).every(t => mastery(progress, t.id) >= 1);
// Where the road starts: grade from the latest Grade Check, if any (never above the tier's top grade).
export const startGrade = (progress, tier) => Math.min(maxGradeFor(tier), Math.max(1, progress?.placement?.grade || 1));
export const lessonDone = (progress, id) => !!topicStats(progress, id).l;

export const nextTopic = (progress, tier) => {
  const list = topicsFor(tier);
  const from = startGrade(progress, tier);
  return list.find(t => t.grade >= from && mastery(progress, t.id) < 1)
    || list.find(t => mastery(progress, t.id) < 1)
    || list[list.length - 1];
};

// Highest grade where the student has (on average) 60% mastery of that grade and everything below it.
export function workingGrade(progress, tier) {
  let wg = 0;
  for (let g = 1; g <= maxGradeFor(tier); g++) {
    const ts = TOPICS.filter(t => t.grade <= g);
    const avg = ts.reduce((s, t) => s + mastery(progress, t.id), 0) / ts.length;
    if (avg >= 0.6) wg = g;
    else break;
  }
  return wg;
}
export const gradeLabel = wg => (wg >= 1 ? `Grade ${wg}` : "Starting out");

export function totals(progress) {
  let c = 0, a = 0, h = 0;
  TOPICS.forEach(t => { const s = topicStats(progress, t.id); c += s.c; a += s.a; h += s.h; });
  return { c, a, h, acc: a ? Math.round((c / a) * 100) : 0 };
}

export function focusList(progress, tier) {
  const list = topicsFor(tier);
  const started = list
    .filter(t => topicStats(progress, t.id).a > 0 && mastery(progress, t.id) < 1)
    .sort((x, y) => mastery(progress, x.id) - mastery(progress, y.id) || x.grade - y.grade);
  const items = started.slice(0, 3).map(t => {
    const s = topicStats(progress, t.id);
    const acc = s.a ? Math.round((s.c / s.a) * 100) : 0;
    return { topic: t, why: `${Math.min(s.c, NEED)}/${NEED} correct, ${acc}% accuracy${s.h ? `, needed help ${s.h} time${s.h > 1 ? "s" : ""}` : ""}` };
  });
  const fresh = list.find(t => !topicStats(progress, t.id).a);
  if (items.length < 3 && fresh) items.push({ topic: fresh, why: "Not started yet" });
  return items;
}
