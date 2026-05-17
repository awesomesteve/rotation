/* js/data.js — auto-extracted from index.html */
/* =========================================================
   DATA LAYER — localStorage. Replace these 2 functions to swap to Firebase later.
   ========================================================= */
const STORE_KEY = 'rotation.v2';
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const merged = Object.assign(defaultState(), JSON.parse(raw));
      // One-time migration: if user is still on the old default-song, switch to shuffle
      if (!merged._shuffleMigrationDone) {
        merged.startupSong = 'shuffle';
        merged._shuffleMigrationDone = true;
      }
      return merged;
    }
    // migrate from v1
    const old = localStorage.getItem('rotation.v1');
    if (old) {
      const s = JSON.parse(old);
      // migrate dates: old shape used {slot, profileId}; new shape uses {profileId} only
      if (s.dates) {
        Object.keys(s.dates).forEach(k => {
          s.dates[k] = (s.dates[k] || []).map(e => ({ profileId: e.profileId || '' })).filter(e => e.profileId);
        });
      }
      return Object.assign(defaultState(), s);
    }
  } catch (e) {}
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch(e){ alert('Storage full — delete some photos.'); }
  if (typeof window._autoSaveToFolder === 'function') window._autoSaveToFolder();
}
function defaultState() {
  return {
    profiles: [],
    customTags: [],
    dates: {},
    theme: 'dark',
    bg: 'svg',
    priorityOrder: [],
    pinHash: '',
    rosterSort: 'priority',
    startupSong: 'shuffle', // 'shuffle' | one of the song keys | 'off'
    snippets: null, // null = use defaults; otherwise array of strings
    alwaysNight: false,     // override the daytime sky cycle — always show night
    animateWeather: true    // animate live weather on the skyline (clouds/rain/lightning)
  };
}

/* =========================================================
   CONSTANTS
   ========================================================= */
const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = {mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun'};
const SLOTS = [
  {key:'lunch', label:'Lunch'},
  {key:'evening', label:'Evening'},
  {key:'night', label:'Night'}
];
const DEFAULT_TAGS = [
  'virgin','extrovert','fun',
  'jobless',
  'open for 3some',
  'classic hotel','daytime only',
  'flakey','meet late','borderline'
];
const DEFAULT_RED_FLAGS = [
  'was late','was disrespectful','asked for money/gift',
  'insists meeting near her','flakey'
];

let state = loadState();
let editingId = null;
let editorDraft = null;
let pendingAddProfileId = null;

/* =========================================================
   THEME
   ========================================================= */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}
applyTheme();
