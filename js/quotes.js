/* js/quotes.js — auto-extracted from index.html */
(function initTateQuotes() {
  const quotes = [
    "If you’re not in control of your own time, you’re not in control of your life.",
    "You must put in the effort. There are no shortcuts to the top.",
    "The man who goes to the gym every single day has already won half the battle.",
    "Arrogance is a mask worn by men who are afraid to show their true strength.",
    "Do the impossible and you’ll never doubt yourself or your abilities again.",
    "Decide what you want and pursue it relentlessly, without apology.",
    "Your mind must be stronger than your feelings.",
    "Be a man of substance. A man of value. Women respect power — earn it.",
    "Pain is temporary. The pride of discipline lasts a lifetime.",
    "Stop explaining yourself to people who don’t deserve access to your energy.",
    "You have to be willing to outwork everyone around you.",
    "Never chase. Build something worth chasing you.",
    "The world will always try to destroy a man who refuses to be ordinary.",
    "Confidence is not loud. It is calm, focused, and relentless.",
    "A man without a plan is a passenger in someone else’s life.",
    "The secret is simple — do what most men won’t.",
    "Your standards reveal your self-worth. Raise them or stay average.",
    "Every moment of weakness is a moment stolen from your future self.",
    "Real value is demonstrated, never begged for.",
    "Winners don’t explain themselves to losers."
  ,
    "You are the only person who can make this work, and you are the only person who can mess this up.",
    "Find a person who is as successful as you’d like to be, ask them what to do, do it and work hard.",
    "Moody females steal your power. It is dangerous for a man. A man must remain focused.",
    "If you have a mind that you can’t control, you’re never going to be a king.",
    "It is your duty to make your bloodline mean something.",
    "We will either live the life of our dreams or die trying.",
    "Action is the only way you’ll progress. Not talking. Not planning. Not reading books.",
    "You will live a life few think is possible. Do you have what it takes?",
    "Close your eyes. Feel excited, powerful. Imagine yourself destroying goals with ease.",
    "The only way to make money is to do stuff.",
    "I was never afraid to lose all my money or die in combat.",
    "Are you better on your worst day than your opponent on their best?",
    "My unmatched perspicacity coupled with sheer indefatigability makes me a feared opponent in any realm of human endeavour.",
    "Loser rolls with losers. Winner rolls with winners.",
    "I think I’m the man. I find that a source of motivation."
  ];
  const band = document.getElementById('tateQuoteBand');
  const tEl  = document.getElementById('tateQuoteText');
  const aEl  = document.getElementById('tateQuoteAttr');
  if (!band || !tEl) return;
  let idx = Math.floor(Math.random() * quotes.length);
  function showQuote() {
    band.classList.remove('visible');
    setTimeout(() => {
      tEl.textContent = quotes[idx];
      if (aEl) aEl.textContent = 'Andrew Tate';
      band.classList.add('visible');
      idx = (idx + 1) % quotes.length;
    }, 700);
  }
  showQuote();
  setInterval(showQuote, 12000);
  band.addEventListener('click', showQuote);
})();

// ═══════════════════════════════════════════════════════════════════
// EASTER EGGS
// ═══════════════════════════════════════════════════════════════════

// ── 1. Triple-tap the clock → play a random song ──────────────────
(function eggClockTripleTap() {
  const clock = document.getElementById('headerClock');
  if (!clock) return;
  let taps = 0, tapTimer = null;
  clock.addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 500);
    if (taps >= 3) {
      taps = 0;
      const pool = SHUFFLE_POOL.length ? SHUFFLE_POOL : ['back-in-black','jarvis','mask','heman','goodtimes'];
      const key  = pool[Math.floor(Math.random() * pool.length)];
      stopMusic();
      playLocalMp3(key);
      const t = document.getElementById('easterToast');
      if (t) { t.textContent = '🎵 ' + key.replace(/-/g,' ').replace(/\w/g,c=>c.toUpperCase()); t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
    }
  });
})();

