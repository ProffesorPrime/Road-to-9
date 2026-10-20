// Professor Prime's guided lessons.
// Every topic gets: (hand-built steps OR a short intro) → watch an example → one together → one solo.
// Step kinds:
//   { say, show: { w, ...props } }   Prime explains while a still picture is shown → Next
//   { say, do: { w, ...props } }     an interactive visual; Next unlocks when the task is done
//   { say, ask: { q, options, answer, yes, no } }  quick check; a wrong pick shows "no" (another way) and lets them try again

export const LESSONS = {
  neg: [
    { say: "Negative numbers live to the LEFT of zero. Think of a thermometer on a freezing night: minus 4 is colder than 2.", show: { w: "numberline", start: -4 } },
    { say: "Adding moves you right. Taking away moves you left. Start at −4 and add 6: tap Right six times.", do: { w: "numberline", start: -4, target: 2 } },
    { say: "You landed on 2. So −4 + 6 = 2. Now start at 3 and take away 7. Which way will you go?", do: { w: "numberline", start: 3, target: -4 } },
    { say: "Quick check!", ask: { q: "What is −2 − 5?", options: ["3", "−7", "7", "−3"], answer: 1, yes: "Spot on! Start at −2 and move 5 to the left.", no: "Let's picture it: start at −2, then take away 5 means 5 steps LEFT. You land on −7. Try again!" } },
    { say: "Here's a rule that surprises people: taking away a negative is the same as adding. 5 − (−3) is 5 + 3, which is 8. Two minuses make a plus!", show: { w: "numberline", start: 5, hop: { from: 5, to: 8 } } },
    { say: "Your turn to use the rule.", ask: { q: "What is 4 − (−6)?", options: ["−2", "10", "2", "−10"], answer: 1, yes: "Eureka! 4 − (−6) = 4 + 6 = 10.", no: "The two minuses become a plus: 4 − (−6) = 4 + 6. Try again!" } },
  ],
  fracamt: [
    { say: "To find a fraction of an amount, the BOTTOM number tells you how many equal parts to split it into.", show: { w: "fractionbar", amount: 24, d: 4 } },
    { say: "Let's find 3/4 of 24. Each part is 24 ÷ 4 = 6. The TOP number says how many parts we want: tap 3 parts.", do: { w: "fractionbar", amount: 24, d: 4, n: 3 } },
    { say: "3 parts of 6 make 18, so 3/4 of 24 = 18. My motto: divide by the bottom, times by the top!" },
    { say: "Quick check!", ask: { q: "What is 2/5 of 35?", options: ["7", "14", "70", "10"], answer: 1, yes: "Splendid! 35 ÷ 5 = 7, and 7 × 2 = 14.", no: "Another way to see it: split 35 into 5 parts of 7. Two of those parts make 14. Try again!" } },
    { say: "And a trickier one.", ask: { q: "What is 3/8 of 40?", options: ["5", "15", "24", "120"], answer: 1, yes: "Eureka! 40 ÷ 8 = 5, then 5 × 3 = 15.", no: "Divide by the bottom first: 40 ÷ 8 = 5. Then times by the top: 5 × 3. Try again!" } },
  ],
  lin: [
    { say: "An equation is like a balance. Both sides weigh exactly the same. Whatever you do to one side, you MUST do to the other.", show: { w: "balance", a: 3, b: 4, c: 13 } },
    { say: "Let's solve 3x + 4 = 13. We want x on its own. Pick the right move each time.", do: { w: "balance", a: 3, b: 4, c: 13 } },
    { say: "x = 3. Always check: 3 × 3 + 4 = 13. It balances! We undid the + 4 first, then the × 3. Undo things in reverse order." },
    { say: "Quick check!", ask: { q: "Solve 2x + 5 = 17. What's the first move?", options: ["Add 5 to both sides", "Take 5 from both sides", "Divide both sides by 5", "Take 2 from both sides"], answer: 1, yes: "Yes! That leaves 2x = 12.", no: "We undo the + 5 first, so we take 5 from both sides. Think: what's stuck to the x? Try again!" } },
    { say: "Now finish it.", ask: { q: "2x = 12. What is x?", options: ["24", "10", "6", "14"], answer: 2, yes: "Eureka! 12 ÷ 2 = 6.", no: "2x means 2 times x. To undo times 2, divide both sides by 2. Try again!" } },
  ],
  pct: [
    { say: "Per cent means 'out of 100'. Picture £80 split into 100 tiny squares. 10% is one row of 10 squares, which is £8.", show: { w: "percentgrid", amount: 80, pct: 10 } },
    { say: "15% is 10% plus 5%. Drag the slider to shade 15% and watch the money.", do: { w: "percentgrid", amount: 80, target: 15 } },
    { say: "£8 for 10%, plus £4 for 5%, makes £12. You can build any percentage out of 10%s, 5%s and 1%s!" },
    { say: "Quick check!", ask: { q: "What is 25% of £60?", options: ["£25", "£6", "£15", "£2.40"], answer: 2, yes: "Splendid! 25% is a quarter, and £60 ÷ 4 = £15.", no: "Another way: 25% is a quarter. A quarter of £60 is £60 ÷ 4. Try again!" } },
    { say: "Here's the shortcut for sales: 20% off means you still pay 80%. So multiply by 0.8." },
    { say: "Try it.", ask: { q: "A £50 game has 20% off. What's the sale price?", options: ["£10", "£40", "£30", "£45"], answer: 1, yes: "Eureka! £50 × 0.8 = £40.", no: "£10 is the discount, not the price! You pay 80%: £50 × 0.8. Try again!" } },
  ],
  ratio: [
    { say: "A ratio shares something in parts. Sam and Priya share £40 in the ratio 3 : 5. Sam gets 3 parts, Priya gets 5.", show: { w: "ratiobars", a: 3, b: 5, total: 40 } },
    { say: "Tap through the three steps to share the money fairly.", do: { w: "ratiobars", a: 3, b: 5, total: 40 } },
    { say: "Check it: £15 + £25 = £40. The shares always add back to the total. If they don't, something's gone wrong!" },
    { say: "Quick check!", ask: { q: "Share £36 in the ratio 1 : 2. How much is the bigger share?", options: ["£12", "£18", "£24", "£72"], answer: 2, yes: "Eureka! 3 parts, £12 each, so the bigger share is 2 × £12 = £24.", no: "Count the parts first: 1 + 2 = 3. One part is £36 ÷ 3 = £12. The bigger share is 2 parts. Try again!" } },
  ],
  pyth: [
    { say: "Pythagoras only works for right-angled triangles. Draw a square on each side of the triangle and look at their areas.", show: { w: "pyth", a: 3, b: 4 } },
    { say: "The two smaller squares always add up to the big one: a² + b² = c². Move the sliders to make a 6 by 8 triangle.", do: { w: "pyth", a: 3, b: 4, target: [6, 8] } },
    { say: "36 + 64 = 100, and √100 = 10. So the longest side, the hypotenuse, is 10." },
    { say: "Quick check!", ask: { q: "The shorter sides are 5 cm and 12 cm. How long is the hypotenuse?", options: ["17 cm", "13 cm", "169 cm", "7 cm"], answer: 1, yes: "Splendid! 25 + 144 = 169, and √169 = 13.", no: "Don't just add the sides! Square them: 5² + 12² = 25 + 144 = 169. Then square root. Try again!" } },
    { say: "If you know the hypotenuse and want a SHORTER side, subtract instead: a² = c² − b².", ask: { q: "The hypotenuse is 10 cm and one side is 6 cm. How long is the other side?", options: ["8 cm", "4 cm", "16 cm", "11.7 cm"], answer: 0, yes: "Eureka! 100 − 36 = 64, and √64 = 8.", no: "It's a shorter side, so subtract: 10² − 6² = 100 − 36 = 64. Then square root. Try again!" } },
  ],
  trig: [
    { say: "SOHCAHTOA starts with labelling. Every side gets a name, measured FROM the marked angle θ.", show: { w: "trilabel", angle: "bl" } },
    { say: "Tap each side when I ask. The angle is in the bottom-left corner.", do: { w: "trilabel", angle: "bl" } },
    { say: "Now I've moved the angle to the top. Watch out: opposite and adjacent swap places!", do: { w: "trilabel", angle: "tr" } },
    { say: "Next, pick the ratio. SOH: sin = O ÷ H. CAH: cos = A ÷ H. TOA: tan = O ÷ A. Look for the two sides you have or want." },
    { say: "Quick check!", ask: { q: "You know the hypotenuse and want the opposite. Which ratio?", options: ["sin", "cos", "tan"], answer: 0, yes: "Spot on! O and H are in SOH.", no: "Which of SOH, CAH, TOA has both O and H in it? Try again!" } },
    { say: "One more.", ask: { q: "You know the opposite and the adjacent. Which ratio?", options: ["sin", "cos", "tan"], answer: 2, yes: "Eureka! O and A are in TOA.", no: "Look for O and A together: SOH, CAH or TOA? Try again!" } },
  ],
  quad: [
    { say: "To solve x² + 7x + 12 = 0, we look for two numbers that MULTIPLY to 12 and ADD to 7. Tap pairs to test them.", do: { w: "factorpairs", b: 7, c: 12 } },
    { say: "3 and 4! So x² + 7x + 12 = (x + 3)(x + 4). If two brackets multiply to make 0, one of them must BE 0." },
    { say: "So x + 3 = 0 or x + 4 = 0. That gives x = −3 or x = −4. Notice the signs flip at the end!" },
    { say: "Quick check!", ask: { q: "Which two numbers multiply to 10 and add to 7?", options: ["1 and 10", "2 and 5", "−2 and −5", "3 and 4"], answer: 1, yes: "Splendid! 2 × 5 = 10 and 2 + 5 = 7.", no: "List the pairs that multiply to 10: 1 and 10, 2 and 5. Which pair adds to 7? Try again!" } },
    { say: "Now solve it.", ask: { q: "x² + 7x + 10 = 0 has solutions…", options: ["x = 2 or x = 5", "x = −2 or x = −5", "x = 10", "x = 7"], answer: 1, yes: "Eureka! (x + 2)(x + 5) = 0, so x = −2 or x = −5.", no: "(x + 2)(x + 5) = 0 means x + 2 = 0 or x + 5 = 0. Solve each one. Watch the signs! Try again!" } },
  ],
};

export const hasHandBuiltLesson = id => !!LESSONS[id];
