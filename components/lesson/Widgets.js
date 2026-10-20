"use client";
// Interactive visuals for Professor Prime's lessons. Each one is tappable / draggable,
// and calls onDone() once the student has completed the task it sets.
// With no onDone they are shown as still pictures.
import { useEffect, useRef, useState } from "react";

const fmtN = n => (n < 0 ? `−${-n}` : `${n}`);
const money = n => (Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`);

function useDone(cond, onDone) {
  const fired = useRef(false);
  useEffect(() => {
    if (cond && onDone && !fired.current) { fired.current = true; onDone(); }
  }, [cond, onDone]);
}

/* ---------------- Number line: hop left and right ---------------- */
export function NumberLine({ start = 0, target, from = -10, to = 10, hop, onDone }) {
  const [pos, setPos] = useState(start);
  const W = 680, X0 = 30, X1 = 650, Y = 90;
  const x = v => X0 + ((v - from) / (to - from)) * (X1 - X0);
  const moved = pos - start;
  useDone(onDone && target !== undefined && pos === target && moved !== 0, onDone);
  const show = hop ? hop.to : pos;
  return (
    <div className="w-wrap">
      <svg viewBox={`0 0 ${W} 150`} className="w-svg" role="img" aria-label={`Number line, marker at ${fmtN(show)}`}>
        <line x1={X0 - 10} y1={Y} x2={X1 + 10} y2={Y} className="w-axis" />
        {Array.from({ length: to - from + 1 }, (_, i) => from + i).map(v => (
          <g key={v}>
            <line x1={x(v)} y1={Y - (v === 0 ? 14 : 8)} x2={x(v)} y2={Y + (v === 0 ? 14 : 8)} className={v === 0 ? "w-zero" : "w-tick"} />
            {(v % 2 === 0 || to - from <= 12) && <text x={x(v)} y={Y + 38} className={`w-label${v === 0 ? " strong" : ""}`} textAnchor="middle">{fmtN(v)}</text>}
          </g>
        ))}
        {hop && hop.from !== hop.to && (
          <path d={`M${x(hop.from)} ${Y - 10} Q ${(x(hop.from) + x(hop.to)) / 2} ${Y - 80} ${x(hop.to)} ${Y - 10}`} className="w-hop" markerEnd="url(#arrow)" />
        )}
        {!hop && moved !== 0 && (
          <path d={`M${x(start)} ${Y - 10} Q ${(x(start) + x(pos)) / 2} ${Y - 70} ${x(pos)} ${Y - 10}`} className="w-hop" />
        )}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" className="w-arrowhead" /></marker></defs>
        <circle cx={x(show)} cy={Y} r="15" className="w-marker" style={{ transition: "cx .25s ease" }} />
      </svg>
      {!hop && onDone && (
        <>
          <p className="w-readout mono">{fmtN(start)} {moved >= 0 ? "+" : "−"} {Math.abs(moved)} = <strong>{fmtN(pos)}</strong></p>
          {onDone && (
            <div className="w-buttons">
              <button type="button" className="btn ghost" onClick={() => setPos(p => Math.max(from, p - 1))} disabled={pos <= from}>← Left (−1)</button>
              <button type="button" className="btn ghost" onClick={() => setPos(p => Math.min(to, p + 1))} disabled={pos >= to}>Right (+1) →</button>
              <button type="button" className="link" onClick={() => setPos(start)}>Reset</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Fraction bar: tap parts to shade ---------------- */
export function FractionBar({ amount = 24, d = 4, n = 0, onDone }) {
  const [shaded, setShaded] = useState([]);
  const each = amount / d;
  useDone(onDone && shaded.length === n, onDone);
  return (
    <div className="w-wrap">
      <p className="w-caption">The whole bar is <strong>{amount}</strong>, split into <strong>{d}</strong> equal parts</p>
      <div className="w-fbar" style={{ gridTemplateColumns: `repeat(${d}, 1fr)` }}>
        {Array.from({ length: d }, (_, i) => {
          const on = shaded.includes(i);
          return (
            <button key={i} type="button" className={`w-fpart${on ? " on" : ""}`} disabled={!onDone}
              onClick={() => setShaded(s => (on ? s.filter(x => x !== i) : [...s, i]))} aria-pressed={on}>
              {each}
            </button>
          );
        })}
      </div>
      {onDone && <p className="w-readout mono">{shaded.length} part{shaded.length === 1 ? "" : "s"} × {each} = <strong>{shaded.length * each}</strong></p>}
    </div>
  );
}

/* ---------------- Balance scale: do the same to both sides ---------------- */
export function Balance({ a = 3, b = 4, c = 13, onDone }) {
  const [stage, setStage] = useState(0);
  const [msg, setMsg] = useState("");
  const x = (c - b) / a;
  useDone(onDone && stage === 2, onDone);
  const left = stage === 0 ? { boxes: a, dots: b } : stage === 1 ? { boxes: a, dots: 0 } : { boxes: 1, dots: 0 };
  const right = stage === 0 ? c : stage === 1 ? c - b : x;
  const eq = stage === 0 ? `${a}x + ${b} = ${c}` : stage === 1 ? `${a}x = ${c - b}` : `x = ${x}`;
  // the right move is in a different place each time, so guessing "the first one" doesn't work
  const options = stage === 0
    ? [[`Add ${b} to both sides`, false], [`Take ${b} from both sides`, true], [`Divide both sides by ${a}`, false]]
    : [[`Take ${a} from both sides`, false], [`Multiply both sides by ${a}`, false], [`Divide both sides by ${a}`, true]];
  const wrongMsg = stage === 0
    ? `Not that one. We want x on its own, so first undo the + ${b}.`
    : `Close! ${a}x means ${a} lots of x. To undo "times ${a}", divide by ${a}.`;

  // dots in rows of 5, centred on cx, stacking upwards from baseY
  const dots = (cx, baseY, n, key) => {
    const out = [];
    for (let i = 0; i < Math.min(n, 20); i++) {
      const row = Math.floor(i / 5), inRow = Math.min(5, n - row * 5), col = i % 5;
      out.push(<circle key={`${key}${i}`} cx={cx - (inRow - 1) * 11 + col * 22} cy={baseY - 11 - row * 22} r="9" className="w-dot" />);
    }
    return out;
  };
  const boxW = 46, gap = 8, rowW = left.boxes * boxW + (left.boxes - 1) * gap;
  return (
    <div className="w-wrap">
      <svg viewBox="0 0 680 330" className="w-svg" role="img" aria-label={`Balance showing ${eq}`}>
        <polygon points="340,66 305,318 375,318" className="w-stand" />
        <rect x="70" y="58" width="540" height="12" rx="6" className="w-beam" />
        <line x1="190" y1="70" x2="190" y2="250" className="w-string" /><line x1="490" y1="70" x2="490" y2="250" className="w-string" />
        <rect x="80" y="250" width="220" height="12" rx="6" className="w-pan" />
        <rect x="380" y="250" width="220" height="12" rx="6" className="w-pan" />
        {Array.from({ length: left.boxes }, (_, i) => (
          <g key={i}><rect x={190 - rowW / 2 + i * (boxW + gap)} y="202" width={boxW} height={boxW} rx="8" className="w-xbox" />
            <text x={190 - rowW / 2 + i * (boxW + gap) + boxW / 2} y="234" textAnchor="middle" className="w-xlabel">x</text></g>
        ))}
        {dots(190, 200, left.dots, "l")}
        {right <= 20 ? dots(490, 250, right, "r") : <text x="490" y="236" textAnchor="middle" className="w-bignum">{right}</text>}
        <text x="190" y="294" textAnchor="middle" className="w-side">left side</text>
        <text x="490" y="294" textAnchor="middle" className="w-side">right side</text>
      </svg>
      <p className="w-eq mono">{eq}</p>
      {onDone && stage < 2 && (
        <div className="w-buttons col">
          {options.map(([label, ok]) => (
            <button key={label} type="button" className="btn ghost" onClick={() => { if (ok) { setStage(s => s + 1); setMsg(""); } else setMsg(wrongMsg); }}>{label}</button>
          ))}
        </div>
      )}
      {msg && <p className="notice bad">{msg}</p>}
    </div>
  );
}

/* ---------------- Percentage grid: 100 squares ---------------- */
export function PercentGrid({ amount = 80, target, pct = 10, onDone }) {
  const [v, setV] = useState(onDone ? 0 : pct);
  useDone(onDone && v === target, onDone);
  return (
    <div className="w-wrap">
      <div className="w-grid100" role="img" aria-label={`${v} of 100 squares shaded`}>
        {Array.from({ length: 100 }, (_, i) => <span key={i} className={i < v ? "on" : ""} />)}
      </div>
      <p className="w-readout mono">{v}% of £{amount} = <strong>{money((v * amount) / 100)}</strong></p>
      {onDone && (
        <label className="w-slider">
          <span className="label">Drag to shade</span>
          <input type="range" min="0" max="100" step="5" value={v} onChange={e => setV(Number(e.target.value))} aria-label="Percentage" />
        </label>
      )}
    </div>
  );
}

/* ---------------- Ratio bars: share in parts ---------------- */
export function RatioBars({ a = 3, b = 5, total = 40, names = ["Sam", "Priya"], onDone }) {
  const [stage, setStage] = useState(0);
  const parts = a + b, one = total / parts;
  useDone(onDone && stage === 3, onDone);
  const row = (name, n) => (
    <div className="w-rrow">
      <span className="w-rname">{name}</span>
      <div className="w-rboxes">{Array.from({ length: n }, (_, i) => <span key={i} className={stage >= 2 ? "on" : ""}>{stage >= 2 ? money(one) : ""}</span>)}</div>
      {stage >= 3 && <strong className="mono">{money(n * one)}</strong>}
    </div>
  );
  const steps = ["Count the parts", "Find one part", "Work out each share"];
  return (
    <div className="w-wrap">
      <p className="w-caption">Share <strong>£{total}</strong> in the ratio <strong>{a} : {b}</strong></p>
      {row(names[0], a)}
      {row(names[1], b)}
      <div className="w-steps mono">
        {stage >= 1 && <p>{a} + {b} = <strong>{parts} parts</strong></p>}
        {stage >= 2 && <p>£{total} ÷ {parts} = <strong>{money(one)} per part</strong></p>}
        {stage >= 3 && <p>{names[0]}: {a} × {money(one)} = <strong>{money(a * one)}</strong> · {names[1]}: {b} × {money(one)} = <strong>{money(b * one)}</strong></p>}
      </div>
      {onDone && stage < 3 && (
        <div className="w-buttons"><button type="button" className="btn" onClick={() => setStage(s => s + 1)}>Step {stage + 1}: {steps[stage]}</button></div>
      )}
    </div>
  );
}

/* ---------------- Pythagoras: squares on each side ---------------- */
export function PythSquares({ a: a0 = 3, b: b0 = 4, target, onDone }) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const ok = target && ((a === target[0] && b === target[1]) || (a === target[1] && b === target[0]));
  useDone(onDone && ok, onDone);
  const s = 10;
  const P = [0, 0], Q = [a * s, 0], R = [0, -b * s];
  const sqA = [P, Q, [a * s, a * s], [0, a * s]];
  const sqB = [P, R, [-b * s, -b * s], [-b * s, 0]];
  const sqC = [Q, R, [R[0] + b * s, R[1] - a * s], [Q[0] + b * s, Q[1] - a * s]];
  const all = [...sqA, ...sqB, ...sqC];
  const minX = Math.min(...all.map(p => p[0])) - 12, maxX = Math.max(...all.map(p => p[0])) + 12;
  const minY = Math.min(...all.map(p => p[1])) - 12, maxY = Math.max(...all.map(p => p[1])) + 12;
  const pts = arr => arr.map(p => p.join(",")).join(" ");
  const mid = arr => [arr.reduce((t, p) => t + p[0], 0) / 4, arr.reduce((t, p) => t + p[1], 0) / 4];
  const c2 = a * a + b * b, c = Math.sqrt(c2);
  const [ma, mb, mc] = [mid(sqA), mid(sqB), mid(sqC)];
  const fs = Math.max(8, Math.min(14, (maxX - minX) / 18));
  return (
    <div className="w-wrap">
      <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className="w-svg pyth" role="img" aria-label={`Right-angled triangle with sides ${a} and ${b}`}>
        <polygon points={pts(sqA)} className="w-sq a" /><polygon points={pts(sqB)} className="w-sq b" /><polygon points={pts(sqC)} className="w-sq c" />
        <polygon points={pts([P, Q, R])} className="w-tri" />
        <text x={ma[0]} y={ma[1]} className="w-sqlabel" style={{ fontSize: fs }} textAnchor="middle" dominantBaseline="middle">{a * a}</text>
        <text x={mb[0]} y={mb[1]} className="w-sqlabel" style={{ fontSize: fs }} textAnchor="middle" dominantBaseline="middle">{b * b}</text>
        <text x={mc[0]} y={mc[1]} className="w-sqlabel" style={{ fontSize: fs }} textAnchor="middle" dominantBaseline="middle">{c2}</text>
      </svg>
      <p className="w-readout mono">{a}² + {b}² = {a * a} + {b * b} = {c2} · c = √{c2} = <strong>{Number.isInteger(c) ? c : c.toFixed(2)}</strong></p>
      {onDone && (
        <div className="w-sliders">
          <label className="w-slider"><span className="label">Side a: {a}</span><input type="range" min="1" max="10" value={a} onChange={e => setA(Number(e.target.value))} /></label>
          <label className="w-slider"><span className="label">Side b: {b}</span><input type="range" min="1" max="10" value={b} onChange={e => setB(Number(e.target.value))} /></label>
        </div>
      )}
    </div>
  );
}

/* ---------------- Triangle labelling: O, A, H ---------------- */
const SIDE_HINT = {
  hyp: "The hypotenuse is the longest side, across from the right angle.",
  opp: "The opposite side is across from the marked angle. It doesn't touch it.",
  adj: "The adjacent side touches the marked angle, but it isn't the hypotenuse.",
};
const SIDE_NAME = { hyp: "hypotenuse", opp: "opposite", adj: "adjacent" };
export function TriLabel({ angle = "bl", onDone }) {
  // Right angle at bottom-right. Sides: bottom AB, right BC, hypotenuse AC.
  const map = angle === "bl" ? { AC: "hyp", BC: "opp", AB: "adj" } : { AC: "hyp", AB: "opp", BC: "adj" };
  const order = ["hyp", "opp", "adj"];
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(null);
  const asking = order[found.length];
  useDone(onDone && found.length === 3, onDone);
  const A = [90, 300], B = [520, 300], C = [520, 70];
  const sides = { AB: [A, B], BC: [B, C], AC: [A, C] };
  const tap = side => {
    if (!onDone || !asking) return;
    if (map[side] === asking) { setFound(f => [...f, asking]); setWrong(null); }
    else setWrong(side);
  };
  const labelPos = { AB: [305, 342], BC: [566, 190], AC: [270, 160] };
  return (
    <div className="w-wrap">
      <svg viewBox="0 0 640 370" className="w-svg" role="img" aria-label="Right-angled triangle">
        <polygon points={`${A} ${B} ${C}`} className="w-tri" />
        <path d="M500 300 L500 280 L520 280" className="w-tick" fill="none" />
        {angle === "bl"
          ? <><path d="M150 300 A60 60 0 0 0 138 266" className="w-angle" /><text x="160" y="285" className="w-anglelabel">θ</text></>
          : <><path d="M520 130 A60 60 0 0 1 486 120" className="w-angle" /><text x="488" y="150" className="w-anglelabel">θ</text></>}
        {Object.entries(sides).map(([k, [p1, p2]]) => {
          const role = map[k], done = found.includes(role);
          return (
            <g key={k}>
              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} className={`w-side-line${done ? " done" : ""}${wrong === k ? " wrong" : ""}`} />
              {onDone && <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} className="w-hit" onClick={() => tap(k)} role="button" aria-label={`Side ${k}`} tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") tap(k); }} />}
              {(done || !onDone) && <g><rect x={labelPos[k][0] - 50} y={labelPos[k][1] - 22} width="100" height="34" rx="17" className="w-chipbg" />
                <text x={labelPos[k][0]} y={labelPos[k][1]} textAnchor="middle" className="w-chiptext">{SIDE_NAME[role]}</text></g>}
            </g>
          );
        })}
      </svg>
      {onDone && asking && <p className="w-prompt">Tap the <strong>{SIDE_NAME[asking]}</strong></p>}
      {wrong && <p className="notice bad">That's the {SIDE_NAME[map[wrong]]}. {SIDE_HINT[asking]}</p>}
    </div>
  );
}

/* ---------------- Factor pairs: multiply to c, add to b ---------------- */
export function FactorPairs({ b = 7, c = 12, onDone }) {
  const pairs = [];
  for (let p = 1; p <= Math.sqrt(Math.abs(c)); p++) if (Math.abs(c) % p === 0) {
    const q = Math.abs(c) / p;
    if (c > 0) { pairs.push([p, q]); pairs.push([-p, -q]); }
    else { pairs.push([p, -q]); pairs.push([-p, q]); }
  }
  const [tried, setTried] = useState([]);
  const winner = pairs.find(([p, q]) => p + q === b);
  const found = winner && tried.some(([p, q]) => p === winner[0] && q === winner[1]);
  useDone(onDone && found, onDone);
  const sg = n => (n < 0 ? `− ${-n}` : `+ ${n}`);
  return (
    <div className="w-wrap">
      <p className="w-caption mono">x² {sg(b)}x {sg(c)} = 0</p>
      <p className="w-caption">Find two numbers that <strong>multiply to {fmtN(c)}</strong> and <strong>add to {fmtN(b)}</strong></p>
      <div className="w-pairs">
        {pairs.map(([p, q]) => {
          const t = tried.some(x => x[0] === p && x[1] === q), win = p + q === b;
          return (
            <button key={`${p},${q}`} type="button" disabled={!onDone || found} className={`w-pair${t ? (win ? " win" : " lose") : ""}`}
              onClick={() => setTried(tr => (t ? tr : [...tr, [p, q]]))}>
              <span className="mono">{fmtN(p)} and {fmtN(q)}</span>
              {t && <span className="small">× = {fmtN(p * q)} · + = {fmtN(p + q)} {win ? "✓" : "✗"}</span>}
            </button>
          );
        })}
      </div>
      {found && <p className="w-eq mono">(x {sg(winner[0])})(x {sg(winner[1])}) = 0</p>}
    </div>
  );
}

export const WIDGETS = { numberline: NumberLine, fractionbar: FractionBar, balance: Balance, percentgrid: PercentGrid, ratiobars: RatioBars, pyth: PythSquares, trilabel: TriLabel, factorpairs: FactorPairs };
