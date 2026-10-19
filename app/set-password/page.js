"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrimeFace, Sign } from "@/components/Bits";

export default function SetPassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (pw.length < 8) return setErr("Use at least 8 characters.");
    if (pw !== pw2) return setErr("The two passwords don't match.");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setErr(error.message.includes("session") ? "This link has expired. Ask your tutor to send a new invite." : error.message);
      setBusy(false);
      return;
    }
    window.location.href = "/home";
  }

  return (
    <main className="auth wrap">
      <div className="card auth-card">
        <a className="auth-brand" href="/"><Sign>9</Sign><span>Road to 9</span></a>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <PrimeFace small />
          <p className="bubble">Choose a password and your road begins. Keep it to yourself!</p>
        </div>
        <form className="stack" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="pw">New password</label>
            <input id="pw" type="password" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pw2">Type it again</label>
            <input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} />
          </div>
          {err && <p className="notice bad" role="alert">{err}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
        </form>
      </div>
    </main>
  );
}
