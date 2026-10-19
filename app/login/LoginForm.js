"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrimeFace, Sign } from "@/components/Bits";

export default function LoginForm({ linkError }) {
  const [mode, setMode] = useState("login"); // login | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(linkError ? { kind: "bad", text: "That link has expired or was already used. Log in, or ask your tutor for a new invite." } : null);

  async function login(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMsg({ kind: "bad", text: "That email and password don't match. Check them and try again." });
      setBusy(false);
      return;
    }
    window.location.href = "/home";
  }

  async function reset(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/confirm` });
    setMsg({ kind: "good", text: "If that email has an account, a reset link is on its way. Check your inbox." });
    setBusy(false);
  }

  return (
    <main className="auth wrap">
      <div className="card auth-card">
        <a className="auth-brand" href="/"><Sign>9</Sign><span>Road to 9</span></a>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <PrimeFace small />
          <p className="bubble">{mode === "login" ? "Welcome back! Log in to continue your road." : "Forgotten your password? I'll send you a reset link."}</p>
        </div>
        <form className="stack" onSubmit={mode === "login" ? login : reset} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode === "login" && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          )}
          {msg && <p className={`notice ${msg.kind}`} role="alert">{msg.text}</p>}
          <button className="btn" type="submit" disabled={busy || !email || (mode === "login" && !password)}>
            {busy ? "One moment…" : mode === "login" ? "Log in" : "Send reset link"}
          </button>
        </form>
        <button className="link" type="button" onClick={() => { setMode(mode === "login" ? "reset" : "login"); setMsg(null); }}>
          {mode === "login" ? "Forgotten your password?" : "Back to log in"}
        </button>
        <p className="small">Accounts are by invitation from your tutor. New student? Get in touch via the homepage.</p>
      </div>
    </main>
  );
}
