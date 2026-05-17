/* js/profiles.js — auto-extracted from index.html */

/* ── Safe element binder — NEVER let a missing element crash the script ──
   Use _on(id, event, fn) everywhere instead of getElementById().addEventListener().
   If the element doesn't exist it silently skips, so moving/removing HTML
   elements from one page to another never breaks the entire file.          */
function _on(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
  // else: element was removed/renamed — skip silently, don't throw
}

/* Inject sparkle overlay divs into medal SVGs + cream-icon wrappers so the CSS animation runs */
function initMedalSparkles() {
  // Medal SVGs: inject a sibling <div class="medal-sparkle-overlay"> after each .medal-mini
  document.querySelectorAll('.badge-row .medal-mini').forEach((svg, i) => {
    // Avoid double-injection
    if (svg.nextElementSibling && svg.nextElementSibling.classList.contains('medal-sparkle-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'medal-sparkle-overlay';
    overlay.textContent = '✦';
    overlay.style.setProperty('--medal-delay', (-(i * 7.3 + Math.random() * 5)).toFixed(2));
    svg.style.position = 'relative';
    const wrap = document.createElement('span');
    wrap.style.cssText = 'position:relative; display:inline-flex; align-items:center;';
    svg.parentNode.insertBefore(wrap, svg);
    wrap.appendChild(svg);
    wrap.appendChild(overlay);
  });
  // First-load-of-day burst: stagger all medals + diamonds to sparkle in first 20s
  _launchDaySparkle();
}

/* Fire a staggered sparkle burst on all medals+diamonds once per calendar day */
function _launchDaySparkle() {
  const todayKey = 'sparkle_day_' + new Date().toISOString().slice(0,10);
  if (sessionStorage.getItem(todayKey)) return; // already fired this session
  // Check localStorage for "already done today"
  try { if (localStorage.getItem(todayKey)) return; } catch(_) {}
  try {
    sessionStorage.setItem(todayKey, '1');
    localStorage.setItem(todayKey, '1');
  } catch(_) {}

  // Collect all medal overlays + cream-icon diamonds
  const medalOverlays  = () => [...document.querySelectorAll('.medal-sparkle-overlay')];
  const diamondIcons   = () => [...document.querySelectorAll('.cream-icon')];

  // Trigger a quick forced gleam on one element by briefly overriding its animation
  function burstElement(el, delay) {
    setTimeout(() => {
      el.style.animation = 'none';
      el.style.opacity = '1';
      el.style.transform = 'scale(1.4) rotate(45deg)';
      el.style.transition = 'transform 0.2s ease-out, opacity 0.15s ease-out';
      setTimeout(() => {
        el.style.transform = 'scale(1.1) rotate(90deg)';
        el.style.opacity = '0.8';
      }, 200);
      setTimeout(() => {
        el.style.transform = 'scale(0.4) rotate(180deg)';
        el.style.opacity = '0';
      }, 450);
      setTimeout(() => {
        // Restore CSS animation
        el.style.removeProperty('animation');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('transition');
      }, 700);
    }, delay);
  }

  // Wait 800ms for DOM to settle, then stagger bursts over first 20s
  setTimeout(() => {
    const medals   = medalOverlays();
    const diamonds = diamondIcons().map(d => d);
    const thumbs   = [...document.querySelectorAll('.profile-card .thumb')];
    const waBtns   = [...document.querySelectorAll('.wa-btn')];
    const all = [...medals, ...diamonds, ...thumbs, ...waBtns];
    if (!all.length) return;
    const step = Math.min(1200, 19000 / Math.max(all.length, 1)); // spread over 19s

    medals.forEach((el, i) => burstElement(el, i * step));

    diamonds.forEach((el, i) => {
      const delay = (medals.length + i) * step;
      setTimeout(() => {
        el.classList.add('diamond-burst');
        setTimeout(() => el.classList.remove('diamond-burst'), 700);
      }, delay);
    });

    // Profile pic thumbs — edge shimmer: a brief bright ring around the border
    thumbs.forEach((el, i) => {
      const delay = (medals.length + diamonds.length + i) * step;
      setTimeout(() => {
        el.classList.add('thumb-burst');
        setTimeout(() => el.classList.remove('thumb-burst'), 800);
      }, delay);
    });

    // WhatsApp buttons — quick green glow flash
    waBtns.forEach((el, i) => {
      const delay = (medals.length + diamonds.length + thumbs.length + i) * step;
      setTimeout(() => {
        el.classList.add('wa-burst');
        setTimeout(() => el.classList.remove('wa-burst'), 700);
      }, delay);
    });
  }, 800);
}

function renderProfilesList() {
  const root = document.getElementById('profilesList');
  if (!state.profiles.length) {
    root.innerHTML = '<div class="empty-state">No profiles yet. Tap <strong>+ New</strong>.</div>';
    return;
  }
  root.innerHTML = '';
  // Active list — ordered by priorityOrder. Excludes archived.
  const activeProfiles = orderedProfiles().filter(p => !p.archived);
  const archivedProfiles = state.profiles.filter(p => p.archived);

  const list = document.createElement('div');
  list.className = 'profile-list';
  list.id = 'activeProfileList';
  activeProfiles.forEach(p => {
    const card = document.createElement('div');
    card.className = 'profile-card' + (p.hidden ? ' hidden-roster' : '');
    card.dataset.profileId = p.id;
    const idx = (typeof p.primaryPhotoIdx === 'number') ? p.primaryPhotoIdx : 0;
    const thumb = p.photos && p.photos[idx] ? p.photos[idx] : '';
    const tags = (p.tags || []).slice(0, 3);
    const moreTags = (p.tags || []).length - tags.length;
    const flagCount = (p.redFlags || []).length;
    const distance = p.distanceMin;
    const medals = p.medals || {};
    // Reusable star-medal SVG: short ribbon + 5-pointed star body. Color comes from gradient id.
    // `inverted` flips the star upside-down (Medal of Honor style — one point downward).
    const starMedalSvg = (id, gradId, stopA, stopB, stopC, ribA, ribB, inverted) =>
      `<svg class="medal-mini" viewBox="0 0 28 32">
        <!-- Ribbon (short, only 8px tall) -->
        <path d="M9 0 L19 0 L17 7 L14 10 L11 7 Z" fill="${ribA}"/>
        <path d="M9 0 L11 0 L12 7 L11 7 Z" fill="${ribB}" opacity=".75"/>
        <path d="M17 0 L19 0 L17 7 Z" fill="${ribB}" opacity=".75"/>
        <defs>
          <radialGradient id="${gradId}${id}" cx="40%" cy="35%">
            <stop offset="0%" stop-color="${stopA}"/>
            <stop offset="50%" stop-color="${stopB}"/>
            <stop offset="100%" stop-color="${stopC}"/>
          </radialGradient>
        </defs>
        <g ${inverted ? 'transform="rotate(180 14 19.5)"' : ''}>
          <!-- 5-pointed star (rotated 180° via group transform when inverted) -->
          <polygon points="14,9 16.6,17 25,17 18.2,22 20.8,30 14,25 7.2,30 9.8,22 3,17 11.4,17"
                   fill="url(#${gradId}${id})" stroke="${stopC}" stroke-width=".5"/>
          <polygon points="14,13 15.3,17.5 19,17.5 16,20 17,24 14,22 11,24 12,20 9,17.5 12.7,17.5"
                   fill="${stopA}" opacity=".5"/>
        </g>
      </svg>`;
    // Purple Heart: full heart shape with gold profile bust silhouette + gold border + short ribbon
    const purpleHeartSvg = (id) =>
      `<svg class="medal-mini" viewBox="0 0 28 32">
        <!-- Ribbon (purple, short, white edge stripes like the real Purple Heart) -->
        <path d="M9 0 L19 0 L17 7 L14 10 L11 7 Z" fill="#6a2a99"/>
        <rect x="9" y="0" width="1.5" height="8" fill="#ffffff"/>
        <rect x="17.5" y="0" width="1.5" height="8" fill="#ffffff"/>
        <!-- Gold heart border -->
        <path d="M14 11 C 8 11 5 14 5 19 C 5 24 14 30 14 30 C 14 30 23 24 23 19 C 23 14 20 11 14 11 Z"
              fill="#d4a017" stroke="#8a6810" stroke-width=".4"/>
        <!-- Purple heart inner -->
        <path d="M14 13 C 9.5 13 7.5 15 7.5 19 C 7.5 23 14 28 14 28 C 14 28 20.5 23 20.5 19 C 20.5 15 18.5 13 14 13 Z"
              fill="#6a2a99"/>
        <!-- Gold Washington profile bust silhouette in the center -->
        <path d="M11 17 Q10.5 19 11 20.5 Q10.5 21.5 11 22 L13.5 22 L13.5 23.5 L11.5 23.5 L11.5 24.5 L16 24.5 L16 23 Q16 21 14.5 20 Q14 19 14 17.5 Q13.5 16 12.5 16 Q11.5 16 11 17 Z"
              fill="#d4a017"/>
      </svg>`;
    const medalRow =
      (medals.met    ? starMedalSvg(p.id, 'bm', '#ffd9a8', '#cd7f32', '#6e3f10', '#c92a2a', '#1864ab', false) : '') +
      (medals.sex    ? starMedalSvg(p.id, 'sm', '#ffffff', '#c0c0c0', '#6a6a6a', '#c92a2a', '#1864ab', false) : '') +
      // Gold "Deflowered" medal: inverted star + light-blue ribbon with white stars, Medal of Honor style
      (medals.flower ? starMedalSvg(p.id, 'gm', '#fff7c2', '#ffd43b', '#a8841a', '#1c63a8', '#3a86d3', true) : '') +
      (medals.flaked ? purpleHeartSvg(p.id) : '');
    const thumbStyle = thumb ? `background-image:url('${cssEscape(thumb)}')` : '';
    const waButton = p.phone
      ? `<button class="wa-btn" title="Message on WhatsApp" data-wa="${escapeHtml(p.phone)}">
           <svg viewBox="0 0 24 24" fill="white"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.3-.7-2.6-1.5-3.6-3.1-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-1-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.4-.1-.1-.3-.1-.6-.1zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.3c1.4.7 3 1.1 4.7 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3c-1.5 0-3-.4-4.2-1.2l-.3-.2-3.1.8.8-3.1-.2-.3c-.9-1.3-1.3-2.9-1.3-4.4 0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.8 8.4-8.3 8.4z"/></svg>
         </button>`
      : '';
    card.innerHTML = `
      <div class="thumb" style="${thumbStyle}">${thumb ? '' : initials(p.name)}</div>
      <div class="meta">
        <div class="name-row">
          <span class="name-text">${escapeHtml(p.name || 'Untitled')}</span>
          ${p.age ? `<span class="age">${escapeHtml(String(p.age))}</span>` : ''}
          ${p.cream ? `<span class="cream-icon" title="Cream of the crop" style="--sparkle-delay:${(Math.random()*2).toFixed(2)}"><svg width="32" height="20" viewBox="0 0 48 24"><defs><linearGradient id="diaList_${escapeHtml(p.id)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#a0e7ff"/><stop offset="100%" stop-color="#5ec2ee"/></linearGradient><linearGradient id="diaList2_${escapeHtml(p.id)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bdf2ff"/><stop offset="100%" stop-color="#3a9ec8"/></linearGradient></defs><polygon points="8,9 13,2 35,2 40,9" fill="url(#diaList_${escapeHtml(p.id)})" stroke="#2d80a8" stroke-width=".5"/><polygon points="8,9 40,9 24,22" fill="url(#diaList2_${escapeHtml(p.id)})" stroke="#2d80a8" stroke-width=".5"/><line x1="8" y1="9" x2="24" y2="22" stroke="#1f6b8a" stroke-width=".4" opacity=".5"/><line x1="40" y1="9" x2="24" y2="22" stroke="#1f6b8a" stroke-width=".4" opacity=".5"/><line x1="21" y1="9" x2="24" y2="22" stroke="#1f6b8a" stroke-width=".3" opacity=".4"/><line x1="27" y1="9" x2="24" y2="22" stroke="#1f6b8a" stroke-width=".3" opacity=".4"/><polygon points="16,5 20,3.5 19,7" fill="#ffffff" opacity=".75"/></svg></span>` : ''}
          ${(() => {
            const todayCycle = p.cycle && p.cycle.lastPeriod ? classifyCycleDay(new Date(), p.cycle) : null;
            const cycleLabel = {period:'🩸 period', peak:'⚠️ peak', ovulation:'⚠️ ovulation', fertile:'fertile', elevated:'elevated', safer:'✓ safe'}[todayCycle] || '';
            const cycleTitleMap = {period:'On her period',peak:'Peak fertility — high pregnancy risk',ovulation:'Ovulation day — peak risk',fertile:'Fertile window (high risk)',elevated:'Elevated risk day',safer:'Lower-risk part of cycle'};
            const cycleBadge = (todayCycle && cycleLabel)
              ? `<span class="cycle-stage-badge ${todayCycle}" title="${cycleTitleMap[todayCycle]||''}">${cycleLabel}</span>` : '';
            const hasBadges = medalRow || distance || flagCount > 0 || cycleBadge;
            return hasBadges ? `<div class="badge-row">
              ${medalRow}
              ${cycleBadge}
              ${distance ? `<span class="mini-tag distance-pill" title="${distance} min by car">🚗 ${distance} min</span>` : ''}
              ${flagCount > 0 ? `<span class="mini-tag red-flag-pill" title="${flagCount} red flag${flagCount===1?'':'s'}">🚩 ${flagCount}</span>` : ''}
            </div>` : '';
          })()}
        </div>
        <div class="sub">
          ${tags.map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join('')}
          ${moreTags > 0 ? `<span class="mini-tag">+${moreTags}</span>` : ''}
        </div>
      </div>
      ${waButton}`;
    card.addEventListener('click', (e) => {
      if (card.dataset.wasDragged) { card.dataset.wasDragged = ''; return; }
      const waEl = e.target.closest('.wa-btn');
      if (waEl) {
        e.stopPropagation();
        openWhatsApp(waEl.dataset.wa);
        return;
      }
      openEditor(p.id);
    });
    // Long-press the avatar thumbnail to preview at full size
    if (thumb) {
      const thumbEl = card.querySelector('.thumb');
      attachPhotoPreviewHold(thumbEl, thumb);
    }
    list.appendChild(card);
  });
  root.appendChild(list);
  attachProfileDragHandlers();
  initMedalSparkles();

  // ARCHIVE drop zone — always visible at the bottom, even when empty (so you can drag into it)
  const archZone = document.createElement('div');
  archZone.id = 'archiveDropZone';
  archZone.innerHTML = `
    <span><span class="arch-icon">🗄</span> Archive · drop here</span>
    <span style="display:inline-flex; align-items:center; gap:8px">
      ${archivedProfiles.length ? `<span class="arch-count">${archivedProfiles.length}</span>` : ''}
      <span class="arch-chevron">▾</span>
    </span>`;
  archZone.addEventListener('click', () => {
    const isOpen = archZone.classList.toggle('open');
    const archList = document.getElementById('archivedList');
    if (archList) archList.style.display = isOpen ? '' : 'none';
  });
  root.appendChild(archZone);

  if (archivedProfiles.length) {
    const archList = document.createElement('div');
    archList.id = 'archivedList';
    archList.className = 'profile-list archived';
    archList.style.display = 'none';
    archivedProfiles.forEach(p => {
      const idx = (typeof p.primaryPhotoIdx === 'number') ? p.primaryPhotoIdx : 0;
      const thumb = p.photos && p.photos[idx] ? p.photos[idx] : '';
      const thumbStyle = thumb ? `background-image:url('${cssEscape(thumb)}')` : '';
      const card = document.createElement('div');
      card.className = 'profile-card archived-card';
      card.innerHTML = `
        <div class="thumb" style="${thumbStyle}">${thumb ? '' : initials(p.name)}</div>
        <div class="meta">
          <div class="name-row"><span class="name-text">${escapeHtml(p.name || 'Untitled')}</span>${p.age ? `<span class="age">${escapeHtml(String(p.age))}</span>` : ''}</div>
        </div>`;
      card.addEventListener('click', () => openEditor(p.id));
      archList.appendChild(card);
    });
    root.appendChild(archList);
  }
}
_on('newProfileBtn', 'click', () => openEditor(null));

/* =========================================================
   PROFILE LIST — live drag-to-reorder (touch + mouse).
   Card follows the finger/cursor in real time. Other cards animate to make room.
   Drag into the archive drop-zone to archive.
   ========================================================= */
function attachProfileDragHandlers() {
  document.querySelectorAll('#activeProfileList .profile-card').forEach(card => {
    let holdTimer = null;
    let isDragging = false;
    let startX = 0, startY = 0;
    let cardRect = null;
    let pointerOffsetY = 0;
    let placeholder = null;

    const beginDrag = (clientX, clientY) => {
      isDragging = true;
      cardRect = card.getBoundingClientRect();
      pointerOffsetY = clientY - cardRect.top;
      card.dataset.wasDragged = '1';

      // Create an invisible placeholder where the card used to be (keeps list height stable)
      placeholder = document.createElement('div');
      placeholder.className = 'profile-card-placeholder';
      placeholder.style.height = cardRect.height + 'px';
      card.parentNode.insertBefore(placeholder, card);

      // Pop the card out of the flow as a fixed-position floating element
      card.classList.add('dragging-live');
      card.style.width = cardRect.width + 'px';
      card.style.left = cardRect.left + 'px';
      card.style.top = cardRect.top + 'px';
      if (navigator.vibrate) navigator.vibrate(35);
      moveTo(clientY);
    };

    const moveTo = (clientY) => {
      if (!isDragging || !placeholder) return;
      const newTop = clientY - pointerOffsetY;
      card.style.top = newTop + 'px';

      // Find what we're hovering over — either another active card or the archive zone
      // (temporarily hide our own card so elementFromPoint sees through it)
      card.style.pointerEvents = 'none';
      const el = document.elementFromPoint(window.innerWidth / 2, clientY);
      card.style.pointerEvents = '';

      // Clear previous highlights
      document.querySelectorAll('.profile-card.drop-target, #archiveDropZone.drop-target')
        .forEach(r => r.classList.remove('drop-target'));

      const archiveZone = el && el.closest('#archiveDropZone');
      if (archiveZone) {
        archiveZone.classList.add('drop-target');
        return;
      }

      const over = el && el.closest('.profile-card:not(.dragging-live):not(.archived-card)');
      if (!over) return;

      const overRect = over.getBoundingClientRect();
      const overMid = overRect.top + overRect.height / 2;
      const list = document.getElementById('activeProfileList');
      if (clientY < overMid) {
        list.insertBefore(placeholder, over);
      } else {
        list.insertBefore(placeholder, over.nextSibling);
      }
    };

    const endDrag = (clientY) => {
      clearTimeout(holdTimer);
      if (!isDragging) { startX = startY = 0; return; }
      isDragging = false;

      // Check if we ended on the archive drop zone
      card.style.pointerEvents = 'none';
      const el = document.elementFromPoint(window.innerWidth / 2, clientY);
      card.style.pointerEvents = '';
      const archiveZone = el && el.closest('#archiveDropZone');

      card.classList.remove('dragging-live');
      card.style.removeProperty('width');
      card.style.removeProperty('left');
      card.style.removeProperty('top');
      document.querySelectorAll('.drop-target').forEach(r => r.classList.remove('drop-target'));

      if (archiveZone) {
        // Archive this profile
        const p = state.profiles.find(p => p.id === card.dataset.profileId);
        if (p) {
          p.archived = true;
          saveState();
        }
        if (placeholder) placeholder.remove();
        placeholder = null;
        renderProfilesList();
        return;
      }

      // Reorder based on placeholder's final position
      if (placeholder) {
        // Build new priority order from current DOM (which has placeholder in the new spot).
        // IMPORTANT: skip the dragging card itself — it is still in the DOM as position:fixed,
        // so we must NOT count it again when we already count it via the placeholder.
        const list = document.getElementById('activeProfileList');
        const newOrderActive = [];
        const draggedId = card.dataset.profileId;
        list.childNodes.forEach(n => {
          if (n === placeholder) {
            newOrderActive.push(draggedId);           // placeholder marks the new position
          } else if (n === card) {
            // skip — this is the floating dragged card, already counted via placeholder
          } else if (n.dataset && n.dataset.profileId) {
            newOrderActive.push(n.dataset.profileId);
          }
        });
        // Merge with archived (which stay at the end of priorityOrder)
        const archivedIds = state.priorityOrder.filter(id => {
          const p = state.profiles.find(p => p.id === id);
          return p && p.archived;
        });
        // Build final order and DEDUPLICATE (safety net — no ID should ever appear twice)
        const _seen = new Set();
        const merged = [...newOrderActive, ...archivedIds].filter(id => {
          if (_seen.has(id)) return false;
          _seen.add(id); return true;
        });
        state.priorityOrder = merged;
        // catch any profiles missing from priorityOrder
        state.profiles.forEach(p => {
          if (!state.priorityOrder.includes(p.id)) state.priorityOrder.push(p.id);
        });
        saveState();
        placeholder.remove();
        placeholder = null;
      }
      renderProfilesList();
    };

    // Touch: 250ms hold → enter drag mode
    card.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      holdTimer = setTimeout(() => beginDrag(t.clientX, t.clientY), 250);
    }, { passive: true });
    card.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!isDragging) {
        // Cancel hold if user starts scrolling
        if (Math.abs(t.clientY - startY) > 12 || Math.abs(t.clientX - startX) > 12) {
          clearTimeout(holdTimer);
        }
        return;
      }
      e.preventDefault();
      moveTo(t.clientY);
    }, { passive: false });
    card.addEventListener('touchend', (e) => {
      const t = (e.changedTouches && e.changedTouches[0]) || { clientY: startY };
      endDrag(t.clientY);
    });
    card.addEventListener('touchcancel', () => {
      clearTimeout(holdTimer);
      if (isDragging) endDrag(startY);
    });

    // Mouse (desktop): hold mousedown for 200ms to enter drag mode
    card.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.wa-btn')) return; // let WA button work
      startX = e.clientX; startY = e.clientY;
      holdTimer = setTimeout(() => beginDrag(e.clientX, e.clientY), 200);
      const mouseMoveHandler = (ev) => {
        if (!isDragging) {
          if (Math.abs(ev.clientY - startY) > 8 || Math.abs(ev.clientX - startX) > 8) {
            clearTimeout(holdTimer);
          }
          return;
        }
        ev.preventDefault();
        moveTo(ev.clientY);
      };
      const mouseUpHandler = (ev) => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        endDrag(ev.clientY);
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    });
  });
}
function reorderProfilePriority(srcId, tgtId) {
  const order = state.priorityOrder.slice();
  const sIdx = order.indexOf(srcId);
  if (sIdx >= 0) order.splice(sIdx, 1);
  const tIdx = order.indexOf(tgtId);
  order.splice(tIdx, 0, srcId);
  state.priorityOrder = order;
}

