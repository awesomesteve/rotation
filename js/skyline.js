/* js/skyline.js — auto-extracted from index.html */
/* Null-safe addEventListener helper — won't crash if element doesn't exist in DOM */
function _skyOn(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
}

/* HEADER LCD CLOCK — 24h local time + weather */
function updateClock() {
  const timeEl = document.querySelector('#headerClock .lcd-active');
  if (!timeEl) return;
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  timeEl.innerHTML = hh + '<span class="colon">:</span>' + mm;
}
updateClock();
setInterval(updateClock, 1000);

/* =========================================================
   LIVE SKY CYCLE — sky color, sun arc, moon arc with real phase
   ========================================================= */

// Map hour-of-day → sky overlay color + opacity. Interpolated smoothly between.
// Stops are anchor times in 24h Jakarta local time.
const SKY_STOPS = [
  { h: 0.0,  c: [10, 12, 30],   o: 0.0  },  // deep night (no overlay; the base purple gradient handles this)
  { h: 5.0,  c: [60, 30, 80],   o: 0.45 },  // pre-dawn purple
  { h: 6.0,  c: [255, 150, 130], o: 0.55 }, // dawn peach
  { h: 7.0,  c: [255, 200, 170], o: 0.4  }, // soft morning glow
  { h: 9.0,  c: [180, 220, 255], o: 0.55 }, // pale morning blue
  { h: 12.0, c: [110, 180, 240], o: 0.65 }, // midday clear blue
  { h: 15.0, c: [130, 190, 240], o: 0.6  }, // afternoon
  { h: 17.0, c: [255, 180, 110], o: 0.5  }, // golden hour
  { h: 18.0, c: [255, 120, 80],  o: 0.55 }, // sunset orange
  { h: 18.75, c: [200, 80, 130], o: 0.5  }, // sunset pink-magenta
  { h: 19.5, c: [80, 40, 100],   o: 0.35 }, // dusk
  { h: 21.0, c: [10, 12, 30],    o: 0.0  }, // night (back to base)
  { h: 24.0, c: [10, 12, 30],    o: 0.0  }
];
function lerp(a, b, t) { return a + (b - a) * t; }
function rgbStr(c) { return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`; }
function skyAtHour(h) {
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i], b = SKY_STOPS[i + 1];
    if (h >= a.h && h <= b.h) {
      const t = (h - a.h) / (b.h - a.h);
      return {
        color: [lerp(a.c[0], b.c[0], t), lerp(a.c[1], b.c[1], t), lerp(a.c[2], b.c[2], t)],
        opacity: lerp(a.o, b.o, t)
      };
    }
  }
  return { color: SKY_STOPS[0].c, opacity: 0 };
}

// Sun & moon arc positions. We define an arc through the sky from horizon→apex→horizon.
// Skyline SVG is 1200 wide. Apex sits around x=600, y=50. Horizons at x=80 and x=1120, y=430.
function arcPos(progress) {
  // progress 0..1 from rise to set
  const t = Math.max(0, Math.min(1, progress));
  // Parabolic arc
  const x = 80 + (1120 - 80) * t;
  // y = lerp between horizon (480) at edges and apex (80) at middle
  const peak = 50, edge = 430;
  // Use 1 - (2t-1)^2 to get a smooth arc (0 at edges, 1 at middle)
  const arc = 1 - Math.pow(2 * t - 1, 2);
  const y = edge - (edge - peak) * arc;
  return { x, y };
}

// Real moon phase calculation, no API needed.
// Anchor: 2000-01-06 18:14 UTC was a precise new moon.
// Synodic month: 29.5305882 days.
function moonPhase(date) {
  const SYN = 29.5305882;
  const anchor = new Date('2000-01-06T18:14:00Z').getTime();
  const days = (date.getTime() - anchor) / (1000 * 60 * 60 * 24);
  let phase = (days % SYN) / SYN;
  if (phase < 0) phase += 1;
  return phase;  // 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
}
// Render the moon at the given phase by repositioning the shadow ellipse.
// phase 0 → full shadow (new), 0.5 → no shadow (full), 0.25/0.75 → half shadow
function renderMoonPhase(phase) {
  const shadow = document.getElementById('moonShadow');
  if (!shadow) return;
  const R = 16; // moon radius in SVG units
  // Convert phase 0..1 to "illumination fraction" 0..1..0
  // and to "shadow-direction" (waxing = left-lit, waning = right-lit)
  // We model the terminator as an ellipse centered offset horizontally.
  // - phase 0 (new): shadow covers everything → shadow rx=R, cx=0 (full opacity)
  // - phase 0.25 (first quarter): half-illuminated, shadow on left half → shadow rx=R, cx = -R/2? Actually use a different trick:
  //     Use shadow ellipse with rx that goes negative→0→positive across phase, cx=0
  // Implementation: an ellipse rx varies; sign of an offset cx flips between waxing & waning
  // Simpler & accurate: cover one hemisphere with a rectangle and the boundary with an ellipse.

  // Cleaner approach using one ellipse:
  // phase 0     → shadow rx = +R, cx = 0  (full dark disc covers moon)
  // phase 0.25  → shadow rx = 0,  cx = -R/2 ... no this gets complex.
  //
  // Best technique: TWO clip regions. But we only have one shadow ellipse.
  // Easier: vary opacity for "amount lit" and offset for direction.
  // For an artistic representation (not astronomically perfect) this is fine.

  // Map phase to "shadow center X" and "shadow rx":
  // phase 0   (new):    shadow at center, rx = R     → fully dark
  // phase 0.25 (waxing first qtr): shadow shifted left, partial coverage of left half (we see right half lit)
  // phase 0.5 (full):  shadow off-screen, rx = 0    → fully lit
  // phase 0.75 (waning last qtr): shadow shifted right, partial coverage of right half (we see left half lit)
  //
  // We parameterize by f = 2 * |phase - 0.5| (0 at full, 1 at new — a "darkness" amount)
  // and a sign: waxing (phase < 0.5) → light grows on right side → shadow on left
  //             waning (phase > 0.5) → light shrinks from right → shadow on right
  const darkness = Math.abs((phase - 0.5) * 2);  // 0 (full) → 1 (new)
  const waxing = phase < 0.5;
  // The shadow ellipse covers the "dark" portion. Its rx scales with darkness, its cx shifts to the dark side.
  // For a clean visual, we use rx = R * darkness on the dark hemisphere center.
  // Trick: combine an ellipse offset to one side. We slide it so the boundary lands at the right spot.
  if (darkness < 0.02) {
    // Practically full moon
    shadow.setAttribute('rx', 0);
    shadow.setAttribute('cx', 0);
  } else if (darkness > 0.98) {
    // Practically new moon — disc invisible
    shadow.setAttribute('rx', R);
    shadow.setAttribute('cx', 0);
  } else {
    // Crescent/gibbous. Use a wide ellipse offset to one side.
    // rx is wide enough to cut a proper curve into the moon disc.
    const rx = R * (1 - darkness * 0.3);  // slight rx variation
    const offsetMag = R * (1 - darkness);  // how far the shadow center sits off-disc
    const cx = waxing ? -offsetMag : offsetMag;
    shadow.setAttribute('rx', rx);
    shadow.setAttribute('cx', cx);
  }
}

// Main update function — called every minute
function updateSky() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(now);
  const hh = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const mm = parseInt(parts.find(p => p.type === 'minute').value, 10);
  // If "always night" is on, lock the hour at 1am (deep night, moon mid-arc)
  const h = state.alwaysNight ? 1.0 : hh + mm / 60;

  // Update sky overlay
  const { color, opacity } = skyAtHour(h);
  const dyn = document.getElementById('skyDynamic');
  if (dyn) {
    dyn.setAttribute('fill', rgbStr(color));
    dyn.setAttribute('opacity', opacity.toFixed(3));
  }

  // Stars visible at night (h < 5.5 or h > 19)
  const stars = document.getElementById('stars');
  if (stars) {
    let starOpacity = 0;
    if (h < 5.5) starOpacity = 1;
    else if (h < 6.5) starOpacity = 1 - (h - 5.5);
    else if (h > 20) starOpacity = Math.min(1, (h - 19.5) / 1.5);
    stars.setAttribute('opacity', starOpacity.toFixed(2));
  }

  // Sun: rises ~6am, sets ~6pm (rough Jakarta equatorial schedule, doesn't vary much)
  const sunEl = document.getElementById('sun');
  const SUN_RISE = 6.0, SUN_SET = 18.0;
  if (sunEl) {
    if (h >= SUN_RISE && h <= SUN_SET) {
      const p = (h - SUN_RISE) / (SUN_SET - SUN_RISE);
      const pos = arcPos(p);
      sunEl.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      sunEl.style.display = '';
      sunEl.style.opacity = 1;
    } else {
      sunEl.style.opacity = 0;
      setTimeout(() => { if (sunEl.style.opacity == 0) sunEl.style.display = 'none'; }, 4500);
    }
  }

  // Moon: rough opposite of sun — rises ~7pm, sets ~5am (highly variable in real life but a good approximation)
  // For a romantic look it's fine that this isn't astronomically perfect.
  const moonEl = document.getElementById('moon');
  const MOON_RISE = 19.0, MOON_SET = 29.0;  // 29 = next day 5am
  if (moonEl) {
    let mh = h;
    if (mh < 5) mh += 24; // wrap so midnight-5am is treated as continuation of last night
    if (mh >= MOON_RISE && mh <= MOON_SET) {
      const p = (mh - MOON_RISE) / (MOON_SET - MOON_RISE);
      const pos = arcPos(p);
      moonEl.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      moonEl.style.display = '';
      moonEl.style.opacity = 1;
      // Real moon phase from astronomical calculation
      try {
        renderMoonPhase(moonPhase(now));
      } catch (e) {
        // If math fails for any reason → default to full moon (no shadow)
        const shadow = document.getElementById('moonShadow');
        if (shadow) { shadow.setAttribute('rx', 0); shadow.setAttribute('cx', 0); }
      }
    } else {
      moonEl.style.opacity = 0;
      setTimeout(() => { if (moonEl.style.opacity == 0) moonEl.style.display = 'none'; }, 4500);
    }
  }
}
updateSky();
// Re-evaluate every minute. The minute change is enough — sky shifts are slow.
setInterval(updateSky, 60 * 1000);

/* WEATHER — Open-Meteo (no API key, free) — Jakarta coords */
// Returns an inline SVG string for the given WMO weather code, in full color
function weatherSvgIcon(code) {
  if (code === 0) {
    // ☀ Clear sun — bright yellow
    return `<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#ffd43b"/><g stroke="#ffd43b" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/></g></svg>`;
  }
  if ([1, 2].includes(code)) {
    // 🌤 Partly cloudy — sun + cloud
    return `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="9" cy="9" r="4" fill="#ffd43b"/><path d="M11 14a4 4 0 0 1 4-4 5 5 0 0 1 5 5 4 4 0 0 1-4 4H9a4 4 0 0 1 0-8 4 4 0 0 1 2 .5z" fill="#dfe5eb" stroke="#a8b0bc" stroke-width=".5"/></svg>`;
  }
  if (code === 3) {
    // ☁ Overcast — grey cloud
    return `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 18a5 5 0 0 1 0-10 6 6 0 0 1 11.5 1 4 4 0 0 1-.5 8H7z" fill="#c4ccd5" stroke="#7a838f" stroke-width=".5"/></svg>`;
  }
  if ([45, 48].includes(code)) {
    // 🌫 Fog — horizontal bars
    return `<svg width="22" height="22" viewBox="0 0 24 24"><g stroke="#b0b8c4" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="3" y1="16" x2="21" y2="16"/></g></svg>`;
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    // 🌦 Drizzle — cloud + small drops
    return `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 14a5 5 0 0 1 0-10 6 6 0 0 1 11.5 1 4 4 0 0 1-.5 8H7z" fill="#c4ccd5"/><path d="M9 17v3M13 17v4M17 17v3" stroke="#74c0fc" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    // 🌧 Rain — bigger cloud + heavier drops
    return `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 12a5 5 0 0 1 0-10 6 6 0 0 1 12 1 4 4 0 0 1-.5 8H6z" fill="#7a8a99"/><path d="M8 14l-1 6M12 14l-1 7M16 14l-1 6" stroke="#22b8cf" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    // ❄ Snow — snowflake
    return `<svg width="20" height="20" viewBox="0 0 24 24"><g stroke="#74c0fc" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></g></svg>`;
  }
  if ([95, 96, 99].includes(code)) {
    // ⛈ Thunderstorm — cloud + lightning bolt
    return `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 11a5 5 0 0 1 0-10 6 6 0 0 1 12 1 4 4 0 0 1-.5 8H6z" fill="#5a6470"/><path d="M13 13l-4 6h3l-1 5 5-7h-3z" fill="#ffd43b" stroke="#a8841a" stroke-width=".4"/></svg>`;
  }
  return '·';
}

