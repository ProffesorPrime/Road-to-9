import { apiSession } from "@/lib/auth";
import { checkAnswer } from "@/lib/questions";
import { applyAnswer } from "@/lib/progress";
import { loadOwnQuestion, loadProgress, saveProgress } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Checks an answer on the server, then updates XP, streaks and badges.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { id, answer } = await request.json().catch(() => ({}));
  const value = String(answer || "").slice(0, 60);
  if (!value.trim()) return Response.json({ error: "Type an answer first." }, { status: 400 });

  const q = await loadOwnQuestion(admin, profile.id, id);
  if (!q) return Response.json({ error: "Question not found. Load a new one." }, { status: 404 });
  if (q.done) return Response.json({ error: "This question is finished. Try the next one." }, { status: 400 });

  const correct = checkAnswer(q.payload.check, value);
  const row = await loadProgress(admin, profile.id);
  const { progress, result } = applyAnswer(row, { topicId: q.topic, correct, firstTry: q.wrong === 0, helped: q.helped });

  const wrong = correct ? q.wrong : q.wrong + 1;
  await Promise.all([
    admin.from("questions").update({ done: correct, wrong, last_answer: value }).eq("id", q.id),
    admin.from("attempts").insert({ student_id: profile.id, topic: q.topic, correct, helped: q.helped }),
    saveProgress(admin, profile.id, progress),
  ]);

  return Response.json({
    ...result,
    wrong,
    canReveal: !correct && wrong >= 3,
    xp: progress.xp,
    dayStreak: progress.day_streak,
  });
}