function deleteProfile(id) {
  state.profiles = state.profiles.filter(p => p.id !== id);
  state.priorityOrder = state.priorityOrder.filter(x => x !== id);
  Object.keys(state.dates).forEach(d => {
    state.dates[d] = (state.dates[d] || []).filter(e => e.profileId !== id);
    if (!state.dates[d].length) delete state.dates[d];
  });
  saveState();
  renderProfilesList();
}

/* =========================================================
   EDITOR
   ========================================================= */
function blankProfile() {
  const sched = {};
  DAYS.forEach(d => sched[d] = {lunch:false, evening:false, night:false});
  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
    name: '', age: '', phone: '', notes: '', photos: [], primaryPhotoIdx: 0,
    tags: [], redFlags: [], schedule: sched,
    cycle: { lastPeriod: '', cycleLength: 28, periodLength: 5 },
    archived: false
  };
}
function openEditor(id) {
  editingId = id;
  if (id) {
    const existing = state.profiles.find(p => p.id === id);
    editorDraft = JSON.parse(JSON.stringify(existing));
    document.getElementById('editorTitle').textContent = 'Edit profile';
    document.getElementById('deleteProfile').style.display = '';
  } else {
    editorDraft = blankProfile();
    document.getElementById('editorTitle').textContent = 'New profile';
    document.getElementById('deleteProfile').style.display = 'none';
  }
  document.getElementById('f-name').value = editorDraft.name || '';
  document.getElementById('f-age').value = editorDraft.age || '';
  document.getElementById('f-phone').value = editorDraft.phone || '+62';
  document.getElementById('f-notes').value = editorDraft.notes || '';
  document.getElementById('f-hidden').checked = !!editorDraft.hidden;
  document.getElementById('f-archived').checked = !!editorDraft.archived;
  document.getElementById('f-cream').checked = !!editorDraft.cream;
  document.getElementById('f-medal-met').checked    = !!(editorDraft.medals && editorDraft.medals.met);
  document.getElementById('f-medal-sex').checked    = !!(editorDraft.medals && editorDraft.medals.sex);
  document.getElementById('f-medal-flower').checked = !!(editorDraft.medals && editorDraft.medals.flower);
  document.getElementById('f-medal-flaked').checked = !!(editorDraft.medals && editorDraft.medals.flaked);
  document.getElementById('f-distance').value = editorDraft.distanceMin || '';
  document.getElementById('f-maps-link').value = editorDraft.mapsLink || '';
  document.getElementById('distanceStatus').textContent = '';
  document.getElementById('waProfileBtn').style.display = editorDraft.phone ? '' : 'none';
  // cycle fields
  if (!editorDraft.cycle) editorDraft.cycle = { lastPeriod: '', cycleLength: 28, periodLength: 5 };
  document.getElementById('f-last-period').value = editorDraft.cycle.lastPeriod || '';
  document.getElementById('f-cycle-length').value = editorDraft.cycle.cycleLength || 28;
  document.getElementById('f-period-length').value = editorDraft.cycle.periodLength || 5;
  renderAvatar();
  renderPhotoRow();
  renderTags();
  renderRedFlags();
  renderScheduleEditor();
  renderCyclePreview();
  showView('editor');
}