/* ── Weather location state ────────────────────────────────────────────── */
let _wxLat = -6.2, _wxLon = 106.8, _wxCity = 'Jakarta';  // defaults

/* Attempt GPS once; silently fall back to Jakarta if denied/unavailable */
function _tryGpsWeather(onSuccess) {
  if (!navigator.geolocation) { if (onSuccess) onSuccess(); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      _wxLat  = pos.coords.latitude;
      _wxLon  = pos.coords.longitude;
      _wxCity = '📍 My location';
      if (onSuccess) onSuccess();
    },
    _err => { if (onSuccess) onSuccess(); },  // permission denied → keep Jakarta
    { timeout: 8000, maximumAge: 300000 }
  );
}

async function updateWeather() {
  const iconEl = document.getElementById('hwIcon');
  const tempEl = document.getElementById('hwTemp');
  if (!iconEl || !tempEl) return;
  try {
    const tz  = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${_wxLat}&longitude=${_wxLon}`
              + `&current=temperature_2m,weather_code,precipitation,wind_speed_10m&timezone=${tz}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();
    const cur = data.current;
    const t = Math.round(cur.temperature_2m);
    iconEl.innerHTML = weatherSvgIcon(cur.weather_code);
    tempEl.textContent = `${t}°`;
    applyWeatherToSky(cur.weather_code, cur.precipitation || 0);
  } catch (e) {
    tempEl.textContent = '--°';
  }
}

