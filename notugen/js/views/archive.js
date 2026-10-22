/**
 * notugen — Archive Page View (Rak Folder & Grid Notulensi)
 */

import { state } from '../state.js';
import { escapeHtml, showToast, showModernConfirm, updateStats } from '../utils.js';

let openDetailHandler = null;

export function setOpenDetailCallback(fn) {
  openDetailHandler = fn;
}

export function renderFolderShelf() {
  const container = document.getElementById('folderShelfContainer');
  if (!container) return;

  const folders = state.folders;
  const meetings = state.meetings;
  const activeFolderFilter = state.activeFolderFilter;

  // Calculate count per folder
  const counts = { all: meetings.length };
  folders.forEach(f => {
    counts[f.id] = 0;
  });

  meetings.forEach(m => {
    if (counts[m.category] !== undefined) {
      counts[m.category]++;
    }
  });

  let html = `
    <button class="folder-chip ${activeFolderFilter === 'all' ? 'active' : ''}" data-folder="all">
      <div class="folder-tab-gradient grad-sand"></div>
      <div class="folder-chip-body">
        <span class="folder-name">Semua Dokumen</span>
        <span class="folder-count">${counts.all} rapat</span>
      </div>
    </button>
  `;

  folders.forEach(f => {
    const isSelected = activeFolderFilter === f.id;
    const count = counts[f.id] || 0;
    html += `
      <div class="folder-chip ${isSelected ? 'active' : ''}" data-folder="${escapeHtml(f.id)}" tabindex="0" role="button">
        <div class="folder-tab-gradient ${escapeHtml(f.gradient || 'grad-sage')}"></div>
        <div class="folder-chip-body">
          <div class="folder-chip-header">
            <span class="folder-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
            <div class="folder-chip-actions">
              <button type="button" class="folder-action-btn edit" data-folder-id="${escapeHtml(f.id)}" title="Ganti nama folder ${escapeHtml(f.name)}" aria-label="Edit folder">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button type="button" class="folder-action-btn delete" data-folder-id="${escapeHtml(f.id)}" title="Hapus folder ${escapeHtml(f.name)}" aria-label="Hapus folder">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <span class="folder-count">${count} rapat</span>
        </div>
      </div>
    `;
  });

  // Add New Folder Card Button
  html += `
    <button type="button" class="folder-chip-add" id="btnOpenAddFolderModal" title="Tambah Folder Proyek Baru">
      <div class="folder-chip-add-text">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tambah Folder</span>
      </div>
    </button>
  `;

  container.innerHTML = html;

  // Attach click listeners for folder chips
  container.querySelectorAll('.folder-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.closest('.folder-chip-actions')) return;
      state.activeFolderFilter = chip.dataset.folder;
      container.querySelectorAll('.folder-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterProjectSelect = document.getElementById('filterProjectSelect');
      if (filterProjectSelect) {
        filterProjectSelect.value = state.activeFolderFilter;
      }
      renderMeetingsGrid();
    });
  });

  // Attach Edit Folder listeners
  container.querySelectorAll('.folder-action-btn.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fId = btn.dataset.folderId;
      openEditFolderModal(fId);
    });
  });

  // Attach Delete Folder listeners
  container.querySelectorAll('.folder-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const fId = btn.dataset.folderId;
      await handleDeleteFolder(fId);
    });
  });

  // Attach "+ Tambah Folder" listener
  const btnAdd = document.getElementById('btnOpenAddFolderModal');
  if (btnAdd) {
    btnAdd.addEventListener('click', openAddFolderModal);
  }
}

export function updateProjectDropdowns() {
  const folders = state.folders;

  // 1. Filter dropdown in Archive View
  const filterProjectSelect = document.getElementById('filterProjectSelect');
  if (filterProjectSelect) {
    const currentVal = filterProjectSelect.value || 'all';
    let optionsHtml = `<option value="all">Semua Proyek / Modul</option>`;
    folders.forEach(f => {
      optionsHtml += `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`;
    });
    filterProjectSelect.innerHTML = optionsHtml;
    filterProjectSelect.value = currentVal;
  }

  // 2. Category select in Generator View
  const genCategorySelect = document.getElementById('genMeetingCategory');
  if (genCategorySelect) {
    const currentGenVal = genCategorySelect.value;
    let genOptionsHtml = '';
    if (folders.length === 0) {
      genOptionsHtml = '<option value="Umum">Umum</option>';
    } else {
      folders.forEach(f => {
        genOptionsHtml += `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`;
      });
    }
    genCategorySelect.innerHTML = genOptionsHtml;
    if (currentGenVal && folders.some(f => f.id === currentGenVal)) {
      genCategorySelect.value = currentGenVal;
    }
  }
}

