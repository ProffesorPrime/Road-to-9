import { GRADES, NEED, topicsInGrade, maxGradeFor, topicStats, mastery, workingGrade, gradeLabel, totals, focusList, BADGES } from "@/lib/topics";
import ParentNote from "./ParentNote";

// Progress report used by students, parents and the tutor, grouped by grade 1–9.
export default function Report({ student, progress, title, noteFor, lastActive }) {
  const p = progress || {};
  const tier = student.tier;
  const st = totals(p);
  const focus = focusList(p, tier);
  const badges = (p.badges || []).map(id => BADGES.find(b => b.id === id)?.name).filter(Boolean);
  const grades = GRADES.filter(g => g.grade <= maxGradeFor(tier));

  return (
    <section>
      <div className="report-head">
        <div><div className="label">Progress report</div><h1>{title || `${student.first_name}'s road so far`}</h1></div>
        <span className="small">
          {student.board} · {student.tier} tier{p.placement?.grade ? ` · Grade Check: Grade ${p.placement.grade}` : ""}{lastActive ? ` · last active ${lastActive}` : ""}
        </span>
      </div>
      <div className="tiles">
        <div className="sum-tile"><span className="label">Working at</span><strong>{gradeLabel(workingGrade(p, tier))}</strong></div>
        <div className="sum-tile"><span className="label">Questions answered</span><strong>{st.a}</strong></div>
        <div className="sum-tile"><span className="label">Accuracy</span><strong>{st.a ? `${st.acc}%` : "–"}</strong></div>
        <div className="sum-tile"><span className="label">Help from Prime</span><strong>{st.h}×</strong></div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Stop</th><th>Lesson</th><th>Mastery</th><th>Correct</th><th>Attempts</th><th>Accuracy</th><th>Helped</th></tr></thead>
          <tbody>
            {grades.map(g => {
              const ts = topicsInGrade(g.grade);
              const done = ts.filter(t => mastery(p, t.id) >= 1).length;
              return [
                <tr key={`g${g.grade}`} className="grade-row"><td colSpan={7}>Grade {g.grade} · {g.title} · {done}/{ts.length} cleared</td></tr>,
                ...ts.map(t => {
                  const s = topicStats(p, t.id), m = mastery(p, t.id);
                  return (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong></td>
                      <td className="small">{s.l ? "Done" : "–"}</td>
                      <td><span className="mbar"><i style={{ width: `${m * 100}%` }} /></span><span className="mono small">{Math.round(m * 100)}%</span></td>
                      <td className="num">{s.c}</td>
                      <td className="num">{s.a}</td>
                      <td className="num">{s.a ? `${Math.round((s.c / s.a) * 100)}%` : "–"}</td>
                      <td className="num">{s.h}</td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>
      <div className="focus">
        <div className="card">
          <div className="label">Focus next</div>
          <ul>
            {focus.length
              ? focus.map(f => <li key={f.topic.id}><strong>{f.topic.name}</strong> <span className="small">(grade {f.topic.grade}) · {f.why}</span></li>)
              : <li>Every stop is cleared. Time for full past papers.</li>}
          </ul>
          <div className="label" style={{ marginTop: 8 }}>Badges</div>
          <p className="small">{badges.length ? badges.join(" · ") : "None yet"} · {p.xp || 0} XP · each stop needs {NEED} correct answers</p>
        </div>
        {noteFor ? (
          <ParentNote studentId={student.id} live={noteFor.live} audience={noteFor.audience} />
        ) : (
          <div className="card">
            <div className="label">How this works</div>
            <p className="small">Topics are grouped by grade, 1 to 9, like the IGCSE grade lists. Each stop starts with a short lesson from Professor Prime. Your working grade is the highest grade where you've mastered most of that grade and everything below it. Your tutor and your parents can see this report.</p>
          </div>
        )}
      </div>
    </section>
  );
}
