import { apiSession } from "@/lib/auth";
import { markHelped } from "@/lib/progress";
import { loadOwnQuestion, recordHelp } from "@/lib/studentQuestion";

export const dynamic = "force-dynamic";

// Written hints, used when the AI tutor is switched off or has hit its daily limit.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;
  const { id } = await request.json().catch(() => ({}));
  const q = await loadOwnQuestion(admin, profile.id, id);
  if (!q) return Response.json({ error: "Question not found." }, { status: 404 });

  const newBadges = await recordHelp(admin, profile.id, q, markHelped);
  const hints = q.payload.hints || [];
  let text;
  if (q.hint_idx < hints.length) {
    text = hints[q.hint_idx];
    await admin.from("questions").update({ hint_idx: q.hint_idx + 1 }).eq("id", q.id);
  } else if (q.wrong >= 2) {
    const lines = String(q.payload.steps).split("\n");
    text = "Here's the method:\n" + lines.slice(0, -1).join("\n") + "\nNow finish the last step yourself.";
  } else {
    text = "That's all my written hints. Give it a go, and after a few tries I can show you the full method.";
  }
  return Response.json({ text, newBadges });
}