/* =========================================================
   CYCLE TRACKER
   - lastPeriod: ISO date of first day of last period
   - cycleLength: full cycle (default 28)
   - periodLength: bleeding duration (default 5)
   Method: ovulation = next-period-start - 14. Fertile window = ovulation -5 to +1.
   ========================================================= */
function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function classifyCycleDay(date, cycle) {
  if (!cycle || !cycle.lastPeriod) return null;
  const start = new Date(cycle.lastPeriod + 'T00:00:00');
  if (isNaN(start.getTime())) return null;
  const cl = Math.max(20, Math.min(45, parseInt(cycle.cycleLength) || 28));
  const pl = Math.max(2, Math.min(10, parseInt(cycle.periodLength) || 5));
  let diff = daysBetween(start, date);
  // If lastPeriod is a FUTURE date (next expected period), back-calculate
  // which day of the CURRENT cycle today falls on by subtracting whole cycles.
  if (diff < 0) {
    const cyclesBack = Math.ceil(-diff / cl);
    diff = diff + cyclesBack * cl;
  }
  const dayInCycle = ((diff % cl) + cl) % cl; // 0 = period day 1
  if (dayInCycle < pl) return 'period';
  // Ovulation expected at cycleLength - 14
  // Sperm can survive up to 5 days; egg viable 12-24h after ovulation.
  // Bands (relative to ovulation day = OD):
  //   peak risk:      OD-1 .. OD+1   (highest pregnancy odds)
  //   fertile:        OD-5 .. OD-2   (sperm window, still high)
  //   elevated:       OD-7..OD-6 and OD+2..OD+3  (cycle variability buffer)
  //   lower-risk:     period+1 .. OD-8 (early follicular)  AND  OD+4 .. end of cycle (luteal)
  // Truly low-risk days are only the few right before next period.
  const ovulationDay = cl - 14;
  const rel = dayInCycle - ovulationDay;
  if (rel === 0) return 'ovulation';
  if (rel >= -1 && rel <= 1) return 'peak';
  if (rel >= -5 && rel <= -2) return 'fertile';
  if ((rel >= -7 && rel <= -6) || (rel >= 2 && rel <= 3)) return 'elevated';
  return 'safer';
}
function renderCyclePreview() {
  const root = document.getElementById('cyclePreview');
  if (!root) return;
  const lp = document.getElementById('f-last-period').value;
  if (!lp) {
    root.innerHTML = '<div class="hint" style="margin-top:8px">Enter the first day of her last period to see the cycle preview.</div>';
    return;
  }
  const cycle = {
    lastPeriod: lp,
    cycleLength: parseInt(document.getElementById('f-cycle-length').value) || 28,
    periodLength: parseInt(document.getElementById('f-period-length').value) || 5
  };
  const today = new Date(); today.setHours(0,0,0,0);
  const days = 30;
  let nextPeriodDay = null, nextOvulation = null, todayClass = null;

  // Build a Mon-Sun grid: header row first, then start at today's column position
  // JS: Sunday=0..Saturday=6. We want Monday=0..Sunday=6.
  let html = '<div class="cycle-grid-header">';
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => {
    html += `<div class="cgh-day">${d}</div>`;
  });
  html += '</div><div class="cycle-grid">';

  // Pad the start so today lands in the correct weekday column
  const todayDow = (today.getDay() + 6) % 7;  // Monday=0..Sunday=6
  for (let i = 0; i < todayDow; i++) html += '<div class="cycle-day empty"></div>';

  for (let i = 0; i < days; i++) {
    const d = addDays(today, i);
    const cls = classifyCycleDay(d, cycle) || '';
    if (i === 0) todayClass = cls;
    if (cls === 'period' && nextPeriodDay === null) nextPeriodDay = d;
    if (cls === 'ovulation' && nextOvulation === null) nextOvulation = d;
    const isToday = i === 0 ? ' today' : '';
    html += `<div class="cycle-day ${cls}${isToday}" title="${fmtDate(d)}">${d.getDate()}</div>`;
  }
  html += '</div>';
  html += `<div class="cycle-legend">
    <span class="ll"><span class="sw" style="background:#6b1620; display:inline-flex; align-items:center; justify-content:center"><svg width="8" height="8" viewBox="0 0 24 24"><path fill="#ff4d6d" d="M12 2C12 2 5 11 5 16a7 7 0 0 0 14 0c0-5-7-14-7-14z"/></svg></span>Period</span>
    <span class="ll"><span class="sw" style="background:#c92a2a; outline:2px solid #ff8fa3; outline-offset:-2px"></span>Peak risk</span>
    <span class="ll"><span class="sw" style="background:#f03e3e; outline:2px solid var(--accent); outline-offset:-2px"></span>Ovulation</span>
    <span class="ll"><span class="sw" style="background:#fd7e14"></span>Fertile</span>
    <span class="ll"><span class="sw" style="background:#ffd43b"></span>Elevated risk</span>
    <span class="ll"><span class="sw" style="background:#51cf66; opacity:.7"></span>Lower-risk</span>
  </div>`;

  const todayLabel = ({
    period: 'on her period',
    peak: 'in her peak fertility window (highest pregnancy risk)',
    ovulation: 'likely ovulating today (peak risk)',
    fertile: 'in her fertile window (high risk — sperm survive ~5 days)',
    elevated: 'in an elevated-risk buffer day (cycles vary by 1–3 days)',
    safer: 'in a lower-risk part of her cycle'
  })[todayClass] || '';
  let summary = `<div class="cycle-summary">`;
  if (todayLabel) summary += `Today: <strong>${todayLabel}</strong>.`;
  if (nextPeriodDay) summary += ` Next period likely starts <strong>${fmtDateLong(nextPeriodDay)}</strong>.`;
  if (nextOvulation) summary += ` Next ovulation around <strong>${fmtDateLong(nextOvulation)}</strong>.`;
  summary += `</div>`;
  root.innerHTML = html + summary;
}