/* On first load, try GPS then update header widget */
_tryGpsWeather(updateWeather);

// Render rain drops once based on density; called when intensity changes
let currentRainLevel = '';
function renderRain(level) {
  if (level === currentRainLevel) return;
  currentRainLevel = level;
  const root = document.getElementById('weatherRain');
  root.className = level; // 'drizzle' | '' | 'heavy'
  root.innerHTML = '';
  if (level === 'none') return;
  const counts = { drizzle: 25, '': 55, heavy: 100 }; // dropdown count by intensity
  const n = counts[level] != null ? counts[level] : 0;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 1280 - 40;
    const y = Math.random() * 380 + 100;  // start anywhere above the skyline
    const len = 6 + Math.random() * 14;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'rain-drop');
    line.setAttribute('x1', x);
    line.setAttribute('y1', y);
    line.setAttribute('x2', x - len * 0.4);
    line.setAttribute('y2', y + len);
    line.style.animationDelay = (-Math.random() * 0.8) + 's';
    line.style.animationDuration = (0.6 + Math.random() * 0.4) + 's';
    root.appendChild(line);
  }
}

// Map weather code → visible layers + intensities
function applyWeatherToSky(code, precipMm) {
  const clouds = document.getElementById('weatherClouds');
  const fog    = document.getElementById('weatherFog');
  if (!clouds || !fog) return;

  // Weather animation off? hide everything and bail.
  if (!state.animateWeather) {
    clouds.setAttribute('opacity', 0);
    fog.setAttribute('opacity', 0);
    renderRain('none');
    return;
  }

  // Determine layers from WMO code
  const isClear      = code === 0;
  const isPartlyCloudy = [1, 2].includes(code);
  const isOvercast   = code === 3;
  const isFog        = [45, 48].includes(code);
  const isDrizzle    = [51, 53, 55, 56, 57].includes(code);
  const isRain       = [61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  const isStorm      = [95, 96, 99].includes(code);
  const isHeavyRain  = [65, 67, 82, 99].includes(code) || precipMm >= 2.5;

  let cloudOpacity = 0;
  if (isClear) cloudOpacity = 0.15;        // few wisps even on "clear"
  else if (isPartlyCloudy) cloudOpacity = 0.45;
  else if (isOvercast || isFog) cloudOpacity = 0.75;
  else if (isDrizzle || isRain) cloudOpacity = 0.85;
  else if (isStorm) cloudOpacity = 0.95;
  clouds.setAttribute('opacity', cloudOpacity);

  // Fog
  fog.setAttribute('opacity', isFog ? 0.35 : 0);

  // Rain
  if (isStorm || isHeavyRain) renderRain('heavy');
  else if (isRain) renderRain('');
  else if (isDrizzle) renderRain('drizzle');
  else renderRain('none');

  // Lightning during thunderstorms — start a random-flash interval
  setLightningActive(isStorm);
}

let lightningTimer = null;
function setLightningActive(on) {
  if (on && !lightningTimer) {
    const fireFlash = () => {
      const el = document.getElementById('weatherLightning');
      if (!el) return;
      el.classList.remove('flash'); void el.offsetWidth; // restart animation
      el.classList.add('flash');
    };
    // First flash quickly, then random 6-18 second cycle
    fireFlash();
    lightningTimer = setInterval(() => {
      if (Math.random() < 0.6) fireFlash();
    }, 6000 + Math.random() * 12000);
  } else if (!on && lightningTimer) {
    clearInterval(lightningTimer);
    lightningTimer = null;
  }
}
// Refresh header widget every 15 minutes
setInterval(updateWeather, 15 * 60 * 1000);

/* Tap the LCD clock → show 24-hour weather feed with rain forecast */
function wmoIcon(code) {
  return code === 0 ? '☀'
    : [1, 2].includes(code) ? '🌤'
    : code === 3 ? '☁'
    : [45, 48].includes(code) ? '🌫'
    : [51, 53, 55, 56, 57].includes(code) ? '🌦'
    : [61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? '🌧'
    : [71, 73, 75, 77, 85, 86].includes(code) ? '❄'
    : [95, 96, 99].includes(code) ? '⛈'
    : '·';
}

async function _fetchHourly() {
  const nowEl  = document.getElementById('weatherNow');
  const grid   = document.getElementById('weatherHourly');
  const cityEl = document.getElementById('weatherCity');
  const attrib = document.getElementById('weatherAttrib');
  nowEl.textContent = 'Loading…';
  grid.innerHTML = '';
  if (cityEl) cityEl.textContent = _wxCity.toUpperCase();
  try {
    const tz  = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${_wxLat}&longitude=${_wxLon}`
      + `&current=temperature_2m,weather_code,precipitation`
      + `&hourly=temperature_2m,weather_code,precipitation_probability,precipitation`
      + `&forecast_hours=24&timezone=${tz}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const cur = data.current;
    nowEl.innerHTML = `${wmoIcon(cur.weather_code)} ${Math.round(cur.temperature_2m)}°`
      + `<span style="font-size:14px;color:var(--muted);font-weight:500;margin-left:8px">`
      + `${cur.precipitation > 0 ? cur.precipitation.toFixed(1) + 'mm rain now' : 'no rain'}</span>`;
    if (attrib) attrib.textContent = `${_wxLat.toFixed(2)}, ${_wxLon.toFixed(2)}`;
    const h = data.hourly;
    const nowHour = new Date(cur.time).getHours();
    let startIdx = h.time.findIndex(t => new Date(t).getHours() === nowHour);
    if (startIdx < 0) startIdx = 0;
    const cards = [];
    for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) {
      const t    = new Date(h.time[i]);
      const hh   = String(t.getHours()).padStart(2, '0');
      const temp = Math.round(h.temperature_2m[i]);
      const code = h.weather_code[i];
      const prob = h.precipitation_probability[i];
      const mm   = h.precipitation[i];
      const rainCls  = mm >= 2.5 ? ' heavy-rain' : (mm >= 0.2 || prob >= 60 ? ' rain' : '');
      const rainText = mm >= 0.2 ? `${mm.toFixed(1)}mm` : (prob >= 30 ? `${prob}%` : '—');
      const rainDry  = mm < 0.2 && prob < 30 ? ' dry' : '';
      cards.push(`<div class="weather-hour${rainCls}">
        <span class="wh-hour">${hh}:00</span>
        <span class="wh-icon">${wmoIcon(code)}</span>
        <span class="wh-temp">${temp}°</span>
        <span class="wh-rain${rainDry}">${rainText}</span>
      </div>`);
    }
    grid.innerHTML = cards.join('');
  } catch (e) {
    nowEl.textContent = 'Weather unavailable';
  }
}

/* Geocode a city name via Open-Meteo geocoding API */
async function _geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('geocode failed');
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error('city not found');
  return data.results[0]; // { latitude, longitude, name, country }
}

