"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BOARDS = ["IGCSE (Edexcel)", "IGCSE (Cambridge)", "GCSE (AQA)", "GCSE (Edexcel)", "GCSE (OCR)"];
const TIERS = ["Higher", "Foundation", "Extended", "Core"];

export default function InviteForm({ students, parents }) {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [board, setBoard] = useState(BOARDS[0]);
  const [tier, setTier] = useState(TIERS[0]);
  const [consent, setConsent] = useState(false);
  const [kids, setKids] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [linkParent, setLinkParent] = useState("");
  const [linkStudent, setLinkStudent] = useState("");
  const [linkMsg, setLinkMsg] = useState(null);

  async function invite(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/tutor/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, firstName, board, tier, consent, studentIds: kids }),
      });
      const r = await res.json();
      if (!res.ok) { setMsg({ kind: "bad", text: r.error }); return; }
      setMsg({ kind: "good", text: r.message });
      setEmail(""); setFirstName(""); setConsent(false); setKids([]);
      router.refresh();
    } catch {
      setMsg({ kind: "bad", text: "Couldn't send the invite. Check your connection." });
    } finally {
      setBusy(false);
    }
  }

  async function link(e) {
    e.preventDefault();
    setLinkMsg(null);
    const res = await fetch("/api/tutor/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parentId: linkParent, studentId: linkStudent }) });
    const r = await res.json();
    setLinkMsg(res.ok ? { kind: "good", text: "Linked." } : { kind: "bad", text: r.error });
    if (res.ok) router.refresh();
  }

  const toggleKid = id => setKids(k => (k.includes(id) ? k.filter(x => x !== id) : [...k, id]));

  return (
    <div className="stack">
      <form className="card panel" onSubmit={invite} noValidate>
        <div className="label">Invite someone</div>
        <div className="seg" role="group" aria-label="Who are you inviting?">
          <button type="button" aria-pressed={role === "student"} onClick={() => setRole("student")}>Student</button>
          <button type="button" aria-pressed={role === "parent"} onClick={() => setRole("parent")}>Parent</button>
        </div>
        <div className="field">
          <label htmlFor="inv-name">First name</label>
          <input id="inv-name" value={firstName} maxLength={30} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="inv-email">Email</label>
          <input id="inv-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        {role === "student" ? (
          <>
            <div className="row2">
              <div className="field">
                <label htmlFor="inv-board">Exam</label>
                <select id="inv-board" value={board} onChange={e => setBoard(e.target.value)}>{BOARDS.map(b => <option key={b}>{b}</option>)}</select>
              </div>
              <div className="field">
                <label htmlFor="inv-tier">Tier</label>
                <select id="inv-tier" value={tier} onChange={e => setTier(e.target.value)}>{TIERS.map(t => <option key={t}>{t}</option>)}</select>
              </div>
            </div>
            <label className="check">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>A parent or guardian has agreed to this student using Road to 9, including the AI tutor.</span>
            </label>
          </>
        ) : (
          <div className="field">
            <span className="flabel">Which children can they see?</span>
            {students.length ? (
              <div className="kids">
                {students.map(s => (
                  <label key={s.id} className="check"><input type="checkbox" checked={kids.includes(s.id)} onChange={() => toggleKid(s.id)} /><span>{s.name}</span></label>
                ))}
              </div>
            ) : <p className="small">Invite the student first, then their parent.</p>}
          </div>
        )}

        {msg && <p className={`notice ${msg.kind}`} role="status">{msg.text}</p>}
        <button className="btn" type="submit" disabled={busy || !email || !firstName || (role === "student" ? !consent : !kids.length)}>
          {busy ? "Sending…" : `Send ${role} invite`}
        </button>
        <p className="small">They'll get an email with a link to set their password.</p>
      </form>

      {parents.length > 0 && students.length > 0 && (
        <form className="card panel" onSubmit={link} noValidate>
          <div className="label">Link a parent to another child</div>
          <div className="row2">
            <div className="field">
              <label htmlFor="lk-p">Parent</label>
              <select id="lk-p" value={linkParent} onChange={e => setLinkParent(e.target.value)}>
                <option value="">Choose…</option>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="lk-s">Student</label>
              <select id="lk-s" value={linkStudent} onChange={e => setLinkStudent(e.target.value)}>
                <option value="">Choose…</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {linkMsg && <p className={`notice ${linkMsg.kind}`} role="status">{linkMsg.text}</p>}
          <button className="btn ghost sm" type="submit" disabled={!linkParent || !linkStudent}>Link</button>
        </form>
      )}
    </div>
  );
}