// live update of preview as user types
['f-last-period','f-cycle-length','f-period-length'].forEach(id => {
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === id) {
      if (!editorDraft) return;
      editorDraft.cycle = editorDraft.cycle || {};
      if (id === 'f-last-period') editorDraft.cycle.lastPeriod = e.target.value;
      if (id === 'f-cycle-length') editorDraft.cycle.cycleLength = parseInt(e.target.value) || 28;
      if (id === 'f-period-length') editorDraft.cycle.periodLength = parseInt(e.target.value) || 5;
      renderCyclePreview();
    }
  });
});

function renderAvatar() {
  const av = document.getElementById('avatarBig');
  const idx = editorDraft.primaryPhotoIdx || 0;
  const src = editorDraft.photos && editorDraft.photos[idx];
  if (src) {
    av.style.backgroundImage = `url('${cssEscape(src)}')`;
    av.firstChild && av.firstChild.nodeType === 3 && av.removeChild(av.firstChild);
    // remove any initials text
    [...av.childNodes].forEach(n => { if (n.nodeType === 3) av.removeChild(n); });
    // hide initials span if present
    const init = av.querySelector('.av-initials'); if (init) init.remove();
  } else {
    av.style.backgroundImage = '';
    if (!av.querySelector('.av-initials')) {
      const span = document.createElement('span');
      span.className = 'av-initials';
      span.textContent = initials(document.getElementById('f-name').value || editorDraft.name);
      av.insertBefore(span, av.firstChild);
    } else {
      av.querySelector('.av-initials').textContent = initials(document.getElementById('f-name').value || editorDraft.name);
    }
  }
  // Re-attach the long-press preview to the avatar (only if there's a photo to preview)
  if (src && !av.dataset.previewBound) {
    attachPhotoPreviewHold(av, src);
    av.dataset.previewBound = '1';
  } else if (src && av.dataset.previewBound) {
    // Update the bound src if photo changed
    attachPhotoPreviewHold(av, src);
  }
}
_on('avatarEditBtn', 'click', () => { const pi = document.getElementById('photoInput'); if (pi) pi.click(); });
_on('f-name', 'input', renderAvatar);

// WhatsApp button in the editor
_on('waProfileBtn', 'click', () => {
  const phone = document.getElementById('f-phone').value.trim();
  if (!phone) { alert('Add a WhatsApp number first.'); return; }
  openWhatsApp(phone);
});

// Distance helper
_on('calcDistanceBtn', 'click', () => {
  const link = document.getElementById('f-maps-link').value.trim();
  const status = document.getElementById('distanceStatus');
  const origin = encodeURIComponent(HOME_ADDRESS);
  if (link) {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodeURIComponent(link)}&travelmode=driving`, '_blank');
    if (status) status.textContent = 'Maps opened — read the ETA, then type it in the Minutes box.';
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&travelmode=driving`, '_blank');
    if (status) status.textContent = 'No link yet — search the destination in Maps and read the ETA.';
  }
});

// Brand quick-launch — all guarded via _on/_bind
function _bind(id, fn) { _on(id, 'click', fn); }
_bind('grabBtn',      openGrab);
_bind('gojekBtn',     openGojek);
_bind('grabBtnTools', openGrab);
_bind('gojekBtnTools',openGojek);
_bind('bumbleBtn',    openBumble);
_bind('tinderBtn',    openTinder);
_bind('okcupidBtn',   openOkCupid);
_bind('badooBtn',     openBadoo);
// New dating apps use inline onclick in HTML — no JS binding needed

// Show WA button when phone field has content
_on('f-phone', 'input', (e) => {
  const btn = document.getElementById('waProfileBtn');
  if (btn) btn.style.display = e.target.value.trim() ? '' : 'none';
});

