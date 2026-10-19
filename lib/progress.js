// Applies one answer to a student's progress and works out XP, streaks and badges. SERVER ONLY.
import { NEED, TOPIC, BADGES, clearedCount, nextTopic } from "./topics";

const TZ = process.env.APP_TIMEZONE || "Asia/Dubai";

export function dayString(date = new Date()) {
  // YYYY-MM-DD in the app's timezone
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function yesterdayString() {
  return dayString(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

export function normalise(row) {
  return {
    xp: row?.xp || 0,
    day_streak: row?.day_streak || 0,
    last_day: row?.last_day || null,
    clean_run: row?.clean_run || 0,
    combo: row?.combo || 0,
    badges: Array.isArray(row?.badges) ? [...row.badges] : [],
    topics: row?.topics ? JSON.parse(JSON.stringify(row.topics)) : {},
  };
}

function award(p, id, list) {
  if (!p.badges.includes(id)) {
    p.badges.push(id);
    const b = BADGES.find(x => x.id === id);
    if (b) list.push(b);
  }
}

export function markHelped(row, topicId) {
  const p = normalise(row);
  const t = (p.topics[topicId] ||= { c: 0, a: 0, h: 0 });
  t.h++;
  const newBadges = [];
  award(p, "lab", newBadges);
  return { progress: p, newBadges };
}

export function applyAnswer(row, { topicId, correct, firstTry, helped }) {
  const p = normalise(row);
  const t = (p.topics[topicId] ||= { c: 0, a: 0, h: 0 });
  const newBadges = [];
  let gain = 0, cleared = false;
  t.a++;

  if (correct) {
    const before = t.c;
    t.c++;
    gain = firstTry && !helped ? 15 : 8;
    p.combo += 1;
    p.clean_run = firstTry && !helped ? p.clean_run + 1 : 0;

    const today = dayString();
    if (p.last_day !== today) {
      p.day_streak = p.last_day === yesterdayString() ? p.day_streak + 1 : 1;
      p.last_day = today;
    }

    award(p, "first", newBadges);
    if (p.combo >= 3) award(p, "hat", newBadges);
    if (p.clean_run >= 5) award(p, "clean", newBadges);
    if (before < NEED && t.c >= NEED) {
      cleared = true;
      gain += 25;
      award(p, "cleared", newBadges);
      if (clearedCount(p) >= 6) award(p, "half", newBadges);
    }
    p.xp += gain;
  } else {
    p.combo = 0;
    p.clean_run = 0;
  }

  return {
    progress: p,
    result: {
      correct, gain, cleared, newBadges,
      topicCorrect: Math.min(t.c, NEED),
      nextTopic: cleared ? nextTopic(p) : null,
      topicName: TOPIC[topicId]?.name,
    },
  };
}
