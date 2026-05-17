# F-buddy Rotation app — Project Context

> Short reference doc for new Claude conversations. Read this first before touching any file.

## What it is

A single-page web app for tracking a personal "rotation" of profiles, scheduling them across weekly time slots, and keeping notes/red flags. All state lives in the browser via `localStorage` — there is no backend.

## File structure

```
index.html          — shell: CSS + HTML only (~3,946 lines)
js/
  data.js           — state (loadState/saveState/defaultState), constants, applyTheme (~85 lines)
  skyline.js        — LCD clock, sky/weather engine, sun/moon, animation loop (~653 lines)
  profiles.js       — renderProfilesList, renderCard, drag-to-reorder, all modals (~1,718 lines)
  audio.js          — song engine (loads audio/songs.json, playLocalMp3, startMusic) (~202 lines)
  fireworks.js      — _chConfetti, _chButtonConfetti, easter eggs (~237 lines)
  quotes.js         — Tate quotes init, roster quotes array, renderAvailability boot (~284 lines)
audio/
  songs.json        — song manifest (add new songs here + drop mp3 in this folder)
  back-in-black.mp3
  goodtimes.mp3
  heman.mp3
  jarvis.mp3
  mask.mp3
  youre-broke.mp3
img/
  bg-day.png
  bg-night.png
  bg-sunset.png
backups/            — index-before-<change>-<HHMMSS>.html snapshots
CONTEXT.md          — this file
```

## Architecture

`index.html` contains all CSS and HTML. JS is split into 6 external files loaded in order at the bottom of `<body>`. No build step — just open in a browser.

### Module load order (important — globals defined in earlier files are used by later ones)

1. `js/data.js` — defines `state`, `STORE_KEY`, `loadState`, `saveState`, `DAYS`, `SLOTS`, `DEFAULT_TAGS`, `DEFAULT_RED_FLAGS`, `applyTheme`
2. `js/skyline.js` — defines `updateClock`, `skyAtHour`, `lerp`, `applyBg`, `updateWeather`, `initSky`
3. `js/profiles.js` — defines `renderProfilesList`, `renderCard`, `renderAvailability`, all drag logic
4. `js/audio.js` — defines `SONG_MP3_FILES`, `SHUFFLE_POOL`, `playLocalMp3`, `startMusic`, `onSongsReady`
5. `js/fireworks.js` — defines `_chConfetti`, `_chButtonConfetti`; wires up easter eggs
6. `js/quotes.js` — defines `quotes` array; calls `renderAvailability()` at boot

### State

- Key: `STORE_KEY = 'rotation.v2'` in `localStorage`.
- `loadState()` / `saveState()` / `defaultState()` are in `js/data.js`.
- Default state shape:
  - `profiles: []`
  - `customTags: []`
  - `dates: {}` — keyed calendar of scheduled dates
  - `theme: 'dark'`
  - `bg: 'svg'`
  - `priorityOrder: []`
  - `pinHash: ''` — optional PIN lock
  - `rosterSort: 'priority'`
  - `startupSong: 'shuffle'` — `'shuffle' | <song key> | 'off'`
  - `snippets: null` — null means use defaults
  - `alwaysNight: false` — override the day/night sky cycle
  - `animateWeather: true` — animate clouds/rain/lightning on the skyline

## SVG Skyline — layout & paint order

ViewBox: `0 0 1200 700`, `preserveAspectRatio="xMidYMax slice"`, height `72vh`
**Phone visible x range ≈ 350–850** (on 390px wide phone)

