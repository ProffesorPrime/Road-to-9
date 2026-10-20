"use client";
// Prime's Arcade: 60 seconds of quick-fire mental maths. Just for fun: high score + badge, no XP.
import { useCallback, useEffect, useRef, useState } from "react";
import { PrimeBig } from "./Bits";
import { arcadeQuestion, ARCADE_SECONDS } from "@/lib/arcade";
import { speak } from "@/lib/speech";
import VoiceToggle from "./VoiceToggle";

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "−", "0", "⌫"];

export default function Arcade({ best: best0, name }) {
  const [state, setState] = useState("ready"); // ready | play | over
  const [q, setQ] = useState(null);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(ARCADE_SECONDS);
  const [flash, setFlash] = useState(null); // "right" | "wrong"
  const [reveal, setReveal] = useState("");
  const [best, setBest] = useState(best0 || 0);
  const [saved, setSaved] = useState(null);
  const scoreRef = useRef(0);
  const endAt = useRef(0);

  const newQ = useCallback(s => { setQ(arcadeQuestion(s)); setTyped(""); }, []);

  function start() {
    scoreRef.current = 0; setScore(0); setCombo(0); setReveal(""); setSaved(null);
    endAt.current = Date.now() + ARCADE_SECONDS * 1000;
    setLeft(ARCADE_SECONDS); setState("play"); newQ(0);
    speak("Ready, steady, maths!");
  }

  useEffect(() => {
    if (state !== "play") return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) { clearInterval(t); finish(); }
    }, 200);
    return () => clearInterval(t);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function finish() {
    setState("over");
    const s = scoreRef.current;
    speak(s >= 20 ? `Eureka! ${s} points. You're an Arcade Ace!` : `Time's up! You scored ${s}.`);
    try {
      const r = await fetch("/api/arcade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: s }) });
      const d = await r.json();
      if (r.ok) { setSaved(d); setBest(d.best); }
    } catch {}
  }

  const submit = useCallback(() => {
    if (state !== "play" || !q || typed === "" || typed === "-") return;
    const v = Number(typed);
    if (v === q.a) {
      scoreRef.current += 1; setScore(scoreRef.current); setCombo(c => c + 1);
      setFlash("right"); setReveal("");
      newQ(scoreRef.current);
    } else {
      setCombo(0); setFlash("wrong"); setReveal(`${q.q} = ${q.a < 0 ? `−${-q.a}` : q.a}`);
      newQ(scoreRef.current);
    }
    setTimeout(() => setFlash(null), 260);
  }, [state, q, typed, newQ]);

  const press = useCallback(k => {
    if (state !== "play") return;
    if (k === "⌫") setTyped(t => t.slice(0, -1));
    else if (k === "−") setTyped(t => (t.startsWith("-") ? t.slice(1) : "-" + t));
    else setTyped(t => (t.length < 6 ? t + k : t));
  }, [state]);

  useEffect(() => {
    const onKey = e => {
      if (state !== "play") return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "-") press("−");
      else if (e.key === "Backspace") press("⌫");
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, press, submit]);

  const pct = (left / ARCADE_SECONDS) * 100;
  return (
    <div className="arcade">
      <div className="arcade-top">
        <div><span className="label">Prime's Arcade</span><h1>Quick-fire maths</h1></div>
        <div className="arcade-stats">
          <div className="sum-tile"><span className="label">Score</span><strong>{score}</strong></div>
          <div className="sum-tile"><span className="label">Best</span><strong>{best}</strong></div>
          <VoiceToggle />
        </div>
      </div>

      {state === "ready" && (
        <div className="card arcade-card center">
          <PrimeBig mood="happy" size={160} />
          <h2>60 seconds. How many can you get, {name}?</h2>
          <p className="small">No calculator. Questions get harder as your score goes up. Wrong answers don't lose points, so keep going!</p>
          <button className="btn arcade-go" type="button" onClick={start}>Start</button>
        </div>
      )}

      {state === "play" && q && (
        <div className={`card arcade-card${flash ? ` flash-${flash}` : ""}`}>
          <div className="arcade-timer" aria-label={`${left} seconds left`}><i style={{ width: `${pct}%` }} className={left <= 10 ? "low" : ""} /></div>
          <div className="arcade-row"><span className="mono">{left}s</span>{combo >= 3 && <span className="tag next">Combo × {combo}</span>}</div>
          <p className="arcade-q">{q.q}</p>
          <p className="arcade-typed mono" aria-live="polite">{typed ? typed.replace("-", "−") : "?"}</p>
          {reveal && <p className="small arcade-reveal">Last one: {reveal}</p>}
          <div className="keypad">
            {KEYS.map(k => <button key={k} type="button" onClick={() => press(k)}>{k}</button>)}
            <button type="button" className="enter" onClick={submit}>Enter</button>
          </div>
        </div>
      )}

      {state === "over" && (
        <div className="card arcade-card center">
          <PrimeBig mood="happy" size={150} />
          <h2>Time's up! You scored {score}.</h2>
          <p className="small">
            {saved?.newBest ? "That's a new high score! " : `Your best is ${best}. `}
            {saved?.badge ? "New badge: Arcade Ace!" : score < 20 ? "Score 20 to earn the Arcade Ace badge." : ""}
          </p>
          <div className="w-buttons"><button className="btn arcade-go" type="button" onClick={start}>Play again</button><a className="btn ghost" href="/app">Back to the map</a></div>
        </div>
      )}
    </div>
  );
}
