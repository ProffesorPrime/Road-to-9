import { apiSession } from "@/lib/auth";
import { loadOwnQuestion, loadProgress, saveProgress } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Shows the worked answer, only after 3 wrong attempts (or once the question is done).
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { id } = await request.json().catch(() => ({}));
  const q = await loadOwnQuestion(admin, profile.id, id);
  if (!q) return Response.json({ error: "Question not found." }, { status: 404 });
  if (!q.done && q.wrong < 3) return Response.json({ error: "Have three tries first." }, { status: 400 });

  if (!q.done) {
    await admin.from("questions").update({ done: true }).eq("id", q.id);
    const row = await loadProgress(admin, profile.id);
    if (row && row.combo) await saveProgress(admin, profile.id, { ...row, combo: 0, clean_run: 0 });
  }
  return Response.json({ steps: q.payload.steps, answerText: q.payload.answerText });
}