// ── 2. Hold moon icon 2s → toggle blood moon ──────────────────────
(function eggBloodMoon() {
  const moonEl = document.getElementById('moon');
  const overlay = document.getElementById('bloodMoonOverlay');
  if (!moonEl || !overlay) return;
  let holdTimer = null;
  let active = false;
  moonEl.style.cursor = 'pointer';
  moonEl.style.pointerEvents = 'all';
  function startHold(e) {
    e.stopPropagation();
    holdTimer = setTimeout(() => {
      active = !active;
      overlay.classList.toggle('active', active);
      document.body.classList.toggle('blood-moon', active);
      if (navigator.vibrate) navigator.vibrate(active ? [40,30,80] : [20]);
      const t = document.getElementById('easterToast');
      if (t) { t.textContent = active ? '🔴 Blood Moon' : '🌙 Moon restored'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000); }
    }, 2000);
  }
  function cancelHold() { clearTimeout(holdTimer); }
  moonEl.addEventListener('mousedown', startHold);
  moonEl.addEventListener('touchstart', startHold, { passive: true });
  moonEl.addEventListener('mouseup',   cancelHold);
  moonEl.addEventListener('touchend',  cancelHold);
  moonEl.addEventListener('mouseleave',cancelHold);
})();

// ── 3. Tap Tate quote → fireworks ─────────────────────────────────
// (band already has click → showQuote; add fireworks on top)
(function eggTateFireworks() {
  const band = document.getElementById('tateQuoteBand');
  if (!band) return;
  band.addEventListener('click', () => { _chConfetti(); });
})();

// ── 4. Tap "Rotation" title 5× → Hall of Fame ────────────────────
(function eggHallOfFame() {
  const h1 = document.querySelector('.brand-text h1');
  const overlay = document.getElementById('hofOverlay');
  const list    = document.getElementById('hofList');
  const closeBtn = document.getElementById('hofClose');
  if (!h1 || !overlay || !list) return;

  function buildHOF() {
    // Count past dates per profile
    const today = new Date(); today.setHours(0,0,0,0);
    const counts = {};   // profileId → { total, lastDate }
    const streaks = {};  // profileId → current streak (consecutive weeks)
    Object.keys(state.dates).forEach(dateKey => {
      const d = new Date(dateKey + 'T00:00:00');
      if (d > today) return;
      (state.dates[dateKey] || []).forEach(e => {
        if (!e.profileId) return;
        const id = e.profileId;
        counts[id] = counts[id] || { total: 0, lastDate: null };
        counts[id].total++;
        if (!counts[id].lastDate || d > counts[id].lastDate) counts[id].lastDate = d;
      });
    });

    const profiles = state.profiles.filter(p => counts[p.id]);
    profiles.sort((a,b) => (counts[b.id].total || 0) - (counts[a.id].total || 0));

    list.innerHTML = '';
    if (!profiles.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px 0">No dates logged yet.</div>';
      return;
    }
    const medals = ['🥇','🥈','🥉'];
    profiles.forEach((p, i) => {
      const c = counts[p.id];
      const idx = (typeof p.primaryPhotoIdx === 'number') ? p.primaryPhotoIdx : 0;
      const thumb = p.photos && p.photos[idx] ? p.photos[idx] : '';
      const lastSeen = c.lastDate ? c.lastDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
      const row = document.createElement('div');
      row.className = 'hof-row';
      row.innerHTML = `
        <div class="hof-rank">${medals[i] || (i+1)}</div>
        <div class="hof-thumb" ${thumb ? `style="background-image:url('${thumb}')"` : ''}>${thumb ? '' : (p.name||'?')[0].toUpperCase()}</div>
        <div style="flex:1">
          <div class="hof-name">${escapeHtml(p.name || 'Untitled')}</div>
          <div class="hof-stats">Last seen ${lastSeen}</div>
        </div>
        <div class="hof-count">${c.total}×</div>`;
      list.appendChild(row);
    });
  }

  let taps = 0, tapTimer = null;
  h1.style.cursor = 'pointer';
  h1.addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 700);
    if (taps >= 5) {
      taps = 0;
      buildHOF();
      overlay.classList.add('show');
    }
  });
  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
})();

