import { requireRole } from "@/lib/auth";
import { workingGrade, gradeLabel, totals, clearedCount, topicsFor } from "@/lib/topics";
import { dayString } from "@/lib/progress";
import { ago } from "@/lib/time";
import InviteForm from "@/components/InviteForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tutor dashboard" };

export default async function TutorPage() {
  const { admin } = await requireRole("tutor");

  const [{ data: people }, { data: progressRows }, { data: links }, { data: recent }, { data: usage }] = await Promise.all([
    admin.from("profiles").select("*").in("role", ["student", "parent"]).order("first_name"),
    admin.from("progress").select("*"),
    admin.from("parent_links").select("*"),
    admin.from("attempts").select("student_id, created_at").order("created_at", { ascending: false }).limit(1000),
    admin.from("prime_usage").select("*").eq("kind", "prime").eq("day", new Date().toISOString().slice(0, 10)),
  ]);

  const students = (people || []).filter(p => p.role === "student");
  const parents = (people || []).filter(p => p.role === "parent");
  const progressBy = Object.fromEntries((progressRows || []).map(r => [r.student_id, r]));
  const lastBy = {};
  (recent || []).forEach(a => { if (!lastBy[a.student_id]) lastBy[a.student_id] = a.created_at; });
  const usageBy = Object.fromEntries((usage || []).map(u => [u.student_id, u.count]));
  const nameBy = Object.fromEntries((people || []).map(p => [p.id, p.first_name]));
  const today = dayString();
  const activeToday = students.filter(s => lastBy[s.id] && dayString(new Date(lastBy[s.id])) === today).length;

  return (
    <>
      <div className="report-head">
        <div><div className="label">Tutor dashboard</div><h1>Your students</h1></div>
        <span className="small">{students.length} student{students.length === 1 ? "" : "s"} · {activeToday} practised today</span>
      </div>

      <div className="tutor-grid">
        <div className="stack">
          <div className="card table-wrap">
            {students.length ? (
              <table>
                <thead><tr><th>Student</th><th>Exam</th><th>Working at</th><th>Stops</th><th>Accuracy</th><th>Last active</th><th>Prime today</th></tr></thead>
                <tbody>
                  {students.map(s => {
                    const p = progressBy[s.id] || {};
                    const t = totals(p);
                    return (
                      <tr key={s.id}>
                        <td><a href={`/tutor/student/${s.id}`}><strong>{s.first_name}</strong></a></td>
                        <td className="small">{s.board} · {s.tier}</td>
                        <td className="num">{gradeLabel(workingGrade(p, s.tier))}</td>
                        <td className="num">{clearedCount(p, s.tier)}/{topicsFor(s.tier).length}</td>
                        <td className="num">{t.a ? `${t.acc}%` : "–"}</td>
                        <td className="small">{ago(lastBy[s.id])}</td>
                        <td className="num">{usageBy[s.id] || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="panel">
                <strong>No students yet</strong>
                <p className="small">Invite your first student with the form. They'll get an email to set their password.</p>
              </div>
            )}
          </div>

          <div className="card table-wrap">
            <table>
              <thead><tr><th>Parent</th><th>Can see</th></tr></thead>
              <tbody>
                {parents.length ? parents.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.first_name}</strong></td>
                    <td className="small">{(links || []).filter(l => l.parent_id === p.id).map(l => nameBy[l.student_id]).filter(Boolean).join(", ") || "Nobody yet"}</td>
                  </tr>
                )) : <tr><td colSpan={2} className="small">No parents invited yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <InviteForm
          students={students.map(s => ({ id: s.id, name: s.first_name }))}
          parents={parents.map(p => ({ id: p.id, name: p.first_name }))}
        />
      </div>
    </>
  );
}
