/* js/fireworks.js — auto-extracted from index.html */
function _chConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:149;image-rendering:pixelated';
  // Use 1:1 pixel mapping — no DPR scaling so pixels stay hard
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width  = Math.floor(W);
  canvas.height = Math.floor(H);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // VGA 16-colour palette (no soft pastels)
  const VGA = ['#ff0055','#ffff00','#00ff41','#aa00ff','#ff6600','#ffffff','#00ccff','#ff3333','#00ff00','#ffaa00'];

  const SKYLINE_Y = H * 0.62;
  const rockets = [];
  const NUM_ROCKETS = 10;
  for (let r = 0; r < NUM_ROCKETS; r++) {
    const color = VGA[Math.floor(Math.random() * VGA.length)];
    // Stagger across full width with slight randomisation
    const targetX = Math.round(W * (0.07 + (r / (NUM_ROCKETS - 1)) * 0.86) + (Math.random() - 0.5) * W * 0.06);
    const targetY = Math.round(H * (0.06 + Math.random() * 0.30));
    const launchDelay = r * 420 + Math.random() * 200;
    const riseTime    = 600 + Math.random() * 400;
    rockets.push({ targetX, startY: SKYLINE_Y, targetY, color,
                   launchDelay, riseTime, exploded: false, sparks: [], trail: [] });
  }

  const start = performance.now();

  // Draw a crisp 1-pixel point (no arc, no blur)
  function pset(x, y, col, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }

  // Draw a crisp line spark in direction of travel
  function drawSpark(s) {
    if (s.life <= 0) return false;
    const speed = Math.hypot(s.vx, s.vy);
    const len   = Math.max(2, Math.min(8, Math.round(speed * 1.6)));
    const nx = speed > 0.01 ? s.vx / speed : 0;
    const ny = speed > 0.01 ? s.vy / speed : 1;
    // Draw pixel-by-pixel along the spark direction — true rasterised line
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(s.x), Math.round(s.y));
    ctx.lineTo(Math.round(s.x - nx * len), Math.round(s.y - ny * len));
    ctx.stroke();
    return true;
  }

  function tick(now) {
    ctx.clearRect(0, 0, W, H);
    const t = now - start;
    let anyAlive = false;

    rockets.forEach(rk => {
      const rt = t - rk.launchDelay;
      if (rt < 0) { anyAlive = true; return; }

      if (!rk.exploded) {
        const prog      = Math.min(rt / rk.riseTime, 1);
        const easedProg = Math.sqrt(prog); // decelerate near top
        const cx = rk.targetX;
        const cy = Math.round(rk.startY + (rk.targetY - rk.startY) * easedProg);

        rk.trail.push({ x: cx, y: cy });
        if (rk.trail.length > 18) rk.trail.shift();

        // Blocky pixel trail — each step one pixel, fading by index
        rk.trail.forEach((pt, i) => {
          const a = (i / rk.trail.length) * 0.9;
          pset(pt.x, pt.y, rk.color, a);
        });
        // Rocket head: 2×2 white block
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);

        if (prog >= 1) {
          rk.exploded = true;
          const NUM_SPARKS = 55 + Math.floor(Math.random() * 20);
          for (let i = 0; i < NUM_SPARKS; i++) {
            const ang  = (Math.PI * 2 * i / NUM_SPARKS) + (Math.random() - 0.5) * 0.18;
            const fast = Math.random() > 0.28;
            const sp   = fast ? (2.8 + Math.random() * 4.0) : (0.4 + Math.random() * 1.4);
            // Some sparks get a secondary colour for variation
            const col  = Math.random() < 0.12 ? '#ffffff'
                       : Math.random() < 0.08 ? VGA[Math.floor(Math.random()*VGA.length)]
                       : rk.color;
            rk.sparks.push({
              x: rk.targetX, y: rk.targetY,
              vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
              color: col, life: 1.0,
              decay: fast ? (0.009 + Math.random() * 0.008) : (0.004 + Math.random() * 0.004)
            });
          }
        }
        anyAlive = true;
      } else {
        let sparkAlive = false;
        rk.sparks.forEach(s => {
          if (s.life <= 0) return;
          s.x  += s.vx; s.y  += s.vy;
          s.vy += 0.055;  // gravity
          s.vx *= 0.976;  // air drag
          s.life -= s.decay;
          if (drawSpark(s)) sparkAlive = true;
        });
        if (sparkAlive) anyAlive = true;
      }
    });

    ctx.globalAlpha = 1; ctx.lineWidth = 1;
    if (anyAlive || t < 5000) requestAnimationFrame(tick);
    else canvas.remove();
  }
  requestAnimationFrame(tick);
}