async function openHourlyWeather() {
  document.getElementById('weatherPopup').classList.add('active');
  await _fetchHourly();
}

/* GPS button */
_skyOn('weatherGps', 'click', () => {
  const cityEl = document.getElementById('weatherCity');
  if (cityEl) cityEl.textContent = 'LOCATING…';
  _tryGpsWeather(async () => {
    await updateWeather();
    await _fetchHourly();
  });
});

/* Vienna quick link */
_skyOn('weatherVienna', 'click', async () => {
  _wxLat = 48.2085; _wxLon = 16.3721; _wxCity = '🇦🇹 Vienna';
  await updateWeather();
  await _fetchHourly();
});

/* Custom city */
_skyOn('weatherCustomBtn', 'click', () => {
  const row = document.getElementById('weatherCustomRow');
  if (!row) return;
  row.style.display = row.style.display === 'none' ? 'flex' : 'none';
  if (row.style.display === 'flex') { const ci = document.getElementById('weatherCustomInput'); if (ci) ci.focus(); }
});

async function _doCustomCity() {
  const input = document.getElementById('weatherCustomInput');
  const name  = input.value.trim();
  if (!name) return;
  const nowEl = document.getElementById('weatherNow');
  nowEl.textContent = 'Looking up…';
  try {
    const place = await _geocodeCity(name);
    _wxLat  = place.latitude;
    _wxLon  = place.longitude;
    _wxCity = place.name + (place.country ? `, ${place.country}` : '');
    document.getElementById('weatherCustomRow').style.display = 'none';
    input.value = '';
    await updateWeather();
    await _fetchHourly();
  } catch(e) {
    nowEl.textContent = 'City not found — try again';
  }
}
_skyOn('weatherCustomGo',    'click',   _doCustomCity);
_skyOn('weatherCustomInput', 'keydown', e => { if (e.key === 'Enter') _doCustomCity(); });

