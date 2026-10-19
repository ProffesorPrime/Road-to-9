// Question generators for grades 1–9. SERVER ONLY: each question includes its answer,
// which is stored in the database and never sent to the browser.
//
// Every generator returns:
//   text        question shown to the student (may contain <sup>, <br>)
//   check       how the answer is marked (see checkAnswer)
//   answerText  the answer as a person would write it
//   hints       two written hints, gentle then stronger
//   steps       full worked method, one step per line
//   input       (optional) what to type, e.g. "Answer in cm"
//   diagram     (optional) inline SVG

const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const Rnz = (a, b) => { let n = 0; while (n === 0) n = R(a, b); return n; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmtN = n => (n < 0 ? `−${-n}` : `${n}`);
const par = n => (n < 0 ? `(${fmtN(n)})` : `${n}`);              // brackets round negatives
const sgn = n => (n < 0 ? ` − ${-n}` : ` + ${n}`);
const coef = (a, v) => (a === 1 ? v : a === -1 ? `−${v}` : a < 0 ? `−${-a}${v}` : `${a}${v}`);
const term = (a, v) => (a === 0 ? "" : a === 1 ? ` + ${v}` : a === -1 ? ` − ${v}` : a > 0 ? ` + ${a}${v}` : ` − ${-a}${v}`);
const round = (n, d = 1) => Math.round((n + Number.EPSILON) * 10 ** d) / 10 ** d;
const fmt = n => String(round(n, 2)).replace("-", "−");
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const frac = (n, d) => { const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1; return d / g * s === 1 ? fmtN(n / g * s) : `${fmtN(n / g * s)}/${d / g * s}`; };
const sq = n => (n < 0 ? `(${fmtN(n)})²` : `${n}²`);
const big = n => n.toLocaleString("en-GB");
const rad = Math.PI / 180;
const num = (ans, tol = 1e-6) => ({ type: "num", ans, tol });
const pair = (a, b, ordered, tol = 1e-6) => ({ type: "pair", a, b, ordered, tol });
const DP1 = 0.051, DP2 = 0.0051;

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
  /* ---------------- Grade 1 ---------------- */
  neg() {
    const a = Rnz(-15, 15), b = Rnz(-12, 12), op = pick(["+", "−", "×"]);
    const ans = op === "+" ? a + b : op === "−" ? a - b : a * b;
    const hints = op === "×"
      ? ["Multiply the numbers first, then sort out the sign.", "Same signs give a positive answer. Different signs give a negative answer."]
      : op === "+" && b < 0
        ? ["Adding a negative is the same as subtracting.", `${fmtN(a)} + (${fmtN(b)}) is the same as ${fmtN(a)} − ${-b}. Use a number line.`]
        : op === "−" && b < 0
          ? ["Subtracting a negative is the same as adding.", `${fmtN(a)} − (${fmtN(b)}) is the same as ${fmtN(a)} + ${-b}.`]
          : ["Picture a number line. Start at the first number.", `Start at ${fmtN(a)} and move ${Math.abs(b)} ${(op === "+") === (b > 0) ? "right" : "left"}.`];
    return { text: `Work out ${fmtN(a)} ${op} ${par(b)}`, check: num(ans), answerText: fmtN(ans), hints,
      steps: `${fmtN(a)} ${op} ${par(b)} = ${fmtN(ans)}` };
  },
  round() {
    if (Math.random() < 0.5) {
      const n = R(1001, 99999), place = pick([10, 100, 1000]), ans = Math.round(n / place) * place;
      const word = { 10: "ten", 100: "hundred", 1000: "thousand" }[place];
      return { text: `Round ${big(n)} to the nearest ${word}.`, check: num(ans), answerText: big(ans),
        hints: [`Find the ${word}s digit, then look at the digit to its right.`, "If the digit to the right is 5 or more, round up. Otherwise round down."],
        steps: `${big(n)} lies between ${big(Math.floor(n / place) * place)} and ${big(Math.ceil(n / place) * place)}.\nRounded to the nearest ${word}: ${big(ans)}` };
    }
    const k = R(1001, 99999), x = k / 1000, dp = pick([1, 2]), ans = Math.round(k / 10 ** (3 - dp)) / 10 ** dp;
    return { text: `Round ${x.toFixed(3)} to ${dp} decimal place${dp > 1 ? "s" : ""}.`, check: num(ans), answerText: ans.toFixed(dp),
      hints: [`Keep ${dp} digit${dp > 1 ? "s" : ""} after the decimal point, then look at the next digit.`, "5 or more rounds up, 4 or less rounds down."],
      steps: `${x.toFixed(3)} → ${ans.toFixed(dp)} (${dp} d.p.)` };
  },
  bidmas() {
    const t = R(0, 3);
    if (t === 0) { const a = R(2, 20), b = R(2, 9), c = R(2, 9), ans = a + b * c;
      return { text: `Work out ${a} + ${b} × ${c}`, check: num(ans), answerText: `${ans}`, hints: ["BIDMAS: multiplication comes before addition.", `Work out ${b} × ${c} first, then add ${a}.`], steps: `${b} × ${c} = ${b * c}\n${a} + ${b * c} = ${ans}` }; }
    if (t === 1) { const a = R(2, 12), b = R(2, 12), c = R(2, 6), ans = (a + b) * c;
      return { text: `Work out (${a} + ${b}) × ${c}`, check: num(ans), answerText: `${ans}`, hints: ["Brackets come first.", `${a} + ${b} = ${a + b}. Now multiply by ${c}.`], steps: `(${a} + ${b}) = ${a + b}\n${a + b} × ${c} = ${ans}` }; }
    if (t === 2) { const d = R(2, 6), q = R(2, 9), c = d * q, a = R(3, 9), b = R(2, 9), ans = a * b - c / d;
      return { text: `Work out ${a} × ${b} − ${c} ÷ ${d}`, check: num(ans), answerText: fmtN(ans), hints: ["Do the × and the ÷ before the −.", `${a} × ${b} = ${a * b} and ${c} ÷ ${d} = ${q}.`], steps: `${a} × ${b} = ${a * b}\n${c} ÷ ${d} = ${q}\n${a * b} − ${q} = ${fmtN(ans)}` }; }
    const a = R(2, 9), b = R(2, 6), c = R(2, 6), ans = a * a - b * c;
    return { text: `Work out ${a}² − ${b} × ${c}`, check: num(ans), answerText: fmtN(ans), hints: ["Indices (powers) come before multiplication and subtraction.", `${a}² = ${a * a} and ${b} × ${c} = ${b * c}.`], steps: `${a}² = ${a * a}\n${b} × ${c} = ${b * c}\n${a * a} − ${b * c} = ${fmtN(ans)}` };
  },
  pow() {
    const t = R(0, 2);
    if (t === 0) { const a = R(2, 12), r = R(2, 12), ans = a * a + r;
      return { text: `Work out ${a}² + √${r * r}`, check: num(ans), answerText: `${ans}`, hints: ["Squaring means multiplying a number by itself. Square root is the opposite.", `${a}² = ${a * a}. What number times itself makes ${r * r}?`], steps: `${a}² = ${a * a}\n√${r * r} = ${r}\n${a * a} + ${r} = ${ans}` }; }
    if (t === 1) { const a = R(2, 6), ans = a ** 3;
      return { text: `Work out ${a}³`, check: num(ans), answerText: `${ans}`, hints: ["Cubed means multiply three of them together.", `${a} × ${a} × ${a}`], steps: `${a} × ${a} = ${a * a}\n${a * a} × ${a} = ${ans}` }; }
    const r = R(2, 5), c = R(2, 9), ans = r * c;
    return { text: `Work out ∛${r ** 3} × ${c}`, check: num(ans), answerText: `${ans}`, hints: ["The cube root undoes cubing.", `Which number cubed makes ${r ** 3}? Then multiply by ${c}.`], steps: `∛${r ** 3} = ${r}\n${r} × ${c} = ${ans}` };
  },

  /* ---------------- Grade 2 ---------------- */
  fracamt() {
    const d = pick([2, 3, 4, 5, 6, 8, 10]); let n; do { n = R(1, d - 1); } while (gcd(n, d) !== 1); const amt = d * R(3, 30), ans = (amt / d) * n;
    return { text: `Work out ${n}/${d} of ${amt}.`, check: num(ans), answerText: `${ans}`,
      hints: [`Divide by the bottom number first: ${amt} ÷ ${d}.`, `${amt} ÷ ${d} = ${amt / d}. Now multiply by the top number, ${n}.`],
      steps: `${amt} ÷ ${d} = ${amt / d}\n${amt / d} × ${n} = ${ans}` };
  },
  onestep() {
    const x = R(2, 25), t = R(0, 3);
    if (t === 0) { const a = R(2, 20); return { text: `Solve x + ${a} = ${x + a}`, input: "Type the value of x", check: num(x), answerText: `x = ${x}`, hints: ["Do the opposite of + to both sides.", `Subtract ${a} from both sides.`], steps: `x = ${x + a} − ${a} = ${x}` }; }
    if (t === 1) { const a = R(2, 20); return { text: `Solve x − ${a} = ${fmtN(x - a)}`, input: "Type the value of x", check: num(x), answerText: `x = ${x}`, hints: ["Do the opposite of − to both sides.", `Add ${a} to both sides.`], steps: `x = ${fmtN(x - a)} + ${a} = ${x}` }; }
    if (t === 2) { const a = R(2, 9); return { text: `Solve ${a}x = ${a * x}`, input: "Type the value of x", check: num(x), answerText: `x = ${x}`, hints: [`${a}x means ${a} × x. What's the opposite of multiplying?`, `Divide both sides by ${a}.`], steps: `x = ${a * x} ÷ ${a} = ${x}` }; }
    const a = R(2, 9), q = R(2, 12);
    return { text: `Solve x ÷ ${a} = ${q}`, input: "Type the value of x", check: num(a * q), answerText: `x = ${a * q}`, hints: ["What's the opposite of dividing?", `Multiply both sides by ${a}.`], steps: `x = ${q} × ${a} = ${a * q}` };
  },
  angles() {
    const t = R(0, 2);
    if (t === 0) { const a = R(20, 80), b = R(20, 160 - a), ans = 180 - a - b;
      return { text: `Three angles sit on a straight line: ${a}°, ${b}° and x. Work out x.`, input: "Answer in degrees", check: num(ans), answerText: `${ans}°`, hints: ["Angles on a straight line add up to 180°.", `Work out 180 − ${a} − ${b}.`], steps: `${a} + ${b} = ${a + b}\nx = 180 − ${a + b} = ${ans}°` }; }
    if (t === 1) { const a = R(25, 90), b = R(20, 150 - a), ans = 180 - a - b;
      return { text: `A triangle has angles of ${a}°, ${b}° and x. Work out x.`, input: "Answer in degrees", check: num(ans), answerText: `${ans}°`, hints: ["The angles in a triangle add up to 180°.", `Work out 180 − ${a} − ${b}.`], steps: `${a} + ${b} = ${a + b}\nx = 180 − ${a + b} = ${ans}°` }; }
    const a = R(60, 140), b = R(50, 120), c = R(40, 330 - a - b), ans = 360 - a - b - c;
    return { text: `Four angles meet at a point: ${a}°, ${b}°, ${c}° and x. Work out x.`, input: "Answer in degrees", check: num(ans), answerText: `${ans}°`, hints: ["Angles around a point add up to 360°.", `Work out 360 − ${a} − ${b} − ${c}.`], steps: `${a} + ${b} + ${c} = ${a + b + c}\nx = 360 − ${a + b + c} = ${ans}°` };
  },
  avg() {
    const n = pick([5, 7]);
    let xs = Array.from({ length: n }, () => R(1, 20));
    const t = R(0, 2);
    if (t === 0) {
      const rem = xs.reduce((s, x) => s + x, 0) % n;
      if (rem) xs[n - 1] += n - rem;                     // make the mean a whole number
      const sum = xs.reduce((s, x) => s + x, 0), ans = sum / n;
      return { text: `Work out the mean of: ${xs.join(", ")}`, check: num(ans), answerText: `${ans}`, hints: ["Mean = add them all up, then divide by how many there are.", `They add up to ${sum}. There are ${n} numbers.`], steps: `${xs.join(" + ")} = ${sum}\n${sum} ÷ ${n} = ${ans}` };
    }
    if (t === 1) {
      const sorted = [...xs].sort((a, b) => a - b), ans = sorted[(n - 1) / 2];
      return { text: `Work out the median of: ${xs.join(", ")}`, check: num(ans), answerText: `${ans}`, hints: ["Put the numbers in order first.", `In order: ${sorted.join(", ")}. The median is the middle one.`], steps: `In order: ${sorted.join(", ")}\nMiddle value: ${ans}` };
    }
    const mx = Math.max(...xs), mn = Math.min(...xs), ans = mx - mn;
    return { text: `Work out the range of: ${xs.join(", ")}`, check: num(ans), answerText: `${ans}`, hints: ["Range = biggest − smallest.", `The biggest is ${mx} and the smallest is ${mn}.`], steps: `${mx} − ${mn} = ${ans}` };
  },
  prob() {
    const r = R(2, 9), b = R(2, 9), g = R(2, 9), t = r + b + g, n = r + g;
    return { text: `A bag holds ${r} red, ${b} blue and ${g} green counters. One counter is taken at random. What is the probability it is not blue?`, input: "A fraction like 3/8, or a decimal", check: num(n / t, 0.0051), answerText: frac(n, t),
      hints: ["How many counters are there in total?", `There are ${t} counters. Count the ones that are NOT blue and put that over ${t}.`],
      steps: `Total = ${r} + ${b} + ${g} = ${t}\nNot blue = ${r} + ${g} = ${n}\nP(not blue) = ${n}/${t}${gcd(n, t) > 1 ? ` = ${frac(n, t)}` : ""}` };
  },

  /* ---------------- Grade 3 ---------------- */
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
  pctch() {
    const a = R(1, 20) * 20, p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60]), up = Math.random() < 0.5, b = up ? a + (a * p) / 100 : a - (a * p) / 100;
    const what = up ? "increase" : "decrease";
    return { text: `A price ${up ? "rises" : "falls"} from £${a} to £${b}. Work out the percentage ${what}.`, input: "Answer as a percentage, e.g. 15", check: num(p, 0.01), answerText: `${p}%`,
      hints: ["Percentage change = change ÷ original × 100.", `The change is £${Math.abs(b - a)} and the original is £${a}.`],
      steps: `Change = £${Math.abs(b - a)}\n${Math.abs(b - a)} ÷ ${a} × 100 = ${p}%` };
  },
  ratio() {
    const [a, b] = pick([[2, 3], [3, 5], [1, 4], [2, 5], [3, 4], [4, 7], [5, 3], [7, 2]]), k = R(4, 25), t = (a + b) * k, big2 = Math.max(a, b) * k;
    return { text: `Share £${t} between Sam and Priya in the ratio ${a} : ${b}. How much does the person with the larger share get?`, check: num(big2, 0.001), answerText: `£${big2}`,
      hints: ["How many parts are there altogether?", `There are ${a + b} parts, so one part is £${t} ÷ ${a + b}. Then multiply by the bigger number in the ratio.`],
      steps: `${a} + ${b} = ${a + b} parts.\nOne part = £${t} ÷ ${a + b} = £${k}.\nLarger share = ${Math.max(a, b)} × £${k} = £${big2}` };
  },
  sub() {
    const a = Rnz(-6, 8), b = Rnz(-6, 8), p = R(2, 6), q = R(2, 5);
    if (Math.random() < 0.5) {
      const ans = p * a - q * b;
      return { text: `Work out the value of ${p}a − ${q}b when a = ${fmtN(a)} and b = ${fmtN(b)}.`, check: num(ans), answerText: fmtN(ans),
        hints: ["Replace each letter with its number, using brackets for negatives.", `${p} × ${par(a)} − ${q} × ${par(b)}`],
        steps: `${p} × ${par(a)} = ${fmtN(p * a)}\n${q} × ${par(b)} = ${fmtN(q * b)}\n${fmtN(p * a)} − ${par(q * b)} = ${fmtN(ans)}` };
    }
    const ans = a * a + p * b;
    return { text: `Work out the value of a² + ${p}b when a = ${fmtN(a)} and b = ${fmtN(b)}.`, check: num(ans), answerText: fmtN(ans),
      hints: ["Replace each letter with its number. A negative number squared is positive.", `${sq(a)} + ${p} × ${par(b)}`],
      steps: `${sq(a)} = ${a * a}\n${p} × ${par(b)} = ${fmtN(p * b)}\n${a * a}${sgn(p * b)} = ${fmtN(ans)}` };
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
      return { text: `A circle has radius ${r} cm. Work out its area. Give your answer to 1 decimal place.`, input: "Answer in cm²", check: num(a, DP1), answerText: `${a} cm²`,
        hints: ["The area of a circle is π × r².", `Square the radius first: ${r}² = ${r * r}. Then multiply by π.`],
        steps: `A = π × ${r}² = π × ${r * r} = ${round(Math.PI * r * r, 4)}…\n= ${a} cm² (1 d.p.)` };
    }
    const d = R(4, 30), c = round(Math.PI * d);
    return { text: `A circular pond has a diameter of ${d} m. Work out its circumference. Give your answer to 1 decimal place.`, input: "Answer in metres", check: num(c, DP1), answerText: `${c} m`,
      hints: ["Circumference = π × diameter.", `Type π × ${d} into your calculator, then round to 1 decimal place.`],
      steps: `C = π × ${d} = ${round(Math.PI * d, 4)}…\n= ${c} m (1 d.p.)` };
  },

  /* ---------------- Grade 4 ---------------- */
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
  hcf() {
    let m, n;
    do { m = pick([2, 3, 4, 5, 7, 9]); n = pick([2, 3, 4, 5, 7, 9]); } while (m === n || gcd(m, n) !== 1);
    const g = R(2, 12), a = g * m, b = g * n, lcm = g * m * n;
    if (Math.random() < 0.5) {
      return { text: `Find the highest common factor (HCF) of ${a} and ${b}.`, check: num(g), answerText: `${g}`,
        hints: ["Write each number as a product of prime factors, or list their factors.", "The HCF is the biggest number that divides into both."],
        steps: `${a} = ${g} × ${m}\n${b} = ${g} × ${n}\n${m} and ${n} share no factors, so HCF = ${g}` };
    }
    return { text: `Find the lowest common multiple (LCM) of ${a} and ${b}.`, check: num(lcm), answerText: `${lcm}`,
      hints: ["List the multiples of the bigger number until you find one the other divides into.", `Or use HCF: LCM = ${a} × ${b} ÷ HCF, and the HCF is ${g}.`],
      steps: `HCF = ${g}\nLCM = ${a} × ${b} ÷ ${g} = ${lcm}` };
  },
  nth() {
    const d = Rnz(-5, 7), a = R(-6, 12), terms = [1, 2, 3, 4, 5].map(n => a + (n - 1) * d), c = a - d;
    const expr = `${coef(d, "n")}${c === 0 ? "" : sgn(c)}`;
    return { text: `Find the nth term of the sequence ${terms.map(fmtN).join(", ")}, …`, input: "Type it like 3n + 2", check: { type: "linexpr", a: d, b: c }, answerText: expr,
      hints: [`What do you add each time? That number goes in front of n.`, `It goes up by ${fmtN(d)} each time, so start with ${coef(d, "n")}. What do you add or take away to get the first term?`],
      steps: `Difference = ${fmtN(d)}, so it starts ${coef(d, "n")}\nWhen n = 1, ${coef(d, "n")} = ${fmtN(d)}, and the first term is ${fmtN(a)}\nAdjust by ${fmtN(c)}: nth term = ${expr}` };
  },
  ci() {
    const P = R(5, 60) * 100, r = pick([2, 3, 4, 5, 6, 8]), y = R(2, 6);
    if (Math.random() < 0.5) {
      const v = round(P * (1 + r / 100) ** y, 2);
      return { text: `£${big(P)} is invested at ${r}% compound interest per year. Work out its value after ${y} years. Give your answer to the nearest penny.`, check: num(v, 0.006), answerText: `£${v.toFixed(2)}`,
        hints: [`Each year the money is multiplied by 1 + ${r}/100 = ${1 + r / 100}.`, `Work out ${big(P)} × ${1 + r / 100}^${y}.`],
        steps: `Multiplier = ${1 + r / 100}\n${big(P)} × ${1 + r / 100}^${y} = ${round(P * (1 + r / 100) ** y, 4)}…\n= £${v.toFixed(2)}` };
    }
    const d = pick([5, 10, 12, 15, 20, 25]), v = round(P * (1 - d / 100) ** y, 2);
    return { text: `A car is worth £${big(P)}. It loses ${d}% of its value each year. Work out its value after ${y} years, to the nearest penny.`, check: num(v, 0.006), answerText: `£${v.toFixed(2)}`,
      hints: [`Each year the value is multiplied by 1 − ${d}/100 = ${1 - d / 100}.`, `Work out ${big(P)} × ${1 - d / 100}^${y}.`],
      steps: `Multiplier = ${1 - d / 100}\n${big(P)} × ${1 - d / 100}^${y} = ${round(P * (1 - d / 100) ** y, 4)}…\n= £${v.toFixed(2)}` };
  },
  polyang() {
    const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), ext = 360 / n, int = 180 - ext, t = R(0, 2);
    if (t === 0) return { text: `Work out the size of each interior angle of a regular polygon with ${n} sides.`, input: "Answer in degrees", check: num(int), answerText: `${int}°`,
      hints: ["Find the exterior angle first: 360 ÷ number of sides.", `Exterior angle = ${ext}°. Interior + exterior = 180°.`], steps: `Exterior = 360 ÷ ${n} = ${ext}°\nInterior = 180 − ${ext} = ${int}°` };
    if (t === 1) { const s = (n - 2) * 180; return { text: `Work out the sum of the interior angles of a polygon with ${n} sides.`, input: "Answer in degrees", check: num(s), answerText: `${s}°`,
      hints: ["A polygon can be split into triangles from one corner. How many?", `There are ${n} − 2 = ${n - 2} triangles, each worth 180°.`], steps: `(${n} − 2) × 180 = ${n - 2} × 180 = ${s}°` }; }
    return { text: `Each exterior angle of a regular polygon is ${ext}°. How many sides does it have?`, check: num(n), answerText: `${n}`,
      hints: ["The exterior angles of any polygon add up to 360°.", `Work out 360 ÷ ${ext}.`], steps: `360 ÷ ${ext} = ${n} sides` };
  },
  pyth() {
    let [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [6, 8, 10], [20, 21, 29]]);
    const k = c <= 13 ? R(1, 3) : 1; a *= k; b *= k; c *= k;
    if (Math.random() < 0.5) {
      return { text: "Work out the length of the side marked x.", diagram: tri({ adj: `${a} cm`, opp: `${b} cm`, hyp: "x" }), diagramText: `right-angled triangle, shorter sides ${a} cm and ${b} cm, hypotenuse x`,
        input: "Answer in cm", check: num(c, DP1), answerText: `${c} cm`,
        hints: ["x is opposite the right angle, so it's the hypotenuse. Use a² + b² = c².", `Work out ${a}² + ${b}² = ${a * a + b * b}, then square root it.`],
        steps: `x² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}\nx = √${c * c} = ${c} cm` };
    }
    return { text: "Work out the length of the side marked x.", diagram: tri({ adj: "x", opp: `${b} cm`, hyp: `${c} cm` }), diagramText: `right-angled triangle, hypotenuse ${c} cm, one shorter side ${b} cm, other shorter side x`,
      input: "Answer in cm", check: num(a, DP1), answerText: `${a} cm`,
      hints: ["You already know the hypotenuse, so this time you SUBTRACT.", `Work out ${c}² − ${b}² = ${c * c - b * b}, then square root it.`],
      steps: `x² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}\nx = √${a * a} = ${a} cm` };
  },

  /* ---------------- Grade 5 ---------------- */
  revpct() {
    const orig = 20 * R(2, 30), p = pick([10, 15, 20, 25, 30, 40]), up = Math.random() < 0.5, now = up ? orig * (1 + p / 100) : orig * (1 - p / 100), m = up ? 1 + p / 100 : 1 - p / 100;
    return { text: up ? `After a ${p}% increase, a price is £${fmt(now)}. Work out the original price.` : `In a ${p}% off sale, a coat costs £${fmt(now)}. Work out the price before the sale.`,
      check: num(orig, 0.005), answerText: `£${orig}`,
      hints: [`The new price is ${up ? 100 + p : 100 - p}% of the original. Don't take ${p}% of the new price!`, `Divide £${fmt(now)} by the multiplier ${m}.`],
      steps: `New price = ${up ? 100 + p : 100 - p}% of original, multiplier ${m}\nOriginal = ${fmt(now)} ÷ ${m} = £${orig}` };
  },
  stdform() {
    const t = R(0, 2);
    if (t === 0) {
      const m = R(11, 99) / 10, e = R(4, 8), n = Math.round(m * 10 ** e);
      return { text: `Write ${big(n)} in standard form.`, input: "Type it like 3.4 × 10^5 (or 3.4e5)", check: { type: "sf", m, e }, answerText: `${m} × 10^${e}`,
        hints: ["Standard form is a number between 1 and 10, times a power of 10.", `Put the decimal point after the first digit: ${m}. How many places did it move?`], steps: `${big(n)} = ${m} × 10^${e}` };
    }
    if (t === 1) {
      const k = R(11, 99), m = k / 10, e = -R(2, 5), n = (m * 10 ** e).toFixed(-e + (k % 10 ? 1 : 0));
      return { text: `Write ${n} in standard form.`, input: "Type it like 3.4 × 10^-4 (or 3.4e-4)", check: { type: "sf", m, e }, answerText: `${m} × 10^${fmtN(e)}`,
        hints: ["For small numbers the power of 10 is negative.", `Move the decimal point to get ${m}. It moved ${-e} places, so the power is ${fmtN(e)}.`], steps: `${n} = ${m} × 10^${fmtN(e)}` };
    }
    const a = R(2, 9), b = R(2, 9), p = R(2, 8), q = R(2, 8);
    let m = a * b, e = p + q;
    if (m >= 10) { m /= 10; e += 1; }
    return { text: `Work out (${a} × 10<sup>${p}</sup>) × (${b} × 10<sup>${q}</sup>). Give your answer in standard form.`, input: "Type it like 3.4 × 10^5", check: { type: "sf", m, e }, answerText: `${m} × 10^${e}`,
      hints: ["Multiply the numbers, and add the powers of 10.", `${a} × ${b} = ${a * b} and 10^${p} × 10^${q} = 10^${p + q}. Is ${a * b} between 1 and 10?`],
      steps: `${a} × ${b} = ${a * b}\n10^${p} × 10^${q} = 10^${p + q}\n${a * b} × 10^${p + q}${a * b >= 10 ? ` = ${m} × 10^${e}` : ""}` };
  },
  speed() {
    if (Math.random() < 0.5) {
      const s = R(15, 45) * 2, t = pick([0.5, 1.5, 2, 2.5, 3, 4]), d = s * t;
      return { text: `A car travels ${fmt(d)} km in ${t} hours. Work out its average speed.`, input: "Answer in km/h", check: num(s, 0.01), answerText: `${s} km/h`,
        hints: ["Speed = distance ÷ time.", `Work out ${fmt(d)} ÷ ${t}.`], steps: `Speed = ${fmt(d)} ÷ ${t} = ${s} km/h` };
    }
    const dens = pick([2.5, 7.8, 8.9, 11.3, 0.9, 1.2, 19.3]), v = R(5, 60), mass = round(dens * v, 2);
    return { text: `A metal has a density of ${dens} g/cm³. Work out the mass of ${v} cm³ of it.`, input: "Answer in grams", check: num(mass, 0.01), answerText: `${fmt(mass)} g`,
      hints: ["Density = mass ÷ volume, so mass = density × volume.", `Work out ${dens} × ${v}.`], steps: `Mass = ${dens} × ${v} = ${fmt(mass)} g` };
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
    return { text: `Solve x²${term(B, "x")}${sgn(C)} = 0`, input: "Type both solutions separated by a comma", check: pair(p, q, false), answerText: `x = ${fmtN(p)} or x = ${fmtN(q)}`,
      hints: [`Find two numbers that multiply to ${fmtN(C)} and add to ${fmtN(B)}.`, `They are ${fmtN(-p)} and ${fmtN(-q)}, so (x${sgn(-p)})(x${sgn(-q)}) = 0. Set each bracket equal to zero.`],
      steps: `Two numbers with product ${fmtN(C)} and sum ${fmtN(B)}: ${fmtN(-p)} and ${fmtN(-q)}\n(x${sgn(-p)})(x${sgn(-q)}) = 0\nx = ${fmtN(p)} or x = ${fmtN(q)}` };
  },
  trig() {
    const v = R(0, 2);
    if (v === 0) {
      const h = R(6, 20), t = pick([25, 30, 35, 40, 50, 55, 62]), a = round(h * Math.sin(t * rad));
      return { text: "Work out the length x. Give your answer to 1 decimal place.", diagram: tri({ hyp: `${h} cm`, opp: "x", angle: `${t}°` }), diagramText: `right-angled triangle, hypotenuse ${h} cm, marked angle ${t}°, x is the side opposite the angle`,
        input: "Answer in cm", check: num(a, DP1), answerText: `${a} cm`,
        hints: ["Label the sides from the marked angle. You know the hypotenuse and want the opposite. Which of SOH, CAH, TOA uses O and H?", `SOH: sin ${t}° = x ÷ ${h}, so x = ${h} × sin ${t}°.`],
        steps: `sin ${t}° = x / ${h}\nx = ${h} × sin ${t}° = ${round(h * Math.sin(t * rad), 4)}…\n= ${a} cm (1 d.p.)` };
    }
    if (v === 1) {
      const h = R(6, 20), t = pick([20, 28, 35, 42, 48, 57]), a = round(h * Math.cos(t * rad));
      return { text: "Work out the length x. Give your answer to 1 decimal place.", diagram: tri({ hyp: `${h} cm`, adj: "x", angle: `${t}°` }), diagramText: `right-angled triangle, hypotenuse ${h} cm, marked angle ${t}°, x is the side adjacent to the angle`,
        input: "Answer in cm", check: num(a, DP1), answerText: `${a} cm`,
        hints: ["From the marked angle, x is next to it (adjacent) and you know the hypotenuse. Which ratio uses A and H?", `CAH: cos ${t}° = x ÷ ${h}, so x = ${h} × cos ${t}°.`],
        steps: `cos ${t}° = x / ${h}\nx = ${h} × cos ${t}° = ${round(h * Math.cos(t * rad), 4)}…\n= ${a} cm (1 d.p.)` };
    }
    const o = R(3, 12), d = R(4, 14), a = round(Math.atan(o / d) / rad);
    return { text: "Work out the size of angle θ. Give your answer to 1 decimal place.", diagram: tri({ opp: `${o} cm`, adj: `${d} cm`, angle: "θ" }), diagramText: `right-angled triangle, side opposite θ is ${o} cm, side adjacent to θ is ${d} cm`,
      input: "Answer in degrees", check: num(a, DP1), answerText: `${a}°`,
      hints: ["You know the opposite and adjacent sides. That's TOA.", `tan θ = ${o} ÷ ${d}. Use the inverse: θ = tan⁻¹(${o} ÷ ${d}).`],
      steps: `tan θ = ${o} / ${d}\nθ = tan⁻¹(${o} / ${d}) = ${round(Math.atan(o / d) / rad, 4)}…\n= ${a}° (1 d.p.)` };
  },

  /* ---------------- Grade 6 ---------------- */
  fracind() {
    const opts = [
      [8, 1, 3, 2], [8, 2, 3, 4], [27, 1, 3, 3], [27, 2, 3, 9], [64, 2, 3, 16], [125, 2, 3, 25],
      [16, 3, 4, 8], [81, 3, 4, 27], [16, 1, 4, 2], [25, 3, 2, 125], [9, 3, 2, 27], [4, 5, 2, 32], [100, 3, 2, 1000], [36, 1, 2, 6],
    ];
    const [b, n, d, v] = pick(opts), neg = Math.random() < 0.4;
    const ans = neg ? 1 / v : v;
    const root = Math.round(b ** (1 / d));
    return { text: `Work out ${b}<sup>${neg ? "−" : ""}${n}/${d}</sup>`, input: neg ? "A fraction like 1/8, or a decimal" : "Type the value", check: num(ans, 1e-6), answerText: neg ? `1/${v}` : `${v}`,
      hints: [`The bottom of the power (${d}) means take the ${d === 2 ? "square" : d === 3 ? "cube" : d + "th"} root. The top (${n}) means raise to that power.${neg ? " The minus sign means 1 over it." : ""}`,
        `${d === 2 ? "√" : d === 3 ? "∛" : "⁴√"}${b} = ${root}. Then ${root}^${n} = ${v}.`],
      steps: `${d === 2 ? "√" : d === 3 ? "∛" : "⁴√"}${b} = ${root}\n${root}^${n} = ${v}${neg ? `\nNegative power → 1/${v}` : ""}` };
  },
  grad() {
    const m = pick([-3, -2, -1, 1, 2, 3, 4, 0.5, -0.5]), x1 = R(-5, 5), y1 = R(-6, 6), dx = pick([2, 4, 6]), x2 = x1 + dx, y2 = y1 + m * dx;
    if (Math.random() < 0.5) {
      return { text: `Work out the gradient of the line through (${fmtN(x1)}, ${fmtN(y1)}) and (${fmtN(x2)}, ${fmtN(y2)}).`, input: "A number or fraction, e.g. 3 or 1/2", check: num(m, 1e-6), answerText: m % 1 ? frac(m * 2, 2) : fmtN(m),
        hints: ["Gradient = change in y ÷ change in x.", `Change in y = ${fmtN(y2)} − ${par(y1)} = ${fmtN(y2 - y1)}. Change in x = ${fmtN(x2)} − ${par(x1)} = ${dx}.`],
        steps: `Gradient = (${fmtN(y2)} − ${par(y1)}) ÷ (${fmtN(x2)} − ${par(x1)})\n= ${fmtN(y2 - y1)} ÷ ${dx} = ${m % 1 ? frac(m * 2, 2) : fmtN(m)}` };
    }
    const mi = pick([-3, -2, 2, 3, 4, 5]), c = y1 - mi * x1;
    return { text: `A line has gradient ${fmtN(mi)} and passes through (${fmtN(x1)}, ${fmtN(y1)}). Its equation is y = ${coef(mi, "x")} + c. Work out c.`, check: num(c), answerText: fmtN(c),
      hints: ["Substitute the point into y = mx + c.", `${fmtN(y1)} = ${fmtN(mi)} × ${par(x1)} + c. Solve for c.`],
      steps: `${fmtN(y1)} = ${fmtN(mi)} × ${par(x1)} + c\n${fmtN(y1)} = ${fmtN(mi * x1)} + c\nc = ${fmtN(c)}` };
  },
  sector() {
    const r = R(4, 15), th = pick([30, 40, 45, 60, 72, 80, 100, 120, 135, 150, 210, 240]);
    if (Math.random() < 0.5) {
      const a = round((th / 360) * Math.PI * r * r);
      return { text: `A sector of a circle has radius ${r} cm and angle ${th}°. Work out its area to 1 decimal place.`, input: "Answer in cm²", check: num(a, DP1), answerText: `${a} cm²`,
        hints: ["A sector is a fraction of a circle: angle ÷ 360.", `Area = ${th}/360 × π × ${r}².`], steps: `${th}/360 × π × ${r * r} = ${round((th / 360) * Math.PI * r * r, 4)}…\n= ${a} cm²` };
    }
    const l = round((th / 360) * 2 * Math.PI * r);
    return { text: `A sector of a circle has radius ${r} cm and angle ${th}°. Work out its arc length to 1 decimal place.`, input: "Answer in cm", check: num(l, DP1), answerText: `${l} cm`,
      hints: ["The arc is a fraction of the circumference: angle ÷ 360.", `Arc length = ${th}/360 × 2 × π × ${r}.`], steps: `${th}/360 × 2π × ${r} = ${round((th / 360) * 2 * Math.PI * r, 4)}…\n= ${l} cm` };
  },
  cone() {
    if (Math.random() < 0.5) {
      const r = R(2, 12), v = round((4 / 3) * Math.PI * r ** 3);
      return { text: `A sphere has radius ${r} cm. Work out its volume to 1 decimal place. (Volume of a sphere = 4/3 πr³)`, input: "Answer in cm³", check: num(v, DP1), answerText: `${v} cm³`,
        hints: ["Cube the radius first.", `${r}³ = ${r ** 3}. Then multiply by 4/3 and by π.`], steps: `4/3 × π × ${r}³ = 4/3 × π × ${r ** 3} = ${round((4 / 3) * Math.PI * r ** 3, 4)}…\n= ${v} cm³` };
    }
    const r = R(2, 10), h = R(4, 20), v = round((1 / 3) * Math.PI * r * r * h);
    return { text: `A cone has base radius ${r} cm and height ${h} cm. Work out its volume to 1 decimal place. (Volume of a cone = 1/3 πr²h)`, input: "Answer in cm³", check: num(v, DP1), answerText: `${v} cm³`,
      hints: ["Square the radius, multiply by the height, then by π, then divide by 3.", `1/3 × π × ${r}² × ${h}`], steps: `1/3 × π × ${r * r} × ${h} = ${round((1 / 3) * Math.PI * r * r * h, 4)}…\n= ${v} cm³` };
  },
  ptree() {
    const r = R(2, 8), b = R(2, 8), t = r + b;
    if (Math.random() < 0.6) {
      const n = r * (r - 1), d = t * (t - 1);
      return { text: `A bag has ${r} red and ${b} blue sweets. Two sweets are taken at random without replacement. What is the probability both are red?`, input: "A fraction like 3/14, or a decimal", check: num(n / d, 0.0051), answerText: frac(n, d),
        hints: ["Draw a tree. After the first red is taken, there is one fewer red and one fewer sweet.", `P(red, red) = ${r}/${t} × ${r - 1}/${t - 1}.`],
        steps: `${r}/${t} × ${r - 1}/${t - 1} = ${n}/${d}${gcd(n, d) > 1 ? ` = ${frac(n, d)}` : ""}` };
    }
    const n = 2 * r * b, d = t * t;
    return { text: `A bag has ${r} red and ${b} blue counters. A counter is taken, put back, then a second is taken. What is the probability of getting one of each colour?`, input: "A fraction or a decimal", check: num(n / d, 0.0051), answerText: frac(n, d),
      hints: ["There are two ways: red then blue, or blue then red. Add them.", `${r}/${t} × ${b}/${t} + ${b}/${t} × ${r}/${t}`],
      steps: `RB: ${r}/${t} × ${b}/${t} = ${r * b}/${d}\nBR: ${b}/${t} × ${r}/${t} = ${r * b}/${d}\nTotal = ${n}/${d}${gcd(n, d) > 1 ? ` = ${frac(n, d)}` : ""}` };
  },

  /* ---------------- Grade 7 ---------------- */
  surds() {
    const b = pick([2, 3, 5, 6, 7, 10, 11]), a = R(2, 9);
    if (Math.random() < 0.6) {
      return { text: `Simplify √${a * a * b}. Write your answer as a√b.`, input: "Type a and b separated by a comma, e.g. 3, 2", check: pair(a, b, true), answerText: `${a}√${b}`,
        hints: ["Find the biggest square number that divides into it.", `${a * a * b} = ${a * a} × ${b}, and √${a * a} = ${a}.`], steps: `√${a * a * b} = √${a * a} × √${b} = ${a}√${b}` };
    }
    const ans = a * a - b;
    return { text: `Expand and simplify (${a} + √${b})(${a} − √${b})`, check: num(ans), answerText: fmtN(ans),
      hints: ["Multiply out the brackets. The middle terms cancel.", `${a}² − (√${b})², and (√${b})² = ${b}.`], steps: `${a}² − √${b}² = ${a * a} − ${b} = ${fmtN(ans)}` };
  },
  bounds() {
    if (Math.random() < 0.5) {
      const a = R(4, 20), b = R(3, 15), ub = (a + 0.5) * (b + 0.5);
      return { text: `A rectangle measures ${a} cm by ${b} cm, each to the nearest cm. Work out the upper bound of its area.`, input: "Answer in cm²", check: num(ub, 1e-6), answerText: `${ub} cm²`,
        hints: ["To the nearest cm means the real length could be up to 0.5 cm more.", `Upper bounds: ${a + 0.5} and ${b + 0.5}. Multiply them.`], steps: `${a + 0.5} × ${b + 0.5} = ${ub} cm²` };
    }
    const d = R(80, 200), t = R(2, 6), lb = (d - 0.5) / (t + 0.05);
    return { text: `A runner covers ${d} m (to the nearest metre) in ${t}.0 seconds (to 1 decimal place). Work out the lower bound of their speed, to 2 decimal places.`, input: "Answer in m/s", check: num(round(lb, 2), DP2), answerText: `${round(lb, 2).toFixed(2)} m/s`,
      hints: ["For the smallest speed, use the smallest distance and the largest time.", `Lower bound of distance = ${d - 0.5}. Upper bound of time = ${t}.05.`], steps: `${d - 0.5} ÷ ${t}.05 = ${round(lb, 4)}…\n= ${round(lb, 2).toFixed(2)} m/s` };
  },
  qform() {
    let a, b, c, D;
    do { a = R(1, 3); b = Rnz(-9, 9); c = Rnz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    const x1 = (-b + Math.sqrt(D)) / (2 * a), x2 = (-b - Math.sqrt(D)) / (2 * a);
    const r1 = round(x1, 2), r2 = round(x2, 2);
    return { text: `Solve ${coef(a, "x²")}${term(b, "x")}${sgn(c)} = 0. Give your answers to 2 decimal places.`, input: "Type both answers separated by a comma", check: pair(r1, r2, false, DP2), answerText: `x = ${fmt(r1)} or x = ${fmt(r2)}`,
      hints: [`Use x = (−b ± √(b² − 4ac)) ÷ 2a with a = ${a}, b = ${fmtN(b)}, c = ${fmtN(c)}.`, `b² − 4ac = ${D}. So x = (${fmtN(-b)} ± √${D}) ÷ ${2 * a}.`],
      steps: `a = ${a}, b = ${fmtN(b)}, c = ${fmtN(c)}\nb² − 4ac = ${b * b} − ${par(4 * a * c)} = ${D}\nx = (${fmtN(-b)} ± √${D}) ÷ ${2 * a}\nx = ${fmt(r1)} or x = ${fmt(r2)}` };
  },
  sinerule() {
    const A = R(30, 80), B = R(30, Math.min(110, 170 - A)), ac = R(6, 20), bc = round((ac * Math.sin(A * rad)) / Math.sin(B * rad));
    return { text: `In triangle ABC, AC = ${ac} cm, angle ABC = ${B}° and angle BAC = ${A}°. Work out the length of BC to 1 decimal place.`, input: "Answer in cm", check: num(bc, DP1), answerText: `${bc} cm`,
      hints: ["Use the sine rule: a/sin A = b/sin B. Pair each side with the angle opposite it.", `BC is opposite angle A and AC is opposite angle B, so BC = ${ac} × sin ${A}° ÷ sin ${B}°.`],
      steps: `BC / sin ${A}° = ${ac} / sin ${B}°\nBC = ${ac} × sin ${A}° ÷ sin ${B}° = ${round((ac * Math.sin(A * rad)) / Math.sin(B * rad), 4)}…\n= ${bc} cm` };
  },
  cosrule() {
    const b = R(5, 15), c = R(5, 15), A = R(35, 120), a = round(Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * rad)));
    return { text: `In triangle ABC, AB = ${c} cm, AC = ${b} cm and angle BAC = ${A}°. Work out the length of BC to 1 decimal place.`, input: "Answer in cm", check: num(a, DP1), answerText: `${a} cm`,
      hints: ["Two sides and the angle between them: use the cosine rule, a² = b² + c² − 2bc cos A.", `BC² = ${b}² + ${c}² − 2 × ${b} × ${c} × cos ${A}°. Then square root.`],
      steps: `BC² = ${b * b} + ${c * c} − ${2 * b * c} × cos ${A}° = ${round(b * b + c * c - 2 * b * c * Math.cos(A * rad), 4)}…\nBC = ${a} cm` };
  },
  triarea() {
    const a = R(4, 15), b = R(4, 15), C = pick([25, 35, 40, 50, 65, 75, 110, 130]), ar = round(0.5 * a * b * Math.sin(C * rad));
    return { text: `A triangle has sides of ${a} cm and ${b} cm with an angle of ${C}° between them. Work out its area to 1 decimal place.`, input: "Answer in cm²", check: num(ar, DP1), answerText: `${ar} cm²`,
      hints: ["Area = ½ab sin C, where C is the angle between sides a and b.", `½ × ${a} × ${b} × sin ${C}°`], steps: `½ × ${a} × ${b} × sin ${C}° = ${round(0.5 * a * b * Math.sin(C * rad), 4)}…\n= ${ar} cm²` };
  },

  /* ---------------- Grade 8 ---------------- */
  csq() {
    const p = Rnz(-6, 6), b = 2 * p, c = Rnz(-12, 15), q = c - p * p;
    return { text: `Write x²${term(b, "x")}${sgn(c)} in the form (x + p)² + q.`, input: "Type p and q separated by a comma, e.g. 3, −4", check: pair(p, q, true), answerText: `(x${sgn(p)})²${sgn(q)}, so p = ${fmtN(p)}, q = ${fmtN(q)}`,
      hints: [`Halve the coefficient of x: ${fmtN(b)} ÷ 2 = ${fmtN(p)}. That's p.`, `(x${sgn(p)})² = x²${term(b, "x")} + ${p * p}. You need ${fmtN(c)}, so q = ${fmtN(c)} − ${p * p}.`],
      steps: `p = ${fmtN(b)} ÷ 2 = ${fmtN(p)}\n(x${sgn(p)})² = x²${term(b, "x")} + ${p * p}\nq = ${fmtN(c)} − ${p * p} = ${fmtN(q)}` };
  },
  func() {
    const a = R(2, 5), b = Rnz(-6, 7), c = Rnz(-5, 6), v = Rnz(-3, 4);
    const fdesc = `f(x) = ${coef(a, "x")}${sgn(b)}`, gdesc = `g(x) = x²${sgn(c)}`;
    if (Math.random() < 0.5) {
      const g = v * v + c, ans = a * g + b;
      return { text: `${fdesc} and ${gdesc}<br>Work out fg(${fmtN(v)}).`, check: num(ans), answerText: fmtN(ans),
        hints: ["fg(x) means do g first, then put that answer into f.", `g(${fmtN(v)}) = ${sq(v)}${sgn(c)} = ${fmtN(g)}. Now work out f(${fmtN(g)}).`],
        steps: `g(${fmtN(v)}) = ${sq(v)}${sgn(c)} = ${fmtN(g)}\nf(${fmtN(g)}) = ${a} × ${par(g)}${sgn(b)} = ${fmtN(ans)}` };
    }
    const f = a * v + b, ans = f * f + c;
    return { text: `${fdesc} and ${gdesc}<br>Work out gf(${fmtN(v)}).`, check: num(ans), answerText: fmtN(ans),
      hints: ["gf(x) means do f first, then put that answer into g.", `f(${fmtN(v)}) = ${a} × ${par(v)}${sgn(b)} = ${fmtN(f)}. Now work out g(${fmtN(f)}).`],
      steps: `f(${fmtN(v)}) = ${fmtN(f)}\ng(${fmtN(f)}) = ${sq(f)}${sgn(c)} = ${fmtN(ans)}` };
  },
  finv() {
    const a = R(2, 7), b = Rnz(-9, 9), x0 = R(-5, 9), y0 = a * x0 + b;
    return { text: `f(x) = ${coef(a, "x")}${sgn(b)}. Work out f<sup>−1</sup>(${fmtN(y0)}).`, check: num(x0), answerText: fmtN(x0),
      hints: ["f⁻¹ undoes f. Find the x that f turns into this number.", `Solve ${coef(a, "x")}${sgn(b)} = ${fmtN(y0)}.`],
      steps: `f⁻¹(x) = (x${sgn(-b)}) ÷ ${a}\nf⁻¹(${fmtN(y0)}) = (${fmtN(y0)}${sgn(-b)}) ÷ ${a} = ${fmtN(x0)}` };
  },
  qseq() {
    const a = pick([1, 2, 3, -1]), b = R(-5, 5), c = R(-6, 8), T = n => a * n * n + b * n + c, k = pick([8, 10, 12, 20]), ans = T(k);
    const nth = `${coef(a, "n²")}${term(b, "n")}${c ? sgn(c) : ""}`;
    return { text: `Here is a quadratic sequence: ${[1, 2, 3, 4, 5].map(n => fmtN(T(n))).join(", ")}, …<br>Work out the ${k}th term.`, check: num(ans), answerText: fmtN(ans),
      hints: [`Find the second difference. Half of it is the number in front of n².`, `The second difference is ${fmtN(2 * a)}, so the sequence starts ${coef(a, "n²")}. Subtract ${coef(a, "n²")} from each term to find the rest.`],
      steps: `Second difference = ${fmtN(2 * a)}, so ${coef(a, "n²")}\nnth term = ${nth}\n${k}th term = ${fmtN(a)} × ${k}²${b ? `${b < 0 ? " − " : " + "}${Math.abs(b)} × ${k}` : ""}${c ? sgn(c) : ""} = ${fmtN(ans)}` };
  },

  /* ---------------- Grade 9 ---------------- */
  diff() {
    const a = pick([1, 2, -1, 3]), b = R(-4, 4), c = R(-8, 8), d = R(-5, 9), k = Rnz(-3, 3);
    const grad = 3 * a * k * k + 2 * b * k + c;
    return { text: `y = ${coef(a, "x³")}${term(b, "x²")}${term(c, "x")}${d ? sgn(d) : ""}. Work out the gradient of the curve at the point where x = ${fmtN(k)}.`, check: num(grad), answerText: fmtN(grad),
      hints: ["Differentiate: multiply by the power, then reduce the power by one. Constants disappear.", `dy/dx = ${coef(3 * a, "x²")}${term(2 * b, "x")}${c ? sgn(c) : ""}. Now substitute x = ${fmtN(k)}.`],
      steps: `dy/dx = ${coef(3 * a, "x²")}${term(2 * b, "x")}${c ? sgn(c) : ""}\nAt x = ${fmtN(k)}: ${fmtN(3 * a)} × ${sq(k)}${sgn(2 * b * k)}${c ? sgn(c) : ""} = ${fmtN(grad)}` };
  },
  qsim() {
    let p, q;
    do { p = R(-5, 5); q = R(-5, 5); } while (p === q);
    const m = Rnz(-3, 3), c = Rnz(-5, 5), b = m - (p + q), c2 = c + p * q;
    return { text: `Solve the simultaneous equations<br>y = ${coef(m, "x")}${sgn(c)}<br>y = x²${term(b, "x")}${c2 ? sgn(c2) : ""}`, input: "Type the two x-values separated by a comma", check: pair(p, q, false), answerText: `x = ${fmtN(p)} or x = ${fmtN(q)}`,
      hints: ["Set the two expressions for y equal to each other.", `x²${term(b, "x")}${c2 ? sgn(c2) : ""} = ${coef(m, "x")}${sgn(c)}. Rearrange to x²${term(-(p + q), "x")}${p * q ? sgn(p * q) : ""} = 0 and factorise.`],
      steps: `x²${term(b, "x")}${c2 ? sgn(c2) : ""} = ${coef(m, "x")}${sgn(c)}\nx²${term(-(p + q), "x")}${p * q ? sgn(p * q) : ""} = 0\n(x${p ? sgn(-p) : ""})(x${q ? sgn(-q) : ""}) = 0\nx = ${fmtN(p)} or x = ${fmtN(q)}` };
  },
  gtrans() {
    const a = Rnz(-5, 5), b = Rnz(-5, 5), t = R(0, 3);
    let desc, X, Y, hint;
    if (t === 0) { const h = Rnz(-4, 4), k = Rnz(-4, 4); desc = `y = f(x${sgn(h)})${sgn(k)}`; X = a - h; Y = b + k; hint = `f(x${sgn(h)}) moves the graph ${h > 0 ? "left" : "right"} by ${Math.abs(h)}. Adding ${fmtN(k)} outside moves it ${k > 0 ? "up" : "down"} by ${Math.abs(k)}.`; }
    else if (t === 1) { desc = "y = −f(x)"; X = a; Y = -b; hint = "−f(x) reflects the graph in the x-axis, so the y-coordinate changes sign."; }
    else if (t === 2) { desc = "y = f(−x)"; X = -a; Y = b; hint = "f(−x) reflects the graph in the y-axis, so the x-coordinate changes sign."; }
    else { const s = R(2, 4); desc = `y = ${s}f(x)`; X = a; Y = s * b; hint = `${s}f(x) stretches the graph vertically by a factor of ${s}, so the y-coordinate is multiplied by ${s}.`; }
    return { text: `The curve y = f(x) has a turning point at (${fmtN(a)}, ${fmtN(b)}). Write down the turning point of ${desc}.`, input: "Type the coordinates as x, y", check: pair(X, Y, true), answerText: `(${fmtN(X)}, ${fmtN(Y)})`,
      hints: ["Changes inside the bracket move the graph left/right (and do the opposite of what you expect). Changes outside move it up/down.", hint],
      steps: `${hint}\nTurning point: (${fmtN(X)}, ${fmtN(Y)})` };
  },
};