// ── 5. Long-press Dates tab 1.5s → nuke dates banner ──────────
(function eggNukeDates() {
  const datesBtn = document.querySelector('nav.tabs button[data-view="calendar"]');
  const banner   = document.getElementById('nukeDatesBanner');
  const yesBtn   = document.getElementById('nukeDatesYes');
  const noBtn    = document.getElementById('nukeDatesNo');
  if (!datesBtn || !banner) return;
  let holdTimer = null;
  function startHold(e) {
    holdTimer = setTimeout(() => {
      banner.classList.add('show');
      if (navigator.vibrate) navigator.vibrate([30,20,60]);
    }, 1500);
  }
  function cancelHold() { clearTimeout(holdTimer); }
  datesBtn.addEventListener('mousedown',  startHold);
  datesBtn.addEventListener('touchstart', startHold, { passive: true });
  datesBtn.addEventListener('mouseup',    cancelHold);
  datesBtn.addEventListener('touchend',   cancelHold);
  datesBtn.addEventListener('mouseleave', cancelHold);
  // Don't attach cancelHold to click — that fires AFTER mouseup and would cancel the hold action itself
  if (yesBtn) yesBtn.addEventListener('click', () => {
    banner.classList.remove('show');
    _nukeDatesWithExplosions(() => {
      state.dates = {};
      saveState();
      if (typeof renderCalendar === 'function') renderCalendar();
      if (typeof renderAvailability === 'function') renderAvailability();
      const t = document.getElementById('easterToast');
      if (t) { t.textContent = '☢️ All dates nuked'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
    });
  });
  if (noBtn) noBtn.addEventListener('click', () => banner.classList.remove('show'));
})();

/* Fiery TNT explosion effect — Sega Megadrive boss-fight style */
function _nukeDatesWithExplosions(onDone) {
  const targets = [
    ...document.querySelectorAll('.date-entry, .day-col, .avail-row, .cal-event, .cal-day.has-event')
  ].filter(el => el.offsetParent !== null);

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;image-rendering:pixelated';
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const FIRE   = ['#ff4400','#ff7700','#ffaa00','#ffcc00','#ff2200','#ffffff','#ff0055','#ffdd00'];
  const PLASMA = ['#00ffff','#ff00ff','#ff4400','#ffaa00','#ffffff','#00ff88'];
  const explosions = [];
  let tickRunning = false;

  function spawnExplosion(cx, cy, radius, palette, count) {
    const sparks = [];
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.4;
      const sp  = 1.2 + Math.random() * (radius * 0.18);
      sparks.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 1, decay: 0.010 + Math.random() * 0.014,
        r: 1 + Math.random() * 3
      });
    }
    // Debris chunks — bigger blocky pixels for Megadrive feel
    const chunks = [];
    for (let i = 0; i < 12; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp  = 2 + Math.random() * 5;
      chunks.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
        w: 3 + Math.floor(Math.random() * 5),
        h: 3 + Math.floor(Math.random() * 5),
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 1, decay: 0.008 + Math.random() * 0.01
      });
    }
    explosions.push({ sparks, chunks, shockR: 0, shockAlpha: 1, cx, cy, radius });
    if (!tickRunning) { tickRunning = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    let anyAlive = false;
    explosions.forEach(exp => {
      // Shockwave
      if (exp.shockAlpha > 0) {
        exp.shockR += 5;
        exp.shockAlpha -= 0.045;
        if (exp.shockAlpha > 0) {
          ctx.beginPath();
          ctx.arc(exp.cx, exp.cy, exp.shockR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,160,0,${exp.shockAlpha.toFixed(2)})`;
          ctx.lineWidth = 4;
          ctx.stroke();
          // Inner bright ring
          ctx.beginPath();
          ctx.arc(exp.cx, exp.cy, exp.shockR * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,180,${(exp.shockAlpha * 0.5).toFixed(2)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          anyAlive = true;
        }
      }
      // Sparks
      exp.sparks.forEach(s => {
        if (s.life <= 0) return;
        s.x += s.vx; s.y += s.vy; s.vy += 0.14; s.vx *= 0.975;
        s.life -= s.decay;
        if (s.life > 0) {
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fillStyle = s.color;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.ceil(s.r), Math.ceil(s.r));
          anyAlive = true;
        }
      });
      // Debris chunks
      exp.chunks.forEach(c => {
        if (c.life <= 0) return;
        c.x += c.vx; c.y += c.vy; c.vy += 0.22; c.vx *= 0.97;
        c.rot += c.vrot; c.life -= c.decay;
        if (c.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, c.life);
          ctx.fillStyle = c.color;
          ctx.translate(Math.round(c.x), Math.round(c.y));
          ctx.rotate(c.rot);
          ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
          ctx.restore();
          anyAlive = true;
        }
      });
    });
    ctx.globalAlpha = 1;
    if (anyAlive) requestAnimationFrame(tick);
    else { canvas.remove(); onDone(); }
  }

  // BOSS FIGHT sequence when no visible date targets (empty calendar)
  function bossExplosionSequence() {
    if (navigator.vibrate) navigator.vibrate([60,40,80,40,120,40,60]);
    // Screen flash white
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:#fff;pointer-events:none;z-index:199;opacity:0;transition:opacity .04s';
    document.body.appendChild(flash);
    // Wave of explosions spreading from centre — 3 waves
    const cx = W/2, cy = H/2;
    const WAVE_DATA = [
      // [delay_ms, positions_array, palette, count_per]
      [0,   [[cx, cy]], FIRE, 90],
      [200, [[cx*0.3,cy*0.4],[cx*1.7,cy*0.4],[cx*0.3,cy*1.6],[cx*1.7,cy*1.6]], FIRE, 70],
      [450, [[cx*0.7,cy*0.2],[cx*1.3,cy*0.2],[cx,cy*1.8],[cx*0.2,cy],[cx*1.8,cy]], PLASMA, 80],
      [700, [[cx*0.15,cy*0.15],[cx*1.85,cy*0.85],[cx*0.5,cy*1.85],[cx*1.5,cy*0.15],[cx*1.85,cy*1.85]], FIRE, 65],
      [980, [[cx*0.4,cy*0.6],[cx*1.6,cy*0.6],[cx*0.4,cy*1.4],[cx*1.6,cy*1.4],[cx,cy*0.5],[cx,cy*1.5]], PLASMA, 75],
      [1280,[[cx*0.2,cy*0.9],[cx*1.8,cy*0.9],[cx*0.8,cy*0.15],[cx*1.2,cy*1.85],[cx*0.15,cy*1.3],[cx*1.85,cy*0.4]], FIRE, 60],
    ];
    // Screen flashes in sync with wave 0 and wave 2
    [0, 450, 980].forEach(d => {
      setTimeout(() => {
        flash.style.opacity = '0.6';
        setTimeout(() => { flash.style.opacity = '0'; }, 60);
        if (navigator.vibrate) navigator.vibrate(50);
      }, d);
    });
    WAVE_DATA.forEach(([delay, positions, pal, cnt]) => {
      setTimeout(() => {
        positions.forEach(([px, py]) => {
          spawnExplosion(Math.max(20, Math.min(W-20, px)), Math.max(20, Math.min(H-20, py)), 60, pal, cnt);
        });
      }, delay);
    });
    setTimeout(() => flash.remove(), 2000);
    setTimeout(() => {
      if (canvas.parentNode) { canvas.remove(); onDone(); }
    }, 5000);
  }

  if (!targets.length) {
    bossExplosionSequence();
    return;
  }

  // Normal mode: blow up each visible date entry one by one then continue boss sequence
  targets.forEach((el, i) => {
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      el.style.transition = 'none';
      el.style.transform = 'scale(1.1) rotate(-3deg)';
      el.style.filter = 'brightness(4) saturate(0)';
      setTimeout(() => {
        el.style.transform = 'scale(0) rotate(20deg)';
        el.style.opacity = '0';
        el.style.transition = 'transform 0.3s ease-in, opacity 0.2s ease-in';
      }, 70);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnExplosion(cx, cy, Math.max(rect.width, rect.height), FIRE, 75);
      if (navigator.vibrate) navigator.vibrate(25);
    }, i * 200);
  });

  // After individual explosions, go boss mode
  setTimeout(() => bossExplosionSequence(), targets.length * 200 + 100);
  // Hard safety timeout
  setTimeout(() => { if (canvas.parentNode) { canvas.remove(); onDone(); } }, targets.length * 200 + 6000);
}

// ── 6. Tap weather icon 7× fast → thunderstorm ───────────────────
(function eggThunderstorm() {
  const btn = document.getElementById('headerWeather');
  if (!btn) return;
  let taps = 0, tapTimer = null;
  btn.addEventListener('click', (e) => {
    // Don't interfere with the normal single-tap hourly weather popup
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 900);
    if (taps >= 7) {
      taps = 0;
      triggerEggThunderstorm();
    }
  }, true); // capture phase so we can check taps before openHourlyWeather fires

  function triggerEggThunderstorm() {
    if (navigator.vibrate) navigator.vibrate([20,15,20,15,60]);
    const t = document.getElementById('easterToast');
    if (t) { t.textContent = '⛈ THUNDERSTORM'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

    // Darken the sky overlay
    const dyn = document.getElementById('skyDynamic');
    const origFill = dyn ? dyn.getAttribute('fill') : null;
    const origOp   = dyn ? dyn.getAttribute('opacity') : null;
    if (dyn) { dyn.setAttribute('fill','#0a0a18'); dyn.setAttribute('opacity','0.72'); }

    // Flash lightning 4 times
    const flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;inset:0;background:#fff;pointer-events:none;z-index:160;opacity:0;transition:opacity .05s';
    document.body.appendChild(flashEl);
    const flashes = [200, 600, 900, 1400];
    flashes.forEach((delay, i) => {
      setTimeout(() => {
        flashEl.style.opacity = '0.55';
        if (navigator.vibrate) navigator.vibrate(30);
        setTimeout(() => { flashEl.style.opacity = '0'; }, 80);
      }, delay);
    });

    // Make the rain heavy for 8 seconds
    const rainEl = document.getElementById('weatherRain');
    const origClass = rainEl ? rainEl.className : '';
    if (rainEl) { rainEl.classList.add('heavy'); rainEl.style.display=''; }

    setTimeout(() => {
      flashEl.remove();
      if (dyn && origFill) { dyn.setAttribute('fill', origFill); dyn.setAttribute('opacity', origOp || '0'); }
      if (rainEl) { rainEl.className = origClass; }
    }, 8000);
  }
})();

// === SAFE TAIL (added by recovery) — replaces missing trailing JS so the document loads cleanly ===
// Original renderCalendarToCanvas / shareCalendarImage and many late features were truncated.
// We attach lightweight shims so the visible UI keeps working.
async function renderCalendarToCanvas() { return null; }
async function shareCalendarImage() {
  alert('Calendar screenshot share is being rebuilt. Use Settings -> Share with friend to send your roster as a code.');
}
const sc = document.getElementById('shareCalBtn');
if (sc) sc.addEventListener('click', shareCalendarImage);

// Restore Sort pills on the Roster (Priority/Recent/Stale)
function applySortPills() {
  document.querySelectorAll('.sort-pill').forEach(b =>
    b.classList.toggle('active', b.dataset.sort === (state.rosterSort || 'priority')));
}
document.querySelectorAll('.sort-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    state.rosterSort = btn.dataset.sort;
    saveState(); applySortPills(); renderAvailability();
  });
});
applySortPills();

// Boot: render the default view
renderAvailability();