export function renderMeetingsGrid() {
  const container = document.getElementById('meetingsGridContainer');
  const emptyState = document.getElementById('archiveEmptyState');
  if (!container) return;

  const keywordInput = document.getElementById('filterKeywordInput');
  const projectSelect = document.getElementById('filterProjectSelect');

  const keyword = (keywordInput?.value || '').trim().toLowerCase();
  const projectFilter = projectSelect?.value || 'all';
  const activeFolderFilter = state.activeFolderFilter;

  const filtered = state.meetings.filter(m => {
    if (activeFolderFilter !== 'all' && m.category !== activeFolderFilter) {
      return false;
    }
    if (projectFilter !== 'all' && m.category !== projectFilter) {
      return false;
    }

    if (keyword) {
      const titleMatch = m.title.toLowerCase().includes(keyword);
      const dateMatch = m.date.toLowerCase().includes(keyword);
      const attendeesMatch = (m.attendees || '').toLowerCase().includes(keyword);
      const agendaMatch = (m.agendas || []).some(a => a.toLowerCase().includes(keyword));
      const decisionsMatch = (m.decisions || []).some(d =>
        d.topic.toLowerCase().includes(keyword) ||
        d.bullets.some(b => b.toLowerCase().includes(keyword))
      );
      return titleMatch || dateMatch || attendeesMatch || agendaMatch || decisionsMatch;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const h3 = emptyState.querySelector('h3');
      const p = emptyState.querySelector('p');
      const btnReset = document.getElementById('btnResetSearchFilter');

      if (state.meetings.length === 0) {
        if (h3) h3.textContent = 'Belum Ada Notulensi Rapat';
        if (p) p.textContent = 'Mulai unggah catatan rapat atau rekam suara menggunakan AI Generator untuk membuat dokumen notulensi resmi.';
        if (btnReset) btnReset.style.display = 'none';
      } else {
        if (h3) h3.textContent = 'Tidak ada notulensi yang cocok';
        if (p) p.textContent = 'Coba sesuaikan kata kunci pencarian atau reset filter kategori.';
        if (btnReset) btnReset.style.display = 'inline-flex';
      }
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(m => {
    // calculate action item progress
    let totalTasks = 0;
    let doneTasks = 0;
    if (m.actionItems) {
      m.actionItems.forEach(grp => {
        grp.tasks.forEach(t => {
          totalTasks++;
          if (t.done) doneTasks++;
        });
      });
    }
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100;

    let badgeClass = 'badge-default';
    if (m.category === 'FSCM') badgeClass = 'badge-fscm';
    else if (m.category === 'Core Banking') badgeClass = 'badge-core';
    else if (m.category === 'Migrasi') badgeClass = 'badge-migrasi';
    else if (m.category === 'Bisnis') badgeClass = 'badge-bisnis';

    const snippet = m.agendas && m.agendas.length > 0 ? m.agendas[0] : (m.summary && m.summary[0] ? m.summary[0] : 'Klik untuk melihat detail risalah rapat...');

    return `
      <article class="meeting-card" data-id="${m.id}" tabindex="0" role="button" aria-label="Buka notulen ${escapeHtml(m.title)}">
        <div class="meeting-card-top">
          <div class="meeting-card-meta-row">
            <span class="badge-tag ${badgeClass}">${escapeHtml(m.category || 'Rapat')}</span>
            <span class="meeting-date-badge">${escapeHtml(m.date)}</span>
          </div>

          <h3 class="meeting-card-title">${escapeHtml(m.title).replace(/\n/g, '<br>')}</h3>

          <div class="meeting-card-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${escapeHtml(m.location || 'Online')}</span>
          </div>

          <p class="meeting-card-snippet">${escapeHtml(snippet)}</p>
        </div>

        <div class="meeting-card-bottom">
          <div class="meeting-action-stats">
            <div class="progress-mini-bar" title="${progressPercent}% Selesai">
              <div class="progress-mini-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <span>${doneTasks}/${totalTasks} Action Items</span>
          </div>

          <span class="btn-ghost-sm">Lihat Notulen →</span>
        </div>
      </article>
    `;
  }).join('');

  // Attach click listeners to cards
  container.querySelectorAll('.meeting-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (typeof openDetailHandler === 'function') {
        openDetailHandler(id);
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = card.dataset.id;
        if (typeof openDetailHandler === 'function') {
          openDetailHandler(id);
        }
      }
    });
  });
}

// --- FOLDER MODAL ACTIONS ---
export function openAddFolderModal() {
  const dialog = document.getElementById('folderModalDialog');
  const title = document.getElementById('folderModalTitle');
  const editIdInput = document.getElementById('inputFolderEditId');
  const nameInput = document.getElementById('inputFolderName');
  const form = document.getElementById('folderModalForm');

  if (!dialog) return;
  if (title) title.textContent = 'Tambah Folder Proyek Baru';
  if (editIdInput) editIdInput.value = '';
  if (nameInput) nameInput.value = '';

  const defaultColorRadio = form?.querySelector('input[name="folderGradient"][value="grad-sage"]');
  if (defaultColorRadio) defaultColorRadio.checked = true;

  dialog.showModal();
  if (nameInput) nameInput.focus();
}

