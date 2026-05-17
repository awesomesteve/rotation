/* js/clipboard.js — clipboard snippet UI
   Depends on: data.js (state, saveState), quotes.js — DEFAULT_SNIPPETS is in snippets.js
   Exposes: renderClipboard()
*/

/* ----------------------------------------------------------
   Helpers
   ---------------------------------------------------------- */
function _getSnippets() {
  // state.snippets null = use defaults; otherwise persisted copy
  if (!state.snippets) {
    // Deep-clone defaults so mutations don't affect the constant
    state.snippets = DEFAULT_SNIPPETS.map(g => ({
      ...g,
      items: g.items.map(it => ({ ...it }))
    }));
    saveState();
  }
  return state.snippets;
}

function _saveSnippets(groups) {
  state.snippets = groups;
  saveState();
}

/* ----------------------------------------------------------
   Main render
   ---------------------------------------------------------- */
function renderClipboard() {
  const list  = document.getElementById('clipboardList');
  const jumps = document.getElementById('clipboardJumps');
  if (!list) return;

  const groups = _getSnippets();
  list.innerHTML  = '';
  if (jumps) jumps.innerHTML = '';

  groups.forEach((group, gIdx) => {
    const anchorId = 'clip-group-' + group.id;

    // Jump pill
    if (jumps) {
      const pill = document.createElement('button');
      pill.className = 'clipboard-jump-pill';
      pill.innerHTML = `${group.emoji} ${group.label}`;
      pill.addEventListener('click', () => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      jumps.appendChild(pill);
    }

    // Group header (with anchor id)
    const header = document.createElement('div');
    header.className = 'snippet-group-header';
    header.id = anchorId;
    header.innerHTML = `<span class="snippet-group-emoji">${group.emoji}</span>
      <span class="snippet-group-label">${group.label}</span>
      <span class="snippet-group-count">${group.items.length}</span>`;
    list.appendChild(header);

    // Group item container (drag within this)
    const container = document.createElement('div');
    container.className = 'snippet-group-items';
    container.dataset.gidx = gIdx;
    list.appendChild(container);

    group.items.forEach((item, iIdx) => {
      container.appendChild(_buildSnippetEl(item, gIdx, iIdx, groups));
    });

    _initDragForGroup(container, groups);
  });
}

/* ----------------------------------------------------------
   Build one snippet element
   ---------------------------------------------------------- */
function _buildSnippetEl(item, gIdx, iIdx, groups) {
  const el = document.createElement('div');
  el.className = 'clipboard-snippet';
  el.dataset.id = item.id;
  el.draggable = true;

  el.innerHTML = `
    <div class="snippet-drag-handle" title="Drag to reorder">⠿</div>
    <div class="snippet-text">${_esc(item.text)}</div>
    <div class="copy-flash">COPIED ✓</div>
    <div class="snippet-actions">
      <button class="snippet-action-btn edit-btn" title="Edit">✏️</button>
      <button class="snippet-action-btn danger del-btn" title="Delete">🗑</button>
    </div>`;

  // Tap body → copy
  el.addEventListener('click', (e) => {
    if (e.target.closest('.snippet-actions') || e.target.closest('.snippet-drag-handle')) return;
    _copyText(item.text, el);
  });

  // Edit
  el.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    _editSnippet(el, item, gIdx, iIdx, groups);
  });

  // Delete
  el.querySelector('.del-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!confirm('Delete this snippet?')) return;
    groups[gIdx].items.splice(iIdx, 1);
    _saveSnippets(groups);
    renderClipboard();
  });

  return el;
}

/* ----------------------------------------------------------
   Copy to clipboard
   ---------------------------------------------------------- */
function _copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1200);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1200);
  });
}

/* ----------------------------------------------------------
   Inline edit
   ---------------------------------------------------------- */
function _editSnippet(el, item, gIdx, iIdx, groups) {
  // Replace snippet body with textarea
  const textDiv = el.querySelector('.snippet-text');
  const actions = el.querySelector('.snippet-actions');
  const handle  = el.querySelector('.snippet-drag-handle');
  handle.style.display = 'none';
  actions.style.opacity = '0'; actions.style.pointerEvents = 'none';
  el.draggable = false;

  const ta = document.createElement('textarea');
  ta.className = 'snippet-edit-area';
  ta.value = item.text;
  textDiv.replaceWith(ta);
  ta.focus();

  // Save on blur or Ctrl+Enter
  function _save() {
    const val = ta.value.trim();
    if (val && val !== item.text) {
      groups[gIdx].items[iIdx].text = val;
      _saveSnippets(groups);
    }
    renderClipboard();
  }
  ta.addEventListener('blur', _save);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ta.blur(); }
    if (e.key === 'Escape') { ta.removeEventListener('blur', _save); renderClipboard(); }
  });
}

/* ----------------------------------------------------------
   Drag-to-reorder (within same group)
   ---------------------------------------------------------- */
function _initDragForGroup(container, groups) {
  let dragged = null;

  container.addEventListener('dragstart', (e) => {
    dragged = e.target.closest('.clipboard-snippet');
    if (!dragged) return;
    setTimeout(() => dragged.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragend', () => {
    if (dragged) dragged.classList.remove('dragging');
    container.querySelectorAll('.clipboard-snippet').forEach(s => s.classList.remove('drag-over'));
    dragged = null;
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.clipboard-snippet');
    if (!target || target === dragged) return;
    container.querySelectorAll('.clipboard-snippet').forEach(s => s.classList.remove('drag-over'));
    target.classList.add('drag-over');
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.clipboard-snippet');
    if (!target || !dragged || target === dragged) return;

    const gIdx = parseInt(container.dataset.gidx, 10);
    const items = groups[gIdx].items;

    // Find indices by id
    const fromId = dragged.dataset.id;
    const toId   = target.dataset.id;
    const fromIdx = items.findIndex(x => x.id === fromId);
    const toIdx   = items.findIndex(x => x.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;

    // Move
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    _saveSnippets(groups);
    renderClipboard();
  });
}

/* ----------------------------------------------------------
   Escape HTML
   ---------------------------------------------------------- */
function _esc(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
}

/* ----------------------------------------------------------
   Add / Reset buttons
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const addBtn   = document.getElementById('addSnippetBtn');
  const resetBtn = document.getElementById('resetSnippetsBtn');

  if (addBtn) addBtn.addEventListener('click', () => {
    const groups = _getSnippets();
    // Pick which group via prompt (simple approach)
    const names = groups.map((g, i) => `${i+1}. ${g.emoji} ${g.label}`).join('\n');
    const choice = prompt(`Add to which group?\n${names}\nEnter number:`);
    const gIdx = parseInt(choice, 10) - 1;
    if (isNaN(gIdx) || gIdx < 0 || gIdx >= groups.length) return;
    const text = prompt('Enter your message:');
    if (!text || !text.trim()) return;
    const newId = `custom-${Date.now()}`;
    groups[gIdx].items.push({ id: newId, text: text.trim() });
    _saveSnippets(groups);
    renderClipboard();
  });

  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all snippets to defaults? Your changes will be lost.')) return;
    state.snippets = null;
    saveState();
    renderClipboard();
  });
});
