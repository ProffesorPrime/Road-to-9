"use client";
// A guided lesson led by Professor Prime: learn → watch → together → solo → done.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PrimeBig, Sign } from "../Bits";
import VoiceToggle from "../VoiceToggle";
import { WIDGETS } from "./Widgets";
import LessonQuestion from "./LessonQuestion";
import { LESSONS } from "@/lib/lessons";
import { speak, stop } from "@/lib/speech";

const post = (url, body) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));

function buildSegments(topic) {
  const hand = LESSONS[topic.id];
  const segs = hand
    ? hand.map(s => ({ kind: "step", ...s }))
    : [{ kind: "step", say: `Today's mission: ${topic.name}! First I'll show you one, then we'll do one together, then you fly solo.` }];
  if (!hand) segs.push({ kind: "watch" });
  segs.push({ kind: "together" }, { kind: "solo" }, { kind: "done" });
  return segs;
}

function Ask({ ask, onRight, onSay }) {
  const [picked, setPicked] = useState(null);
  const [wrongs, setWrongs] = useState([]);
  const right = picked === ask.answer;
  return (
    <div className="ask">
      <p className="qtext">{ask.q}</p>
      <div className="ask-options">
        {ask.options.map((o, i) => (
          <button key={o} type="button" disabled={right || wrongs.includes(i)}
            className={`ask-option${picked === i && right ? " right" : ""}${wrongs.includes(i) ? " wrong" : ""}`}
            onClick={() => { setPicked(i); if (i === ask.answer) { onSay(ask.yes); onRight(); } else { setWrongs(w => [...w, i]); onSay(ask.no); } }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Watch({ topicId, onSay, onReady }) {
  const [ex, setEx] = useState(null);
  const [shown, setShown] = useState(0);
  const [err, setErr] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; started.current = true;
    post("/api/lesson/example", { topic: topicId }).then(r => {
      if (!r.ok) { setErr(r.data.error || "Couldn't load the example."); return; }
      setEx(r.data);
      onSay(`Watch me do one. ${r.data.rule}`);
    }).catch(() => setErr("Couldn't load the example. Check your connection."));
  }, [topicId, onSay]);
  useEffect(() => { if (ex && shown >= ex.steps.length) onReady(); }, [ex, shown, onReady]);
  if (err) return <p className="notice bad">{err}</p>;
  if (!ex) return <p className="small">Professor Prime is picking an example…</p>;
  const next = () => {
    const n = shown + 1;
    setShown(n);
    onSay(n < ex.steps.length ? ex.steps[n - 1] : `${ex.steps[n - 1]}. So the answer is ${ex.answerText}. Your turn next!`);
  };
  return (
    <div className="watch">
      <span className="label">Prime's example</span>
      <p className="qtext" dangerouslySetInnerHTML={{ __html: ex.text }} />
      {ex.diagram && <div dangerouslySetInnerHTML={{ __html: ex.diagram }} />}
      <ol className="watch-steps">
        {ex.steps.slice(0, shown).map((s, i) => <li key={i} className="mono">{s}</li>)}
      </ol>
      {shown >= ex.steps.length
        ? <p className="feedback good">Answer: {ex.answerText}</p>
        : <div className="w-buttons"><button type="button" className="btn" onClick={next}>{shown === 0 ? "Show me the first step" : "Next step"}</button></div>}
    </div>
  );
}

export default function Lesson({ topic, practiceHref, mapHref, alreadyDone }) {
  const segs = useMemo(() => buildSegments(topic), [topic]);
  const [i, setI] = useState(0);
  const [say, setSay] = useState("");
  const [talking, setTalking] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [xp, setXp] = useState(0);
  const [finish, setFinish] = useState(null);
  const seg = segs[i];
  const talkTimer = useRef(null);

  const onSay = useCallback(text => {
    setSay(text);
    setTalking(true);
    clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => setTalking(false), Math.min(4000, 400 + text.length * 35));
    speak(text);
  }, []);

  // entering a segment
  useEffect(() => {
    setCanNext(seg.kind === "step" && !seg.do && !seg.ask);
    if (seg.kind === "step") onSay(seg.say);
    if (seg.kind === "done") {
      post("/api/lesson/complete", { topic: topic.id }).then(r => {
        setFinish(r.ok ? r.data : { gain: 0 });
        onSay(alreadyDone ? "Lesson complete again! Practice makes perfect." : `Eureka! Lesson complete. Now let's clear the ${topic.name} stop with practice!`);
      });
    }
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { stop(); clearTimeout(talkTimer.current); }, []);

  const next = () => { stop(); if (i < segs.length - 1) setI(i + 1); };
  const W = seg.show ? WIDGETS[seg.show.w] : seg.do ? WIDGETS[seg.do.w] : null;
  const phase = seg.kind === "step" ? "Learn" : seg.kind === "watch" ? "Watch" : seg.kind === "together" ? "Together" : seg.kind === "solo" ? "Solo" : "Done";

  return (
    <div className="lesson">
      <div className="lesson-top">
        <a className="link" href={mapHref}>✕ Exit</a>
        <div className="lesson-title"><Sign size={36}>{topic.grade}</Sign><strong>{topic.name}</strong></div>
        <VoiceToggle />
      </div>
      <div className="lesson-progress" aria-label={`Step ${i + 1} of ${segs.length}`}>
        {segs.map((_, k) => <i key={k} className={k < i ? "done" : k === i ? "now" : ""} />)}
      </div>

      <div className="lesson-main">
        <div className="lesson-prime">
          <div className="lesson-bubble" aria-live="polite">
            <span className="label">{phase}</span>
            <p>{say}</p>
          </div>
          <PrimeBig mood={seg.kind === "done" ? "happy" : talking ? "talk" : "idle"} size={170} />
        </div>

        <div className="lesson-stage card">
          {seg.kind === "step" && (
            <>
              {seg.show && W && <W key={`s${i}`} {...seg.show} />}
              {seg.do && W && <W key={`d${i}`} {...seg.do} onDone={() => { setCanNext(true); onSay("Eureka! That's exactly it."); }} />}
              {seg.ask && <Ask key={`a${i}`} ask={seg.ask} onSay={onSay} onRight={() => setCanNext(true)} />}
              {!seg.show && !seg.do && !seg.ask && (
                <div className="lesson-idea"><Sign size={96}>{topic.grade}</Sign><span className="label">Key idea</span><p className="qtext">{seg.say}</p></div>
              )}
            </>
          )}
          {seg.kind === "watch" && <Watch topicId={topic.id} onSay={onSay} onReady={() => setCanNext(true)} />}
          {(seg.kind === "together" || seg.kind === "solo") && (
            <LessonQuestion key={seg.kind} topicId={topic.id} mode={seg.kind} onSay={onSay}
              onXp={g => setXp(x => x + (g || 0))} onDone={() => next()} />
          )}
          {seg.kind === "done" && (
            <div className="lesson-done">
              <Sign size={120}>{topic.grade}</Sign>
              <h2>Lesson complete!</h2>
              <p className="small">{finish ? `+${(finish.gain || 0) + xp} XP${finish.newBadges?.length ? ` · New badge: ${finish.newBadges.map(b => b.name).join(", ")}` : ""}` : "Saving…"}</p>
              <p>Next: clear the stop with 5 correct answers. Any you got right in this lesson already count!</p>
              <div className="w-buttons">
                <a className="btn" href={practiceHref}>Keep practising</a>
                <a className="btn ghost" href={mapHref}>Back to the map</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {seg.kind === "step" || seg.kind === "watch" ? (
        <div className="lesson-actions">
          <button type="button" className="btn lesson-next" disabled={!canNext} onClick={next}>
            {canNext ? "Next" : seg.do ? "Finish the task to continue" : seg.ask ? "Pick an answer" : "Next"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
