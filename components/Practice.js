"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimeFace, Sign } from "./Bits";

const INTROS = [
  t => `${t}! One of my favourite experiments. Have a go, and call me if you get stuck.`,
  t => `To the laboratory! Today's specimen: ${t}. Show me what you've got.`,
  t => `Ah, ${t}. Read the question carefully, then try it. I'll be right here.`,
];
const PRAISE = ["Eureka! Spot on.", "Splendid! The numbers obey you.", "Correct! A prime piece of work.", "Magnificent. My calculations agree with yours.", "Yes! Onwards along the road."];
const pick = a => a[Math.floor(Math.random() * a.length)];
let msgId = 0;

function xpFloat(n) {
  const box = document.getElementById("xp-box");
  const el = document.createElement("span");
  el.className = "xpfloat";
  el.textContent = `+${n} XP`;
  const r = box ? box.getBoundingClientRect() : { right: window.innerWidth - 20, top: 20 };
  el.style.left = `${Math.max(8, r.right - 70)}px`;
  el.style.top = `${r.top}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

export default function Practice({ topic, topics, startCorrect, need, primeLive }) {
  const router = useRouter();
  const [q, setQ] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [canReveal, setCanReveal] = useState(false);
  const [cleared, setCleared] = useState(null);
  const [correctCount, setCorrectCount] = useState(startCorrect);
  const [chat, setChat] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const history = useRef([]);
  const ctl = useRef(null);
  const chatBox = useRef(null);
  const ansInput = useRef(null);
  const nextBtn = useRef(null);

  const addMsg = (who, text, extra = {}) => {
    const id = ++msgId;
    setChat(c => [...c, { id, who, text, ...extra }]);
    return id;
  };
  const setMsg = (id, patch) => setChat(c => c.map(m => (m.id === id ? { ...m, ...patch } : m)));
  const announceBadges = list => (list || []).forEach(b => addMsg("prime", `New badge: ${b.name}! ${b.desc}.`));

  useEffect(() => { if (chatBox.current) chatBox.current.scrollTop = chatBox.current.scrollHeight; }, [chat]);

  async function loadQuestion() {
    ctl.current?.abort();
    setQ(null); setLoadErr(""); setAnswer(""); setFeedback(null); setDone(false); setCanReveal(false); setCleared(null); setBusy(false);
    history.current = [];
    setChat([{ id: ++msgId, who: "prime", text: pick(INTROS)(topic.name) }]);
    try {
      const res = await fetch("/api/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: topic.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load a question.");
      setQ(data);
      setTimeout(() => ansInput.current?.focus(), 50);
    } catch (e) {
      setLoadErr(e.message || "Couldn't load a question. Check your connection.");
    }
  }
  useEffect(() => { loadQuestion(); return () => ctl.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    if (!q || done || checking || !answer.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, answer }) });
      const r = await res.json();
      if (!res.ok) { setFeedback({ kind: "bad", text: r.error }); return; }
      if (r.correct) {
        setDone(true);
        setCorrectCount(r.topicCorrect);
        setFeedback({ kind: "good", text: `Correct. +${r.gain} XP${r.gain < 15 ? " (full 15 XP for first-try answers with no help)" : ""}` });
        xpFloat(r.gain);
        addMsg("prime", pick(PRAISE));
        announceBadges(r.newBadges);
        if (r.cleared) setCleared({ name: topic.name, next: r.nextTopic, grade: r.gradeDone });
        if (r.gradeDone) addMsg("prime", `EUREKA! You cleared every stop in Grade ${r.gradeDone}. +50 bonus XP. Onwards up the road!`);
        router.refresh(); // updates XP and streak in the header
        setTimeout(() => nextBtn.current?.focus(), 50);
      } else {
        const msgs = ["Not quite. Have another go.", "Still not right. Check each step.", "Not yet. You can ask Professor Prime or see the worked answer."];
        setFeedback({ kind: "bad", text: msgs[Math.min(r.wrong, 3) - 1] });
        setCanReveal(r.canReveal);
        if (r.wrong === 1) addMsg("prime", "Hmm, my instruments disagree. Check your arithmetic, or tap Give me a hint.");
        if (r.wrong === 2) addMsg("prime", "Two tries. Shall we look at it together? Tap Walk me through it.");
        ansInput.current?.select();
      }
    } catch {
      setFeedback({ kind: "bad", text: "Couldn't check that. Check your connection and try again." });
    } finally {
      setChecking(false);
    }
  }

  async function reveal() {
    const res = await fetch("/api/reveal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id }) });
    const r = await res.json();
    if (!res.ok) return setFeedback({ kind: "bad", text: r.error });
    setDone(true); setCanReveal(false);
    setFeedback({ kind: "info", steps: r.steps, answerText: r.answerText });
    addMsg("prime", "There's the full method. Study it line by line, then try a fresh one.");
  }

  async function writtenHint(intoId) {
    try {
      const res = await fetch("/api/hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id }) });
      const r = await res.json();
      const text = res.ok ? r.text : r.error;
      if (intoId) setMsg(intoId, { text, thinking: false }); else addMsg("prime", text);
      announceBadges(r.newBadges);
    } catch {
      addMsg("prime", "Couldn't reach my notes. Check your connection.");
    }
  }

  async function ask(kind, freeText) {
    if (!q || busy) return;
    const userText = kind === "hint" ? "Can I have a hint?" : kind === "walk" ? "I'm stuck. Walk me through it one step at a time." : freeText;
    addMsg("me", userText);

    if (!primeLive) {
      if (kind === "free") addMsg("prime", "My live lab is switched off right now, so I can only give written hints. Tap Give me a hint.");
      else await writtenHint();
      return;
    }

    const id = addMsg("prime", "Thinking…", { thinking: true });
    const messages = [...history.current, { role: "user", content: userText }];
    const controller = new AbortController();
    ctl.current = controller;
    setBusy(true);
    let full = "";
    try {
      const res = await fetch("/api/prime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, messages }), signal: controller.signal });
      if (!res.ok) {
        const msg = await res.text();
        setMsg(id, { text: msg || "Professor Prime is unavailable right now.", thinking: false });
        if ((res.status === 429 || res.status === 503) && kind !== "free") await writtenHint();
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { value, done: end } = await reader.read();
        if (end) break;
        full += dec.decode(value, { stream: true });
        setMsg(id, { text: full, thinking: false });
      }
      history.current = [...messages, { role: "assistant", content: full }].slice(-10);
    } catch (e) {
      if (e.name === "AbortError") setMsg(id, { text: full ? `${full} …` : "Stopped.", thinking: false });
      else setMsg(id, { text: "Lost the signal to my lab. Tap again to retry.", thinking: false });
    } finally {
      setBusy(false);
    }
  }

  function sendDraft(e) {
    e.preventDefault();
    const v = draft.trim();
    if (!v || v === "Here's my working:") return;
    setDraft("");
    ask("free", v);
  }

  return (
    <div className="practice">
      <div>
        <div className="qtop">
          <label className="label" htmlFor="topic-select">Stop</label>
          <select id="topic-select" value={topic.id} onChange={e => router.push(`/app/practice/${e.target.value}`)}>
            {[...new Set(topics.map(t => t.grade))].map(g => (
              <optgroup key={g} label={`Grade ${g}`}>
                {topics.filter(t => t.grade === g).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <article className="card qcard">
          <div className="qmeta">
            <div className="qmeta-l">
              <Sign label={`Grade ${topic.grade}`}>{topic.grade}</Sign>
              <div><strong>{topic.name}</strong><div className="small">{topic.strand}{topic.calc ? " · calculator allowed" : ""}</div></div>
            </div>
            <div className="dots" title="Correct answers towards clearing this stop">
              {Array.from({ length: need }, (_, i) => <i key={i} className={i < correctCount ? "on" : ""} />)}
              <span className="small mono" style={{ marginLeft: 6 }}>{correctCount}/{need}</span>
            </div>
          </div>

          {loadErr ? (
            <p className="notice bad">{loadErr} <button className="link" onClick={loadQuestion}>Try again</button></p>
          ) : !q ? (
            <p className="qtext small">Loading a fresh question…</p>
          ) : (
            <>
              <p className="qtext" dangerouslySetInnerHTML={{ __html: q.text }} />
              {q.diagram && <div dangerouslySetInnerHTML={{ __html: q.diagram }} />}
              <form onSubmit={submit} noValidate>
                <label htmlFor="ans" className="label">Your answer</label>
                <div className="ansrow">
                  <input id="ans" ref={ansInput} autoComplete="off" spellCheck="false" value={answer} disabled={done} onChange={e => setAnswer(e.target.value)} />
                  <button className="btn" type="submit" disabled={done || checking || !answer.trim()}>{checking ? "Checking…" : "Check"}</button>
                </div>
                <p className="small" style={{ marginTop: 6 }}>{q.input}</p>
              </form>
            </>
          )}

          {feedback && (
            <div className={`feedback ${feedback.kind}`} role="status">
              {feedback.steps ? (
                <><strong>Worked answer</strong><pre>{feedback.steps}</pre><strong>Answer: {feedback.answerText}</strong></>
              ) : feedback.text}
            </div>
          )}
          {cleared && (
            <div className="cleared-banner">
              <Sign>{topic.grade}</Sign>
              <div><strong>{cleared.grade ? `Grade ${cleared.grade} cleared!` : `Stop cleared: ${cleared.name}`}</strong>{cleared.next && <div style={{ opacity: 0.85 }}>Next on the road: {cleared.next.name}</div>}</div>
            </div>
          )}
          <div className="qactions">
            {canReveal && !done && <button className="btn ghost" type="button" onClick={reveal}>Show worked answer</button>}
            {done && <button className="btn" type="button" ref={nextBtn} onClick={loadQuestion}>Next question</button>}
            {done && cleared?.next && <a className="btn ghost" href={`/app/practice/${cleared.next.id}`}>Go to {cleared.next.name}</a>}
            {!done && q && <button className="link" type="button" onClick={loadQuestion}>Skip this one</button>}
          </div>
        </article>
      </div>

      <aside className="card prime" aria-label="Professor Prime">
        <div className="prime-head">
          <PrimeFace small />
          <div><h3>Professor Prime</h3><span className={`pill${primeLive ? " live" : ""}`}>{primeLive ? "AI tutor live" : "Written hints"}</span></div>
        </div>
        <div className="chat" ref={chatBox} aria-live="polite">
          {chat.map(m => (
            <div key={m.id} className={`msg ${m.who === "prime" ? "prime-msg" : "me"}${m.thinking ? " thinking" : ""}`}>{m.text}</div>
          ))}
        </div>
        <div className="quick">
          <button type="button" disabled={busy || !q} onClick={() => ask("hint")}>Give me a hint</button>
          <button type="button" disabled={busy || !q} onClick={() => ask("walk")}>Walk me through it</button>
          {primeLive && <button type="button" disabled={busy || !q} onClick={() => { if (!draft.trim()) setDraft("Here's my working:\n"); document.getElementById("chat-in")?.focus(); }}>Check my working</button>}
        </div>
        <form className="chat-form" onSubmit={sendDraft} noValidate>
          <label htmlFor="chat-in" hidden>Message Professor Prime</label>
          <textarea id="chat-in" rows={2} maxLength={600} value={draft} placeholder="Ask about this question, or paste your working"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDraft(e); } }} />
          {busy
            ? <button className="btn ghost" type="button" onClick={() => ctl.current?.abort()}>Stop</button>
            : <button className="btn prime" type="submit" disabled={!q}>Send</button>}
        </form>
      </aside>
    </div>
  );
}
