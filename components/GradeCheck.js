"use client";
// Adaptive Grade Check: 10 questions. Right → one grade harder, wrong → one grade easier.
import { useCallback, useEffect, useRef, useState } from "react";
import { PrimeBig, Sign } from "./Bits";
import VoiceToggle from "./VoiceToggle";
import { speak, stop } from "@/lib/speech";

const TOTAL = 10;
const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));
const CHEER = ["Got it!", "Splendid!", "Eureka!", "Correct! Let's try something harder.", "Magnificent!"];
const CALM = ["No problem. Let's try a different one.", "That's fine, that's what this is for.", "No worries! Next one.", "Good try. Here's another."];
const pick = a => a[Math.floor(Math.random() * a.length)];

export default function GradeCheck({ name, top, firstGrade, previous }) {
  const [stage, setStage] = useState("intro"); // intro | q | result
  const [grade, setGrade] = useState(firstGrade);
  const [n, setN] = useState(0);
  const [q, setQ] = useState(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [fb, setFb] = useState(null);
  const [say, setSay] = useState(`Hello ${name}! Let's find out where your road to 9 should start.`);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const used = useRef([]);
  const answered = useRef([]);
  const input = useRef(null);

  const onSay = useCallback(t => { setSay(t); speak(t); }, []);
  useEffect(() => () => stop(), []);

  async function loadQ(g) {
    setQ(null); setAnswer(""); setFb(null); setErr("");
    const r = await post("/api/check/question", { grade: g, avoid: used.current.slice(-6) }).catch(() => ({ ok: false, data: {} }));
    if (!r.ok) { setErr(r.data.error || "Couldn't load a question. Check your connection."); return; }
    used.current.push(r.data.topic);
    setQ(r.data);
    setTimeout(() => input.current?.focus(), 60);
  }

  function start() {
    setStage("q"); setN(0); answered.current = [];
    onSay("Answer what you can. If you haven't learned something yet, just tap I don't know. No XP to lose!");
    loadQ(firstGrade);
  }

  async function submit(e, skip = false) {
    e?.preventDefault();
    if (!q || busy || fb) return;
    if (!skip && !answer.trim()) return;
    setBusy(true);
    const r = await post("/api/check/answer", { id: q.id, answer: skip ? "" : answer }).catch(() => ({ ok: false, data: {} }));
    setBusy(false);
    if (!r.ok) { setErr(r.data.error || "Couldn't check that. Try again."); return; }
    const right = r.data.correct;
    answered.current.push(q.id);
    setFb({ right, answerText: r.data.answerText, skip });
    onSay(right ? pick(CHEER) : pick(CALM));
  }

  async function next() {
    const right = fb?.right;
    const count = n + 1;
    setN(count);
    const g = right ? Math.min(top, grade + 1) : Math.max(1, grade - 1);
    setGrade(g);
    if (count >= TOTAL) {
      setStage("result"); setQ(null);
      const r = await post("/api/check/finish", { ids: answered.current }).catch(() => ({ ok: false, data: {} }));
      if (!r.ok) { setErr(r.data.error || "Couldn't save your result."); return; }
      setResult(r.data);
      onSay(`Eureka! Your road starts at Grade ${r.data.grade}. You got ${r.data.correct} out of ${r.data.answered}. Let's go!`);
      return;
    }
    loadQ(g);
  }

  return (
    <div className="lesson check">
      <div className="lesson-top">
        <a className="link" href="/app">✕ Exit</a>
        <div className="lesson-title"><strong>Grade Check</strong></div>
        <VoiceToggle />
      </div>
      <div className="lesson-progress" aria-label={`Question ${Math.min(n + 1, TOTAL)} of ${TOTAL}`}>
        {Array.from({ length: TOTAL }, (_, k) => <i key={k} className={k < n ? "done" : k === n && stage === "q" ? "now" : ""} />)}
      </div>
      <div className="lesson-main">
        <div className="lesson-prime">
          <div className="lesson-bubble" aria-live="polite"><span className="label">Professor Prime</span><p>{say}</p></div>
          <PrimeBig mood={stage === "result" ? "happy" : fb?.right ? "happy" : "idle"} size={170} />
        </div>
        <div className="lesson-stage card">
          {stage === "intro" && (
            <div className="lesson-done">
              <h2>Find your starting grade</h2>
              <p>{TOTAL} questions, about 10 minutes. They get harder when you're right and easier when you're not, so it's normal to find some tricky.</p>
              {previous && <p className="small">Your last Grade Check put you at Grade {previous}.</p>}
              <ul className="check-list small"><li>No calculator needed for most questions. Keep one handy just in case.</li><li>Don't know it yet? Tap "I don't know". That helps too.</li></ul>
              <div className="w-buttons"><button className="btn" type="button" onClick={start}>Start the Grade Check</button></div>
            </div>
          )}
          {stage === "q" && (err ? <p className="notice bad">{err} <button className="link" onClick={() => loadQ(grade)}>Try again</button></p>
            : !q ? <p className="small">Loading…</p> : (
              <div className="lq">
                <div className="check-meta"><Sign size={40}>{q.grade}</Sign><span className="small">Question {n + 1} of {TOTAL} · {q.topicName}</span></div>
                <p className="qtext" dangerouslySetInnerHTML={{ __html: q.text }} />
                {q.diagram && <div dangerouslySetInnerHTML={{ __html: q.diagram }} />}
                {!fb ? (
                  <form onSubmit={submit} noValidate>
                    <label htmlFor="gc-ans" className="label">Your answer</label>
                    <div className="ansrow">
                      <input id="gc-ans" ref={input} autoComplete="off" spellCheck="false" value={answer} onChange={e => setAnswer(e.target.value)} />
                      <button className="btn" type="submit" disabled={busy || !answer.trim()}>{busy ? "Checking…" : "Check"}</button>
                    </div>
                    <div className="lq-row"><p className="small">{q.input}</p><button type="button" className="link" disabled={busy} onClick={e => submit(e, true)}>I don't know</button></div>
                  </form>
                ) : (
                  <>
                    <p className={`feedback ${fb.right ? "good" : "info"}`}>{fb.right ? "Correct!" : fb.skip ? `That's fine. The answer was ${fb.answerText}.` : `Not this time. The answer was ${fb.answerText}.`}</p>
                    <div className="w-buttons"><button className="btn" type="button" onClick={next}>{n + 1 >= TOTAL ? "See my result" : "Next question"}</button></div>
                  </>
                )}
              </div>
            ))}
          {stage === "result" && (err ? <p className="notice bad">{err}</p> : !result ? <p className="small">Working out your grade…</p> : (
            <div className="lesson-done">
              <Sign size={140}>{result.grade}</Sign>
              <h2>Your road starts at Grade {result.grade}</h2>
              <p className="small">{result.correct} of {result.answered} correct. Your tutor and parents can see this result.</p>
              <div className="w-buttons">
                {result.start && <a className="btn" href={`/app/learn/${result.start.id}`}>Start your first lesson: {result.start.name}</a>}
                <a className="btn ghost" href="/app">See my map</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