export function generate(topicId) {
  const g = GEN[topicId];
  if (!g) throw new Error("Unknown topic");
  return g();
}
export const hasGenerator = id => typeof GEN[id] === "function";

// Only these fields are ever sent to the browser.
export function publicQuestion(id, topicId, q) {
  return { id, topic: topicId, text: q.text, diagram: q.diagram || "", input: q.input || "Type your answer" };
}

const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
const clean = s => String(s).trim()
  .replace(/10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, m) => "10^" + [...m].map(c => SUP[c]).join(""))
  .replace(/[−–—]/g, "-").replace(/×/g, "x");

function parseNum(s) {
  s = clean(s).replace(/^[a-zθ]\s*=\s*/i, "").replace(/[£$\s]/g, "");
  s = s.replace(/(cm²|cm\^2|cm³|cm\^3|cm|m²|m\/s|km\/h|kmh|m|g|kg|°|degrees|deg|%)$/i, "").replace(/,(?=\d{3}\b)/g, "");
  const f = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (f) { const d = +f[2]; return d ? +f[1] / d : null; }
  return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : null;
}

function parseSF(s) {
  s = clean(s).replace(/\s/g, "");
  let m = s.match(/^(-?\d*\.?\d+)(?:x|\*)10\^?\(?(-?\d+)\)?$/i) || s.match(/^(-?\d*\.?\d+)e(-?\d+)$/i);
  return m ? { m: parseFloat(m[1]), e: parseInt(m[2], 10) } : null;
}

