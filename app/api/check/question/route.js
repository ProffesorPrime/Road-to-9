import { apiSession } from "@/lib/auth";
import { generate, publicQuestion } from "@/lib/questions";
import { topicsInGrade, maxGradeFor } from "@/lib/topics";

export const dynamic = "force-dynamic";

// Grade Check: one question from a random topic at the requested grade.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const body = await request.json().catch(() => ({}));
  const top = maxGradeFor(profile.tier);
  const grade = Math.min(top, Math.max(1, parseInt(body.grade, 10) || 1));
  const avoid = Array.isArray(body.avoid) ? body.avoid.map(String) : [];

  let pool = topicsInGrade(grade).filter(t => !avoid.includes(t.id));
  if (!pool.length) pool = topicsInGrade(grade);
  const topic = pool[Math.floor(Math.random() * pool.length)];
  const q = generate(topic.id);

  const { data, error } = await admin
    .from("questions")
    .insert({ student_id: profile.id, topic: topic.id, payload: { ...q, placement: true, grade } })
    .select("id")
    .single();
  if (error) return Response.json({ error: "Couldn't load a question. Try again." }, { status: 500 });

  return Response.json({ ...publicQuestion(data.id, topic.id, q), grade, topicName: topic.name });
}