function renderPhotoRow() {
  const row = document.getElementById('photoRow');
  row.innerHTML = '';
  (editorDraft.photos || []).forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'photo-thumb' + (i === (editorDraft.primaryPhotoIdx||0) ? ' is-primary' : '');
    div.style.backgroundImage = `url('${cssEscape(src)}')`;
    div.title = 'Tap to set as profile pic';
    div.addEventListener('click', (e) => {
      if (e.target.closest('.x')) return;
      editorDraft.primaryPhotoIdx = i;
      renderPhotoRow(); renderAvatar();
    });
    const x = document.createElement('button');
    x.className = 'x'; x.type = 'button'; x.textContent = '×';
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      editorDraft.photos.splice(i,1);
      if ((editorDraft.primaryPhotoIdx || 0) >= editorDraft.photos.length) editorDraft.primaryPhotoIdx = 0;
      renderPhotoRow(); renderAvatar();
    });
    div.appendChild(x);
    attachPhotoPreviewHold(div, src);
    row.appendChild(div);
  });
}
_on('addPhotoBtn', 'click', () => { const pi = document.getElementById('photoInput'); if (pi) pi.click(); });
_on('photoInput', 'change', async (e) => {
  const files = Array.from(e.target.files || []);
  for (const f of files) {
    const dataUrl = await fileToCompressedDataUrl(f, 720, 0.82);
    editorDraft.photos.push(dataUrl);
  }
  e.target.value = '';
  renderPhotoRow(); renderAvatar();
});
function fileToCompressedDataUrl(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const c = document.createElement('canvas');
        c.width = width; c.height = height;
        c.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function allTags() {
  return Array.from(new Set([...DEFAULT_TAGS, ...(state.customTags || [])]));
}
function renderTags() {
  const wrap = document.getElementById('tagsWrap');
  wrap.innerHTML = '';
  allTags().forEach(t => {
    const el = document.createElement('span');
    el.className = 'tag' + (editorDraft.tags.includes(t) ? ' on' : '');
    el.textContent = t;
    el.addEventListener('click', () => {
      if (editorDraft.tags.includes(t)) editorDraft.tags = editorDraft.tags.filter(x => x !== t);
      else editorDraft.tags.push(t);
      renderTags();
    });
    wrap.appendChild(el);
  });
  const add = document.createElement('span');
  add.className = 'tag custom-add'; add.textContent = '+ custom';
  add.addEventListener('click', () => {
    const v = prompt('New tag:');
    if (!v) return;
    const t = v.trim().toLowerCase();
    if (!t) return;
    if (!state.customTags.includes(t) && !DEFAULT_TAGS.includes(t)) state.customTags.push(t);
    if (!editorDraft.tags.includes(t)) editorDraft.tags.push(t);
    saveState();
    renderTags();
  });
  wrap.appendChild(add);
}

function allRedFlags() {
  return Array.from(new Set([...DEFAULT_RED_FLAGS, ...(state.customRedFlags || [])]));
}
function renderRedFlags() {
  const wrap = document.getElementById('redFlagsWrap');
  wrap.innerHTML = '';
  if (!editorDraft.redFlags) editorDraft.redFlags = [];
  allRedFlags().forEach(t => {
    const el = document.createElement('span');
    el.className = 'tag' + (editorDraft.redFlags.includes(t) ? ' on' : '');
    el.textContent = t;
    el.addEventListener('click', () => {
      if (editorDraft.redFlags.includes(t)) editorDraft.redFlags = editorDraft.redFlags.filter(x => x !== t);
      else editorDraft.redFlags.push(t);
      renderRedFlags();
    });
    wrap.appendChild(el);
  });
  const add = document.createElement('span');
  add.className = 'tag custom-add'; add.textContent = '+ custom flag';
  add.addEventListener('click', () => {
    const v = prompt('New red flag:');
    if (!v) return;
    const t = v.trim().toLowerCase();
    if (!t) return;
    if (!state.customRedFlags) state.customRedFlags = [];
    if (!state.customRedFlags.includes(t) && !DEFAULT_RED_FLAGS.includes(t)) state.customRedFlags.push(t);
    if (!editorDraft.redFlags.includes(t)) editorDraft.redFlags.push(t);
    saveState();
    renderRedFlags();
  });
  wrap.appendChild(add);
}

function renderScheduleEditor() {
  const grid = document.getElementById('schedGrid');
  grid.innerHTML = '';
  // header
  grid.appendChild(empty());
  DAYS.forEach(d => {
    const h = document.createElement('div'); h.className = 'sg-h'; h.textContent = DAY_LABELS[d];
    grid.appendChild(h);
  });
  // rows
  SLOTS.forEach(slot => {
    const lbl = document.createElement('div'); lbl.className = 'sg-row-label ' + slot.key; lbl.textContent = slot.label;
    grid.appendChild(lbl);
    DAYS.forEach(d => {
      const cell = document.createElement('div');
      const on = !!(editorDraft.schedule[d] && editorDraft.schedule[d][slot.key]);
      cell.className = 'sched-cell ' + slot.key + (on ? ' on' : '');
      cell.addEventListener('click', () => {
        editorDraft.schedule[d] = editorDraft.schedule[d] || {};
        editorDraft.schedule[d][slot.key] = !editorDraft.schedule[d][slot.key];
        cell.classList.toggle('on', editorDraft.schedule[d][slot.key]);
      });
      grid.appendChild(cell);
    });
  });
  function empty() { const e = document.createElement('div'); return e; }
}

_on('cancelEdit', 'click', () => { editingId = null; editorDraft = null; showView('profiles'); });
function saveProfileHandler() {
  editorDraft.name = document.getElementById('f-name').value.trim();
  editorDraft.age = document.getElementById('f-age').value.trim();
  editorDraft.phone = document.getElementById('f-phone').value.trim();
  editorDraft.notes = document.getElementById('f-notes').value.trim();
  editorDraft.hidden = document.getElementById('f-hidden').checked;
  editorDraft.archived = document.getElementById('f-archived').checked;
  editorDraft.cream = document.getElementById('f-cream').checked;
  editorDraft.medals = {
    met:    document.getElementById('f-medal-met').checked,
    sex:    document.getElementById('f-medal-sex').checked,
    flower: document.getElementById('f-medal-flower').checked,
    flaked: document.getElementById('f-medal-flaked').checked
  };
  const distVal = document.getElementById('f-distance').value.trim();
  editorDraft.distanceMin = distVal ? parseInt(distVal, 10) : null;
  editorDraft.mapsLink = document.getElementById('f-maps-link').value.trim();
  editorDraft.cycle = {
    lastPeriod: document.getElementById('f-last-period').value || '',
    cycleLength: parseInt(document.getElementById('f-cycle-length').value) || 28,
    periodLength: parseInt(document.getElementById('f-period-length').value) || 5
  };
  if (!editorDraft.name) { alert('Give her a name first.'); return; }
  const nameLc = editorDraft.name.toLowerCase();
  const dupe = state.profiles.find(p => p.name.trim().toLowerCase() === nameLc && p.id !== editorDraft.id);
  if (dupe) {
    if (!confirm(`"${dupe.name}" already exists. Overwrite the existing one?`)) return;
    editorDraft.id = dupe.id;
    const idx = state.profiles.findIndex(p => p.id === dupe.id);
    state.profiles[idx] = editorDraft;
  } else if (editingId) {
    const idx = state.profiles.findIndex(p => p.id === editingId);
    state.profiles[idx] = editorDraft;
  } else {
    state.profiles.push(editorDraft);
    state.priorityOrder.push(editorDraft.id);
  }
  state.priorityOrder = state.priorityOrder.filter(id => state.profiles.some(p => p.id === id));
  state.profiles.forEach(p => { if (!state.priorityOrder.includes(p.id)) state.priorityOrder.push(p.id); });
  saveState();
  editingId = null; editorDraft = null;
  showView('profiles');
}
_on('saveProfile',    'click', saveProfileHandler);
_on('saveProfileTop', 'click', saveProfileHandler);
_on('deleteProfile',  'click', () => {
  if (!editingId) return;
  if (!confirm('Delete this profile?')) return;
  deleteProfile(editingId);
  editingId = null; editorDraft = null;
  showView('profiles');
});

/* =========================================================
   CONTACT PICKER (Android Chrome only)
   ========================================================= */
if ('contacts' in navigator && 'ContactsManager' in window) {
  const btn = document.getElementById('contactPickerBtn');
  btn.style.display = '';
  btn.addEventListener('click', async () => {
    try {
      const props = ['name','tel'];
      const contacts = await navigator.contacts.select(props, {multiple:false});
      if (!contacts.length) return;
      const c = contacts[0];
      const draft = blankProfile();
      draft.name = (c.name && c.name[0]) || '';
      draft.phone = (c.tel && c.tel[0]) || '';
      editorDraft = draft; editingId = null;
      document.getElementById('editorTitle').textContent = 'New profile';
      document.getElementById('deleteProfile').style.display = 'none';
      document.getElementById('f-name').value = draft.name;
      document.getElementById('f-age').value = '';
      document.getElementById('f-phone').value = draft.phone || '';
      document.getElementById('f-notes').value = '';
      renderAvatar(); renderPhotoRow(); renderTags(); renderScheduleEditor();
      showView('editor');
    } catch(e) { alert('Contact picker error: ' + (e && e.message ? e.message : String(e))); }
  });
}

/* =========================================================
   AVAILABILITY
   ========================================================= */
function dayKeyFromJsDate(d) {
  const map = ['sun','mon','tue','wed','thu','fri','sat'];
  return map[d.getDay()];
}
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
function orderedProfiles() {
  const byId = new Map(state.profiles.map(p => [p.id, p]));
  const sort = state.rosterSort || 'priority';
  if (sort === 'priority') {
    const order = state.priorityOrder.filter(id => byId.has(id));
    state.profiles.forEach(p => { if (!order.includes(p.id)) order.push(p.id); });
    return order.map(id => byId.get(id));
  }
  // For recent / longest-since, compute lastSeen from `dates` (most recent date entry containing this profile, in the past)
  const today = new Date(); today.setHours(0,0,0,0);
  const lastSeenById = {};
  Object.keys(state.dates).forEach(dateKey => {
    const entryDate = new Date(dateKey + 'T00:00:00');
    if (entryDate > today) return; // skip future bookings
    (state.dates[dateKey] || []).forEach(e => {
      if (!e.profileId) return;
      const cur = lastSeenById[e.profileId];
      if (!cur || entryDate > cur) lastSeenById[e.profileId] = entryDate;
    });
  });
  const list = [...state.profiles];
  list.sort((a, b) => {
    const la = lastSeenById[a.id] ? lastSeenById[a.id].getTime() : 0;
    const lb = lastSeenById[b.id] ? lastSeenById[b.id].getTime() : 0;
    if (sort === 'recent') return lb - la;       // most-recent first
    if (sort === 'longest-since') return la - lb; // earliest (or never) first
    return 0;
  });
  return list;
}

function renderAvailability() {
  const root = document.getElementById('dayCols');
  root.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = dayKeyFromJsDate(d);
    const col = document.createElement('div');
    col.className = 'day-col'; col.dataset.day = key;
    col.innerHTML = `<h3>${d.toLocaleDateString('en-US',{weekday:'long'})}<span class="date ${i===0?'today':''}">${d.getDate()}. ${d.toLocaleDateString('en-US',{month:'long'})}</span></h3>`;
    const available = orderedProfiles().filter(p => {
      if (p.hidden || p.archived) return false;
      const s = p.schedule && p.schedule[key];
      return s && (s.lunch || s.evening || s.night);
    });
    if (!available.length) {
      const e = document.createElement('div'); e.className = 'empty-state'; e.textContent = '—';
      col.appendChild(e);
    } else {
      available.forEach(p => col.appendChild(buildAvailRow(p, key, d)));
    }
    // Invisible flex spacer — fills empty bottom of card so the whole area is swipeable
    const spacer = document.createElement('div');
    spacer.className = 'day-col-spacer';
    col.appendChild(spacer);
    root.appendChild(col);
  }
  attachDragHandlers();
}

