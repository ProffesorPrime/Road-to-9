"use client";
import { useEffect, useState } from "react";
import { voiceOn, setVoice, voiceSupported, speak } from "@/lib/speech";

// "Read aloud" switch for Professor Prime. Remembered on this device.
export default function VoiceToggle() {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(voiceSupported()); setOn(voiceOn()); }, []);
  if (!ok) return null;
  return (
    <button
      type="button"
      className={`voice-toggle${on ? " on" : ""}`}
      aria-pressed={on}
      onClick={() => { const v = !on; setVoice(v); setOn(v); if (v) speak("Voice on. Eureka!"); }}
      title="Professor Prime reads aloud"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on
          ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          : <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      </svg>
      {on ? "Voice on" : "Voice off"}
    </button>
  );
}
