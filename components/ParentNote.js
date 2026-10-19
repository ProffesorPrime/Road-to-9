"use client";
import { useState } from "react";

// Asks Professor Prime to write a short progress update.
export default function ParentNote({ studentId, live, audience }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function write() {
    setBusy(true); setText("Professor Prime is writing…"); setCopied(false);
    try {
      const res = await fetch("/api/parent-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }) });
      const r = await res.json();
      setText(res.ok ? r.text : r.error);
    } catch {
      setText("Couldn't write the update just now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  }

  return (
    <div className="card">
      <div className="label">{audience === "tutor" ? "Update for parents" : "Summary from Professor Prime"}</div>
      <p className="small">
        {audience === "tutor"
          ? "Professor Prime drafts a short, friendly update from this report that you can send home."
          : "A short summary of how things are going and what to work on next."}
      </p>
      {live ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn prime sm" type="button" onClick={write} disabled={busy}>{busy ? "Writing…" : text ? "Write again" : "Write summary"}</button>
          {text && !busy && audience === "tutor" && <button className="btn ghost sm" type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>}
        </div>
      ) : (
        <p className="small">Available once Professor Prime's live mode is switched on.</p>
      )}
      {text && <p className="note-out">{text}</p>}
    </div>
  );
}