_skyOn('headerWeather', 'click', openHourlyWeather);
_skyOn('weatherClose',  'click', () => {
  const wp = document.getElementById('weatherPopup'); if (wp) wp.classList.remove('active');
});
_skyOn('weatherPopup',  'click', (e) => {
  if (e.target.id === 'weatherPopup') e.target.classList.remove('active');
});

/* Tap the F logo → kiss emoji shower */
function fireKissShower() {
  const root = document.getElementById('kissShower');
  root.classList.add('active');
  const kisses = ['💋','😘','💕','💖','💗','💘'];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'kiss';
    el.textContent = kisses[Math.floor(Math.random() * kisses.length)];
    el.style.left = (Math.random() * 92 + 4) + 'vw';
    el.style.animationDelay = (Math.random() * 0.6) + 's';
    el.style.fontSize = (22 + Math.random() * 16) + 'px';
    el.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
    root.appendChild(el);
  }
  if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
  setTimeout(() => {
    root.innerHTML = '';
    root.classList.remove('active');
  }, 3200);
}
// Bind to the header logo specifically (the PIN lock has a .logo-badge too — it appears first in the DOM)
(document.querySelector('header.app .logo-badge') || document.querySelector('.brand .logo-badge')).addEventListener('click', fireKissShower);

/* =========================================================
   BACKGROUND CHOICES
   ========================================================= */
