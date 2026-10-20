"use client";
// Professor Prime's read-aloud voice, using the browser's built-in speech (free, nothing leaves the device).

const KEY = "r9-voice";
let cachedVoice = null;

export function voiceSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
export function voiceOn() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function setVoice(on) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
  if (!on) stop();
}

// Turn maths symbols into words so the voice reads them properly.
export function speakable(text) {
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/cm²/g, " square centimetres").replace(/cm³/g, " cubic centimetres")
    .replace(/(\w)²/g, "$1 squared").replace(/(\w)³/g, "$1 cubed")
    .replace(/∛/g, "cube root of ").replace(/√/g, "square root of ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/[−–]/g, " minus ").replace(/×/g, " times ").replace(/÷/g, " divided by ")
    .replace(/=/g, " equals ").replace(/θ/g, "theta").replace(/°/g, " degrees")
    .replace(/%/g, " percent").replace(/£(\d+(?:\.\d+)?)/g, "$1 pounds")
    .replace(/\^/g, " to the power ").replace(/→/g, " to ")
    .replace(/(\d) d\.p\./g, "$1 decimal place").replace(/…/g, "")
    .replace(/\s+/g, " ").trim();
}

function pickVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices() || [];
  cachedVoice =
    voices.find(v => /en-GB/i.test(v.lang) && /male|daniel|arthur|george|oliver/i.test(v.name)) ||
    voices.find(v => /en-GB/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) || null;
  return cachedVoice;
}

export function speak(text) {
  if (!voiceSupported() || !voiceOn() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakable(text));
    u.lang = "en-GB";
    u.rate = 1.0;
    u.pitch = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {}
}

export function stop() {
  try { if (voiceSupported()) window.speechSynthesis.cancel(); } catch {}
}