function buildAvailRow(p, dayKey, jsDate) {
  const row = document.createElement('div');
  row.className = 'avail-row';
  row.dataset.profileId = p.id;
  const idx = p.primaryPhotoIdx || 0;
  const thumbSrc = p.photos && p.photos[idx] ? p.photos[idx] : '';
  const s = p.schedule[dayKey] || {};

  const thumb = document.createElement('div');
  thumb.className = 'av-thumb';
  if (thumbSrc) thumb.style.backgroundImage = `url('${cssEscape(thumbSrc)}')`;
  else thumb.textContent = initials(p.name);

  const name = document.createElement('div');
  name.className = 'av-name';
  if (p.cream) {
    name.innerHTML = `<svg class="cream-inline" width="22" height="14" viewBox="0 0 48 24" style="vertical-align:-2px; margin-right:4px"><defs><linearGradient id="diaAv_${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#a0e7ff"/><stop offset="100%" stop-color="#5ec2ee"/></linearGradient><linearGradient id="diaAv2_${p.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bdf2ff"/><stop offset="100%" stop-color="#3a9ec8"/></linearGradient></defs><polygon points="8,9 13,2 35,2 40,9" fill="url(#diaAv_${p.id})" stroke="#2d80a8" stroke-width=".5"/><polygon points="8,9 40,9 24,22" fill="url(#diaAv2_${p.id})" stroke="#2d80a8" stroke-width=".5"/></svg>` + escapeHtml(p.name);
  } else {
    name.textContent = p.name;
  }

  const pills = document.createElement('div');
  pills.className = 'slot-pills';
  let pillHtml = `
    <span class="slot-pill ${s.lunch ? 'on lunch':''}">L</span>
    <span class="slot-pill ${s.evening ? 'on evening':''}">E</span>
    <span class="slot-pill ${s.night ? 'on night':''}">N</span>`;
  if (p.distanceMin) {
    pillHtml += `<span class="slot-pill distance-mini" title="${p.distanceMin} min by car">🚗${p.distanceMin}</span>`;
  }
  pills.innerHTML = pillHtml;

  // Cycle stage badge for this specific day (uses jsDate — the future date shown in this slide)
  const cycleClass = p.cycle && p.cycle.lastPeriod ? classifyCycleDay(jsDate, p.cycle) : null;
  if (cycleClass) {
    const flag = document.createElement('div');
    flag.className = 'cycle-flag ' + cycleClass;
    const cycleLabels = {period:'🩸 period', peak:'⚠️ peak', ovulation:'⚠️ ovulation', fertile:'fertile', elevated:'elevated', safer:'✓ safe'};
    const cycleTitles = {period:'On her period', peak:'Peak fertility — high pregnancy risk', ovulation:'Ovulation day — peak risk', fertile:'Fertile window (high risk)', elevated:'Elevated risk day', safer:'Lower-risk part of cycle'};
    flag.title = cycleTitles[cycleClass] || '';
    flag.textContent = cycleLabels[cycleClass] || cycleClass;
    pills.appendChild(flag);
  }

  const actions = document.createElement('div');
  actions.className = 'av-actions';
  // WhatsApp (only if phone)
  if (p.phone) {
    const waBtn = document.createElement('button');
    waBtn.className = 'av-action-btn wa-mini';
    waBtn.title = 'WhatsApp';
    waBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.3-.7-2.6-1.5-3.6-3.1-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-1-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.4-.1-.1-.3-.1-.6-.1z"/></svg>';
    waBtn.addEventListener('click', (e) => { e.stopPropagation(); openWhatsApp(p.phone); });
    actions.appendChild(waBtn);
  }
  // Add to date calendar
  const addBtn = document.createElement('button');
  addBtn.className = 'av-action-btn'; addBtn.title = 'Add to date calendar'; addBtn.innerHTML = '+';
  addBtn.addEventListener('click', (e) => { e.stopPropagation(); openAddDateModal(p.id, jsDate); });
  actions.appendChild(addBtn);

  // Tap the avatar to open the profile — rest of row is a free swipe surface
  thumb.style.cursor = 'pointer';
  thumb.addEventListener('click', (e) => { e.stopPropagation(); openEditor(p.id); });

  row.appendChild(thumb);
  row.appendChild(name);
  row.appendChild(pills);
  row.appendChild(actions);
  return row;
}

// Drag-to-reorder removed — rows are now a free swipe surface.
// Reordering is done via the Sort buttons (Priority / Recent / Stale).
function attachDragHandlers() { /* no-op — drag removed */ }
function reorderPriority(srcId, targetId) {
  const order = state.priorityOrder.slice();
  const sIdx = order.indexOf(srcId);
  if (sIdx >= 0) order.splice(sIdx, 1);
  const tIdx = order.indexOf(targetId);
  order.splice(tIdx, 0, srcId);
  state.priorityOrder = order;
}

/* =========================================================
   ADD-TO-DATE MODAL (opened from availability + button)
   ========================================================= */
function openAddDateModal(profileId, defaultDate) {
  pendingAddProfileId = profileId;
  const profile = state.profiles.find(p => p.id === profileId);
  document.getElementById('addDateTitle').textContent = `Date with ${profile ? profile.name : '…'}`;
  const row = document.getElementById('dateBtnRow');
  row.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = isoDate(d);
    const slotsUsed = (state.dates[key] || []).length;
    const isDef = defaultDate && isoDate(defaultDate) === key;
    const b = document.createElement('button');
    b.innerHTML = `${d.toLocaleDateString('en-US',{weekday:'short'})}<br><strong>${d.getDate()}. ${d.toLocaleDateString('en-US',{month:'short'})}</strong><br><span style="font-size:10px;opacity:.7">${slotsUsed}/3</span>`;
    if (slotsUsed >= 3) { b.disabled = true; b.style.opacity = .3; }
    if (isDef) b.classList.add('sel');
    b.addEventListener('click', () => addToDate(key));
    row.appendChild(b);
  }
  document.getElementById('addDateModal').classList.add('active');
}
function addToDate(key) {
  if (!pendingAddProfileId) return;
  state.dates[key] = state.dates[key] || [];
  if (state.dates[key].length >= 3) { alert('That day is already full (3 dates).'); return; }
  if (state.dates[key].some(e => e.profileId === pendingAddProfileId)) {
    alert('She is already on that day.'); return;
  }
  state.dates[key].push({ profileId: pendingAddProfileId });
  saveState();
  document.getElementById('addDateModal').classList.remove('active');
  pendingAddProfileId = null;
  // little success blip
  if (navigator.vibrate) navigator.vibrate(20);
}
_on('closeAddDate', 'click', () => {
  const m = document.getElementById('addDateModal'); if (m) m.classList.remove('active');
  pendingAddProfileId = null;
});
_on('addDateModal', 'click', (e) => {
  if (e.target.id === 'addDateModal') { e.target.classList.remove('active'); pendingAddProfileId = null; }
});

/* =========================================================
   DATE CALENDAR — simplified: just who, no time dropdown
   ========================================================= */
