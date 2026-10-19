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
