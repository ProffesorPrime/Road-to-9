import { apiSession } from "@/lib/auth";
import { generate, publicQuestion } from "@/lib/questions";
import { TOPIC } from "@/lib/topics";

export const dynamic = "force-dynamic";

// Makes a new question, stores it (with its answer) and sends back only the question.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { topic } = await request.json().catch(() => ({}));
  if (!TOPIC[topic]) return Response.json({ error: "Unknown topic." }, { status: 400 });

  const q = generate(topic);
  const { data, error } = await admin
    .from("questions")
    .insert({ student_id: profile.id, topic, payload: q })
    .select("id")
    .single();
  if (error) return Response.json({ error: "Couldn't load a question. Try again." }, { status: 500 });

  return Response.json(publicQuestion(data.id, topic, q));
}
