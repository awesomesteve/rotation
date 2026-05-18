# F-buddy Rotation App — Claude Context

## What this app is
Jakarta-themed PWA for managing a social roster ("the roster"). Single-page app.
No build system — plain HTML/CSS/JS, open directly in browser.

## File structure
```
index.html          — 4400+ lines: ALL SVG skyline, ALL CSS, app shell HTML
js/data.js          — state object, saveState(), loadState()
js/skyline.js       — sky cycle, weather, animations, clock, backup/export, showView()
js/content.js       — TOASTS, TINDER_OPENERS, PHILOSOPHICAL_QUOTES arrays + wiring
js/profiles.js      — renderAvailability(), showToast(), profile CRUD (1670 lines)
js/quotes.js        — sort pills, applySortPills(), boot call renderAvailability()
js/audio.js         — music player
js/fireworks.js     — fireworks Easter egg
backups/            — timestamped backups; latest: KNOWN-GOOD-20260517-2244/ (8 files)
```

## Script load order (critical — do not change)
```html
data.js → skyline.js → content.js → profiles.js → audio.js → fireworks.js → quotes.js
```
- `content.js` must load BEFORE `profiles.js` (profiles.js references PHILOSOPHICAL_QUOTES/TOASTS)
- `renderAvailability()` is defined in profiles.js, called at bottom of quotes.js
- A `window.load` safety net in index.html also calls renderAvailability() as a fallback

## CRITICAL editing rules

### Never use the Edit tool on JS files
Edit tool truncates large JS files silently. Always use:
```bash
# Safe targeted replacement:
python3 -c "
path='js/skyline.js'
with open(path,'r') as f: c=f.read()
c=c.replace('OLD','NEW',1)
with open(path,'w') as f: f.write(c)
"

# Safe append:
cat >> js/skyline.js << 'EOF'
// new code
EOF
```

### Always validate after every JS edit
```bash
node --check js/skyline.js && echo OK
```

### Edit tool IS safe for index.html (it's HTML, not truncation-prone)
But still verify line count after: `wc -l index.html`

## SVG / animation rules (hard-won lessons)

### CSS transform overrides SVG transform attribute entirely
If a `<g>` has BOTH a CSS animation that sets `transform` AND an SVG `transform="translate(...)"` attribute,
the CSS wins and the SVG attribute is ignored — elements teleport to SVG origin (0,0).
**Fix:** Remove the SVG `transform` attribute; bake absolute positions into CSS keyframes.

### SVG overflow hidden by default
Add `overflow="visible"` to the skyline SVG element for planes/elements entering from off-screen.

### CSS px units in SVG = SVG user units
`transform: translate(500px, 300px)` on an SVG element means 500/300 SVG user units, not screen pixels.

### Draw order = z-index in SVG
Later elements in the SVG source appear on top. No z-index property needed.

### vw/vh units unreliable inside SVG
Use fixed SVG user unit values instead of viewport-relative units.

## Null-crash pattern (most dangerous bug)
```javascript
// WRONG — crashes if element missing, stops ALL subsequent JS:
document.querySelector('.logo-badge').addEventListener('click', fn);

// RIGHT — null guard:
{ const el = document.querySelector('.logo-badge'); if (el) el.addEventListener('click', fn); }
```
A null crash in skyline.js stops profiles.js from loading → roster never renders.
skyline.js has a `_skyOn(id, event, fn)` helper for safe binding — use it.

## Backup strategy
Before any significant change:
```bash
cp js/skyline.js backups/skyline-before-DESCRIPTION-HHMMSS.js
cp index.html backups/index-before-DESCRIPTION-HHMMSS.html
```
Latest known-good: `backups/KNOWN-GOOD-20260517-2244/` (8 files)

## Roster / profiles — how it works
- Profiles only appear in roster if they have date availability entered
- Empty state (no profiles with dates) = blank roster — this is correct behaviour
- `renderAvailability()` in profiles.js is the main render function
- `applySortPills()` in quotes.js wires the sort UI

## Animation elements in index.html (approx line numbers)
- Party-goers CSS: ~2085–2155
- C130 + paratroopers CSS: ~2090–2127
- Falling stars: DELETED (removed in session 20260517)
- Party-goer SVG elements: ~3400–3440
- C130 + paratroopers SVG: ~3440–3535
- Peeker guy/girl: ~3537+ (separate SVG elements outside main skyline SVG)
- Main skyline SVG closes: ~3536

## SVG landmark positions (SVG user units)
- Monas: shifted +30px right from original
- Mosque + minaret: shifted -20px left from original
- ZOO club sign: `translate(462, 462)` — circular dark disc r=15, red neon glow, "ZOO" serif white + "SCBD" arc text
- Skyline scaled view: `CONTENT_MID_X = 614` (shifted 30px left from 644)

## Clipboard / default texts (NEXT SESSION FOCUS)
The app has a clipboard/tools section. Goal: make default texts editable and copyable.
- `js/content.js` holds `TOASTS`, `TINDER_OPENERS`, `PHILOSOPHICAL_QUOTES` arrays
- Check if there is already a separate clipboard JS file in tools section
- Plan: allow user to edit default opener/toast/quote texts from within the app UI
- These may be stored in `state.snippets` (already in defaultState — null = use defaults; array = custom)
- The snippets field in state is wired but UI for editing it may not exist yet

## Recent completed work (session 20260517)
- Checkbox row 3 (Hide/Archive): removed medal-placeholder span, text now next to checkbox
- Shooting stars: fully deleted (CSS + SVG elements + JS shootStar function)
- CONTENT_MID_X: 644 → 614 (scaled view 30px left)
- ZOO sign: redesigned as circular peacock logo (dark disc, red neon, serif ZOO, SCBD arc)
- Profile editor: reorganized section order (Photos→Cycle→Weekly→Checkboxes→Tags→RedFlags→Distance→Notes→Save)
- Toggle grid: 2-column layout with 8px spacer column
- Monas moved +30px right, mosque -20px left
- Swipe-back: history.pushState in showView + popstate handler
- Backup nag toast: tappable (pointer-events:auto when .show), navigates to settings backup section
- Weather: Jakarta preset, humidity, colored icons, temperature gradient (blue→red)
