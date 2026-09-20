'use strict';
/* 贪吃蛇 · 纯本地 PWA
 * 安全约束：零网络请求、零数据采集、无 eval/动态代码、
 * 唯一持久化 = localStorage 的最高分与声音偏好（仅存本机）。
 */
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const btnOverlay = document.getElementById('btn-overlay');
  const btnPause = document.getElementById('btn-pause');
  const btnSound = document.getElementById('btn-sound');
  const dpadBtns = document.querySelectorAll('.db');

  const GRID = 20;
  const START_TICK = 160; // ms/步
  const MIN_TICK = 70;

  let cells = 0;
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let score = 0;
  let best = 0;
  let tickMs = START_TICK;
  let lastTick = 0;
  let state = 'ready'; // ready | playing | paused | over
  let soundOn = true;
  let actx = null;
  let rafId = 0;

  try {
    best = Math.max(0, parseInt(localStorage.getItem('snake.best'), 10) || 0);
    soundOn = localStorage.getItem('snake.sound') !== 'off';
  } catch (e) {
    best = 0;
    soundOn = true;
  }

  // ---------- 画布 ----------
  function resize() {
    const size = Math.max(240, Math.min(window.innerWidth - 16, Math.round(window.innerHeight * 0.58)));
    cells = size;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    if (!cells) return;
    const c = cells / GRID;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cells, cells);
    ctx.strokeStyle = 'rgba(148,163,184,0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * c + 0.5, 0); ctx.lineTo(i * c + 0.5, cells); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * c + 0.5); ctx.lineTo(cells, i * c + 0.5); ctx.stroke();
    }
    if (food) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(food.x * c + c / 2, food.y * c + c / 2, c * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
      roundRect(s.x * c + c * 0.08, s.y * c + c * 0.08, c * 0.84, c * 0.84, c * 0.28);
    }
  }

  // ---------- 游戏逻辑 ----------
  function placeFood() {
    const occupied = new Set(snake.map(s => s.x + ',' + s.y));
    const free = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) { food = null; gameOver(true); return; }
    food = free[(Math.random() * free.length) | 0];
  }

  function reset() {
    const mid = Math.floor(GRID / 2);
    snake = [{ x: 2, y: mid }, { x: 1, y: mid }, { x: 0, y: mid }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    tickMs = START_TICK;
    food = null;
    placeFood();
    updateHud();
  }

  function step() {
    if (state !== 'playing') return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) return gameOver(false);
    const willGrow = food !== null && head.x === food.x && head.y === food.y;
    const body = willGrow ? snake : snake.slice(0, -1);
    if (body.some(s => s.x === head.x && s.y === head.y)) return gameOver(false);
    snake.unshift(head);
    if (willGrow) {
      score += 10;
      beep(880, 0.07);
      tickMs = Math.max(MIN_TICK, START_TICK - (score / 10) * 5);
      placeFood();
      updateHud();
    } else {
      snake.pop();
    }
  }

  function gameOver(won) {
    state = 'over';
    cancelAnimationFrame(rafId);
    if (score > best) {
      best = score;
      try { localStorage.setItem('snake.best', String(best)); } catch (e) { /* 存储不可用则忽略 */ }
    }
    updateHud();
    draw();
    showOverlay(won ? '通关！得分 ' + score : '游戏结束 · 得分 ' + score, '再来一局');
    beep(won ? 1320 : 220, won ? 0.3 : 0.25);
  }

  function frame(ts) {
    if (state !== 'playing') return;
    if (ts - lastTick >= tickMs) {
      lastTick = ts;
      step();
      if (state !== 'playing') return;
    }
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    reset();
    state = 'playing';
    lastTick = performance.now();
    hideOverlay();
    beep(660, 0.06);
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function setPaused(p) {
    if (p && state === 'playing') {
      state = 'paused';
      cancelAnimationFrame(rafId);
      draw();
      showOverlay('已暂停', '继续');
    } else if (!p && state === 'paused') {
      state = 'playing';
      lastTick = performance.now();
      hideOverlay();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }
  }

  // ---------- 输入 ----------
  const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

  function press(name) {
    const d = DIRS[name];
    if (!d) return;
    if (state === 'ready' || state === 'over') start();
    if (d.x === -nextDir.x && d.y === -nextDir.y) return; // 禁止 180° 掉头
    nextDir = d;
  }

  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right',
  };
  window.addEventListener('keydown', e => {
    const name = KEYMAP[e.key];
    if (name) {
      e.preventDefault();
      press(name);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (state === 'playing') setPaused(true);
      else if (state === 'paused') setPaused(false);
      else start();
    }
  });

  let tS = null;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) tS = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!tS || !e.touches.length) return;
    const dx = e.touches[0].clientX - tS.x;
    const dy = e.touches[0].clientY - tS.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    tS = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', () => { tS = null; }, { passive: true });
  canvas.addEventListener('touchcancel', () => { tS = null; }, { passive: true });

  dpadBtns.forEach(b => {
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      press(b.dataset.dir);
    });
  });

  btnPause.addEventListener('click', () => {
    if (state === 'playing') setPaused(true);
    else if (state === 'paused') setPaused(false);
  });

  function updateSoundBtn() { btnSound.textContent = soundOn ? '🔊' : '🔇'; }
  btnSound.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('snake.sound', soundOn ? 'on' : 'off'); } catch (e) { /* 忽略 */ }
    updateSoundBtn();
    if (soundOn) beep(660, 0.05);
  });

  // ---------- 覆盖层 ----------
  function showOverlay(text, btnText) {
    overlayText.textContent = text;
    btnOverlay.textContent = btnText;
    overlay.classList.add('show');
  }
  function hideOverlay() { overlay.classList.remove('show'); }
  btnOverlay.addEventListener('click', () => {
    if (state === 'paused') setPaused(false);
    else start();
  });

  // ---------- 声音（WebAudio 合成，无音频文件、无网络） ----------
  function beep(freq, dur) {
    if (!soundOn) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.connect(g);
      g.connect(actx.destination);
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.04, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.start();
      o.stop(actx.currentTime + dur);
    } catch (e) { /* 音频不可用则静默 */ }
  }

  // ---------- HUD ----------
  function updateHud() {
    scoreEl.textContent = String(score);
    bestEl.textContent = String(Math.max(best, score));
  }

  // ---------- 生命周期 ----------
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') setPaused(true);
  });
  window.addEventListener('pagehide', () => {
    if (state === 'playing') setPaused(true);
  });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // ---------- 本地测试钩子（仅离线自动化测试用，无任何对外通信） ----------
  window.__snake = {
    getState: () => state,
    getScore: () => score,
    getSnake: () => snake.map(s => ({ x: s.x, y: s.y })),
    getFood: () => (food ? { x: food.x, y: food.y } : null),
    press,
    start,
    setFood: (x, y) => { food = { x, y }; },
    stepOnce: () => { step(); draw(); },
  };

  // ---------- 初始化 ----------
  resize();
  reset();
  draw();
  updateSoundBtn();
  updateHud();
  showOverlay('贪吃蛇\n在棋盘上滑动，或用下方方向键\n吃食物成长，别撞墙别撞自己', '开始游戏');
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* 离线缓存不可用则跳过 */ });
    });
  }
})();
