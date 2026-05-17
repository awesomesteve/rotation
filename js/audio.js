/* js/audio.js — auto-extracted from index.html */
let SONG_MP3_FILES    = {};
let SONG_START_OFFSETS = {};
let SHUFFLE_POOL      = [];
let _songsLoaded      = false;
let _songsLoadCallbacks = [];

function onSongsReady(cb) {
  if (_songsLoaded) { cb(); return; }
  _songsLoadCallbacks.push(cb);
}

fetch('audio/songs.json')
  .then(r => r.json())
  .then(songs => {
    songs.forEach(s => {
      SONG_MP3_FILES[s.key]     = s.file;
      SONG_START_OFFSETS[s.key] = s.startSec || 0;
      SHUFFLE_POOL.push(s.key);
    });
    _songsLoaded = true;
    // Rebuild the settings song picker so new songs appear automatically
    const row = document.getElementById('songChoices');
    if (row) {
      // Keep the first (Surprise me) and last (Off) buttons, replace the middle
      const first = row.querySelector('[data-song="shuffle"]');
      const last  = row.querySelector('[data-song="off"]');
      // Remove existing song buttons (not shuffle/off)
      [...row.querySelectorAll('[data-song]')].forEach(btn => {
        if (btn.dataset.song !== 'shuffle' && btn.dataset.song !== 'off') btn.remove();
      });
      // Insert one button per song before the Off button
      songs.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'bg-choice';
        btn.dataset.song = s.key;
        btn.textContent = s.label;
        if (last) row.insertBefore(btn, last);
        else row.appendChild(btn);
      });
      // Re-apply active state
      row.querySelectorAll('[data-song]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.song === state.startupSong);
        btn.addEventListener('click', () => {
          state.startupSong = btn.dataset.song;
          saveState();
          row.querySelectorAll('[data-song]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }
    _songsLoadCallbacks.forEach(cb => cb());
    _songsLoadCallbacks = [];
  })
  .catch(() => {
    // Fallback to hardcoded list if fetch fails (e.g. opened as file://)
    const fallback = [
      { key:'back-in-black', label:'Back in Black',  file:'audio/back-in-black.mp3', startSec:6  },
      { key:'jarvis',        label:'Jarvis Startup', file:'audio/jarvis.mp3',         startSec:6  },
      { key:'mask',          label:'M.A.S.K. Theme', file:'audio/mask.mp3',           startSec:6  },
      { key:'heman',         label:'He-Man Theme',   file:'audio/heman.mp3',          startSec:6  },
      { key:'goodtimes',     label:'Good Times',     file:'audio/goodtimes.mp3',      startSec:55 },
      { key:'youre-broke',   label:"You're Broke",   file:'audio/youre-broke.mp3',    startSec:0  },
    ];
    fallback.forEach(s => {
      SONG_MP3_FILES[s.key]      = s.file;
      SONG_START_OFFSETS[s.key]  = s.startSec;
      SHUFFLE_POOL.push(s.key);
    });
    _songsLoaded = true;
    _songsLoadCallbacks.forEach(cb => cb());
    _songsLoadCallbacks = [];
  });

const PLAY_DURATION_MS = 25000;
const FADE_DURATION_MS = 4000;
const MUSIC_VOLUME     = 0.35;   // 35% default volume

let localAudio = null;
let fadeTimer = null;
let stopTimer = null;

function stopMusic() {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
  if (localAudio) { try { localAudio.pause(); localAudio.src = ''; } catch(e){} localAudio = null; }
}

function playLocalMp3(songKey) {
  stopMusic();
  const file = SONG_MP3_FILES[songKey];
  const startSec = SONG_START_OFFSETS[songKey] || 0;
  if (!file) return;
  const audio = new Audio();
  audio.preload = 'auto';
  audio.volume = MUSIC_VOLUME;
  audio.addEventListener('loadedmetadata', () => {
    try { audio.currentTime = startSec; } catch(e){}
  }, { once: true });
  audio.src = file;
  localAudio = audio;
  const tryPlay = () => {
    audio.play().then(() => {
      const fadeStartMs = PLAY_DURATION_MS - FADE_DURATION_MS;
      setTimeout(() => {
        const steps = 40;
        let i = 0;
        fadeTimer = setInterval(() => {
          i++;
          audio.volume = Math.max(0, 1 - i/steps) * MUSIC_VOLUME;
          if (i >= steps) { clearInterval(fadeTimer); fadeTimer = null; }
        }, FADE_DURATION_MS/steps);
      }, fadeStartMs);
      stopTimer = setTimeout(() => stopMusic(), PLAY_DURATION_MS);
    }).catch(() => {});
  };
  if (audio.readyState >= 1) tryPlay();
  else audio.addEventListener('loadedmetadata', tryPlay, { once: true });
}

// Returns 'morning' (6am–12pm), 'afternoon' (12pm–6pm), or null (outside both windows)
function _musicSlot() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return null;
}

// Returns the localStorage key for today's slot, e.g. 'music_played_morning_2026-05-16'
function _musicSlotKey(slot) {
  const d = new Date();
  const iso = d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
  return 'music_played_' + slot + '_' + iso;
}

function startMusic() {
  if (!state.startupSong || state.startupSong === 'off') return;

  // Frequency limit: once per morning window, once per afternoon window
  const slot = _musicSlot();
  if (slot) {
    const key = _musicSlotKey(slot);
    if (localStorage.getItem(key)) return;   // already played this slot today
    localStorage.setItem(key, '1');
  } else {
    // Outside 6am–6pm: skip music entirely
    return;
  }

  onSongsReady(() => {
    const songKey = state.startupSong === 'shuffle'
      ? SHUFFLE_POOL[Math.floor(Math.random() * SHUFFLE_POOL.length)]
      : state.startupSong;
    playLocalMp3(songKey);
  });
}
{
  const prompt = document.getElementById('musicPrompt');
  // Only show the prompt if music would actually play this slot
  // (song is set, we're in a valid time window, and this slot hasn't played yet today)
  const _slot = _musicSlot();
  const _alreadyPlayed = _slot ? !!localStorage.getItem(_musicSlotKey(_slot)) : true;
  if (prompt && state.startupSong && state.startupSong !== 'off' && !_alreadyPlayed) {
    setTimeout(() => prompt.style.display = 'flex', 300);
    prompt.addEventListener('click', (e) => {
      if (e.target.id === 'musicPromptDismiss') return;
      prompt.style.display = 'none';
      startMusic();
    });
    const dismiss = document.getElementById('musicPromptDismiss');
    if (dismiss) dismiss.addEventListener('click', (e) => {
      e.stopPropagation();
      prompt.style.display = 'none';
    });
  }
}



// F logo kiss shower is bound near fireKissShower() — no duplicate binding needed

// === REBUILT: Classic Hotel open/closed status + scroll trigger ===
// Closed-day dates (Indonesian Islamic): day before Ramadan, Ramadan 1, Nuzulul Quran (Ramadan 17),
// Takbiran (last day Ramadan), Idul Fitri 1+2 Syawal, day after (3 Syawal).
const RAMADAN_START_GREGORIAN_CH = {
  2024:'2024-03-12', 2025:'2025-03-01', 2026:'2026-02-18', 2027:'2027-02-08',
  2028:'2028-01-28', 2029:'2029-01-16', 2030:'2030-01-06', 2031:'2031-12-26',
  2032:'2032-12-14', 2033:'2033-12-04', 2034:'2034-11-23'
};
function _chAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function _chIso(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  return y + '-' + m + '-' + dd;
}
function classicHotelClosedSet(year) {
  const closed = new Set();
  function addWin(iso) {
    if (!iso) return;
    const start = new Date(iso + 'T00:00:00');
    if (isNaN(start)) return;
    const len = 30;
    [_chAddDays(start,-1), start, _chAddDays(start,16), _chAddDays(start,len-1),
     _chAddDays(start,len), _chAddDays(start,len+1), _chAddDays(start,len+2)]
      .forEach(d => closed.add(_chIso(d)));
  }
  addWin(RAMADAN_START_GREGORIAN_CH[year]);
  addWin(RAMADAN_START_GREGORIAN_CH[year-1]);
  addWin(RAMADAN_START_GREGORIAN_CH[year+1]);
  return closed;
}
function classicHotelStatus(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
d
  if (d.getDay() === 6) return 'closed';
  const y = d.getFullYear();
  const closed = new Set([
    ..._chSetIter(classicHotelClosedSet(y)),
    ..._chSetIter(classicHotelClosedSet(y-1)),
    ..._chSetIter(classicHotelClosedSet(y+1))
  ]);
  return closed.has(_chIso(d)) ? 'closed' : 'open';
}
function _chSetIter(s) { const out = []; s.forEach(v => out.push(v)); return out; }

function renderClassicHotel() {
  const btn = document.getElementById('classicHotelBtn');
  const sub = document.getElementById('classicHotelSub');
  if (!btn) return;
  const status = classicHotelStatus(new Date());
  if (status === 'open') {
    btn.innerHTML = 'Classic Hotel is <span class="ch-state open">OPEN</span> today';

    if (sub) sub.textContent = 'Go forth';
  } else {
    btn.innerHTML = 'Classic Hotel is <span class="ch-state closed">CLOSED</span> today';
    if (sub) sub.textContent = 'Take the day off';
  }
}