_on('weeksAhead', 'input', (e) => {
  const days = parseInt(e.target.value, 10) || 4;
  document.getElementById('weeksLabel').textContent = days + ' day' + (days === 1 ? '' : 's');
  renderCalendar();
});

function renderCalendar() {
  const totalDays = parseInt(document.getElementById('weeksAhead').value, 10) || 4;
  document.getElementById('weeksLabel').textContent = totalDays + ' day' + (totalDays === 1 ? '' : 's');
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = isoDate(d);
    const card = document.createElement('div');
    card.className = 'cal-day';
    const isToday = i === 0;
    card.innerHTML = `<h4>
      <span>${d.toLocaleDateString('en-US',{weekday:'long'})} ${isToday ? '<span class="today-badge">TODAY</span>' : ''}</span>
      <span class="dt">${d.getDate()}. ${d.toLocaleDateString('en-US',{month:'long'})}</span>
    </h4>`;

    const entries = state.dates[key] || [];
    entries.forEach((entry, idx) => {
      const slot = document.createElement('div'); slot.className = 'cal-slot';
      slot.innerHTML = `<div class="num">${idx+1}</div>`;

      // Who select
      const sel = document.createElement('select');
      sel.className = 'who-sel';
      const blank = document.createElement('option'); blank.value = ''; blank.textContent = '— who —';
      sel.appendChild(blank);
      // Use priority order, skip archived
      orderedProfiles().filter(p => !p.archived).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; opt.textContent = p.name;
        if (entry.profileId === p.id) opt.selected = true;
        sel.appendChild(opt);
      });

      // Time-of-day tag (lunch / evening / night)
      const slotTag = document.createElement('select');
      slotTag.className = 'slot-tag-sel ' + (entry.slot || '');
      [['','—'],['lunch','Lunch'],['evening','Evening'],['night','Night']].forEach(([v,l]) => {
        const o = document.createElement('option');
        o.value = v; o.textContent = l;
        if ((entry.slot || '') === v) o.selected = true;
        slotTag.appendChild(o);
      });

      // Hour input — plain text 24h, identical on every device (no native picker locale issues)
      const hourInp = document.createElement('input');
      hourInp.type = 'text';
      hourInp.className = 'hour-inp';
      hourInp.value = entry.time || '';
      hourInp.placeholder = '24h';
      hourInp.inputMode = 'numeric';
      hourInp.maxLength = 5;
      hourInp.title = 'Time (24h, e.g. 18:30)';
      // Auto-format as user types: 1830 → 18:30, 18 → 18:, etc.
      hourInp.addEventListener('input', (e) => {
        let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0,2) + ':' + v.slice(2);
        // Clamp hours and minutes to valid ranges
        if (v.length >= 2) {
          let h = parseInt(v.slice(0,2), 10);
          if (h > 23) h = 23;
          v = String(h).padStart(2,'0') + v.slice(2);
        }
        if (v.length === 5) {
          let m = parseInt(v.slice(3,5), 10);
          if (m > 59) m = 59;
          v = v.slice(0,3) + String(m).padStart(2,'0');
        }
        e.target.value = v;
      });

      function saveSlot() {
        state.dates[key][idx] = {
          profileId: sel.value,
          slot: slotTag.value,
          time: hourInp.value
        };
        // remove fully empty entry
        if (!sel.value && !slotTag.value && !hourInp.value) {
          state.dates[key].splice(idx, 1);
          if (!state.dates[key].length) delete state.dates[key];
        }
        saveState(); renderCalendar();
      }
      sel.addEventListener('change', saveSlot);
      slotTag.addEventListener('change', () => {
        // auto-suggest a default hour for that slot if hour is blank
        if (!hourInp.value) {
          if (slotTag.value === 'lunch') hourInp.value = '12:00';
          else if (slotTag.value === 'evening') hourInp.value = '18:00';
          else if (slotTag.value === 'night') hourInp.value = '22:00';
        }
        saveSlot();
      });
      hourInp.addEventListener('change', saveSlot);

      const fields = document.createElement('div'); fields.className = 'slot-fields';
      fields.appendChild(sel);
      const sub = document.createElement('div'); sub.className = 'slot-sub';
      sub.appendChild(slotTag);
      sub.appendChild(hourInp);
      fields.appendChild(sub);
      slot.appendChild(fields);

      const del = document.createElement('button');
      del.className = 'del-slot'; del.innerHTML = '×';
      del.addEventListener('click', () => {
        state.dates[key].splice(idx, 1);
        if (!state.dates[key].length) delete state.dates[key];
        saveState(); renderCalendar();
      });
      slot.appendChild(del);
      card.appendChild(slot);
    });

    if (entries.length < 3) {
      const add = document.createElement('button'); add.className = 'cal-add';
      add.textContent = entries.length === 0 ? '+ Add a date' : '+ Add another';
      add.addEventListener('click', () => {
        state.dates[key] = state.dates[key] || [];
        state.dates[key].push({ profileId: '' });
        saveState(); renderCalendar();
      });
      card.appendChild(add);
    }
    grid.appendChild(card);
  }
}

/* =========================================================
   SHARE / IMPORT (no server, just copy-paste through WhatsApp/email)
   ========================================================= */
_on('shareBtn', 'click', () => {
  const ib = document.getElementById('importBox'); if (ib) ib.value = '';
  const sm = document.getElementById('shareModal'); if (sm) sm.classList.add('active');
});
_on('closeShareBtn', 'click', () => {
  const sm = document.getElementById('shareModal'); if (sm) sm.classList.remove('active');
});
_on('shareModal', 'click', (e) => {
  if (e.target.id === 'shareModal') e.target.classList.remove('active');
});

// Build a compact, photo-free snapshot suitable for pasting into a chat.
function buildShareSnapshot() {
  const slim = {
    v: 2,
    profiles: state.profiles.map(p => ({
      id: p.id, name: p.name, age: p.age, phone: p.phone || '',
      notes: p.notes || '', tags: p.tags || [], redFlags: p.redFlags || [],
      schedule: p.schedule, cycle: p.cycle || null,
      cream: !!p.cream, hidden: !!p.hidden, archived: !!p.archived,
      medals: p.medals || null,
      distanceMin: p.distanceMin || null,
      mapsLink: p.mapsLink || ''
    })),
    customTags: state.customTags || [],
    dates: state.dates || {},
    priorityOrder: state.priorityOrder || []
  };
  const json = JSON.stringify(slim);
  // base64 + light obfuscation so a casual eye can't read it in a chat
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return 'ROT1:' + b64;
}

function parseShareSnapshot(text) {
  if (!text) return null;
  const t = text.trim();
  if (!t.startsWith('ROT1:')) return null;
  try {
    const json = decodeURIComponent(escape(atob(t.slice(5))));
    return JSON.parse(json);
  } catch (e) { return null; }
}

_on('exportShareBtn', 'click', async () => {
  const code = buildShareSnapshot();
  // Try Web Share API first (opens native share sheet — WhatsApp, Telegram, etc.)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Rotation share', text: code });
      return;
    } catch (e) { /* user cancelled — fall through to clipboard */ }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(code);
    alert('Share code copied. Paste it into a chat with your friend.');
  } catch (e) {
    // Last fallback: show the text so user can long-press to copy
    prompt('Copy this code and send it to your friend:', code);
  }
});

function doImport(mode) {
  const text = document.getElementById('importBox').value.trim();
  const data = parseShareSnapshot(text);
  if (!data) { alert('That code doesn\'t look right. Make sure it starts with ROT1:'); return; }

  if (mode === 'replace') {
    if (!confirm('Replace ALL your data with the imported version? Your current data will be lost.')) return;
    state.profiles = data.profiles || [];
    state.customTags = data.customTags || [];
    state.dates = data.dates || {};
    state.priorityOrder = data.priorityOrder || [];
    // photos are stripped during share, so imported profiles have no photos — that's fine
    state.profiles.forEach(p => { if (!p.photos) p.photos = []; if (typeof p.primaryPhotoIdx !== 'number') p.primaryPhotoIdx = 0; });
  } else {
    // merge: add profiles by name, prefer existing if name matches
    let added = 0, updated = 0;
    (data.profiles || []).forEach(incoming => {
      const existing = state.profiles.find(p => p.name.trim().toLowerCase() === (incoming.name || '').trim().toLowerCase());
      if (existing) {
        // merge tags, keep newer notes if incoming has any, merge schedule (OR-combine)
        existing.tags = Array.from(new Set([...(existing.tags||[]), ...(incoming.tags||[])]));
        if (incoming.notes && !existing.notes) existing.notes = incoming.notes;
        Object.keys(incoming.schedule || {}).forEach(d => {
          existing.schedule[d] = existing.schedule[d] || {lunch:false,evening:false,night:false};
          ['lunch','evening','night'].forEach(k => {
            existing.schedule[d][k] = existing.schedule[d][k] || !!(incoming.schedule[d] && incoming.schedule[d][k]);
          });
        });
        updated++;
      } else {
        incoming.photos = []; incoming.primaryPhotoIdx = 0;
        state.profiles.push(incoming);
        state.priorityOrder.push(incoming.id);
        added++;
      }
    });
    // merge custom tags
    state.customTags = Array.from(new Set([...(state.customTags||[]), ...((data.customTags)||[])]));
    // merge dates: don't overwrite, just add if slot free
    Object.keys(data.dates || {}).forEach(day => {
      state.dates[day] = state.dates[day] || [];
      (data.dates[day] || []).forEach(entry => {
        if (state.dates[day].length < 3 && !state.dates[day].some(e => e.profileId === entry.profileId)) {
          state.dates[day].push(entry);
        }
      });
    });
    alert(`Imported: ${added} new, ${updated} merged.`);
  }
  saveState();
  document.getElementById('shareModal').classList.remove('active');
  showView('profiles');
}
_on('importMergeBtn',   'click', () => doImport('merge'));
_on('importReplaceBtn', 'click', () => doImport('replace'));