// "3n + 2", "-2n+15", "n - 4", "5 + 3n"
function parseLin(s) {
  s = clean(s).replace(/\s/g, "").toLowerCase();
  let m = s.match(/^([+-]?\d*)n([+-]\d+)?$/);
  if (m) return { a: m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : +m[1], b: m[2] ? +m[2] : 0 };
  m = s.match(/^([+-]?\d+)([+-]\d*)n$/);
  if (m) return { a: m[2] === "+" ? 1 : m[2] === "-" ? -1 : +m[2], b: +m[1] };
  return null;
}

export function checkAnswer(check, input) {
  if (check.type === "num") {
    const v = parseNum(input);
    return v !== null && Math.abs(v - check.ans) <= check.tol + 1e-9;
  }
  if (check.type === "pair") {
    const n = (clean(input).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (n.length !== 2) return false;
    const tol = (check.tol ?? 1e-6) + 1e-9;
    const eq = (x, y) => Math.abs(x - y) <= tol;
    if (check.ordered) return eq(n[0], check.a) && eq(n[1], check.b);
    return (eq(n[0], check.a) && eq(n[1], check.b)) || (eq(n[0], check.b) && eq(n[1], check.a));
  }
  if (check.type === "sf") {
    const v = parseSF(input);
    return !!v && v.m >= 1 && v.m < 10 && v.e === check.e && Math.abs(v.m - check.m) < 1e-9;
  }
  if (check.type === "linexpr") {
    const v = parseLin(input);
    return !!v && v.a === check.a && v.b === check.b;
  }
  return false;
}

export const plainText = h => String(h).replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<br\s*\/?>/g, "; ").replace(/<[^>]+>/g, "");
