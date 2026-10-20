import { apiSession } from "@/lib/auth";
import { loadProgress } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Saves an Arcade score. Arcade is just for fun: no XP, only a high score and a badge.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { score } = await request.json().catch(() => ({}));
  const n = Math.max(0, Math.min(60, parseInt(score, 10) || 0)); // 60 seconds: more than 60 isn't realistic

  const row = await loadProgress(admin, profile.id);
  const best = row?.arcade_best || 0;
  const badges = Array.isArray(row?.badges) ? [...row.badges] : [];
  const earned = n >= 20 && !badges.includes("speed");
  if (earned) badges.push("speed");

  if (n > best || earned) {
    const patch = { arcade_best: Math.max(n, best), badges, updated_at: new Date().toISOString() };
    if (row) await admin.from("progress").update(patch).eq("student_id", profile.id);
    else await admin.from("progress").insert({ student_id: profile.id, ...patch });
  }
  return Response.json({ best: Math.max(n, best), newBest: n > best, badge: earned ? { name: "Arcade Ace" } : null });
}
