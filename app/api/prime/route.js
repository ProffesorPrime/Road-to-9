import Anthropic from "@anthropic-ai/sdk";
import { apiSession } from "@/lib/auth";
import { markHelped } from "@/lib/progress";
import { loadOwnQuestion, recordHelp } from "@/lib/studentQuestion";
import { PRIME_RULES, PRIME_MODEL, PRIME_DAILY_LIMIT, questionContext } from "@/lib/prime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (msg, status) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

// Professor Prime: streams a reply from Claude. The question's answer stays on the server.
export async function POST(request) {
  const s = await apiSession(["student"]);
  if (s.error) return s.error;
  const { admin, profile } = s;

  if (!process.env.ANTHROPIC_API_KEY) return text("Professor Prime's live mode isn't switched on yet.", 503);

  const body = await request.json().catch(() => null);
  if (!body) return text("Bad request.", 400);
  const q = await loadOwnQuestion(admin, profile.id, body.id);
  if (!q) return text("Question not found. Load a new one.", 404);

  // Only the last few turns, only user/assistant, short, ending on the student.
  const raw = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const messages = raw
    .filter(m => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return text("Type a message first.", 400);

  const { data: allowed } = await admin.rpc("bump_usage", { p_student: profile.id, p_kind: "prime", p_limit: PRIME_DAILY_LIMIT });
  if (!allowed) return text(`That's all of today's ${PRIME_DAILY_LIMIT} questions to Professor Prime. Written hints still work, and Prime is back tomorrow.`, 429);

  await recordHelp(admin, profile.id, q, markHelped);

  const client = new Anthropic();
  const studentText = messages[messages.length - 1].content;
  const encoder = new TextEncoder();
  let full = "";

  const stream = client.messages.stream({
    model: PRIME_MODEL,
    max_tokens: 400,
    system: `${PRIME_RULES}\n\n${questionContext(profile, q)}`,
    messages,
  });

  const body2 = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        console.error("Prime error", e?.message);
        controller.enqueue(encoder.encode(full ? "\n\n(Signal lost. Ask again.)" : "Lost the signal to my lab. Try again in a moment."));
      } finally {
        controller.close();
        if (full) {
          await admin.from("prime_log").insert({ student_id: profile.id, topic: q.topic, student_text: studentText, prime_text: full });
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body2, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
