"use strict";

window.onerror = function(msg, src, line, col, err) {
  console.error("[GAME ERROR]", msg, "at", src + ":" + line + ":" + col);
  return false;
};
window.addEventListener("unhandledrejection", function(e) {
  console.error("[GAME UNHANDLED]", e.reason);
});

(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);

  const el = {
    hud: $("hud"), hudScore: $("hudScore"), hudBest: $("hudBest"),
    hudCombo: $("hudCombo"), chipCombo: $("chipCombo"), chipHearts: $("chipHearts"),
    chipTitle: $("chipTitle"), hudBar: $("hudBar"),
    questionBox: $("questionBox"), questionText: $("questionText"), banner: $("banner"),
    fireBtn: $("fireBtn"), exitBtn: $("exitBtn"),
    mainMenu: $("mainMenu"), worldsMenu: $("worldsMenu"), worldGrid: $("worldGrid"),
    howTo: $("howTo"), leaderMenu: $("leaderMenu"), leaderList: $("leaderList"),
    worldComplete: $("worldComplete"), wcTitle: $("wcTitle"), wcStars: $("wcStars"),
    wcScore: $("wcScore"), wcName: $("wcName"), wcNameBox: $("wcNameBox"),
    btnSaveWc: $("btnSaveWc"), wcSavedMsg: $("wcSavedMsg"), wcAutoMsg: $("wcAutoMsg"),
    btnStageNext: $("btnStageNext"),
    gameOver: $("gameOver"), goTitle: $("goTitle"), goInfo: $("goInfo"), goStars: $("goStars"),
    goName: $("goName"), goNameBox: $("goNameBox"), btnSaveGo: $("btnSaveGo"),
    goSavedMsg: $("goSavedMsg"), goAutoMsg: $("goAutoMsg"),
    pauseMenu: $("pauseMenu"), btnSound: $("btnSound"), menuBest: $("menuBest"),
    sectionsMenu: $("sectionsMenu"), secTitle: $("secTitle"), secGrid: $("secGrid"),
    matchBox: $("matchBox"), matchA: $("matchA"), matchB: $("matchB"),
    matchMisses: $("matchMisses"), matchDone: $("matchDone"),
    memBox: $("memBox"), memGrid: $("memGrid"), memMisses: $("memMisses"), memDone: $("memDone")
  };

  const Q_PER_WORLD = 10;
  const Q_PER_WAVE = 5;
  const HEARTS_MAX = 3;
  const WORLD_COUNT = 5;
  const LANE_X = [0.14, 0.38, 0.62, 0.86];

  const EXPLORE_THEMES = [
    { name: "كوكب الأرقام", desc: "الجمع والطرح حتى 20", bgA: "#0b1e4b", bgB: "#15317e", ground: "#1c3f94", bubble: "#4fc3f7", glow: "#4fc3f7", accent: "#ffd54f" },
    { name: "القمر الذهبي", desc: "الجمع والطرح حتى 50", bgA: "#2b1b0a", bgB: "#6b4a12", ground: "#8a5f1a", bubble: "#ffca28", glow: "#ffca28", accent: "#fff3c4" },
    { name: "النجم الأخضر", desc: "حتى 100 وبداية الضرب", bgA: "#032a1f", bgB: "#0d4d38", ground: "#16694d", bubble: "#66e07a", glow: "#66e07a", accent: "#b9f6ca" },
    { name: "الزهرة الأرجواني", desc: "جدول الضرب كاملاً", bgA: "#2a0b3f", bgB: "#4f1a73", ground: "#5c2b8a", bubble: "#ce93d8", glow: "#ce93d8", accent: "#f8bbd0" },
    { name: "مجرة الأبطال", desc: "الضرب والقسمة معاً", bgA: "#3d0a14", bgB: "#7a1626", ground: "#8e2330", bubble: "#ff8a80", glow: "#ff8a80", accent: "#ffd54f" }
  ];

  const PALETTES = [
    { bgA: "#081c44", bgB: "#12306b", ground: "#1d3f8f", bubble: "#58a6ff", glow: "#58a6ff", accent: "#8ec5ff" },
    { bgA: "#2b1b0a", bgB: "#6b4a12", ground: "#8a5f1a", bubble: "#ffca28", glow: "#ffca28", accent: "#fff3c4" },
    { bgA: "#2a0b3f", bgB: "#4f1a73", ground: "#5c2b8a", bubble: "#ce93d8", glow: "#ce93d8", accent: "#f8bbd0" },
    { bgA: "#032a1f", bgB: "#0d4d38", ground: "#16694d", bubble: "#66e07a", glow: "#66e07a", accent: "#b9f6ca" },
    { bgA: "#3d0a14", bgB: "#7a1626", ground: "#8e2330", bubble: "#ff8a80", glow: "#ff8a80", accent: "#ffd54f" }
  ];

  const SKILLS = [
    { id: "numbers", name: "عالم الأرقام", desc: "المقارنة والترتيب", pal: 0 },
    { id: "addsub", name: "عالم الجمع والطرح", desc: "حتى 100", pal: 1 },
    { id: "multdiv", name: "عالم الضرب والقسمة", desc: "جداول الضرب", pal: 2 },
    { id: "shapes", name: "عالم الأشكال", desc: "الأشكال والزوايا", pal: 3 },
    { id: "puzzles", name: "عالم الألغاز", desc: "الأنماط والمسائل", pal: 4 }
  ];

  const SKILL_PLANETS = [
    ["نجم الأرقام", "قمر المقارنة", "كوكب التسلسل"],
    ["كويكب الجمع", "كوكب الجمع والطرح", "مجرة الحساب"],
    ["نجمة الضرب", "كوكب جداول الضرب", "سديم القسمة"],
    ["بلورة الأشكال", "مملكة الأشكال", "قلعة الهندسة"],
    ["لغز النمط", "كوكب الأنماط", "مجرّة الألغاز"]
  ];
  const SKILL_TIERS = [0, 2, 4];

  const MODES = [
    { id: "m_catch", name: "التقاط الإجابات", desc: "الطريقة الكلاسيكية الممتعة", kind: "catch", skill: "addsub", tier: 2 },
    { id: "m_match", name: "توصيل الأزواج", desc: "صِل كل سؤال بإجابته", kind: "match", skill: "addsub", tier: 2 },
    { id: "m_memory", name: "بطاقات الذاكرة", desc: "مستوى أرقام + مستوى معادلات", kind: "memory", skill: "addsub", tier: 1 },
    { id: "m_sprint", name: "تحدي الستين ثانية", desc: "أكبر عدد إجابات في 60 ثانية", kind: "sprint", skill: "addsub", tier: 2 },
    { id: "m_boss", name: "معركة الزعماء", desc: "10 مراحل - حل الأسئلة لهزم الزعيم", kind: "boss", skill: "multdiv", tier: 3 }
  ];

  const ADVENTURES = [
    { id: "a_explore", name: "استكشاف الكواكب", desc: "الرحلة الرئيسية عبر 5 كواكب", kind: "explore" },
    { id: "a_rescue", name: "مهمة الإنقاذ", desc: "أنقذ النجمة قبل نفاد الوقت", kind: "rescue", skill: "addsub", tier: 2, time: 45, target: 8 },
    { id: "a_gauntlet", name: "متاهة العمالقة", desc: "واجه 3 زعماء متتاليين", kind: "gauntlet", skill: "multdiv", tiers: [2, 3, 4], hp: [4, 5, 6] },
    { id: "a_daily", name: "النجوم السرية", desc: "مهمة جديدة كل يوم", kind: "daily" }
  ];

  const ENDLESS_SKILLS = ["addsub", "addsub", "multdiv", "multdiv", "numbers", "shapes", "puzzles"];
  const DAILY_SKILLS = ["numbers", "addsub", "multdiv", "shapes", "puzzles", "addsub", "numbers"];

  const SCENARIOS = {};
  (function buildScenarios() {
    SKILLS.forEach((sk, si) => {
      for (let p = 0; p < 3; p++) {
        const id = "sk_" + si + "_" + p;
        SCENARIOS[id] = { id: id, name: SKILL_PLANETS[si][p], kind: "catch", skill: sk.id, tier: SKILL_TIERS[p], desc: sk.name + " · مستوى " + (p + 1) };
      }
    });
    MODES.forEach((m) => { SCENARIOS[m.id] = m; });
    ADVENTURES.forEach((a) => { SCENARIOS[a.id] = a; });
    SCENARIOS.endless = { id: "endless", name: "التحدي اللامتناهي", kind: "endless", skill: "addsub", tier: 0 };
  })();

  const store = {
    get: function (key, def) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    }
  };

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let state = "MENU";
  let scenario = null;
  let world = 0;
  let score = 0, best = 0, combo = 0;
  let hearts = HEARTS_MAX, mistakes = 0;
  let answered = 0, wave = 0;
  let question = null, bubbles = [];
  let lasers = [], laserCooldown = 0;
  let speed = 1;
  let starsArr = [], particles = [], floaties = [], meteors = [], dust = [];
  let flashAlpha = 0, flashColor = "#ffffff";
  let rocket = { x: 0, y: 0, w: 72, h: 80, targetX: 0, tilt: 0, flameT: 0 };
  let groundY = 0;
  let keys = {}, pointerActive = false, lastPointerX = null;
  let lastTime = 0;
  let bannerTimer = null;
  let pendingEntryId = null;
  let bossHp = 0, bossHpMax = 0, bossIdx = 0;
  let bossX = 0, bossY = 0, bossW = 100, bossH = 100;
  let bossProjectiles = [], bossAttackTimer = 0, bossAttackInterval = 1.8;
  let bossPhase = 0, bossMoveDir = 1, bossMoveSpeed = 80;
  let bossStage = 0, bossStageMax = 10;
  const BOSS_BASE_HP = 3;
  let timerActive = false, timeLeft = 0, timerMax = 1;
  let secTab = "skills";
  let matchSel = null, matchMiss = 0, matchDoneCount = 0, matchBusy = false;
  let memCards = [], memOpen = [], memMiss = 0, memMatched = 0, memBusy = false;
  const MEMORY_LEVELS = 2, MEMORY_STAGES = 10, MEMORY_CHALLENGES = 10;
  let memLevel = 1, memStage = 1, memChallenge = 0;

  function theme() {
    if (!scenario) return EXPLORE_THEMES[0];
    if (scenario.kind === "explore") return EXPLORE_THEMES[world];
    if (scenario.kind === "endless") return EXPLORE_THEMES[Math.min(4, Math.floor(wave / 3))];
    const sk = SKILLS.find((s) => s.id === scenario.skill) || SKILLS[1];
    const pal = PALETTES[sk.pal];
    return { name: scenario.name, desc: scenario.desc, bgA: pal.bgA, bgB: pal.bgB, ground: pal.ground, bubble: pal.bubble, glow: pal.glow, accent: pal.accent };
  }

  function tierNow() {
    if (scenario.kind === "explore") return world;
    if (scenario.kind === "endless") return Math.min(5, Math.floor(wave / 2));
    return scenario.tier;
  }

  function skillNow() {
    if (scenario.kind === "endless") return ENDLESS_SKILLS[Math.min(wave, ENDLESS_SKILLS.length - 1)];
    return scenario.skill || "addsub";
  }

  function bubbleR() { return Math.min(52, 40 + Math.min(W, H) * 0.018); }

  function laneX(i) { return W * LANE_X[i]; }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function buildDailyScenario() {
    const skill = DAILY_SKILLS[new Date().getDay()];
    const sk = SKILLS.find((s) => s.id === skill);
    return { id: "a_daily", name: "مهمة اليوم: " + sk.name, kind: "daily", skill: skill, tier: 2, daily: true };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    groundY = H - 88;
    rocket.y = groundY - rocket.h + 8;
    rocket.x = Math.min(Math.max(rocket.x, rocket.w / 2), W - rocket.w / 2);
    rocket.targetX = rocket.x;
    buildStars();
    buildDust();
    if (state === "PLAY" && bubbles.length) repositionBubbles();
  }

  function buildStars() {
    starsArr = [];
    const n = Math.floor((W * H) / 12000);
    for (let i = 0; i < n; i++) {
      starsArr.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.8,
        r: Math.random() * 1.8 + 0.5,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 2 + 0.5
      });
    }
  }

  function buildDust() {
    dust = [];
    for (let i = 0; i < 26; i++) {
      dust.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.6,
        sp: Math.random() * 14 + 6,
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  function repositionBubbles() {
    bubbles.forEach((b) => { b.x = laneX(b.lane); });
  }

  function show(id) { id.classList.remove("hidden"); }
  function hide(id) { id.classList.add("hidden"); }

  function setQuestion(text) {
    el.questionText.textContent = text;
    show(el.questionBox);
  }

  function showBanner(text, ms) {
    el.banner.innerHTML = "<span>" + text + "</span>";
    show(el.banner);
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => hide(el.banner), ms || 2400);
  }function newRound() {
    const isText = scenario.kind === "match" || scenario.kind === "memory";
    question = QuestionGen.makeQuestion(skillNow(), tierNow(), isText);
    if (!question) {
      showBanner("انتهت الأسئلة، أحسنت!");
      endGame();
      return;
    }
    setQuestion(question.text);
    if (scenario.kind === "match" || scenario.kind === "memory") return;
    const lanes = shuffle([0, 1, 2, 3]);
    const r = bubbleR();
    bubbles = [];
    for (let i = 0; i < 4; i++) {
      bubbles.push({
        lane: lanes[i],
        x: laneX(lanes[i]),
        y: -r,
        r: r,
        text: question.choices[i],
        correct: question.choices[i] === question.answer,
        speed: speed * (0.55 + Math.random() * 0.55),
        wob: Math.random() * Math.PI * 2
      });
    }
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = Math.random() * 300 + 60;
      particles.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: Math.random() * 0.7 + 0.3, maxLife: 1,
        r: Math.random() * 4 + 2, color: color
      });
    }
  }

  function floatText(text, x, y, color, size) {
    floaties.push({ text: text, x: x, y: y, life: 1, color: color, size: size || 22 });
  }

  function flash(color, alpha) {
    flashColor = color;
    flashAlpha = alpha || 0.5;
  }

  function starsByMisses() {
    return mistakes <= 0 ? 3 : mistakes === 1 ? 2 : 1;
  }

  function saveStars(id, stars) {
    const all = store.get("mfg_stars2", {});
    if (!all[id] || stars > all[id]) all[id] = stars;
    store.set("mfg_stars2", all);
    if (scenario.kind === "explore") {
      const arr = store.get("mfg_stars", []);
      if (!arr[world] || stars > arr[world]) arr[world] = stars;
      store.set("mfg_stars", arr);
    }
    if (scenario.kind === "daily" && stars > 0) {
      const d = store.get("mfg_daily", {});
      d[todayStr()] = stars;
      store.set("mfg_daily", d);
    }
  }

  function recordRun(entryName) {
    const name = String(entryName || "لاعب").slice(0, 14);
    const leaderboard = store.get("mfg_leaderboard", []);
    pendingEntryId = Date.now();
    leaderboard.push({ id: pendingEntryId, name: name, score: score, mode: scenario ? scenario.kind : "" });
    leaderboard.sort((a, b) => b.score - a.score);
    store.set("mfg_leaderboard", leaderboard.slice(0, 100));
  }

  function claimEntry() {
    const leaderboard = store.get("mfg_leaderboard", []);
    const entry = leaderboard.find((e) => e.id === pendingEntryId);
    if (!entry) return;
    entry.name = String(el.wcName.value.trim() || "لاعب").slice(0, 14);
    store.set("mfg_leaderboard", leaderboard);
  }

  function updateHud() {
    el.hudScore.textContent = score;
    el.hudBest.textContent = best;
    el.chipCombo.textContent = combo;
    el.chipHearts.textContent = "❤".repeat(Math.max(0, hearts));
    if (scenario && scenario.kind === "boss") {
      el.chipTitle.textContent = "مرحلة " + bossStage + "/10 · HP " + bossHp;
      el.hudBar.className = "hud-bar";
      el.hudBar.style.width = ((bossHp / bossHpMax) * 100).toFixed(1) + "%";
    } else if (scenario && scenario.kind === "match") {
      el.chipTitle.textContent = "الأزواج: " + matchDoneCount + " / 6";
      el.hudBar.className = "hud-bar";
      el.hudBar.style.width = ((matchDoneCount / 6) * 100).toFixed(1) + "%";
    } else if (scenario && scenario.kind === "memory") {
      el.chipTitle.textContent = "المستوى " + memLevel + " · مرحلة " + memStage + " · " + memMatched + " / 4";
      el.hudBar.className = "hud-bar";
      el.hudBar.style.width = ((memMatched / 4) * 100).toFixed(1) + "%";
    } else if (scenario && (scenario.kind === "sprint" || scenario.kind === "rescue")) {
      el.chipTitle.textContent = "الوقت: " + Math.ceil(timeLeft);
      el.hudBar.className = "hud-bar time";
      el.hudBar.style.width = ((timeLeft / timerMax) * 100).toFixed(1) + "%";
    } else {
      el.chipTitle.textContent = "المرحلة " + (answered + 1);
      el.hudBar.className = "hud-bar";
      el.hudBar.style.width = ((answered / Q_PER_WORLD) * 100).toFixed(1) + "%";
    }
  }

  function beginPlay() {
    state = "PLAY";
    hide(el.mainMenu); hide(el.worldsMenu); hide(el.sectionsMenu);
    hide(el.howTo); hide(el.leaderMenu); hide(el.worldComplete);
    hide(el.gameOver); hide(el.pauseMenu); hide(el.matchBox); hide(el.memBox);
    show(el.hud); show(el.exitBtn);
    if (scenario.kind === "match" || scenario.kind === "memory") {
      hide(el.questionBox); hide(el.fireBtn);
    } else {
      show(el.questionBox); show(el.fireBtn);
    }
    updateHud();
  }

  function startScenario(id) {
    if (id === "a_explore") { showWorldsMenu(); return; }
    scenario = SCENARIOS[id] || SCENARIOS.sk_0_0;
    if (id === "a_daily") scenario = buildDailyScenario();
    if (id === "endless") best = store.get("mfg_best", 0);
    startRun();
  }

  function startWorld(i) {
    scenario = SCENARIOS.a_explore;
    world = i;
    startRun();
  }

  function startRun() {
    score = 0; combo = 0; hearts = HEARTS_MAX; mistakes = 0;
    answered = 0; wave = 0; speed = 1;
    bubbles = []; lasers = []; particles = []; floaties = [];
    bossIdx = 0; bossHpMax = 0; bossHp = 0;
    bossProjectiles = []; bossAttackTimer = 1.5; bossPhase = 0; bossMoveDir = 1; bossMoveSpeed = 80;
    timerActive = false;
    matchSel = null; matchMiss = 0; matchDoneCount = 0; matchBusy = false;
    memOpen = []; memMiss = 0; memMatched = 0; memBusy = false;
    memLevel = 1; memStage = 1; memChallenge = 0;
    rocket.targetX = W / 2; rocket.x = W / 2;
    if (scenario.kind === "sprint") {
      timerMax = 60; timeLeft = 60; timerActive = true;
      showBanner("ستون ثانية! ابدأ!");
    } else if (scenario.kind === "rescue") {
      timerMax = scenario.time; timeLeft = scenario.time; timerActive = true;
      showBanner("أنقذ النجمة! " + scenario.target + " إجابات");
    } else if (scenario.kind === "boss") {
      bossStage = 1;
      bossHpMax = BOSS_BASE_HP; bossHp = bossHpMax;
      bossX = W / 2; bossY = 70;
      bossAttackInterval = 1.8;
      bossProjectiles = [];
      showBanner("مرحلة 1 من 10 - الزعيم ظهر!");
    } else if (scenario.kind === "gauntlet") {
      bossIdx = 0;
      scenario.tier = scenario.tiers[0];
      bossHpMax = scenario.hp[0]; bossHp = scenario.hp[0];
      bossX = W / 2; bossY = 70;
      bossProjectiles = [];
      showBanner("الزعيم " + 1 + " قادم!");
    } else if (scenario.kind === "endless") {
      showBanner("التحدي اللامتناهي!");
    } else if (scenario.kind === "daily") {
      showBanner("مهمة اليوم! " + scenario.name);
    } else {
      showBanner(theme().name);
    }
    beginPlay();
    updateHud();
    if (scenario.kind === "match") setupMatch();
    else if (scenario.kind === "memory") setupMemory();
    else newRound();
  }

  function catchCorrect(bx, by) {
    try {
      answered++;
      combo = combo >= 3 ? 0 : combo + 1;
      score += 10 + Math.min(50, (combo - 1) * 5);
      hearts = HEARTS_MAX;
      Sound.correct();
      flash("#7dff8a", 0.14);
      burst(bx || rocket.x, by || rocket.y, "#7dff8a", 16);
      floatText("+" + (10 + Math.min(50, (combo - 1) * 5)), (bx || rocket.x), (by || rocket.y) - 20, "#b6ffc0", 22);
      if (scenario.kind === "boss") {
        bossHp--;
        Sound.boom();
        burst(bossX, bossY, "#ff8a80", 10);
        if (bossHp <= 0) {
          score += bossStage * 10;
          bossDefeated();
        } else {
          newRound();
        }
      } else if (scenario.kind === "endless") {
        const waveQ = Q_PER_WAVE * (wave + 1);
        if (answered >= waveQ) {
          wave++;
          speed = Math.min(3, 1 + wave * 0.25);
          score += wave * 10;
          combo = 0;
          showBanner("موجة " + (wave + 1) + "! " + skillNowLabel(), 2000);
          Sound.levelUp();
        }
      } else {
        speed = Math.min(2.2, 1 + answered * 0.05);
      }
      updateHud();
      if (scenario.kind === "boss") return;
      else if (scenario.kind === "endless") newRound();
      else if (answered >= Q_PER_WORLD && scenario.kind !== "sprint" && scenario.kind !== "rescue") {
        completeStage(starsByMisses(), "أكملت المرحلة!", "حصلت على " + score + " نقطة");
      } else newRound();
    } catch (e) {
      console.error("[CATCH CORRECT ERROR]", e.message);
    }
  }

  function skillNowLabel() {
    const sk = SKILLS.find((s) => s.id === skillNow());
    return sk ? sk.name : "";
  }

  function catchWrong() {
    hearts--;
    mistakes++;
    combo = 0;
    Sound.wrong();
    flash("#ff5252", 0.22);
    if (hearts <= 0) {
      endGame();
      return;
    }
    updateHud();
    newRound();
  }

  function laserHit(bubble) {
    if (bubble.correct) {
      bubbles = bubbles.filter((b) => b !== bubble);
      catchCorrect(bubble.x, bubble.y);
    } else {
      bubbles = bubbles.filter((b) => b !== bubble);
      catchWrong();
    }
  }

  function shoot() {
    try {
      if (state !== "PLAY") return;
      if (scenario.kind === "match" || scenario.kind === "memory") return;
      if (laserCooldown > 0) return;
      laserCooldown = 0.24;
      lasers.push({ x: rocket.x, y: rocket.y - rocket.h * 0.6, vy: -700 });
      Sound.laser();
    } catch (e) {
      console.error("[SHOOT ERROR]", e.message);
    }
  }

  function bossDefeated() {
    bossProjectiles = [];
    burst(bossX, bossY, "#ffd740", 30);
    if (scenario.kind === "boss") {
      if (bossStage >= bossStageMax) {
        completeStage(starsByMisses(), "هزمت الزعيم!", "معركة الزعماء: " + score + " نقطة");
        return;
      }
      bossStage++;
      bossHpMax = BOSS_BASE_HP + bossStage * 2;
      bossHp = bossHpMax;
      bossX = W / 2;
      bossMoveDir *= -1;
      showBanner("مرحلة " + bossStage + " من 10", 2200);
      Sound.levelUp();
      newRound();
      updateHud();
      return;
    }
    if (scenario.kind === "gauntlet") {
      bossIdx++;
      if (bossIdx >= scenario.tiers.length) {
        completeStage(starsByMisses(), "هزمت كل العمالقة!", "متاهة العمالقة: " + score + " نقطة");
        return;
      }
      scenario.tier = scenario.tiers[bossIdx];
      bossHpMax = scenario.hp[bossIdx];
      bossHp = bossHpMax;
      bossX = W / 2;
      showBanner("الزعيم " + (bossIdx + 1) + " قادم!", 2200);
      Sound.levelUp();
      newRound();
      updateHud();
      return;
    }
    completeStage(starsByMisses(), "هزمت زعيم المجرة!", "معركة الزعماء: " + score + " نقطة");
  }

  function rescueSuccess() {
    completeStage(answered >= 10 ? 3 : 2, "أنقذت النجمة!", "مهمة الإنقاذ: " + score + " نقطة");
  }

  function rescueFail() {
    completeStage(answered >= 5 ? 1 : 0, "فشلت المهمة هذه المرة", "مهمة الإنقاذ: " + answered + " إجابات صحيحة");
  }

  function completeStage(stars, title, msg) {
    state = "STAGEDONE";
    hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    hide(el.exitBtn);
    saveStars(scenario.id, stars);
    const detail = scenario.kind === "explore" ? EXPLORE_THEMES[world].name : scenario.name;
    el.wcTitle.textContent = title;
    el.wcStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    el.wcScore.textContent = msg;
    el.btnStageNext.textContent = (scenario.kind === "explore" && world + 1 < WORLD_COUNT) ? "الكوكب التالي" : "المرحلة التالية";
    el.wcNameBox.classList.add("hidden");
    el.wcNameBox.style.display = "none";
    recordRun(detail);
    show(el.worldComplete);
    Sound.worldWin();
    setTimeout(function() { nextStage(); }, 2200);
  }

  function endGame() {
    state = "GAMEOVER";
    hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    hide(el.exitBtn);
    let stars = 0;
    const detail = scenario.kind === "explore" ? EXPLORE_THEMES[world].name : scenario.name;
    if (scenario.kind === "sprint") {
      el.goTitle.textContent = "انتهت الستون ثانية!";
      el.goInfo.textContent = "أجبت " + answered + " إجابة صحيحة، نقاطك: " + score;
      stars = answered >= 20 ? 3 : answered >= 12 ? 2 : answered >= 6 ? 1 : 0;
    } else if (scenario.kind === "endless") {
      if (score > best) { best = score; store.set("mfg_best", best); }
      el.goTitle.textContent = "انتهت الرحلة!";
      el.goInfo.textContent = "أجبت " + answered + " سؤالاً ووصلت إلى الموجة " + (wave + 1) + "، نقاطك: " + score;
      stars = answered >= 40 ? 3 : answered >= 25 ? 2 : answered >= 12 ? 1 : 0;
    } else {
      el.goTitle.textContent = "أكملت " + answered + " من " + Q_PER_WORLD + " أسئلة";
      el.goInfo.textContent = "حاول مرة أخرى! نقاطك: " + score;
    }
    el.goStars.textContent = stars ? "★".repeat(stars) + "☆".repeat(3 - stars) : "";
    el.goNameBox.classList.remove("hidden");
    el.goNameBox.style.display = "flex";
    el.goName.value = "";
    el.btnSaveGo.disabled = false;
    show(el.goAutoMsg);
    hide(el.goSavedMsg);
    recordRun(detail);
    show(el.gameOver);
    Sound.gameOver();
  }

  function nextStage() {
    hide(el.worldComplete);
    if (scenario.kind === "explore" && world + 1 < WORLD_COUNT) startWorld(world + 1);
    else startScenario(scenario.id);
  }

  function retry() {
    hide(el.gameOver);
    startScenario(scenario.id);
  }

  function setupMatch() {
    el.memBox.classList.add("hidden");
    el.matchBox.classList.remove("hidden");
    const left = [], right = [];
    const used = new Set();
    for (let i = 0; i < 6; i++) {
      let q = QuestionGen.makeQuestion(skillNow(), tierNow());
      let guard = 0;
      while (used.has(q.text) && guard < 8) { q = QuestionGen.makeQuestion(skillNow(), tierNow()); guard++; }
      used.add(q.text);
      left.push({ key: q.text, text: q.text });
      right.push({ key: q.text, text: String(q.answer) });
    }
    shuffle(right);
    matchSel = null; matchMiss = 0; matchDoneCount = 0; matchBusy = false;
    el.matchMisses.textContent = "0";
    el.matchDone.textContent = "0 / 6";
    renderMatchSide(el.matchA, left, false);
    renderMatchSide(el.matchB, right, true);
  }

  function renderMatchSide(container, items, isRight) {
    container.innerHTML = "";
    items.forEach((it, idx) => {
      const btn = document.createElement("button");
      btn.className = "match-card" + (isRight ? " right" : "");
      btn.textContent = it.text;
      btn.setAttribute("data-key", it.key);
      btn.addEventListener("click", () => matchPick(btn, isRight));
      container.appendChild(btn);
    });
  }

  function matchPick(btn, isRight) {
    try {
      if (matchBusy) return;
      if (btn.classList.contains("done")) return;
      Sound.click();
      if (matchSel === null) {
        matchSel = { btn: btn, key: btn.getAttribute("data-key"), right: isRight };
        btn.classList.add("sel");
        return;
      }
      if (matchSel.btn === btn) {
        btn.classList.remove("sel");
        matchSel = null;
        return;
      }
      if (matchSel.right === isRight) {
        matchSel.btn.classList.remove("sel");
        matchSel = btn;
        btn.classList.add("sel");
        return;
      }
      matchBusy = true;
      const a = matchSel, b = btn;
      a.btn.classList.remove("sel");
      if (a.key === b.getAttribute("data-key")) {
        a.btn.classList.add("done");
        b.classList.add("done");
        matchDoneCount++;
        el.matchDone.textContent = matchDoneCount + " / 6";
        combo++;
        score += 10 + Math.min(50, combo * 5);
        updateHud();
        Sound.correct();
        floatText("+10", b.offsetLeft + 60, b.offsetTop - 10, "#b6ffc0", 20);
        matchBusy = false;
        if (matchDoneCount >= 6) completeStage(starsByMisses(), "وصلت كل الأزواج!", "التوصيل: " + score + " نقطة");
    } else {
      matchMiss++;
      el.matchMisses.textContent = matchMiss;
      mistakes++;
      Sound.wrong();
      flash("#ff5252", 0.16);
      a.btn.classList.add("bad");
      b.classList.add("bad");
      setTimeout(() => {
        a.btn.classList.remove("bad");
        b.classList.remove("bad");
        matchBusy = false;
      }, 450);
    }
    matchSel = null;
    } catch (e) {
      console.error("[MATCH PICK ERROR]", e.message);
      matchSel = null;
      matchBusy = false;
    }
  }

  function setupMemory() {
    el.matchBox.classList.add("hidden");
    el.memBox.classList.remove("hidden");
    const pairs = [];
    const used = new Set();
    if (memLevel === 1) {
      for (let i = 0; i < 4; i++) {
        let q = QuestionGen.makeQuestion(skillNow(), tierNow());
        let guard = 0;
        while (used.has(q.answer) && guard < 8) { q = QuestionGen.makeQuestion(skillNow(), tierNow()); guard++; }
        used.add(q.answer);
        const answerText = String(q.answer);
        pairs.push({ text: answerText }, { text: answerText });
      }
    } else {
      for (let i = 0; i < 4; i++) {
        let q = QuestionGen.makeQuestion("addsub", Math.min(tierNow() + 1, 4));
        let guard = 0;
        while (used.has(String(q.answer)) && guard < 8) { q = QuestionGen.makeQuestion("addsub", Math.min(tierNow() + 1, 4)); guard++; }
        used.add(String(q.answer));
        const qText = q.text.replace(" = ؟", "");
        pairs.push({ text: qText, answer: String(q.answer) });
        pairs.push({ text: String(q.answer), answer: String(q.answer) });
      }
    }
    shuffle(pairs);
    memCards = pairs.map((p, i) => ({ i: i, text: p.text, answer: p.answer || p.text, open: false, matched: false }));
    memOpen = []; memMiss = 0; memMatched = 0; memBusy = false;
    el.memMisses.textContent = "0";
    el.memDone.textContent = "0 / 4";
    el.memGrid.innerHTML = "";
    memCards.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "mem-card";
      btn.setAttribute("data-i", c.i);
      btn.addEventListener("click", () => memFlip(btn));
      el.memGrid.appendChild(btn);
    });
  }

  function memFlip(btn) {
    if (memBusy) return;
    try {
    const c = memCards[Number(btn.getAttribute("data-i"))];
    if (c.open || c.matched) return;
    Sound.click();
    c.open = true;
    btn.classList.add("open");
    btn.textContent = c.text;
    memOpen.push({ btn: btn, card: c });
    if (memOpen.length === 2) {
      memBusy = true;
      const [a, b] = memOpen;
      memOpen = [];
      const matchBy = memLevel === 1 ? "text" : "answer";
      if (a.card[matchBy] === b.card[matchBy]) {
        a.card.matched = true;
        b.card.matched = true;
        a.btn.classList.add("done");
        b.btn.classList.add("done");
        memMatched++;
        el.memDone.textContent = memMatched + " / 4";
        combo++;
        score += 10 + Math.min(50, combo * 5);
        updateHud();
        Sound.correct();
        if (memMatched >= 4) {
          memChallenge++;
          if (memChallenge >= MEMORY_CHALLENGES) {
            memStage++;
            memChallenge = 0;
            if (memStage > MEMORY_STAGES) {
              memLevel++;
              memStage = 1;
              if (memLevel > MEMORY_LEVELS) {
                completeStage(starsByMisses(), "أكملت كل مستويات الذاكرة!", "الذاكرة: " + score + " نقطة");
                return;
              }
              showBanner("المستوى " + memLevel + "! " + (memLevel === 2 ? "معادلات حسابية" : "أرقام"), 2000);
            } else {
              showBanner("مرحلة " + memStage + " / " + MEMORY_STAGES, 1500);
            }
          }
          setupMemory();
        }
        memBusy = false;
      } else {
        memMiss++;
        el.memMisses.textContent = memMiss;
        mistakes++;
        Sound.wrong();
        flash("#ff5252", 0.16);
        setTimeout(() => {
          a.card.open = false;
          b.card.open = false;
          a.btn.classList.remove("open");
          b.btn.classList.remove("open");
          a.btn.textContent = "";
          b.btn.textContent = "";
          memBusy = false;
        }, 550);
      }
    }
    } catch (e) {
      console.error("[MEM FLIP ERROR]", e.message);
      memBusy = false;
    }
  }function showMainMenu() {
    state = "MENU";
    best = store.get("mfg_best", 0);
    el.menuBest.textContent = best;
    hide(el.worldsMenu); hide(el.sectionsMenu); hide(el.howTo); hide(el.leaderMenu);
    hide(el.worldComplete); hide(el.gameOver); hide(el.pauseMenu);
    hide(el.hud); hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    hide(el.exitBtn);
    show(el.mainMenu);
  }

  function showWorldsMenu() {
    state = "WORLDS";
    hide(el.mainMenu); hide(el.sectionsMenu); hide(el.howTo); hide(el.leaderMenu);
    hide(el.worldComplete); hide(el.gameOver); hide(el.pauseMenu);
    hide(el.hud); hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    show(el.worldsMenu);
    const allStars = store.get("mfg_stars", []);
    el.worldGrid.innerHTML = "";
    EXPLORE_THEMES.forEach((t, i) => {
      const card = document.createElement("button");
      card.className = "world-card";
      card.style.background = "linear-gradient(135deg, " + t.bgA + ", " + t.bgB + ")";
      card.innerHTML =
        "<span class='wc-name'>" + t.name + "</span>" +
        "<span class='wc-desc'>" + t.desc + "</span>" +
        "<span class='wc-stars'>" + "★".repeat(allStars[i] || 0) + "☆".repeat(3 - (allStars[i] || 0)) + "</span>";
      card.addEventListener("click", () => { Sound.click(); startWorld(i); });
      el.worldGrid.appendChild(card);
    });
  }

  function showSectionsMenu() {
    state = "SECTIONS";
    hide(el.mainMenu); hide(el.worldsMenu); hide(el.howTo); hide(el.leaderMenu);
    hide(el.worldComplete); hide(el.gameOver); hide(el.pauseMenu);
    hide(el.hud); hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    show(el.sectionsMenu);
    renderSections();
  }

  function renderSections() {
    document.querySelectorAll(".sec-tab").forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-sec-tab") === secTab);
    });
    const allStars = store.get("mfg_stars2", {});
    const dailyStars = store.get("mfg_daily", {});
    el.secGrid.innerHTML = "";
    if (secTab === "skills") {
      el.secTitle.textContent = "أقسام المهارات";
      SKILLS.forEach((sk, si) => {
        for (let p = 0; p < 3; p++) {
          const id = "sk_" + si + "_" + p;
          const pal = PALETTES[sk.pal];
          makeSecCard(id, SKILL_PLANETS[si][p], sk.name + " · مستوى " + (p + 1), pal, allStars[id] || 0);
        }
      });
    } else if (secTab === "modes") {
      el.secTitle.textContent = "أساليب اللعب";
      MODES.forEach((m) => {
        const pal = PALETTES[SKILLS.find((s) => s.id === m.skill).pal];
        makeSecCard(m.id, m.name, m.desc, pal, allStars[m.id] || 0);
      });
    } else {
      el.secTitle.textContent = "المغامرة";
      ADVENTURES.forEach((a) => {
        if (a.id === "a_daily") {
          const d = buildDailyScenario();
          const done = dailyStars[todayStr()] || 0;
          const pal = PALETTES[SKILLS.find((s) => s.id === d.skill).pal];
          makeSecCard(a.id, a.name, done ? "أنجزت مهمة اليوم!" : "مهمة اليوم: " + d.name.replace("مهمة اليوم: ", ""), pal, done);
        } else if (a.id === "a_explore") {
          makeSecCard(a.id, a.name, a.desc, EXPLORE_THEMES[0], allStars[a.id] || 0);
        } else {
          const pal = PALETTES[2];
          makeSecCard(a.id, a.name, a.desc, pal, allStars[a.id] || 0);
        }
      });
    }
  }

  function makeSecCard(id, name, desc, pal, stars) {
    const card = document.createElement("button");
    card.className = "world-card";
    card.style.background = "linear-gradient(135deg, " + pal.bgA + ", " + pal.bgB + ")";
    card.innerHTML =
      "<span class='wc-name'>" + name + "</span>" +
      "<span class='wc-desc'>" + desc + "</span>" +
      "<span class='wc-stars'>" + "★".repeat(stars) + "☆".repeat(3 - stars) + "</span>";
    card.addEventListener("click", () => { Sound.click(); startScenario(id); });
    el.secGrid.appendChild(card);
  }

  function showLeaderMenu() {
    state = "LEADER";
    hide(el.mainMenu); hide(el.worldsMenu); hide(el.sectionsMenu); hide(el.howTo);
    hide(el.worldComplete); hide(el.gameOver); hide(el.pauseMenu);
    hide(el.hud); hide(el.questionBox); hide(el.fireBtn); hide(el.matchBox); hide(el.memBox);
    show(el.leaderMenu);
    renderLeaderboard();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderLeaderboard() {
    const rows = store.get("mfg_leaderboard", []);
    el.leaderList.innerHTML = "";
    if (!rows.length) {
      el.leaderList.innerHTML = "<div class='lb-empty'>لا توجد نتائج بعد، كن أول الأبطال!</div>";
      return;
    }
    const header = document.createElement("div");
    header.className = "leader-header";
    header.innerHTML =
      "<span>#</span>" +
      "<span>اللاعب</span>" +
      "<span>الأسلوب</span>" +
      "<span>النقاط</span>";
    el.leaderList.appendChild(header);
    const medals = ["🥇", "🥈", "🥉"];
    const top = rows.slice(0, 10);
    top.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "leader-row" + (i === 0 ? " leader-top1" : i === 1 ? " leader-top2" : i === 2 ? " leader-top3" : "");
      const modeLabels = { catch: "التقاط", match: "توصيل", memory: "ذاكرة", sprint: "سبيد", boss: "زعيم", gauntlet: "عمالقة", rescue: "إنقاذ", explore: "استكشاف", endless: "لامتناهي", daily: "يومي" };
      const modeName = modeLabels[r.mode] || r.mode || "";
      row.innerHTML =
        "<span class='lb-rank'>" + (i < 3 ? medals[i] : (i + 1)) + "</span>" +
        "<span class='lb-name'>" + escapeHtml(r.name) + "</span>" +
        "<span class='lb-mode'>" + modeName + "</span>" +
        "<span class='lb-score'>" + r.score.toLocaleString() + "</span>";
      el.leaderList.appendChild(row);
    });
  }

  function togglePause() {
    if (state === "PLAY") {
      state = "PAUSE";
      show(el.pauseMenu);
      hide(el.fireBtn);
    } else if (state === "PAUSE") {
      state = "PLAY";
      hide(el.pauseMenu);
      if (scenario.kind !== "match" && scenario.kind !== "memory") show(el.fireBtn);
      lastTime = performance.now();
    }
  }

  function toggleSound() {
    Sound.toggle();
    el.btnSound.textContent = Sound.muted() ? "🔇" : "🔊";
    el.btnSound.classList.toggle("muted", Sound.muted());
  }

  function bindSave(input, btn, okMsg, doneMsg, claim) {
    const doSave = () => {
      claim();
      btn.disabled = true;
      okMsg.classList.add("hidden");
      doneMsg.classList.remove("hidden");
      renderLeaderboard();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSave();
    });
    btn.addEventListener("click", doSave);
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const a = t.getAttribute("data-action");
    Sound.click();
    if (a === "menu") showMainMenu();
    else if (a === "worlds") showWorldsMenu();
    else if (a === "sections") showSectionsMenu();
    else if (a === "endless") startScenario("endless");
    else if (a === "howto") { hide(el.mainMenu); hide(el.sectionsMenu); show(el.howTo); }
    else if (a === "leaderboard") showLeaderMenu();
    else if (a === "sound") toggleSound();
    else if (a === "resume") togglePause();
    else if (a === "retry") retry();
    else if (a === "stageNext") nextStage();
  });

  document.querySelectorAll(".sec-tab").forEach((t) => {
    t.addEventListener("click", () => {
      secTab = t.getAttribute("data-sec-tab");
      Sound.click();
      renderSections();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      if (state === "PLAY") {
        e.preventDefault();
        shoot();
      }
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
      e.preventDefault();
      keys.left = true;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      e.preventDefault();
      keys.right = true;
    } else if (e.code === "KeyP" || e.code === "Escape") {
      if (state === "PLAY" || state === "PAUSE") togglePause();
    } else if (e.code === "KeyM") {
      toggleSound();
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    else if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  });

  canvas.addEventListener("pointermove", (e) => {
    pointerActive = true;
    lastPointerX = e.clientX;
  });
  canvas.addEventListener("pointerleave", () => {
    lastPointerX = null;
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (state === "PLAY") {
      shoot();
      pointerActive = true;
      lastPointerX = e.clientX;
    }
  });

  function update(dt) {
    if (state !== "PLAY") return;

    if (keys.left) rocket.targetX -= 720 * dt;
    if (keys.right) rocket.targetX += 720 * dt;
    if (pointerActive && lastPointerX !== null) rocket.targetX = lastPointerX;
    rocket.x += (rocket.targetX - rocket.x) * Math.min(1, dt * 10);
    rocket.x = Math.max(rocket.w / 2, Math.min(W - rocket.w / 2, rocket.x));

    if (scenario.kind === "match" || scenario.kind === "memory") {
      if (timerActive) {
        timeLeft -= dt;
        if (timeLeft <= 0) {
          timeLeft = 0;
          timerActive = false;
          if (scenario.kind === "rescue") {
            if (answered >= scenario.target) rescueSuccess();
            else rescueFail();
          } else {
            endGame();
          }
        }
      }
      updateHud();
      return;
    }

    speed = scenario.kind === "endless" ? speed : Math.min(2.2, 1 + answered * 0.05);
    const r = bubbleR();
    for (const b of bubbles) {
      b.y += b.speed * 60 * dt;
      b.wob += dt * 2;
      b.x = laneX(b.lane) + Math.sin(b.wob) * 7;
      if (b.y > H + r * 2) {
        newRound();
        break;
      }
    }

    const rw = rocket.w * 0.55, rh = rocket.h * 0.6;
    const rx = rocket.x - rw / 2, ry = rocket.y + rocket.h * 0.12;
    let caught = null;
    for (const b of bubbles) {
      if (b.x > rx - b.r && b.x < rx + rw + b.r && b.y > ry - b.r && b.y < ry + rh + b.r) {
        caught = b;
        break;
      }
    }
    if (caught) {
      bubbles = bubbles.filter((o) => o !== caught);
      if (caught.correct) catchCorrect(caught.x, caught.y);
      else catchWrong();
    }

    laserCooldown = Math.max(0, laserCooldown - dt);
    for (const l of lasers) {
      l.y += l.vy * dt;
      if (l.dead) continue;
      const hit = bubbles.find((b) =>
        l.x > b.x - b.r && l.x < b.x + b.r && l.y > b.y - b.r && l.y < b.y + b.r
      );
      if (hit) {
        l.dead = true;
        burst(l.x, l.y, hit.correct ? "#7dff8a" : "#ff5252", 6);
        laserHit(hit);
      }
    }
    lasers = lasers.filter((l) => l.y > -30 && !l.dead);

    if (scenario.kind === "boss" || scenario.kind === "gauntlet") {
      bossX = Math.max(bossW / 2 + 20, Math.min(W - bossW / 2 - 20, bossX + bossMoveDir * bossMoveSpeed * dt));
      if (bossX >= W - bossW / 2 - 20 || bossX <= bossW / 2 + 20) bossMoveDir *= -1;
      bossMoveSpeed = 80 + (1 - bossHp / bossHpMax) * 60 + bossStage * 8;
      bossAttackTimer -= dt;
      if (bossAttackTimer <= 0) {
        bossAttackTimer = Math.max(0.5, bossAttackInterval - bossStage * 0.12);
        const pat = (bossPhase + bossStage) % 6;
        bossPhase = pat;
        if (pat === 0) {
          bossProjectiles.push({ x: bossX, y: bossY + bossH / 2, vx: 0, vy: 300 + bossStage * 15, r: 12, color: "#ff5252" });
        } else if (pat === 1) {
          bossProjectiles.push({ x: bossX - 50, y: bossY + bossH / 2, vx: -100, vy: 260 + bossStage * 10, r: 10, color: "#ffab40" });
          bossProjectiles.push({ x: bossX + 50, y: bossY + bossH / 2, vx: 100, vy: 260 + bossStage * 10, r: 10, color: "#ffab40" });
        } else if (pat === 2) {
          for (let i = -2; i <= 2; i++) {
            bossProjectiles.push({ x: bossX + i * 40, y: bossY + bossH / 2, vx: i * 25, vy: 240 + bossStage * 12, r: 9, color: "#ffd740" });
          }
        } else if (pat === 3) {
          const angle = Math.atan2(groundY - bossY, rocket.x - bossX);
          bossProjectiles.push({ x: bossX, y: bossY + bossH / 2, vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200, r: 13, color: "#ff3d47" });
        } else if (pat === 4) {
          for (let i = 0; i < 4 + Math.min(bossStage, 4); i++) {
            const a = (Math.PI / 5) * i - Math.PI / 2;
            bossProjectiles.push({ x: bossX, y: bossY + bossH / 2, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180 + 60, r: 8, color: "#e040fb" });
          }
        } else {
          bossProjectiles.push({ x: bossX - 70, y: bossY + bossH / 2 + 10, vx: 0, vy: 340 + bossStage * 15, r: 11, color: "#ff5252" });
          bossProjectiles.push({ x: bossX, y: bossY + bossH / 2, vx: 0, vy: 380 + bossStage * 15, r: 14, color: "#ff1744" });
          bossProjectiles.push({ x: bossX + 70, y: bossY + bossH / 2 + 10, vx: 0, vy: 340 + bossStage * 15, r: 11, color: "#ff5252" });
        }
      }
      const rw = rocket.w * 0.55, rh = rocket.h * 0.6;
      const rx = rocket.x - rw / 2, ry = rocket.y + rocket.h * 0.12;
      const hitProj = bossProjectiles.find((p) =>
        p.x > rx - p.r && p.x < rx + rw + p.r && p.y > ry - p.r && p.y < ry + rh + p.r
      );
      if (hitProj) {
        bossProjectiles = bossProjectiles.filter((p) => p !== hitProj);
        hearts--;
        Sound.wrong();
        flash("#ff5252", 0.25);
        burst(rocket.x, rocket.y, "#ff5252", 10);
        if (hearts <= 0) endGame();
        updateHud();
      }
      bossProjectiles = bossProjectiles.filter((p) => p.y < H + 30);
    }

    if (timerActive) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        timerActive = false;
        if (scenario.kind === "sprint") endGame();
        else if (scenario.kind === "rescue") {
          if (answered >= scenario.target) rescueSuccess();
          else rescueFail();
        }
      }
    }

    particles = particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      return p.life > 0;
    });
    floaties = floaties.filter((f) => {
      f.life -= dt * 1.2;
      f.y -= 46 * dt;
      return f.life > 0;
    });
    flashAlpha = Math.max(0, flashAlpha - dt * 2);

    updateHud();
  }

  function drawBackground(t, pal) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bgA);
    g.addColorStop(1, pal.bgB);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const par = (rocket.x / W - 0.5) * 30;
    const blobs = [
      { x: W * 0.2, y: H * 0.18, r: Math.min(W, H) * 0.28, ph: 0 },
      { x: W * 0.78, y: H * 0.3, r: Math.min(W, H) * 0.2, ph: 1.7 },
      { x: W * 0.5, y: H * 0.62, r: Math.min(W, H) * 0.24, ph: 3.1 }
    ];
    for (const b of blobs) {
      const rr = b.r * (1 + Math.sin(t * 0.4 + b.ph) * 0.07);
      const bx = b.x - par * 0.5;
      const by = b.y + Math.sin(t * 0.5 + b.ph) * 10;
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, rr);
      bg.addColorStop(0, pal.bubble + "55");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const s of starsArr) {
      const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
      const sx = s.x - par * s.sp * 0.2;
      ctx.globalAlpha = 0.25 + tw * 0.7;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const m of meteors) {
      m.x += m.vx * (1 / 60);
      m.y += m.vy * (1 / 60);
      m.life -= 1 / 60;
      if (m.life > 0) {
        ctx.strokeStyle = "rgba(255,255,255," + Math.min(0.7, m.life) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 4, m.y - m.vy * 4);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    meteors = meteors.filter((m) => m.life > 0);
    if (Math.random() < 0.05) {
      meteors.push({
        x: Math.random() * W,
        y: -20,
        vx: (Math.random() - 0.5) * 160,
        vy: Math.random() * 220 + 120,
        life: 1
      });
    }

    for (const d of dust) {
      const dy = ((d.y - t * d.sp * 0.15) % H + H) % H;
      const dx = d.x + Math.sin(t * 0.8 + d.ph) * 14 - par * 0.1;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath();
      ctx.arc(dx, dy, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const ringX = W * 0.85, ringY = H * 0.2;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 46, 14, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pal.accent + "33";
    ctx.beginPath();
    ctx.arc(ringX, ringY, 24, 0, Math.PI * 2);
    ctx.fill();

    const gg = ctx.createLinearGradient(0, groundY, 0, H);
    gg.addColorStop(0, pal.ground);
    gg.addColorStop(1, "#050a18");
    ctx.fillStyle = gg;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, groundY, W, 3);
  }

  function drawBubble(b) {
    ctx.save();
    ctx.shadowColor = b.correct ? b.glow || theme().glow : "#ff5252";
    ctx.shadowBlur = 26;
    ctx.fillStyle = b.correct ? "rgba(255,255,255,0.07)" : "rgba(255,82,82,0.08)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = b.correct ? "rgba(255,255,255,0.92)" : "#ffd2d2";
    ctx.font = "700 " + Math.round(b.r * 0.72) + "px Cairo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const txt = b.text.length > 10 ? b.text.slice(0, 10) + "…" : b.text;
    ctx.fillText(txt, b.x, b.y);
    ctx.restore();
  }

  function drawRocket() {
    const x = rocket.x, y = rocket.y;
    rocket.tilt += (0 - rocket.tilt) * 0.08;
    ctx.save();
    ctx.translate(x, y + rocket.h / 2);
    ctx.rotate(rocket.tilt);
    ctx.shadowColor = theme().glow;
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#e8ecf4";
    ctx.beginPath();
    ctx.moveTo(0, -rocket.h * 0.92);
    ctx.lineTo(rocket.w * 0.4, -rocket.h * 0.1);
    ctx.lineTo(rocket.w * 0.4, rocket.h * 0.34);
    ctx.lineTo(-rocket.w * 0.4, rocket.h * 0.34);
    ctx.lineTo(-rocket.w * 0.4, -rocket.h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ff3d47";
    ctx.beginPath();
    ctx.moveTo(0, -rocket.h * 0.3);
    ctx.lineTo(rocket.w * 0.2, rocket.h * 0.34);
    ctx.lineTo(-rocket.w * 0.2, rocket.h * 0.34);
    ctx.closePath();
    ctx.fill();
    const fl = 14 + Math.abs(Math.sin(rocket.flameT += 0.2)) * 9;
    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.moveTo(-8, rocket.h * 0.3);
    ctx.lineTo(8, rocket.h * 0.3);
    ctx.lineTo(0, rocket.h * 0.3 + fl);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawBoss(t) {
    if (bossHp <= 0) return;
    ctx.save();
    ctx.translate(bossX, bossY);
    const shake = (1 - bossHp / bossHpMax) * 3;
    ctx.translate(Math.sin(t * 30) * shake, 0);
    ctx.fillStyle = "#5c2b8a";
    ctx.beginPath();
    ctx.moveTo(0, -bossH * 0.6);
    ctx.lineTo(bossW * 0.45, -bossH * 0.2);
    ctx.lineTo(bossW * 0.5, bossH * 0.3);
    ctx.lineTo(-bossW * 0.5, bossH * 0.3);
    ctx.lineTo(-bossW * 0.45, -bossH * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff3d47";
    ctx.beginPath();
    ctx.arc(-18, -10, 10, 0, Math.PI * 2);
    ctx.arc(18, -10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-18, -10, 5, 0, Math.PI * 2);
    ctx.arc(18, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(-18, -10, 2.5, 0, Math.PI * 2);
    ctx.arc(18, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffd740";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -30);
    ctx.lineTo(-30, -48);
    ctx.moveTo(-20, -30);
    ctx.lineTo(-10, -46);
    ctx.moveTo(20, -30);
    ctx.lineTo(30, -48);
    ctx.moveTo(20, -30);
    ctx.lineTo(10, -46);
    ctx.stroke();
    const hpPct = bossHp / bossHpMax;
    ctx.fillStyle = "#333";
    ctx.fillRect(-40, -55, 80, 8);
    ctx.fillStyle = hpPct > 0.5 ? "#7dff8a" : hpPct > 0.25 ? "#ffd740" : "#ff5252";
    ctx.fillRect(-40, -55, 80 * hpPct, 8);
    ctx.strokeStyle = "#ffffff44";
    ctx.lineWidth = 1;
    ctx.strokeRect(-40, -55, 80, 8);
    ctx.restore();
  }

  function drawBossProjectiles() {
    ctx.save();
    for (const p of bossProjectiles) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      glow.addColorStop(0, p.color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLasers() {
    ctx.save();
    for (const l of lasers) {
      const g = ctx.createLinearGradient(l.x, l.y, l.x, l.y - 44);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(1, "#7ef9ff");
      ctx.fillStyle = g;
      ctx.fillRect(l.x - 3, l.y - 44, 6, 44);
    }
    ctx.restore();
  }

  function drawFx() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = "800 22px Cairo, sans-serif";
    ctx.textAlign = "center";
    for (const f of floaties) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.font = "800 " + f.size + "px Cairo, sans-serif";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    if (flashAlpha > 0) {
      ctx.globalAlpha = Math.min(0.5, flashAlpha);
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  function draw(dt) {
    const t = performance.now() / 1000;
    const pal = theme() || EXPLORE_THEMES[0];
    drawBackground(t, pal);
    if (state === "PLAY" || state === "PAUSE") {
      if (scenario.kind === "boss" || scenario.kind === "gauntlet") {
        drawBoss(t);
        drawBossProjectiles();
      }
      drawRocket();
      if (scenario.kind !== "match" && scenario.kind !== "memory") {
        for (const b of bubbles) drawBubble(b);
        drawLasers();
      }
    }
    drawFx();
  }

  function loop(now) {
    try {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      draw(dt);
    } catch (e) {
      console.error("[LOOP ERROR]", e.message, e.stack);
    }
    requestAnimationFrame(loop);
  }

  document.querySelectorAll("[data-action='sound']").forEach((b) => {
    b.textContent = Sound.muted() ? "🔇" : "🔊";
    b.classList.toggle("muted", Sound.muted());
  });

  bindSave(el.wcName, el.btnSaveWc, el.wcAutoMsg, el.wcSavedMsg, claimEntry);
  bindSave(el.goName, el.btnSaveGo, el.goAutoMsg, el.goSavedMsg, () => {
    const leaderboard = store.get("mfg_leaderboard", []);
    const entry = leaderboard.find((e) => e.id === pendingEntryId);
    if (!entry) return;
    entry.name = String(el.goName.value.trim() || "لاعب").slice(0, 14);
    store.set("mfg_leaderboard", leaderboard);
  });

  el.fireBtn.addEventListener("click", shoot);

  window.addEventListener("resize", resize);

  window.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") {
      toggleSound();
    }
  });

  resize();
  buildStars();
  buildDust();
  best = store.get("mfg_best", 0);
  el.menuBest.textContent = best;
  el.hudBest.textContent = best;
  document.fonts.ready.then(() => {
    showMainMenu();
    requestAnimationFrame((now) => { lastTime = now; loop(now); });
  });
})();