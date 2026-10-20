import { requireRole } from "@/lib/auth";
import { GRADES, BADGES, NEED, topicsInGrade, topicsFor, maxGradeFor, topicStats, mastery, clearedCount, nextTopic, workingGrade, gradeLabel, lessonDone, startGrade, totals } from "@/lib/topics";
import { PrimeBig } from "@/components/Bits";
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
  const tier = profile.tier;
  const top = maxGradeFor(tier);
  const badges = p.badges || [];
  const wg = workingGrade(p, tier), cl = clearedCount(p, tier), total = topicsFor(tier).length;
  const nx = nextTopic(p, tier), nxs = topicStats(p, nx.id);
  const placed = p.placement?.grade || null, from = startGrade(p, tier);
  const brandNew = !placed && totals(p).a === 0;
  const nxLesson = !lessonDone(p, nx.id) && nxs.c < NEED;
  const nxHref = nxLesson ? `/app/learn/${nx.id}` : `/app/practice/${nx.id}`;

  return (
    <>
      <div className="map-head">
        <div>
          <h1>{greeting()}, {profile.first_name}.</h1>
          <p className="sub">{profile.board} · {profile.tier} tier. Clear each stop with {NEED} correct answers. Clear every stop in a grade to move up the road.</p>
        </div>
        <div className="summary">
          {placed && <a className="sum-tile link-tile" href="/app/check"><span className="label">Grade Check</span><strong>Grade {placed}</strong></a>}
          <div className="sum-tile"><span className="label">Mastered to</span><strong>{gradeLabel(wg)}</strong></div>
          <div className="sum-tile"><span className="label">Stops cleared</span><strong>{cl} / {total}</strong></div>
        </div>
      </div>

      {brandNew && (
        <div className="card welcome">
          <PrimeBig mood="happy" size={110} />
          <div className="grow">
            <div className="label">Start here</div>
            <h2>Take your Grade Check</h2>
            <p className="small">10 quick questions so Professor Prime knows where your road should start. About 10 minutes.</p>
          </div>
          <a className="btn" href="/app/check">Start the Grade Check</a>
        </div>
      )}

      <div className="card next-up">
        <Sign size={46}>{nx.grade}</Sign>
        <div className="grow">
          <div className="label">Up next · Grade {nx.grade}</div>
          <strong>{nx.name}</strong>
          <div className="small">{nxLesson ? "Start with a short lesson. Professor Prime will show you how it works." : `${Math.min(nxs.c, NEED)} of ${NEED} correct so far`}</div>
        </div>
        <a className="btn" href={nxHref}>{nxLesson ? "Start the lesson" : "Keep practising"}</a>
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

      <ol className="levels">
        {GRADES.map(g => {
          const ts = topicsInGrade(g.grade);
          const done = ts.filter(t => mastery(p, t.id) >= 1).length;
          const pct = Math.round((ts.reduce((s, t) => s + mastery(p, t.id), 0) / ts.length) * 100);
          const locked = g.grade > top;
          const isCurrent = !locked && g.grade === nx.grade && done < ts.length;
          const state = locked ? "locked" : done === ts.length ? "cleared" : isCurrent ? "current" : "";
          return (
            <li key={g.grade} className={`level ${state}`} id={`grade-${g.grade}`}>
              <div className="level-sign"><Sign size={g.grade === 9 ? 64 : 52}>{g.grade}</Sign></div>
              <div className="level-body">
                <div className="level-head">
                  <div>
                    <div className="label">Grade {g.grade} · {g.band}</div>
                    <h2>{g.title}</h2>
                  </div>
                  <div className="level-meter">
                    {locked ? <span className="tag">Higher tier only</span>
                      : done === ts.length ? <span className="tag done">Grade cleared</span>
                      : placed && g.grade < from ? <span className="tag">Grade Check: you know this</span>
                      : <span className="small mono">{done}/{ts.length} stops</span>}
                    {!locked && <span className="meter"><i style={{ width: `${pct}%` }} /></span>}
                  </div>
                </div>
                {!locked && (
                  <ul className="stops">
                    {ts.map(t => {
                      const s = topicStats(p, t.id), m = mastery(p, t.id), cleared = m >= 1, isNext = t.id === nx.id && !cleared;
                      const learn = !lessonDone(p, t.id) && !cleared;
                      return (
                        <li key={t.id}>
                          <a className={`stop-tile${cleared ? " cleared" : ""}${isNext ? " next" : ""}`} href={learn ? `/app/learn/${t.id}` : `/app/practice/${t.id}`}>
                            <span className="ring" style={{ background: `conic-gradient(var(--good) ${m * 360}deg, var(--line) 0)` }} aria-hidden="true">
                              <span>{Math.min(s.c, NEED)}/{NEED}</span>
                            </span>
                            <span className="stop-text">
                              <strong>{t.name}</strong>
                              <span className="small">
                                {cleared ? "Cleared" : learn ? (isNext ? "Up next · lesson" : "Lesson") : isNext ? "Up next" : s.a ? "In progress" : t.strand}
                                {t.calc ? " · calculator" : ""}
                              </span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
