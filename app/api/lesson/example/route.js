import { apiSession } from "@/lib/auth";
import { generate } from "@/lib/questions";
import { TOPIC } from "@/lib/topics";

export const dynamic = "force-dynamic";

// A fully worked example for the "Watch Prime do one" part of a lesson.
// It is a fresh question that is never stored, so showing its answer gives nothing away.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { topic } = await request.json().catch(() => ({}));
  if (!TOPIC[topic]) return Response.json({ error: "Unknown topic." }, { status: 400 });
  const q = generate(topic);
  return Response.json({
    text: q.text,
    diagram: q.diagram || "",
    rule: q.hints?.[0] || "",
    steps: String(q.steps).split("\n").filter(Boolean),
    answerText: q.answerText,
  });
}
