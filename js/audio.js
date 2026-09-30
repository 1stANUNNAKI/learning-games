"use strict";

const Sound = (() => {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  return {
    unlock: function () { ensure(); },
    setMuted: function (m) { muted = m; },
    isMuted: function () { return muted; },
    toggle: function () { muted = !muted; },
    muted: function () { return muted; },
    click: function () { tone(600, 0.07, "square", 0.05); },
    correct: function () {
      [523, 659, 784].forEach(function (f, i) {
        tone(f, 0.14, "triangle", 0.14, i * 0.08);
      });
    },
    wrong: function () {
      tone(180, 0.3, "sawtooth", 0.1);
      tone(120, 0.35, "sawtooth", 0.1, 0.12);
    },
    heartLost: function () { tone(200, 0.45, "sawtooth", 0.12); },
    levelUp: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        tone(f, 0.16, "triangle", 0.13, i * 0.1);
      });
    },
    gameOver: function () {
      [392, 330, 262, 196].forEach(function (f, i) {
        tone(f, 0.28, "sawtooth", 0.09, i * 0.16);
      });
    },
    star: function () {
      tone(880, 0.1, "sine", 0.1);
      tone(1320, 0.18, "sine", 0.1, 0.08);
    },
    laser: function () {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(1600, t);
      o.frequency.exponentialRampToValueAtTime(300, t + 0.15);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.2);
    },
    boom: function () {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.25);
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.32);
    },
    worldWin: function () {
      [523, 659, 784, 1046, 1318].forEach(function (f, i) {
        tone(f, 0.2, "triangle", 0.13, i * 0.11);
      });
    }
  };
})();