function applyBg() {
  document.body.setAttribute('data-bg', state.bg || 'svg');
  document.querySelectorAll('[data-bg]').forEach(b => b.classList.toggle('active', b.dataset.bg === state.bg));
  document.querySelectorAll('[data-theme-choice]').forEach(b => b.classList.toggle('active', b.dataset.themeChoice === state.theme));
}
applyBg();

// Detect which photo files actually exist and disable buttons for missing ones.
// Each slot accepts either a .png (screenshot) or .jpg (download) — whichever is found wins.
const PHOTO_BGS = {
  'photo-day':    ['img/bg-day.png',    'bg-day.jpg'],
  'photo-night':  ['img/bg-night.png',  'bg-night.jpg'],
  'photo-sunset': ['img/bg-sunset.png', 'bg-sunset.jpg']
};
let availablePhotos = {};
function detectPhotos() {
  const keys = Object.keys(PHOTO_BGS);
  let pending = keys.length;
  let anyFound = false;
  keys.forEach(key => {
    tryOne(PHOTO_BGS[key], 0, key);
  });
  function tryOne(candidates, idx, key) {
    if (idx >= candidates.length) {
      availablePhotos[key] = false;
      const btn = document.querySelector(`[data-bg="${key}"]`);
      if (btn) { btn.disabled = true; btn.title = `Drop ${candidates.join(' or ')} into the app folder to use this background.`; }
      if (--pending === 0) finalizeStatus();
      return;
    }
    const probe = new Image();
    probe.onload = () => {
      availablePhotos[key] = candidates[idx]; anyFound = true;
      const btn = document.querySelector(`[data-bg="${key}"]`);
      if (btn) btn.disabled = false;
      if (--pending === 0) finalizeStatus();
    };
    probe.onerror = () => tryOne(candidates, idx + 1, key);
    probe.src = candidates[idx];
  }
  function finalizeStatus() {
    const s = document.getElementById('photoStatus');
    if (anyFound) s.textContent = 'Photo backgrounds ready. Greyed-out options are missing files (see instructions below).';
    else s.textContent = 'No photo files found yet. Drop them into the app folder to enable photo backgrounds (see instructions below).';
  }
}
detectPhotos();

// Settings open/close
// settingsBtn was moved into the Tools tab — guard against missing element
{ const _b = document.getElementById('settingsBtn'); if (_b) _b.addEventListener('click', () => showView('settings')); }
{ const _b = document.getElementById('closeSettings'); if (_b) _b.addEventListener('click', () => showView('tools')); }

// Theme choice buttons
document.querySelectorAll('[data-theme-choice]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.theme = btn.dataset.themeChoice;
    saveState(); applyTheme(); applyBg();
  });
});

// Skyline behavior toggles
function applySkylineToggles() {
  const an = document.getElementById('f-always-night');
  const aw = document.getElementById('f-animate-weather');
  if (an) an.checked = !!state.alwaysNight;
  if (aw) aw.checked = !!state.animateWeather;
}
applySkylineToggles();
const anEl = document.getElementById('f-always-night');
const awEl = document.getElementById('f-animate-weather');
if (anEl) anEl.addEventListener('change', () => {
  state.alwaysNight = anEl.checked;
  saveState();
  if (typeof updateSky === 'function') updateSky();
});
if (awEl) awEl.addEventListener('change', () => {
  state.animateWeather = awEl.checked;
  saveState();
  if (typeof updateWeather === 'function') updateWeather();
});

// Background choice buttons
document.querySelectorAll('[data-bg]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.bg = btn.dataset.bg;
    saveState(); applyBg();
  });
});

/* =========================================================
   DATA SAFETY — export / import / auto-folder / backup nag
   =========================================================

   Strategy:
   • localStorage is a *cache* — treat it as disposable.
   • Real source of truth = a .json file the user controls.
   • Three layers of protection:
       1. Export to file  (manual, always works)
       2. Auto-folder     (File System Access API — Chrome on Android/desktop)
                          User picks a folder once; we write there on every save.
       3. Backup nag      (toast after 7 days without an export)
   • On startup: if localStorage is empty but profiles were known to exist,
     show a "looks like data was wiped — import a backup?" prompt.
   ========================================================= */

function buildFullExport() {
  return JSON.stringify({ ...state, _exportedAt: new Date().toISOString(), _v: 2 }, null, 2);
}
function makeFilename() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  return `F-Rotation-${stamp}.json`;
}

