// Question generators. SERVER ONLY: each question includes its answer,
// which is stored in the database and never sent to the browser.

const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const Rnz = (a, b) => { let n = 0; while (n === 0) n = R(a, b); return n; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmtN = n => (n < 0 ? `−${-n}` : `${n}`);
const sgn = n => (n < 0 ? ` − ${-n}` : ` + ${n}`);
const coef = (a, v) => (a === 1 ? v : a === -1 ? `−${v}` : a < 0 ? `−${-a}${v}` : `${a}${v}`);
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const fmt = n => String(round(n, 2));
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const sq = n => (n < 0 ? `(${fmtN(n)})²` : `${n}²`);
const num = (ans, tol = 1e-6) => ({ type: "num", ans, tol });
const pair = (a, b, ordered) => ({ type: "pair", a, b, ordered });

function tri({ adj = "", opp = "", hyp = "", angle = "" }) {
  return `<svg class="tri" viewBox="0 0 320 196" role="img" aria-label="Right-angled triangle">
<path class="tri-shape" d="M40 160 L240 160 L240 40 Z"/>
<path class="tri-mark" d="M226 160 L226 146 L240 146"/>
${angle ? `<path class="tri-arc" d="M80 160 A40 40 0 0 0 74.3 139.4"/><text class="tri-ang" x="90" y="153">${angle}</text>` : ""}
<text x="140" y="186" text-anchor="middle">${adj}</text>
<text x="252" y="106">${opp}</text>
<text x="128" y="88" text-anchor="end">${hyp}</text>
</svg>`;
}

const GEN = {
  pct() {
    if (Math.random() < 0.5) {
      const p = pick([5, 15, 20, 25, 35, 40, 45, 60, 65, 75]), n = R(2, 20) * 20, a = (p * n) / 100;
      return { text: `Work out ${p}% of ${n}.`, check: num(a, 0.001), answerText: fmt(a),
        hints: [`Start with 10% of ${n}: divide by 10.`, `Build ${p}% from 10%s, 5%s and 1%s, or multiply ${n} by ${p / 100}.`],
        steps: `${p}% as a decimal is ${p / 100}.\n${n} × ${p / 100} = ${fmt(a)}` };
    }
    const p = pick([10, 15, 20, 25, 30, 35, 40]), n = R(4, 30) * 10, m = (100 - p) / 100, a = n * m;
    return { text: `A jacket costs £${n}. In a sale the price is reduced by ${p}%. What is the sale price?`, check: num(a, 0.005), answerText: `£${fmt(a)}`,
      hints: [`If the price drops by ${p}%, what percentage of the original price is left?`, `${100 - p}% is left, so multiply £${n} by the multiplier ${m}.`],
      steps: `100% − ${p}% = ${100 - p}%, multiplier ${m}.\n£${n} × ${m} = £${fmt(a)}` };
  },
  ratio() {
    const [a, b] = pick([[2, 3], [3, 5], [1, 4], [2, 5], [3, 4], [4, 7], [5, 3], [7, 2]]), k = R(4, 25), t = (a + b) * k, big = Math.max(a, b) * k;
    return { text: `Share £${t} between Sam and Priya in the ratio ${a} : ${b}. How much does the person with the larger share get?`, check: num(big, 0.001), answerText: `£${big}`,
      hints: ["How many parts are there altogether?", `There are ${a + b} parts, so one part is £${t} ÷ ${a + b}. Then multiply by the bigger number in the ratio.`],
      steps: `${a} + ${b} = ${a + b} parts.\nOne part = £${t} ÷ ${a + b} = £${k}.\nLarger share = ${Math.max(a, b)} × £${k} = £${big}` };
  },
  ind() {
    if (Math.random() < 0.6) {
      const m = R(3, 9), n = R(2, 7), d = R(2, 6), a = m + n - d;
      return { text: `Simplify x<sup>${m}</sup> × x<sup>${n}</sup> ÷ x<sup>${d}</sup>`, input: "Type the power of x in your answer, e.g. 7", check: num(a), answerText: `x^${a}`,
        hints: ["When you multiply powers of the same letter, add the indices.", `When you divide, subtract. So work out ${m} + ${n} − ${d}.`],
        steps: `x^${m} × x^${n} = x^${m + n}\nx^${m + n} ÷ x^${d} = x^${a}` };
    }
    const m = R(2, 6), n = R(2, 5), a = m * n;
    return { text: `Simplify (x<sup>${m}</sup>)<sup>${n}</sup>`, input: "Type the power of x in your answer", check: num(a), answerText: `x^${a}`,
      hints: ["A power raised to another power: do you add or multiply the indices?", `Multiply them: ${m} × ${n}.`],
      steps: `(x^${m})^${n} = x^(${m} × ${n}) = x^${a}` };
  },
  lin() {
    if (Math.random() < 0.5) {
      const x = Rnz(-5, 9), a = R(2, 9), b = Rnz(-12, 15), c = a * x + b;
      return { text: `Solve ${coef(a, "x")}${sgn(b)} = ${fmtN(c)}`, input: "Type the value of x", check: num(x), answerText: `x = ${fmtN(x)}`,
        hints: [`Undo the ${b > 0 ? "+ " + b : "− " + -b} first by doing the opposite to both sides.`, `You should get ${coef(a, "x")} = ${fmtN(c - b)}. Now divide both sides by ${a}.`],
        steps: `${coef(a, "x")} = ${fmtN(c)}${sgn(-b)} = ${fmtN(c - b)}\nx = ${fmtN(c - b)} ÷ ${a} = ${fmtN(x)}` };
    }
    let a, d, x, b, e;
    do { a = R(4, 9); d = R(1, a - 1); x = Rnz(-4, 8); b = Rnz(-9, 12); e = a * x + b - d * x; } while (e === 0);
    return { text: `Solve ${coef(a, "x")}${sgn(b)} = ${coef(d, "x")}${sgn(e)}`, input: "Type the value of x", check: num(x), answerText: `x = ${fmtN(x)}`,
      hints: [`Get the x terms on one side: subtract ${coef(d, "x")} from both sides.`, `You should have ${coef(a - d, "x")}${sgn(b)} = ${fmtN(e)}. Solve that like a two-step equation.`],
      steps: `${coef(a - d, "x")}${sgn(b)} = ${fmtN(e)}\n${coef(a - d, "x")} = ${fmtN(e - b)}\nx = ${fmtN(e - b)} ÷ ${a - d} = ${fmtN(x)}` };
  },
  circ() {
    if (Math.random() < 0.5) {
      const r = R(3, 15), a = round(Math.PI * r * r);
      return { text: `A circle has radius ${r} cm. Work out its area. Give your answer to 1 decimal place.`, input: "Answer in cm²", check: num(a, 0.051), answerText: `${a} cm²`,
        hints: ["The area of a circle is π × r².", `Square the radius first: ${r}² = ${r * r}. Then multiply by π.`],
        steps: `A = π × ${r}² = π × ${r * r} = ${round(Math.PI * r * r, 4)}…\n= ${a} cm² (1 d.p.)` };
    }
    const d = R(4, 30), c = round(Math.PI * d);
    return { text: `A circular pond has a diameter of ${d} m. Work out its circumference. Give your answer to 1 decimal place.`, input: "Answer in metres", check: num(c, 0.051), answerText: `${c} m`,
      hints: ["Circumference = π × diameter.", `Type π × ${d} into your calculator, then round to 1 decimal place.`],
      steps: `C = π × ${d} = ${round(Math.PI * d, 4)}…\n= ${c} m (1 d.p.)` };
  },
  prob() {
    const r = R(2, 9), b = R(2, 9), g = R(2, 9), t = r + b + g, n = r + g, k = gcd(n, t);
    return { text: `A bag holds ${r} red, ${b} blue and ${g} green counters. One counter is taken at random. What is the probability it is not blue?`, input: "A fraction like 3/8, or a decimal", check: num(n / t, 0.0051), answerText: `${n / k}/${t / k}`,
      hints: ["How many counters are there in total?", `There are ${t} counters. Count the ones that are NOT blue and put that over ${t}.`],
      steps: `Total = ${r} + ${b} + ${g} = ${t}\nNot blue = ${r} + ${g} = ${n}\nP(not blue) = ${n}/${t}${k > 1 ? ` = ${n / k}/${t / k}` : ""}` };
  },
  pyth() {
    let [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [6, 8, 10], [20, 21, 29]]);
    const k = c <= 13 ? R(1, 3) : 1; a *= k; b *= k; c *= k;
    if (Math.random() < 0.5) {
      return { text: "Work out the length of the side marked x.", diagram: tri({ adj: `${a} cm`, opp: `${b} cm`, hyp: "x" }), diagramText: `right-angled triangle, shorter sides ${a} cm and ${b} cm, hypotenuse x`,
        input: "Answer in cm", check: num(c, 0.051), answerText: `${c} cm`,
        hints: ["x is opposite the right angle, so it's the hypotenuse. Use a² + b² = c².", `Work out ${a}² + ${b}² = ${a * a + b * b}, then square root it.`],
        steps: `x² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}\nx = √${c * c} = ${c} cm` };
    }
    return { text: "Work out the length of the side marked x.", diagram: tri({ adj: "x", opp: `${b} cm`, hyp: `${c} cm` }), diagramText: `right-angled triangle, hypotenuse ${c} cm, one shorter side ${b} cm, other shorter side x`,
      input: "Answer in cm", check: num(a, 0.051), answerText: `${a} cm`,
      hints: ["You already know the hypotenuse, so this time you SUBTRACT.", `Work out ${c}² − ${b}² = ${c * c - b * b}, then square root it.`],
      steps: `x² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}\nx = √${a * a} = ${a} cm` };
  },
  sim() {
    const x = R(1, 8), y = R(1, 8), a = R(1, 5), b = R(1, 4), d = R(1, 5), e = R(1, 4);
    const c1 = a * x + b * y, c2 = d * x - e * y;
    return { text: `Solve the simultaneous equations<br>${coef(a, "x")} + ${coef(b, "y")} = ${c1}<br>${coef(d, "x")} − ${coef(e, "y")} = ${fmtN(c2)}`, input: "Type x and y separated by a comma, e.g. 3, 2", check: pair(x, y, true), answerText: `x = ${x}, y = ${y}`,
      hints: ["Make the y coefficients the same size by multiplying one or both equations.", "One y term is + and one is −, so once they match, ADD the equations to eliminate y. Then solve for x."],
      steps: `Multiply eq.1 by ${e} and eq.2 by ${b}:\n${a * e}x + ${b * e}y = ${c1 * e}\n${d * b}x − ${b * e}y = ${fmtN(c2 * b)}\nAdd: ${a * e + d * b}x = ${c1 * e + c2 * b}, so x = ${x}\nSubstitute: ${coef(b, "y")} = ${c1} − ${a * x} = ${b * y}, so y = ${y}` };
  },
  quad() {
    let p, q;
    do { p = Rnz(-6, 8); q = Rnz(-6, 8); } while (p === q || p + q === 0);
    const B = -(p + q), C = p * q;
    const bt = B === 1 ? " + x" : B === -1 ? " − x" : B > 0 ? ` + ${B}x` : ` − ${-B}x`;
    return { text: `Solve x²${bt}${sgn(C)} = 0`, input: "Type both solutions separated by a comma", check: pair(p, q, false), answerText: `x = ${fmtN(p)} or x = ${fmtN(q)}`,
      hints: [`Find two numbers that multiply to ${fmtN(C)} and add to ${fmtN(B)}.`, `They are ${fmtN(-p)} and ${fmtN(-q)}, so (x${sgn(-p)})(x${sgn(-q)}) = 0. Set each bracket equal to zero.`],
      steps: `Two numbers with product ${fmtN(C)} and sum ${fmtN(B)}: ${fmtN(-p)} and ${fmtN(-q)}\n(x${sgn(-p)})(x${sgn(-q)}) = 0\nx = ${fmtN(p)} or x = ${fmtN(q)}` };
  },
  trig() {
    const v = R(0, 2), rad = Math.PI / 180;
    if (v === 0) {
      const h = R(6, 20), t = pick([25, 30, 35, 40, 50, 55, 62]), a = round(h * Math.sin(t * rad));
      return { text: "Work out the length x. Give your answer to 1 decimal place.", diagram: tri({ hyp: `${h} cm`, opp: "x", angle: `${t}°` }), diagramText: `right-angled triangle, hypotenuse ${h} cm, marked angle ${t}°, x is the side opposite the angle`,
        input: "Answer in cm", check: num(a, 0.051), answerText: `${a} cm`,
        hints: ["Label the sides from the marked angle. You know the hypotenuse and want the opposite. Which of SOH, CAH, TOA uses O and H?", `SOH: sin ${t}° = x ÷ ${h}, so x = ${h} × sin ${t}°.`],
        steps: `sin ${t}° = x / ${h}\nx = ${h} × sin ${t}° = ${round(h * Math.sin(t * rad), 4)}…\n= ${a} cm (1 d.p.)` };
    }
    if (v === 1) {
      const h = R(6, 20), t = pick([20, 28, 35, 42, 48, 57]), a = round(h * Math.cos(t * rad));
      return { text: "Work out the length x. Give your answer to 1 decimal place.", diagram: tri({ hyp: `${h} cm`, adj: "x", angle: `${t}°` }), diagramText: `right-angled triangle, hypotenuse ${h} cm, marked angle ${t}°, x is the side adjacent to the angle`,
        input: "Answer in cm", check: num(a, 0.051), answerText: `${a} cm`,
        hints: ["From the marked angle, x is next to it (adjacent) and you know the hypotenuse. Which ratio uses A and H?", `CAH: cos ${t}° = x ÷ ${h}, so x = ${h} × cos ${t}°.`],
        steps: `cos ${t}° = x / ${h}\nx = ${h} × cos ${t}° = ${round(h * Math.cos(t * rad), 4)}…\n= ${a} cm (1 d.p.)` };
    }
    const o = R(3, 12), d = R(4, 14), a = round(Math.atan(o / d) / rad);
    return { text: "Work out the size of angle θ. Give your answer to 1 decimal place.", diagram: tri({ opp: `${o} cm`, adj: `${d} cm`, angle: "θ" }), diagramText: `right-angled triangle, side opposite θ is ${o} cm, side adjacent to θ is ${d} cm`,
      input: "Answer in degrees", check: num(a, 0.051), answerText: `${a}°`,
      hints: ["You know the opposite and adjacent sides. That's TOA.", `tan θ = ${o} ÷ ${d}. Use the inverse: θ = tan⁻¹(${o} ÷ ${d}).`],
      steps: `tan θ = ${o} / ${d}\nθ = tan⁻¹(${o} / ${d}) = ${round(Math.atan(o / d) / rad, 4)}…\n= ${a}° (1 d.p.)` };
  },
  func() {
    const a = R(2, 5), b = Rnz(-6, 7), c = Rnz(-5, 6), v = Rnz(-3, 4);
    const fdesc = `f(x) = ${coef(a, "x")}${sgn(b)}`, gdesc = `g(x) = x²${sgn(c)}`;
    if (Math.random() < 0.5) {
      const g = v * v + c, ans = a * g + b;
      return { text: `${fdesc} and ${gdesc}<br>Work out fg(${fmtN(v)}).`, check: num(ans), answerText: fmtN(ans),
        hints: ["fg(x) means do g first, then put that answer into f.", `g(${fmtN(v)}) = ${sq(v)}${sgn(c)} = ${fmtN(g)}. Now work out f(${fmtN(g)}).`],
        steps: `g(${fmtN(v)}) = ${sq(v)}${sgn(c)} = ${fmtN(g)}\nf(${fmtN(g)}) = ${a} × ${g < 0 ? `(${fmtN(g)})` : g}${sgn(b)} = ${fmtN(ans)}` };
    }
    const f = a * v + b, ans = f * f + c;
    return { text: `${fdesc} and ${gdesc}<br>Work out gf(${fmtN(v)}).`, check: num(ans), answerText: fmtN(ans),
      hints: ["gf(x) means do f first, then put that answer into g.", `f(${fmtN(v)}) = ${a} × ${v < 0 ? `(${fmtN(v)})` : v}${sgn(b)} = ${fmtN(f)}. Now work out g(${fmtN(f)}).`],
      steps: `f(${fmtN(v)}) = ${fmtN(f)}\ng(${fmtN(f)}) = ${sq(f)}${sgn(c)} = ${fmtN(ans)}` };
  },
};

