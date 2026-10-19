import { requireRole } from "@/lib/auth";
import { TOPICS, BADGES, NEED, topicStats, mastery, clearedCount, nextTopic, workingGrade } from "@/lib/topics";
import { Sign } from "@/components/Bits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your road" };

function greeting() {
  const h = parseInt(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: process.env.APP_TIMEZONE || "Asia/Dubai" }).format(new Date()), 10);
  return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
}

export default async function MapPage() {
  const { profile, admin } = await requireRole("student");
  const { data } = await admin.from("progress").select("*").eq("student_id", profile.id).maybeSingle();
  const p = data || {};
  const badges = p.badges || [];
  const wg = workingGrade(p), cl = clearedCount(p), nx = nextTopic(p), nxs = topicStats(p, nx.id);

  return (
    <>
      <div className="map-head">
        <div>
          <h1>{greeting()}, {profile.first_name}.</h1>
          <p className="sub">{profile.board} · {profile.tier} tier. Clear each stop with {NEED} correct answers.</p>
        </div>
        <div className="summary">
          <div className="sum-tile"><span className="label">Working at</span><strong>Grade {wg}</strong></div>
          <div className="sum-tile"><span className="label">Stops cleared</span><strong>{cl} / {TOPICS.length}</strong></div>
        </div>
      </div>

      <div className="card next-up">
        <Sign size={46}>{nx.grade}</Sign>
        <div className="grow">
          <div className="label">Up next</div>
          <strong>{nx.name}</strong>
          <div className="small">{nxs.c ? `${Math.min(nxs.c, NEED)} of ${NEED} correct so far` : "New stop. Professor Prime is ready when you are."}</div>
        </div>
        <a className="btn" href={`/app/practice/${nx.id}`}>{nxs.c ? "Keep going" : "Start"}</a>
      </div>

      <div className="badges">
        {BADGES.map(b => {
          const on = badges.includes(b.id);
          return (
            <span key={b.id} className={`badge${on ? " on" : ""}`} title={b.desc}>
              <span className="dot">{b.short}</span>{b.name}{!on && <span className="small"> · locked</span>}
            </span>
          );
        })}
      </div>

      <ol className="road">
        {TOPICS.map(t => {
          const s = topicStats(p, t.id), m = mastery(p, t.id), done = m >= 1, isNext = t.id === nx.id && !done;
          return (
            <li key={t.id} className={`stop${done ? " cleared" : ""}${isNext ? " next" : ""}`}>
              <div className="card stop-card">
                <Sign>{t.grade}</Sign>
                <div>
                  <h3>{t.name}</h3>
                  <div className="meta">
                    <span>{t.strand}</span>
                    {t.calc && <span className="tag">Calculator</span>}
                    {done ? <span className="tag done">Cleared</span> : isNext ? <span className="tag next">Up next</span> : null}
                  </div>
                </div>
                <div className="ring" style={{ background: `conic-gradient(var(--good) ${m * 360}deg, var(--line) 0)` }} aria-label={`${Math.min(s.c, NEED)} of ${NEED} correct`}>
                  <span>{Math.min(s.c, NEED)}/{NEED}</span>
                </div>
                <a className={`btn sm stop-btn${isNext ? "" : " ghost"}`} href={`/app/practice/${t.id}`}>{done ? "Revisit" : s.c ? "Continue" : "Practise"}</a>
              </div>
            </li>
          );
        })}
        <li className="stop goal">
          <div className="card goal-card">
            <Sign>9</Sign>
            <h3>{wg >= 9 ? "Grade 9 reached!" : "The Grade 9 sign"}</h3>
            <p>{wg >= 9 ? "You cleared the whole road. Professor Prime is speechless (almost)." : `Clear every stop to reach the top grade. ${TOPICS.length - cl} to go.`}</p>
          </div>
        </li>
      </ol>
    </>
  );
}