/* ── Trigger a plain file download ── */
function downloadBackup() {
  const blob = new Blob([buildFullExport()], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = makeFilename();
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  try { localStorage.setItem('rotation.lastExport', Date.now()); } catch(_) {}
  updateBackupStatus();
}

/* ── File System Access API: pick a folder, remember the handle ──
   The handle is stored in IndexedDB (survives page reloads, unlike memory).
   On every saveState() we write the latest JSON into that folder.          */
const IDB_DB  = 'rotation-fs';
const IDB_KEY = 'folderHandle';

function openFsDb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('handles');
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
async function getFolderHandle() {
  try {
    const db = await openFsDb();
    return await new Promise((res, rej) => {
      const tx  = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get(IDB_KEY);
      req.onsuccess = () => res(req.result || null);
      req.onerror   = () => rej(req.error);
    });
  } catch(_) { return null; }
}
async function setFolderHandle(handle) {
  try {
    const db = await openFsDb();
    await new Promise((res, rej) => {
      const tx  = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(handle, IDB_KEY);
      tx.oncomplete = res; tx.onerror = rej;
    });
  } catch(_) {}
}
async function clearFolderHandle() {
  try {
    const db = await openFsDb();
    await new Promise((res, rej) => {
      const tx  = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete(IDB_KEY);
      tx.oncomplete = res; tx.onerror = rej;
    });
  } catch(_) {}
}

/* Write latest JSON to the auto-folder (silent, called from saveState hook) */
async function autoSaveToFolder() {
  const handle = await getFolderHandle();
  if (!handle) return;
  try {
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      const req = await handle.requestPermission({ mode: 'readwrite' });
      if (req !== 'granted') return;
    }
    const fileHandle = await handle.getFileHandle('F-Rotation-latest.json', { create: true });
    const writable   = await fileHandle.createWritable();
    await writable.write(buildFullExport());
    await writable.close();
    try { localStorage.setItem('rotation.lastExport', Date.now()); } catch(_) {}
    updateBackupStatus();
  } catch(e) {
    if (e.name === 'NotFoundError' || e.name === 'NotAllowedError') {
      await clearFolderHandle();
      updateBackupStatus();
    }
  }
}

/* Auto-folder hook: called explicitly at the end of saveState in data.js.
   We expose autoSaveToFolder globally so data.js can call it. */
window._autoSaveToFolder = function() { autoSaveToFolder(); };

/* ── Backup nag: toast after 7 days without export ── */
function checkBackupNag() {
  try {
    const last = parseInt(localStorage.getItem('rotation.lastExport') || '0', 10);
    const days = (Date.now() - last) / 86400000;
    if (days > 7 && state.profiles && state.profiles.length > 0) {
      setTimeout(() => {
        const t = document.getElementById('easterToast');
        if (t) {
          t.textContent = '⚠️ No backup in 7+ days — tap Settings → Export to file!';
          t.style.background = 'linear-gradient(135deg,#e74c3c,#c0392b)';
          t.classList.add('show');
          setTimeout(() => { t.classList.remove('show'); t.style.background = ''; }, 7000);
        }
      }, 5000);
    }
  } catch(_) {}
}

/* ── Startup wipe detector ── */
function checkDataWipe() {
  try {
    const hadData = localStorage.getItem('rotation.hadData');
    const hasData = state.profiles && state.profiles.length > 0;
    if (hasData) {
      localStorage.setItem('rotation.hadData', '1');
    } else if (hadData && !hasData) {
      setTimeout(() => {
        const yes = confirm(
          '⚠️ Your profile data appears to have been cleared (possibly by "Clear browsing data").\n\n' +
          'Do you have a backup file (F-Rotation-*.json) to restore from?\n\n' +
          'Tap OK to pick a file now, or Cancel to start fresh.'
        );
        if (yes) { const ifi = document.getElementById('importFileInput'); if (ifi) ifi.click(); }
        else { localStorage.removeItem('rotation.hadData'); }
      }, 800);
    }
  } catch(_) {}
}

/* ── Update backup status line in Settings ── */
async function updateBackupStatus() {
  const el = document.getElementById('backupStatusLine');
  if (!el) return;
  try {
    const last   = parseInt(localStorage.getItem('rotation.lastExport') || '0', 10);
    const handle = await getFolderHandle();
    let folderNote = '';
    if (handle) {
      try {
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        folderNote = perm === 'granted' ? ' → ' + handle.name + '/' : ' (folder permission needed — tap Pick Folder)';
      } catch(_) { folderNote = ' (folder disconnected)'; }
    }
    if (!last) {
      el.textContent = handle ? 'Auto-folder active' + folderNote + ' — no export yet' : '⚠️ Never backed up — export now!';
      el.style.color = '#e74c3c';
    } else {
      const mins = Math.round((Date.now() - last) / 60000);
      const ago  = mins < 2 ? 'just now' : mins < 60 ? mins + 'm ago' : Math.round(mins/60) + 'h ago';
      el.textContent = handle ? 'Auto-folder' + folderNote + ' · last saved ' + ago : 'Last export: ' + ago;
      el.style.color = 'var(--muted)';
    }
  } catch(_) {}
}

