"use client";
// One real question inside a lesson. Counts towards mastery, like practice.
// mode "together": Prime gives the first hint straight away and more after mistakes.
// mode "solo": no automatic help, but hints are a tap away.
import { useEffect, useRef, useState } from "react";

const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));

export default function LessonQuestion({ topicId, mode, onSay, onDone, onXp }) {
  const [q, setQ] = useState(null);
  const [err, setErr] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [result, setResult] = useState(null); // null | "right" | "shown"
  const [hint, setHint] = useState("");
  const [steps, setSteps] = useState(null);
  const input = useRef(null);
  const started = useRef(false);

  async function load() {
    setErr("");
    const r = await post("/api/question", { topic: topicId }).catch(() => ({ ok: false, data: {} }));
    if (!r.ok) { setErr(r.data.error || "Couldn't load a question. Check your connection."); return; }
    setQ(r.data);
    if (mode === "together") {
      onSay("Let's do this one together. Here's how I'd start…");
      const h = await post("/api/hint", { id: r.data.id }).catch(() => null);
      if (h?.ok) { setHint(h.data.text); onSay(`Let's do this one together. ${h.data.text}`); }
    } else {
      onSay("Now you fly solo! I'm here if you need a hint.");
    }
    setTimeout(() => input.current?.focus(), 60);
  }
  useEffect(() => { if (!started.current) { started.current = true; load(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function getHint() {
    const h = await post("/api/hint", { id: q.id }).catch(() => null);
    if (h?.ok) { setHint(h.data.text); onSay(h.data.text); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!q || busy || result || !answer.trim()) return;
    setBusy(true);
    const r = await post("/api/answer", { id: q.id, answer }).catch(() => ({ ok: false, data: {} }));
    setBusy(false);
    if (!r.ok) { onSay(r.data.error || "Hmm, I couldn't check that. Try again."); return; }
    if (r.data.correct) {
      setResult("right");
      onXp?.(r.data.gain);
      onSay(mode === "together" ? `Eureka! We did it together. +${r.data.gain} XP` : `Magnificent! All by yourself. +${r.data.gain} XP`);
      return;
    }
    const w = r.data.wrong;
    setWrong(w);
    if (w >= 3) {
      const rv = await post("/api/reveal", { id: q.id }).catch(() => null);
      if (rv?.ok) { setSteps(rv.data); setResult("shown"); onSay("No worries. Here's the full method. Read it line by line, it will click."); }
      return;
    }
    if (mode === "together" || w >= 2) {
      onSay("Not quite. Let me show you another way…");
      await getHint();
    } else {
      onSay("Not quite! Check each step, or tap Hint.");
    }
    input.current?.select();
  }

  if (err) return <p className="notice bad">{err} <button className="link" onClick={load}>Try again</button></p>;
  if (!q) return <p className="small">Loading a question…</p>;

  return (
    <div className="lq">
      <p className="qtext" dangerouslySetInnerHTML={{ __html: q.text }} />
      {q.diagram && <div dangerouslySetInnerHTML={{ __html: q.diagram }} />}
      {hint && !result && <p className="lq-hint"><span className="label">Prime's hint</span>{hint}</p>}
      {!result && (
        <form onSubmit={submit} noValidate>
          <label htmlFor="lq-ans" className="label">Your answer</label>
          <div className="ansrow">
            <input id="lq-ans" ref={input} autoComplete="off" spellCheck="false" value={answer} onChange={e => setAnswer(e.target.value)} />
            <button className="btn" type="submit" disabled={busy || !answer.trim()}>{busy ? "Checking…" : "Check"}</button>
          </div>
          <div className="lq-row">
            <p className="small">{q.input}</p>
            <button type="button" className="link" onClick={getHint}>Hint</button>
          </div>
          {wrong > 0 && <p className="feedback bad">Not yet. {3 - wrong} more {3 - wrong === 1 ? "try" : "tries"} before I show you the method.</p>}
        </form>
      )}
      {result === "right" && <p className="feedback good">Correct!</p>}
      {result === "shown" && steps && (
        <div className="feedback info"><strong>Worked answer</strong><pre>{steps.steps}</pre><strong>Answer: {steps.answerText}</strong></div>
      )}
      {result && <div className="w-buttons"><button className="btn" type="button" onClick={() => onDone(result === "right")}>Continue</button></div>}
    </div>
  );
}
