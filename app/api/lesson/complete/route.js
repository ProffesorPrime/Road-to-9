import { apiSession } from "@/lib/auth";
import { TOPIC } from "@/lib/topics";
import { completeLesson } from "@/lib/progress";
import { loadProgress, saveProgress } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Marks a topic's lesson as finished. XP is only given the first time.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { topic } = await request.json().catch(() => ({}));
  if (!TOPIC[topic]) return Response.json({ error: "Unknown topic." }, { status: 400 });

  const row = await loadProgress(admin, profile.id);
  const { progress, gain, newBadges } = completeLesson(row, topic);
  if (gain) await saveProgress(admin, profile.id, progress);
  return Response.json({ gain, newBadges, xp: progress.xp });
}