export function generate(topicId) {
  const g = GEN[topicId];
  if (!g) throw new Error("Unknown topic");
  return g();
}

// Only these fields are ever sent to the browser.
export function publicQuestion(id, topicId, q) {
  return { id, topic: topicId, text: q.text, diagram: q.diagram || "", input: q.input || "Type your answer" };
}

function parseNum(s) {
  s = String(s).trim().replace(/[−–]/g, "-").replace(/^[a-zθ]\s*=\s*/i, "").replace(/[£$\s]/g, "");
  s = s.replace(/(cm²|cm\^2|cm|m²|m|°|degrees|deg)$/i, "").replace(/,(?=\d{3}\b)/g, "");
  const f = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (f) { const d = +f[2]; return d ? +f[1] / d : null; }
  return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : null;
}

export function checkAnswer(check, input) {
  if (check.type === "num") {
    const v = parseNum(input);
    return v !== null && Math.abs(v - check.ans) <= check.tol + 1e-9;
  }
  if (check.type === "pair") {
    const n = (String(input).replace(/[−–]/g, "-").match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (n.length !== 2) return false;
    if (check.ordered) return n[0] === check.a && n[1] === check.b;
    const x = [...n].sort((p, q) => p - q), y = [check.a, check.b].sort((p, q) => p - q);
    return x[0] === y[0] && x[1] === y[1];
  }
  return false;
}

export const plainText = h => String(h).replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<br\s*\/?>/g, "; ").replace(/<[^>]+>/g, "");
