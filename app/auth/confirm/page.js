"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sign } from "@/components/Bits";

// Invite and password-reset emails land here. Works with Supabase's default
// email templates (tokens in the address) and with custom ones (token_hash).
export default function Confirm() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const type = query.get("type") || hash.get("type") || "";
      let error = null;

      try {
        if (hash.get("error") || query.get("error")) {
          error = new Error("link");
        } else if (query.get("token_hash")) {
          ({ error } = await supabase.auth.verifyOtp({ type: type || "invite", token_hash: query.get("token_hash") }));
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          ({ error } = await supabase.auth.setSession({ access_token: hash.get("access_token"), refresh_token: hash.get("refresh_token") }));
        } else if (query.get("code")) {
          ({ error } = await supabase.auth.exchangeCodeForSession(query.get("code")));
        } else {
          error = new Error("link");
        }
      } catch (e) {
        error = e;
      }

      if (error) { setFailed(true); return; }
      window.location.replace(type === "signup" || type === "magiclink" ? "/home" : "/set-password");
    })();
  }, []);

  return (
    <main className="auth wrap">
      <div className="card auth-card">
        <a className="auth-brand" href="/"><Sign>9</Sign><span>Road to 9</span></a>
        {failed ? (
          <>
            <h1 style={{ fontSize: "1.3rem" }}>That link didn't work</h1>
            <p>It may have expired or already been used. Ask your tutor for a new invite, or reset your password from the login page.</p>
            <a className="btn" href="/login">Go to log in</a>
          </>
        ) : (
          <p>Checking your link…</p>
        )}
      </div>
    </main>
  );
}
