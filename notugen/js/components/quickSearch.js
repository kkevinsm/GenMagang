/**
 * notugen — Quick Search Modal Component (⌘K / Ctrl+K)
 */

import { state } from '../state.js';
import { escapeHtml } from '../utils.js';

let openDetailHandler = null;

export function setOpenDetailCallback(fn) {
  openDetailHandler = fn;
}

export function openQuickSearch() {
  const dialog = document.getElementById('quickSearchDialog');
  const input = document.getElementById('modalSearchInput');
  if (!dialog) return;

  dialog.showModal();
  if (input) {
    input.value = '';
    input.focus();
  }
  renderQuickSearchResults('');
}

export function closeQuickSearch() {
  const dialog = document.getElementById('quickSearchDialog');
  if (dialog && dialog.open) {
    dialog.close();
  }
}

export function renderQuickSearchResults(query) {
  const resultsContainer = document.getElementById('modalSearchResults');
  if (!resultsContainer) return;

  const q = (query || '').trim().toLowerCase();
  const meetings = state.meetings;

  if (!q) {
    // Show recent 5 meetings
    const recents = meetings.slice(0, 5);
    resultsContainer.innerHTML = `
      <div style="padding: 8px 12px; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
        Notulen Terbaru
      </div>
      ${recents.map(m => `
        <div class="search-result-item" data-id="${m.id}">
          <div class="result-item-title">${escapeHtml(m.title).replace(/\n/g, ' ')}</div>
          <div class="result-item-snippet">
            <span class="badge-tag" style="margin-right: 6px;">${escapeHtml(m.category)}</span>
            ${escapeHtml(m.date)} • ${escapeHtml(m.location || 'Online')}
          </div>
        </div>
      `).join('')}
    `;
  } else {
    const hits = meetings.filter(m => {
      const inTitle = m.title.toLowerCase().includes(q);
      const inDate = m.date.toLowerCase().includes(q);
      const inAttendees = (m.attendees || '').toLowerCase().includes(q);
      const inCategory = (m.category || '').toLowerCase().includes(q);
      const inAgenda = (m.agendas || []).some(a => a.toLowerCase().includes(q));
      const inDecisions = (m.decisions || []).some(d =>
        d.topic.toLowerCase().includes(q) || d.bullets.some(b => b.toLowerCase().includes(q))
      );
      return inTitle || inDate || inAttendees || inCategory || inAgenda || inDecisions;
    });

    if (hits.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          Tidak ditemukan notulen dengan kata kunci "${escapeHtml(q)}"
        </div>
      `;
    } else {
      resultsContainer.innerHTML = hits.map(m => `
        <div class="search-result-item" data-id="${m.id}">
          <div class="result-item-title">${escapeHtml(m.title).replace(/\n/g, ' ')}</div>
          <div class="result-item-snippet">
            <span class="badge-tag" style="margin-right: 6px;">${escapeHtml(m.category)}</span>
            ${escapeHtml(m.date)} • ${m.agendas && m.agendas[0] ? escapeHtml(m.agendas[0]) : ''}
          </div>
        </div>
      `).join('');
    }
  }

  // Attach click listener to each result
  resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const mId = item.dataset.id;
      closeQuickSearch();
      if (typeof openDetailHandler === 'function') {
        openDetailHandler(mId);
      }
    });
  });
}

export function initQuickSearch(onSelectMeeting) {
  if (onSelectMeeting) {
    setOpenDetailCallback(onSelectMeeting);
  }

  const btnTrigger = document.getElementById('btnQuickSearchTrigger');
  const input = document.getElementById('modalSearchInput');
  const dialog = document.getElementById('quickSearchDialog');

  if (btnTrigger) {
    btnTrigger.addEventListener('click', openQuickSearch);
  }

  if (input) {
    input.addEventListener('input', (e) => {
      renderQuickSearchResults(e.target.value);
    });
  }

  // Global ⌘K or Ctrl+K shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog?.open) {
        closeQuickSearch();
      } else {
        openQuickSearch();
      }
    }
  });
}
