"use strict";

const QuestionGen = (() => {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[rand(0, arr.length - 1)];

  const SHAPE_TEXT = ["مثلث", "مربع", "مستطيل", "دائرة", "مكعب"];

  function qAddSub(tier) {
    const roll = Math.random();
    let a = 1, b = 1, op = "+", answer = 0;

    if (tier <= 0) {
      if (roll < 0.55) { a = rand(1, 19); b = rand(1, 20 - a); op = "+"; answer = a + b; }
      else { a = rand(3, 20); b = rand(1, a); op = "-"; answer = a - b; }
    } else if (tier === 1) {
      if (roll < 0.55) { a = rand(1, 45); b = rand(1, 50 - a); op = "+"; answer = a + b; }
      else { a = rand(5, 50); b = rand(1, a - 1); op = "-"; answer = a - b; }
    } else if (tier === 2) {
      if (roll < 0.5) { a = rand(1, 90); b = rand(1, 100 - a); op = "+"; answer = a + b; }
      else { a = rand(10, 100); b = rand(1, a - 1); op = "-"; answer = a - b; }
    } else {
      if (roll < 0.45) { a = rand(1, 99); b = rand(1, 100 - a); op = "+"; answer = a + b; }
      else if (roll < 0.75) { a = rand(20, 100); b = rand(2, a - 2); op = "-"; answer = a - b; }
      else { a = rand(1, 90); b = rand(1, 100 - a); op = "+"; answer = a + b; }
    }

    return { text: a + " " + op + " " + b + " = ؟", answer: answer };
  }

  function qMultDiv(tier) {
    const roll = Math.random();
    let a = 1, b = 1, op = "×", answer = 0;

    if (tier <= 0) {
      a = rand(2, 4); b = rand(2, 5); op = "×"; answer = a * b;
    } else if (tier === 1) {
      a = rand(2, 6); b = rand(2, 6); op = "×"; answer = a * b;
    } else if (tier <= 3) {
      if (roll < 0.8) { a = rand(2, 9); b = rand(2, 9); op = "×"; answer = a * b; }
      else { b = rand(2, 6); answer = rand(2, 9); a = b * answer; op = "÷"; }
    } else {
      if (roll < 0.5) { a = rand(2, 12); b = rand(2, 9); op = "×"; answer = a * b; }
      else { b = rand(2, 12); answer = rand(2, 12); a = b * answer; op = "÷"; }
    }

    return { text: a + " " + op + " " + b + " = ؟", answer: answer };
  }

  function qNumbers(tier) {
    const max = [20, 50, 100, 200, 500, 500][Math.min(tier, 5)];
    const roll = Math.random();
    if (roll < 0.4) {
      let a = rand(2, max), b = rand(2, max);
      while (a === b) b = rand(2, max);
      return { text: "أي رقم أكبر: " + a + " أم " + b + "؟", answer: Math.max(a, b) };
    }
    if (roll < 0.7) {
      let a = rand(2, max), b = rand(2, max);
      while (a === b) b = rand(2, max);
      return { text: "أي رقم أصغر: " + a + " أم " + b + "؟", answer: Math.min(a, b) };
    }
    if (roll < 0.85) {
      const x = rand(2, Math.min(max - 1, 999));
      return { text: "ما الرقم الذي يلي " + x + "؟", answer: x + 1 };
    }
    const x = rand(12, Math.min(max, 1000));
    return { text: "ما الرقم الذي يسبق " + x + "؟", answer: x - 1 };
  }

  function qShapes() {
    const num = [
      { t: "كم ضلعاً للمربع؟", a: 4 },
      { t: "كم ضلعاً للمثلث؟", a: 3 },
      { t: "كم ضلعاً للمستطيل؟", a: 4 },
      { t: "كم ضلعاً للنجمة الخماسية؟", a: 5 },
      { t: "كم عدد وجوه المكعب؟", a: 6 },
      { t: "كم عدد أركان المكعب؟", a: 8 },
      { t: "كم عدد أركان المربع؟", a: 4 },
      { t: "كم عدد أركان المثلث؟", a: 3 },
      { t: "كم عدد زوايا المستطيل؟", a: 4 }
    ];
    const txt = [
      { t: "الشكل الذي له 3 أضلاع؟", a: "مثلث" },
      { t: "الشكل الذي له 4 أضلاع متساوية و 4 زوايا قائمة؟", a: "مربع" },
      { t: "الشكل الذي له ضلعان طويلان وضلعان قصيران؟", a: "مستطيل" },
      { t: "الشكل الدائري الذي لا زوايا له؟", a: "دائرة" },
      { t: "الشكل الذي له 6 وجوه مربعة؟", a: "مكعب" }
    ];
    if (Math.random() < 0.55) {
      const q = pick(num);
      return { text: q.t, answer: q.a };
    }
    const q = pick(txt);
    return { text: q.t, answer: q.a };
  }

  function qPatterns(tier) {
    if (tier <= 1) {
      const step = rand(2, 3);
      const start = rand(1, 15);
      const seq = [start, start + step, start + 2 * step];
      const answer = start + 3 * step;
      return { text: "أكمل النمط: " + seq.join(" ، ") + " ، ؟", answer: answer };
    }
    if (tier === 2) {
      const step = rand(2, 5);
      const start = rand(1, 10);
      const seq = [start, start + step, start + 2 * step, start + 3 * step];
      const answer = start + 4 * step;
      return { text: "أكمل النمط: " + seq.join(" ، ") + " ، ؟", answer: answer };
    }
    if (tier === 3) {
      const base = rand(2, 4);
      const mul = rand(2, 3);
      const a = base, b = base + mul, c = base + mul * 2, d = base + mul * 3;
      const answer = base + mul * 4;
      return { text: "أكمل: " + a + " ، " + b + " ، " + c + " ، " + d + " ، ؟", answer: answer };
    }
    if (tier === 4) {
      const a = rand(1, 5), b = rand(2, 4);
      const seq = [a, a + b, (a + b) * 2, (a + b) * 2 + b];
      const answer = ((a + b) * 2 + b) * 2;
      return { text: "أكمل: " + seq.join(" ، ") + " ، ؟", answer: answer };
    }
    const step = rand(3, 8);
    const start = rand(1, 10);
    const seq = [start, start + step, start + 3 * step, start + 6 * step];
    const answer = start + 10 * step;
    return { text: "أكمل: " + seq.join(" ، ") + " ، ؟", answer: answer };
  }

  function makeNumberChoices(answer, tier) {
    const choices = [answer];
    const spread = Math.max(3 + tier * 2, Math.round(answer * 0.1));
    let guard = 0;

    while (choices.length < 4 && guard < 400) {
      guard++;
      let d;
      if (Math.random() < 0.5) d = answer + rand(1, spread);
      else d = answer - rand(1, spread);
      if (d >= 0 && d !== answer && choices.indexOf(d) === -1) choices.push(d);
    }

    let fill = 1;
    while (choices.length < 4) {
      const d = answer + spread + fill;
      if (d >= 0 && choices.indexOf(d) === -1) choices.push(d);
      fill++;
    }

    for (let i = choices.length - 1; i > 0; i--) {
      const j = rand(0, i);
      const t = choices[i];
      choices[i] = choices[j];
      choices[j] = t;
    }

    return choices;
  }

  function makeTextChoices(correct, pool) {
    const choices = [correct];
    const others = pool.filter((x) => x !== correct);
    while (choices.length < 4 && others.length) {
      const idx = rand(0, others.length - 1);
      choices.push(others[idx]);
      others.splice(idx, 1);
    }
    for (let i = choices.length - 1; i > 0; i--) {
      const j = rand(0, i);
      const t = choices[i];
      choices[i] = choices[j];
      choices[j] = t;
    }
    return choices;
  }

  function makeQuestion(skill, tier) {
    let q;
    if (skill === "numbers") q = qNumbers(tier);
    else if (skill === "addsub") q = qAddSub(tier);
    else if (skill === "multdiv") q = qMultDiv(tier);
    else if (skill === "shapes") q = qShapes();
    else if (skill === "puzzles") q = qPatterns(tier);
    else q = qPatterns(tier);

    const isText = typeof q.answer === "string";
    const choices = isText ? makeTextChoices(q.answer, SHAPE_TEXT) : makeNumberChoices(q.answer, tier);
    return { text: q.text, answer: q.answer, choices: choices, isText: isText };
  }

  return {
    makeQuestion: makeQuestion,
    makeNumberChoices: makeNumberChoices,
    makeTextChoices: makeTextChoices
  };
})();