// Wild 90s neon confetti for the Classic Hotel button — pink/baby-blue pixel burst
function _chButtonConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:150;image-rendering:pixelated';
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Neon 90s palette: hot pink, baby blue, lavender, white, yellow
  const NEON = ['#ff69b4','#7ec8e3','#c084fc','#ffffff','#ffec00','#ff85a1','#a8d8ea','#e0aaff'];
  const pieces = [];
  // 8 wild bursts spread across the screen
  for (let burst = 0; burst < 8; burst++) {
    const ox = W * (0.05 + Math.random() * 0.9);
    const oy = H * (0.2 + Math.random() * 0.6);
    const burstColor = NEON[Math.floor(Math.random() * NEON.length)];
    for (let i = 0; i < 30; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp  = 1.5 + Math.random() * 4.5;
      // Mix of square pixels and short lines for retro feel
      pieces.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
        w: Math.random() < 0.5 ? 3 : 2,  // pixel size
        h: Math.random() < 0.3 ? 6 : 3,  // taller = streaky
        rot: Math.random() * Math.PI,
        color: Math.random() < 0.3 ? '#ffffff' : burstColor,
        life: 1, decay: 0.008 + Math.random() * 0.01,
        bornAt: burst * 120 + Math.random() * 80
      });
    }
  }
  const start = performance.now();
  function tick(now) {
    ctx.clearRect(0, 0, W, H);
    const t = now - start;
    let anyAlive = false;
    pieces.forEach(p => {
      if (t < p.bornAt) { anyAlive = true; return; }
      p.x  += p.vx; p.y  += p.vy;
      p.vy += 0.06; p.vx *= 0.988;
      p.rot += 0.12;
      p.life -= p.decay;
      if (p.life > 0) {
        anyAlive = true;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.rotate(p.rot);
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
    });
    ctx.globalAlpha = 1;
    if (anyAlive) requestAnimationFrame(tick); else canvas.remove();
  }
  requestAnimationFrame(tick);
}
function _chSadFloater() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = '😢';
      el.style.cssText = 'position:fixed;font-size:'+(60+Math.random()*30)+'px;z-index:150;pointer-events:none;'
        + 'left:'+(10+Math.random()*80)+'vw;bottom:-20vh;'
        + 'animation:sadFloat '+(3+Math.random()*2)+'s ease-out forwards;'
        + 'filter:drop-shadow(0 4px 8px rgba(0,0,0,.4));';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5500);
    }, i * 350);
  }
}

// Trigger when the Classic Hotel button scrolls into view
let _chVisible = false;
function setupClassicHotelTrigger() {
  const target = document.getElementById('classicHotelWrap');
  if (!target) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !_chVisible) {
        _chVisible = true;
        const status = classicHotelStatus(new Date());
        if (status === 'open') _chConfetti();
        else _chSadFloater();
      } else if (!entry.isIntersecting) {
        _chVisible = false;
      }
    });
  }, { threshold: 0.5 });
  obs.observe(target);
}
renderClassicHotel();
setupClassicHotelTrigger();

// Tap the button to manually re-trigger
{
  const btn = document.getElementById('classicHotelBtn');
  if (btn) btn.addEventListener('click', () => {
    const status = classicHotelStatus(new Date());
    if (status === 'open') _chButtonConfetti(); else _chSadFloater();
  });
}


// === Andrew Tate rotating quotes (Dates section) ===
// Uses .quote-band / .quote-text / .quote-attr CSS — identical fade to the Roster quote band