/* ── Button wiring ── */

_skyOn('exportFileBtn', 'click', () => downloadBackup());

_skyOn('pickFolderBtn', 'click', async () => {
  if (!window.showDirectoryPicker) {
    alert('Your browser doesn\'t support folder picking. Use "Export to file" and save to Google Drive or Files manually.');
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'documents' });
    await setFolderHandle(handle);
    await autoSaveToFolder();
    updateBackupStatus();
    alert('✅ Auto-save folder set to "' + handle.name + '".\n\nF-Rotation-latest.json will update there every time you save a profile or date.');
  } catch(e) {
    if (e.name !== 'AbortError') alert('Could not access that folder: ' + e.message);
  }
});

_skyOn('clearFolderBtn', 'click', async () => {
  await clearFolderHandle();
  updateBackupStatus();
  alert('Auto-save folder cleared. Use Export to file for manual backups.');
});

_skyOn('saveDriveBtn', 'click', () => {
  downloadBackup();
  setTimeout(() => alert(
    '📥 File downloaded!\n\n' +
    'To save to Google Drive:\n' +
    '1. Open the Files app\n' +
    '2. Find the downloaded F-Rotation-*.json file\n' +
    '3. Long-press → Share → Save to Drive\n\n' +
    'Or tap "Pick auto-save folder" and choose your Drive folder directly (Android Chrome only).'
  ), 400);
});

_skyOn('importFileBtn', 'click', () => { const ifi = document.getElementById('importFileInput'); if (ifi) ifi.click(); });
_skyOn('importFileInput', 'change', async (e) => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try {
    const text = await f.text();
    const data = JSON.parse(text);
    if (!data.profiles || !Array.isArray(data.profiles)) throw new Error('not a rotation file');
    const dateStr = data._exportedAt ? new Date(data._exportedAt).toLocaleString() : 'unknown date';
    if (!confirm('Restore from backup?\n\nThis will replace all current data with the backup from ' + dateStr + '.\n\nYour current data will be lost.')) return;
    state = Object.assign(defaultState(), data);
    saveState(); applyTheme(); applyBg();
    localStorage.setItem('rotation.hadData', '1');
    alert('✅ Restored successfully!');
    showView('profiles');
  } catch(err) { alert('That file doesn\'t look like a Rotation backup. Make sure it\'s an F-Rotation-*.json file.'); }
  e.target.value = '';
});

_skyOn('wipeAllBtn', 'click', () => {
  if (!confirm('This deletes ALL profiles, schedules, dates, and photos. Are you sure?')) return;
  if (!confirm('Really sure? This cannot be undone.')) return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem('rotation.v1');
  localStorage.removeItem('rotation.hadData');
  localStorage.removeItem('rotation.lastExport');
  location.reload();
});

window.addEventListener('DOMContentLoaded', () => {
  checkDataWipe();
  checkBackupNag();
  updateBackupStatus();
});
document.addEventListener('click', (e) => {
  if (e.target && e.target.dataset && e.target.dataset.view === 'settings') updateBackupStatus();
});


/* =========================================================
   TABS
   ========================================================= */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
  if (name === 'editor') {
    document.getElementById('view-editor').classList.add('active');
    document.querySelector('nav.tabs button[data-view="profiles"]').classList.add('active');
  } else if (name === 'settings') {
    document.getElementById('view-settings').classList.add('active');
    applyBg();
  } else {
    document.getElementById('view-' + name).classList.add('active');
    const btn = document.querySelector(`nav.tabs button[data-view="${name}"]`);
    if (btn) btn.classList.add('active');
  }
  if (name === 'availability') renderAvailability();
  if (name === 'profiles') renderProfilesList();
  if (name === 'calendar') renderCalendar();
  if (name === 'tools') showToolsLanding();
  // Toggle floating brand bars per view
  document.getElementById('floatBarRoster').classList.toggle('show', name === 'availability');
  document.getElementById('floatBarProfiles').classList.toggle('show', name === 'profiles');
  window.scrollTo({top:0, behavior:'instant'});
}
document.querySelectorAll('nav.tabs button').forEach(b => {
  b.addEventListener('click', () => showView(b.dataset.view));
});

/* =========================================================
   AVATAR — auto-crop face area: scale down on top third of photo
   We can't actually detect faces without a library, but the heuristic
   "background-position: center 30%" centers on the upper portion where
   faces typically sit. We apply this everywhere a round avatar shows.
   ========================================================= */
function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0,2).join('').toUpperCase();
}

/* =========================================================
   PROFILES LIST
   ========================================================= */