### SVG paint order (bottom to top — later elements appear in front):
1. Sky gradient + stars + clouds/weather
2. FAR layer — distant dark towers (layerFar gradient)
3. MID layer — medium towers (layerMid gradient), Monas, mosque
4. MID-RISE infill — dark-purple band (midRiseGrad), fills gap between towers and foreground
5. NEAR layer — navy/grey low-rise buildings (layerLowrise/layerLowrise2), Kota mall tower, Classic Hotel
   - Low-rise block: x=350–575, y=525–625 (clipped at y=625 so it doesn't overlap road)
   - Kota mall tower: x=385–490, y=517–625
   - Classic Hotel: x=700–758, y=475–625
   - Filler low-rises: x=265, 620, 830, 960 (same layerLowrise grey)
6. Aviation lights, twinkling windows, vehicles (helicopter, jet, buses, cars)
7. **Shopfronts** (absolute last before road — on top of all buildings):
   - KOPI TIAM: x=382–444
   - KOTA MALL entrance: x=538–624
   - CAFÉ: x=700–772
   - 24H MART: x=790–848
8. Neon rooftop signs (GRAND INDO, KOTA, SENAYAN, LOTTE, CLASSIC, BLOK M)
9. Falling stars (hidden, triggered by JS)
10. **ROAD + PARK** (on top of shops — covers building bases):
    - Road (asphalt): y=625, height=40
    - Park (green): y=665, height=35
    - Trees, palms, shrubs in park zone
    - Centre-line dashes at y=644

### Key gradients
- `layerFar`: near-black `#0d0918 → #020104`
- `layerMid`: dark purple-grey
- `layerLowrise`: slate navy-grey `#3a3a4a → #2a2a38 → #1e1e2a` ← USE THIS for all foreground buildings
- `layerNear`: near-black `#0d0918 → #020104` ← only for very dark accents, NOT buildings
- `streetBand`: warm dark asphalt
- `midRiseGrad`: dark purple `#3a1f4a → #1a0d28`

### Vehicles
- **Buses**: CSS `translate(-50px, 630px)` at start — ride at y=630 in the road band
- **Cars** (headlight dots `cy="633"`, tail lights `cy="635"`): SVG + CSS keyframes at y=633/635
- **Helicopter**: CSS animated, flies mid-sky
- **747 jet**: `animation-delay: 0s` — flies immediately on load, `jet-cross-right 180s`

### Sun / Moon arc
In `js/skyline.js` → `arcPos()`:
- `peak = 50` (apex y), `edge = 430` (horizon y)
- Sun: rises 6am, sets 6pm
- Moon: rises 7pm, sets 5am (next day)

### Falling stars
- 3 hidden SVG elements: `#fstar1`, `#fstar2`, `#fstar3`
- JS in inline `<script>` after `quotes.js` fires one randomly 8–20s after load, then every 18–45s

### Neon signs (rooftop level — sit just above midrise building tops)
- GRAND INDO: `translate(410, 480)`
- KOTA (mall tower rooftop): `translate(437, 478)`
- SENAYAN: `translate(560, 458)`
- LOTTE: `translate(670, 462)`
- CLASSIC (hotel): `translate(729, 450)`
- BLOK M: `translate(800, 462)`

## Conventions

- State changes go through `saveState()` so localStorage stays in sync.
- Before risky edits, save a copy into `backups/` named `index-before-<change>-<HHMMSS>.html`.
- CSS edits go in `index.html` (inside `<style>`). JS edits go in the relevant `js/*.js` file.
- SVG skyline is inside `index.html` — paint order matters (later = on top).
- **Always use Python `str.replace()` scripts via bash for edits** — never use the Edit tool directly on index.html (too large, risk of truncation).
- **layerLowrise for all foreground buildings** — never layerNear (that's near-black).


## MANDATORY: Session-start checklist (run BEFORE any edits)

```bash
# 1. Syntax check all JS files
for f in data.js skyline.js profiles.js audio.js fireworks.js quotes.js; do
  result=$(node --check "js/$f" 2>&1)
  if [ $? -eq 0 ]; then echo "✓ $f"; else echo "✗ BROKEN $f: $result"; fi
done

# 2. SVG balance check
python3 -c "
c=open('index.html').read()
print(f\'<svg: {c.count(chr(60)+"svg")}, </svg>: {c.count("</svg>")}\')"
```

If any file fails — **stop and fix before proceeding**. Never skip this.

## Why truncation happens & how to prevent it

Python `f.write()` via bash heredoc can silently truncate if:
- The string contains unescaped `$`, backticks, or special shell chars
- Always use `python3 << 'PYEOF'` (quoted PYEOF = no shell interpolation)
- Always verify file size after write: `wc -c file.js`
- Always run `node --check` after any JS edit
- Never use regex `x="NNN"` across the whole HTML file — scope to specific blocks only

## Tips for future conversations

- Read this file first — saves reading 7,000 lines.
- Mention the function name or file when asking for a change.
- The skyline SVG viewBox is `0 0 1200 700`. On a phone (~390px wide, 65vh tall ≈ 549px), the **visible SVG x range is roughly 350–850**.
- If the app's structure changes significantly, update this file.
