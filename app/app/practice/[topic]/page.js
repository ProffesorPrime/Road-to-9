import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { TOPIC, TOPICS, NEED, topicStats } from "@/lib/topics";
import Practice from "@/components/Practice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practice" };

export default async function PracticePage({ params }) {
  const { topic } = await params;
  if (!TOPIC[topic]) notFound();
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("*").eq("student_id", profile.id).maybeSingle();

  return (
    <Practice
      key={topic}
      topic={TOPIC[topic]}
      topics={TOPICS.map(t => ({ id: t.id, name: t.name, grade: t.grade }))}
      startCorrect={Math.min(topicStats(data, topic).c, NEED)}
      need={NEED}
      primeLive={!!process.env.ANTHROPIC_API_KEY}
    />
  );
}