/* =========================================================
   UTIL
   ========================================================= */
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function cssEscape(s) { return String(s || '').replace(/'/g, "\\'"); }

// Long-press → show fullscreen photo preview. Attach to any element with a `data-photo-src` attr.
function attachPhotoPreviewHold(el, src) {
  if (!el || !src) return;
  let holdTimer = null;
  let canceled = false;
  const start = () => {
    canceled = false;
    holdTimer = setTimeout(() => {
      if (canceled) return;
      const pv = document.getElementById('photoPreview');
      document.getElementById('photoPreviewImg').src = src;
      pv.classList.add('show');
      if (navigator.vibrate) navigator.vibrate(30);
    }, 400);
  };
  const cancel = () => { canceled = true; clearTimeout(holdTimer); };
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('mouseup', cancel);
  el.addEventListener('mouseleave', cancel);
  el.addEventListener('touchend', cancel);
  el.addEventListener('touchcancel', cancel);
  el.addEventListener('touchmove', cancel, { passive: true });
}
// Tap anywhere on preview to dismiss
_on('photoPreview', 'click', () => {
  const pp = document.getElementById('photoPreview'); if (pp) pp.classList.remove('show');
});
// Single source of truth for date formatting across the whole app.
// Format: "Tuesday 12. May"
function fmtDate(d) {
  const date = new Date(d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month   = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${date.getDate()}. ${month}`;
}
// Short version for tight spaces — "Tue 12. May"
function fmtDateShort(d) {
  const date = new Date(d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month   = date.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday} ${date.getDate()}. ${month}`;
}
// Numeric-day + month + year — "22. May 2026"
function fmtDateLong(d) {
  const date = new Date(d);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${date.getDate()}. ${month} ${date.getFullYear()}`;
}
function openWhatsApp(phone) {
  if (!phone) return;
  // strip everything except digits (keeps leading + handling clean)
  const clean = String(phone).replace(/[^\d]/g, '');
  if (!clean) { alert('No valid WhatsApp number on this profile.'); return; }
  // wa.me works on phone (opens WhatsApp app) and on desktop (opens WhatsApp Web)
  window.open(`https://wa.me/${clean}`, '_blank');
}
// Default home address — preset as departure & arrival in ride apps
const HOME_ADDRESS = 'Jl. Raya Casablanca No. Kav. 88, Jakarta';
function openGrab() {
  const addr = encodeURIComponent(HOME_ADDRESS);
  // Grab's deep link with prefilled pickup & dropoff
  const deepLink = `grab://open?screenType=BOOKING&dropOffAddress=${addr}&pickUpAddress=${addr}`;
  window.location.href = deepLink;
  setTimeout(() => {
    // Web fallback uses Grab's transport booking page
    window.open(`https://www.grab.com/id/transport/?pickup=${addr}&dropoff=${addr}`, '_blank');
  }, 1200);
}
function openGojek() {
  const addr = encodeURIComponent(HOME_ADDRESS);
  // Gojek's deep link with prefilled origin & destination
  const deepLink = `gojek://gocar?pickup_address=${addr}&destination_address=${addr}`;
  window.location.href = deepLink;
  setTimeout(() => window.open('https://www.gojek.com/', '_blank'), 1200);
}
function openBumble() {
  // Bumble's App Links: tapping the official URL opens the installed app, or web if not installed.
  // The bumble:// scheme isn't reliably handled — App Links are the supported path.
  window.open('https://bumble.com/get-started', '_blank');
}
function openTinder() {
  // Tinder's universal link
  window.open('https://tinder.com/app/recs', '_blank');
}
function openOkCupid() {
  window.open('https://www.okcupid.com/', '_blank');
}
function openBadoo() {
  // Badoo also uses App Links / Universal Links
  window.open('https://badoo.com/', '_blank');
}

/* =========================================================
   SHARE CALENDAR AS IMAGE
   Renders the upcoming dates to a canvas, then either opens the
   native share sheet with the PNG (Android/iOS) or downloads it
   so the user can attach it manually.
   ========================================================= */




/* === Tools sub-page navigation ===
   Uses a SINGLE delegated listener on document so it works regardless of
   display:none state, render order, or dynamic injection.               */
const _TOOL_PANES = ['tools-landing','tools-clipboard','tools-links','tools-daygame','tools-dating'];

function _toolsShowPane(paneId) {
  _TOOL_PANES.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (id === paneId) ? 'block' : 'none';
  });
}
function showToolsLanding()  { _toolsShowPane('tools-landing'); }
function showToolsClipboard(){ _toolsShowPane('tools-clipboard'); if (typeof renderClipboard === 'function') renderClipboard(); }
function showToolsLinks()    { _toolsShowPane('tools-links'); }
function showToolsDaygame()  { _toolsShowPane('tools-daygame'); }
function showToolsDating()   { _toolsShowPane('tools-dating'); }

// Single delegated listener — catches clicks anywhere in the document.
// Uses closest() so clicking a child (icon, arrow, text) still works.
document.addEventListener('click', function(e) {
  // Tool card navigation
  const card = e.target.closest('[data-tool]');
  if (card) {
    const tool = card.dataset.tool;
    if      (tool === 'clipboard') showToolsClipboard();
    else if (tool === 'links')     showToolsLinks();
    else if (tool === 'daygame')   showToolsDaygame();
    else if (tool === 'dating')    showToolsDating();
    else if (tool === 'settings')  { if (typeof showView === 'function') showView('settings'); }
    return;
  }
  // Back buttons
  const id = e.target.id || (e.target.closest('button') && e.target.closest('button').id);
  if (id === 'toolsBack' || id === 'toolsBackLinks' || id === 'toolsBackDaygame' || id === 'toolsBackDating') {
    showToolsLanding();
    return;
  }
  // Quick-jump chips
  const chip = e.target.closest('.tools-quick-chip[data-jump]');
  if (chip) {
    showToolsLinks();
    requestAnimationFrame(() => {
      const target = document.getElementById(chip.dataset.jump);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('jump-flash');
        setTimeout(() => target.classList.remove('jump-flash'), 1400);
      }
    });
  }
});


/* =========================================================
   REBUILT FEATURES — restored after corruption
   ========================================================= */

function showToast(text) {
  const t = document.getElementById('easterToast');
  if (!t) return;
  t.textContent = text;
  t.classList.add('show');
  const ms = Math.min(7000, Math.max(3200, text.length * 50));
  setTimeout(() => t.classList.remove('show'), ms);
}



let _quoteIdx = -1;
function rotateQuote() {
  const band = document.getElementById('quoteBand');
  if (!band) return;
  const roster = document.getElementById('view-availability');
  if (!roster || !roster.classList.contains('active')) return;
  band.classList.remove('visible');
  setTimeout(() => {
    _quoteIdx = (_quoteIdx + 1 + Math.floor(Math.random() * (PHILOSOPHICAL_QUOTES.length - 1))) % PHILOSOPHICAL_QUOTES.length;
    const q = PHILOSOPHICAL_QUOTES[_quoteIdx];
    const tEl = band.querySelector('.quote-text');
    const aEl = band.querySelector('.quote-attr');
    if (tEl) tEl.textContent = q.t;
    if (aEl) aEl.textContent = '— ' + q.a;
    requestAnimationFrame(() => band.classList.add('visible'));
  }, 2200);
}
setTimeout(() => {
  const band = document.getElementById('quoteBand');
  if (!band) return;
  _quoteIdx = Math.floor(Math.random() * PHILOSOPHICAL_QUOTES.length);
  const q = PHILOSOPHICAL_QUOTES[_quoteIdx];
  const tEl = band.querySelector('.quote-text');
  const aEl = band.querySelector('.quote-attr');
  if (tEl) tEl.textContent = q.t;
  if (aEl) aEl.textContent = '— ' + q.a;
  band.classList.add('visible');
}, 800);
setInterval(rotateQuote, 14000);

function showLaunchPopup() {
  const popup = document.getElementById('launchPopup');
  if (!popup) return;
  const textEl = popup.querySelector('.launch-popup-text');
  if (textEl) textEl.textContent = TOASTS[Math.floor(Math.random() * TOASTS.length)];
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 5000);
}
{
  const popup = document.getElementById('launchPopup');
  if (popup) {
    popup.addEventListener('click', () => popup.classList.remove('show'));
    setTimeout(showLaunchPopup, 600);
  }
}

// Song catalogue — loaded dynamically from audio/songs.json
// To add a new song: drop the .mp3 in audio/ and add one entry to audio/songs.json
