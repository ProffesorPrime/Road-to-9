// Small shared pieces: the grade sign and Professor Prime's face.

export function Sign({ children, size, style, label }) {
  return (
    <span className="sign" style={size ? { "--s": `${size}px`, ...style } : style} aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </span>
  );
}

export function PrimeFace({ small }) {
  return (
    <svg className={`prime-av${small ? " sm" : ""}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="var(--prime-soft)" />
      <g fill="var(--hair)" stroke="var(--face-ink)" strokeWidth="1.2">
        <circle cx="15" cy="24" r="8" /><circle cx="49" cy="24" r="8" /><circle cx="21" cy="14" r="7" /><circle cx="43" cy="14" r="7" /><circle cx="32" cy="10" r="7.5" />
      </g>
      <ellipse cx="32" cy="34" rx="15" ry="16" fill="var(--skin)" />
      <g fill="var(--glass)" stroke="var(--face-ink)" strokeWidth="2"><circle cx="25" cy="32" r="6" /><circle cx="39" cy="32" r="6" /></g>
      <path d="M31 32h2" stroke="var(--face-ink)" strokeWidth="2" />
      <circle cx="25" cy="32" r="1.8" fill="var(--face-ink)" /><circle cx="39" cy="32" r="1.8" fill="var(--face-ink)" />
      <path d="M25 22 l6 2 M39 22 l-6 2" stroke="var(--face-ink)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 42 q6 5 12 0" fill="none" stroke="var(--face-ink)" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 50 L32 54 L21 59 Z M43 50 L32 54 L43 59 Z" fill="var(--prime)" />
      <circle cx="32" cy="54" r="2.4" fill="var(--prime)" />
    </svg>
  );
}

export function Brand({ href = "/" }) {
  return (
    <a className="brand" href={href}>
      <Sign>9</Sign>Road to 9
    </a>
  );
}

// Full-body Professor Prime for lessons, the Grade Check and the Arcade.
// mood: "idle" | "talk" | "happy" | "think"
export function PrimeBig({ mood = "idle", size = 220 }) {
  return (
    <svg className={`prime-big mood-${mood}`} viewBox="0 0 64 93" width={size} height={size * 93 / 64} aria-hidden="true">
      <g className="pb-bob">
        <rect x="12" y="50" width="40" height="42" rx="13" fill="#fff" stroke="var(--face-ink)" strokeWidth="1.4" />
        <line x1="32" y1="58" x2="32" y2="91" stroke="#c8cdd7" strokeWidth="0.8" />
        <circle cx="34.5" cy="66" r="0.9" fill="var(--face-ink)" /><circle cx="34.5" cy="74" r="0.9" fill="var(--face-ink)" />
        <path d="M32 56 L22 76 L26 50 Z M32 56 L42 76 L38 50 Z" fill="#eceff5" stroke="var(--face-ink)" strokeWidth="0.8" />
        <rect x="40" y="80" width="8" height="8" fill="none" stroke="var(--face-ink)" strokeWidth="1" />
        <rect x="42" y="76" width="1.2" height="5" fill="var(--prime)" /><rect x="45" y="77" width="1.2" height="4" fill="#2b3552" />
        <g fill="var(--hair)" stroke="var(--face-ink)" strokeWidth="1.1">
          <circle cx="15" cy="24" r="8" /><circle cx="49" cy="24" r="8" /><circle cx="21" cy="14" r="7" /><circle cx="43" cy="14" r="7" />
          <circle cx="32" cy="10" r="7.5" /><circle cx="11" cy="33" r="6" /><circle cx="53" cy="33" r="6" />
        </g>
        <circle cx="17" cy="35" r="3.2" fill="var(--skin)" stroke="var(--face-ink)" strokeWidth="0.8" />
        <circle cx="47" cy="35" r="3.2" fill="var(--skin)" stroke="var(--face-ink)" strokeWidth="0.8" />
        <ellipse cx="32" cy="34" rx="15" ry="16" fill="var(--skin)" stroke="var(--face-ink)" strokeWidth="0.8" />
        <g fill="var(--glass)" stroke="var(--face-ink)" strokeWidth="2"><circle cx="25" cy="32" r="6" /><circle cx="39" cy="32" r="6" /></g>
        <path d="M31 32h2" stroke="var(--face-ink)" strokeWidth="2" />
        <g className="pb-eyes"><circle cx="25" cy="32.4" r="2" fill="var(--face-ink)" /><circle cx="39" cy="32.4" r="2" fill="var(--face-ink)" />
          <circle cx="25.7" cy="31.6" r="0.6" fill="#fff" /><circle cx="39.7" cy="31.6" r="0.6" fill="#fff" /></g>
        <path className="pb-brows" d="M21 23.5 L28 22 M43 23.5 L36 22" stroke="var(--face-ink)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M26 40.6 Q29.2 37.6 32.4 40.6 Z M31.6 40.6 Q34.8 37.6 38 40.6 Z" fill="var(--hair)" stroke="var(--face-ink)" strokeWidth="0.8" />
        <path className="pb-smile" d="M28 42.5 Q32 46.5 36 42.5" fill="none" stroke="var(--face-ink)" strokeWidth="1.8" strokeLinecap="round" />
        <g className="pb-open"><ellipse cx="32" cy="44.2" rx="3.4" ry="2.4" fill="#782020" stroke="var(--face-ink)" strokeWidth="1" />
          <ellipse cx="32" cy="45.4" rx="2" ry="1" fill="#e66e6e" /></g>
        <path d="M21 50 L32 54 L21 59 Z M43 50 L32 54 L43 59 Z" fill="var(--prime)" stroke="var(--face-ink)" strokeWidth="0.6" />
        <circle cx="32" cy="54" r="2.4" fill="var(--prime)" stroke="var(--face-ink)" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
