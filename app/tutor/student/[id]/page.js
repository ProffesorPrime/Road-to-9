import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import Report from "@/components/Report";
import { TOPIC } from "@/lib/topics";
import { ago, stamp } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Student" };

export default async function TutorStudent({ params }) {
  const { id } = await params;
  const { admin } = await requireRole("tutor");
  const { data: student } = await admin.from("profiles").select("*").eq("id", id).eq("role", "student").maybeSingle();
  if (!student) notFound();

  const [{ data: progress }, { data: last }, { data: log }, { data: links }] = await Promise.all([
    admin.from("progress").select("*").eq("student_id", id).maybeSingle(),
    admin.from("attempts").select("created_at").eq("student_id", id).order("created_at", { ascending: false }).limit(1),
    admin.from("prime_log").select("*").eq("student_id", id).order("created_at", { ascending: false }).limit(40),
    admin.from("parent_links").select("parent_id").eq("student_id", id),
  ]);
  const parentIds = (links || []).map(l => l.parent_id);
  const { data: parents } = parentIds.length ? await admin.from("profiles").select("first_name").in("id", parentIds) : { data: [] };

  return (
    <>
      <p style={{ marginBottom: 16 }}><a className="link" href="/tutor">← All students</a></p>
      <Report
        student={student}
        progress={progress}
        lastActive={ago(last?.[0]?.created_at)}
        noteFor={{ live: !!process.env.ANTHROPIC_API_KEY, audience: "tutor" }}
      />
      <p className="small" style={{ marginTop: 14 }}>
        Parents linked: {(parents || []).map(p => p.first_name).join(", ") || "none yet"}
        {student.consent_recorded_at ? ` · consent recorded ${stamp(student.consent_recorded_at)}` : ""}
      </p>

      <section className="section-gap">
        <div className="report-head">
          <div><div className="label">Safeguarding</div><h2>Conversations with Professor Prime</h2></div>
          <span className="small">Latest 40 messages</span>
        </div>
        <div className="card log">
          {(log || []).length ? log.map(m => (
            <div key={m.id} className="log-item">
              <span className="small">{stamp(m.created_at)} · {TOPIC[m.topic]?.name || m.topic}</span>
              <div className="msg me" style={{ justifySelf: "end" }}>{m.student_text}</div>
              <div className="msg prime-msg">{m.prime_text}</div>
            </div>
          )) : <div className="log-item small">No conversations yet.</div>}
        </div>
      </section>
    </>
  );
}
