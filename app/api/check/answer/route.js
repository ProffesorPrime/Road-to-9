import { apiSession } from "@/lib/auth";
import { checkAnswer } from "@/lib/questions";
import { loadOwnQuestion } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Grade Check: one try per question. Doesn't touch XP or mastery.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { id, answer } = await request.json().catch(() => ({}));
  const value = String(answer || "").slice(0, 60);

  const q = await loadOwnQuestion(admin, profile.id, id, "placement");
  if (!q) return Response.json({ error: "Question not found." }, { status: 404 });
  if (q.done) return Response.json({ error: "Already answered." }, { status: 400 });

  // A blank answer counts as "I don't know yet".
  const correct = value.trim() ? checkAnswer(q.payload.check, value) : false;
  await admin.from("questions").update({ done: true, wrong: correct ? 0 : 1, last_answer: value }).eq("id", q.id);
  return Response.json({ correct, answerText: q.payload.answerText });
}
