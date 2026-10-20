import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { TOPIC, topicStats } from "@/lib/topics";
import Lesson from "@/components/lesson/Lesson";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lesson" };

export default async function LearnPage({ params }) {
  const { topic } = await params;
  if (!TOPIC[topic]) notFound();
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("topics").eq("student_id", profile.id).maybeSingle();

  return (
    <Lesson
      key={topic}
      topic={TOPIC[topic]}
      practiceHref={`/app/practice/${topic}`}
      mapHref="/app"
      alreadyDone={!!topicStats(data, topic).l}
    />
  );
}
