import { apiSession } from "@/lib/auth";
import { maxGradeFor, topicsFor } from "@/lib/topics";
import { placementGrade } from "@/lib/progress";
import { loadProgress } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Grade Check: works out the starting grade from the answers saved on the server.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String).slice(0, 20) : [];
  if (!ids.length) return Response.json({ error: "Answer a few more questions first." }, { status: 400 });

  // Only this student's own, answered Grade Check questions from the last 3 hours count.
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await admin
    .from("questions")
    .select("payload, wrong, done, created_at")
    .eq("student_id", profile.id)
    .in("id", ids)
    .eq("payload->>placement", "true")
    .eq("done", true)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const answered = (rows || []).map(r => ({ grade: Number(r.payload?.grade) || 1, correct: r.wrong === 0 }));
  if (answered.length < 5) return Response.json({ error: "Answer a few more questions first." }, { status: 400 });

  const top = maxGradeFor(profile.tier);
  const grade = placementGrade(answered, top);
  const placement = { grade, at: new Date().toISOString(), answered: answered.length, correct: answered.filter(a => a.correct).length };

  const existing = await loadProgress(admin, profile.id);
  if (existing) await admin.from("progress").update({ placement, updated_at: new Date().toISOString() }).eq("student_id", profile.id);
  else await admin.from("progress").insert({ student_id: profile.id, placement });

  const first = topicsFor(profile.tier).find(t => t.grade >= grade);
  return Response.json({ grade, correct: placement.correct, answered: placement.answered, start: first ? { id: first.id, name: first.name, grade: first.grade } : null });
}