export function openEditFolderModal(folderId) {
  const dialog = document.getElementById('folderModalDialog');
  const title = document.getElementById('folderModalTitle');
  const editIdInput = document.getElementById('inputFolderEditId');
  const nameInput = document.getElementById('inputFolderName');
  const form = document.getElementById('folderModalForm');

  const targetFolder = state.folders.find(f => f.id === folderId);
  if (!targetFolder || !dialog) return;

  if (title) title.textContent = `Ganti Nama Folder (${targetFolder.name})`;
  if (editIdInput) editIdInput.value = folderId;
  if (nameInput) nameInput.value = targetFolder.name;

  const colorRadio = form?.querySelector(`input[name="folderGradient"][value="${targetFolder.gradient || 'grad-sage'}"]`);
  if (colorRadio) colorRadio.checked = true;

  dialog.showModal();
  if (nameInput) {
    nameInput.focus();
    nameInput.select();
  }
}

export function closeFolderModal() {
  const dialog = document.getElementById('folderModalDialog');
  if (dialog && dialog.open) {
    dialog.close();
  }
}

export function saveFolderForm(name, gradient, editId) {
  const trimmed = name.trim();
  if (!trimmed) {
    showToast('Nama folder tidak boleh kosong');
    return;
  }

  if (editId) {
    const res = state.renameFolder(editId, trimmed, gradient);
    if (!res) {
      showToast('Gagal mengubah nama folder');
      return;
    }
    showToast(`Folder berhasil diubah menjadi "${trimmed}" (${res.migratedCount} notulen diperbarui)`);
  } else {
    // Check duplication
    const exists = state.folders.some(f => f.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Folder "${trimmed}" sudah ada`);
      return;
    }
    state.addFolder({ name: trimmed, gradient });
    showToast(`Folder baru "${trimmed}" berhasil dibuat!`);
  }

  closeFolderModal();
  renderFolderShelf();
  updateProjectDropdowns();
  renderMeetingsGrid();
}

export async function handleDeleteFolder(folderId) {
  const targetFolder = state.folders.find(f => f.id === folderId);
  if (!targetFolder) return;

  const countInFolder = state.meetings.filter(m => m.category === folderId || m.category === targetFolder.name).length;

  let msg = `Apakah Anda yakin ingin menghapus folder "${targetFolder.name}"?`;
  if (countInFolder > 0) {
    msg = `Folder "${targetFolder.name}" berisi ${countInFolder} notulensi. Notulen tidak akan terhapus, tetapi akan dialihkan ke kategori "Umum". Lanjutkan?`;
  }

  const confirmed = await showModernConfirm({
    title: 'Hapus Folder Proyek?',
    message: msg,
    confirmText: 'Ya, Hapus Folder'
  });

  if (confirmed) {
    state.deleteFolder(folderId);
    renderFolderShelf();
    updateProjectDropdowns();
    renderMeetingsGrid();
    showToast(`Folder "${targetFolder.name}" telah dihapus.`);
  }
}

export function initArchiveView(onSelectMeeting) {
  if (onSelectMeeting) {
    setOpenDetailCallback(onSelectMeeting);
  }

  // Search input & clear button
  const keywordInput = document.getElementById('filterKeywordInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const projectSelect = document.getElementById('filterProjectSelect');

  if (keywordInput) {
    keywordInput.addEventListener('input', () => {
      if (btnClearSearch) {
        btnClearSearch.classList.toggle('hidden', !keywordInput.value);
      }
      renderMeetingsGrid();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (keywordInput) {
        keywordInput.value = '';
        btnClearSearch.classList.add('hidden');
        renderMeetingsGrid();
      }
    });
  }

  const btnResetSearchFilter = document.getElementById('btnResetSearchFilter');
  if (btnResetSearchFilter) {
    btnResetSearchFilter.addEventListener('click', () => {
      if (keywordInput) keywordInput.value = '';
      if (btnClearSearch) btnClearSearch.classList.add('hidden');
      state.activeFolderFilter = 'all';
      if (projectSelect) projectSelect.value = 'all';
      renderFolderShelf();
      renderMeetingsGrid();
    });
  }

  if (projectSelect) {
    projectSelect.addEventListener('change', () => {
      state.activeFolderFilter = projectSelect.value;
      const shelfContainer = document.getElementById('folderShelfContainer');
      if (shelfContainer) {
        shelfContainer.querySelectorAll('.folder-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.folder === state.activeFolderFilter);
        });
      }
      renderMeetingsGrid();
    });
  }

  // Folder Modal Form
  const folderModalForm = document.getElementById('folderModalForm');
  const btnCloseFolderModal = document.getElementById('btnCloseFolderModal');
  const btnCancelFolderModal = document.getElementById('btnCancelFolderModal');
  const inputFolderName = document.getElementById('inputFolderName');
  const inputFolderEditId = document.getElementById('inputFolderEditId');

  if (folderModalForm) {
    folderModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const folderName = inputFolderName?.value || '';
      const selectedGradient = folderModalForm.querySelector('input[name="folderGradient"]:checked')?.value || 'grad-sage';
      const editId = inputFolderEditId?.value || '';
      saveFolderForm(folderName, selectedGradient, editId);
    });
  }

  if (btnCloseFolderModal) btnCloseFolderModal.addEventListener('click', closeFolderModal);
  if (btnCancelFolderModal) btnCancelFolderModal.addEventListener('click', closeFolderModal);
}
