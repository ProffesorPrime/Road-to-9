import Anthropic from "@anthropic-ai/sdk";
import { apiSession, canSeeStudent } from "@/lib/auth";
import { NEED, topicStats, workingGrade, gradeLabel, totals, topicsFor } from "@/lib/topics";
import { PRIME_MODEL } from "@/lib/prime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Writes a short progress summary for parents (or for the tutor to send home).
export async function POST(request) {
  const s = await apiSession(["tutor", "parent"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "Professor Prime's live mode isn't switched on yet." }, { status: 503 });

  const { studentId } = await request.json().catch(() => ({}));
  if (!studentId || !(await canSeeStudent(admin, profile, studentId))) return Response.json({ error: "Not allowed." }, { status: 403 });

  const { data: allowed } = await admin.rpc("bump_usage", { p_student: studentId, p_kind: "note", p_limit: 6 });
  if (!allowed) return Response.json({ error: "That's enough summaries for today. Try again tomorrow." }, { status: 429 });

  const [{ data: student }, { data: progress }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", studentId).single(),
    admin.from("progress").select("*").eq("student_id", studentId).maybeSingle(),
  ]);
  const p = progress || {};
  const st = totals(p);
  const rows = topicsFor(student.tier).filter(t => topicStats(p, t.id).a > 0 || t.grade <= Math.max(workingGrade(p, student.tier) + 1, 2)).map(t => {
    const x = topicStats(p, t.id);
    return `${t.name} (grade ${t.grade}): ${Math.min(x.c, NEED)}/${NEED} towards mastery, ${x.a} attempts, needed help ${x.h} times`;
  }).join("\n");

  const voice = profile.role === "tutor"
    ? `from a maths tutor to the parents of ${student.first_name}`
    : `addressed to the parent of ${student.first_name}, written by Professor Prime, the friendly AI maths tutor in the Road to 9 app`;

  const prompt = `Write a short, warm progress update (80-110 words, plain text, no headings or bullet points) ${voice}. They study ${student.board} maths, ${student.tier} tier, on the "Road to 9" app. Working grade estimate: ${gradeLabel(workingGrade(p, student.tier))} (topics are graded 1 to 9, following the IGCSE grade list). Questions answered: ${st.a}, accuracy ${st.acc}%. Mention one or two strengths and one or two topics to focus on next, with a concrete suggestion. If there is little data yet, say so kindly and encourage regular short practice. Do not invent facts beyond this data.\n\nTopic data:\n${rows}`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({ model: PRIME_MODEL, max_tokens: 400, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    return Response.json({ text });
  } catch (e) {
    console.error("Parent note error", e?.message);
    return Response.json({ error: "Couldn't write the update just now. Try again." }, { status: 502 });
  }
}
