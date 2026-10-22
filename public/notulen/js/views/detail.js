/**
 * notugen — Detail Meeting Page View (Official Corporate Sheet)
 */

import { state } from '../state.js';
import { escapeHtml, showToast, showModernConfirm, updateStats } from '../utils.js';

let backToArchiveHandler = null;

export function setBackToArchiveCallback(fn) {
  backToArchiveHandler = fn;
}

export function openMeetingDetail(meetingId) {
  const meeting = state.meetings.find(m => m.id === meetingId);
  if (!meeting) {
    showToast('Dokumen notulen tidak ditemukan');
    return;
  }

  state.currentMeetingId = meetingId;

  // Breadcrumb
  const breadcrumb = document.getElementById('breadcrumbDocTitle');
  if (breadcrumb) {
    breadcrumb.textContent = meeting.title.split('\n')[0];
  }

  // Populate Header & Metadata Table
  const metaTitle = document.getElementById('docMetaTitle');
  const metaCategory = document.getElementById('docMetaCategory');
  const metaCategoryBadge = document.getElementById('docMetaCategoryBadge');
  const metaDate = document.getElementById('docMetaDate');
  const metaTime = document.getElementById('docMetaTime');
  const metaLocation = document.getElementById('docMetaLocation');
  const metaLeader = document.getElementById('docMetaLeader');
  const metaAttendees = document.getElementById('docMetaAttendees');

  if (metaTitle) metaTitle.innerHTML = escapeHtml(meeting.title).replace(/\n/g, '<br>');
  if (metaDate) metaDate.textContent = meeting.date || '-';
  if (metaTime) metaTime.textContent = meeting.time || '-';
  if (metaLocation) metaLocation.textContent = meeting.location || '-';
  if (metaLeader) metaLeader.textContent = meeting.leader || '-';
  if (metaAttendees) metaAttendees.textContent = meeting.attendees || '-';

  const categoryName = meeting.category || 'Umum';
  if (metaCategory) metaCategory.textContent = categoryName;
  if (metaCategoryBadge) {
    metaCategoryBadge.textContent = categoryName;
    metaCategoryBadge.className = 'badge-tag';
    if (categoryName === 'FSCM') metaCategoryBadge.classList.add('badge-fscm');
    else if (categoryName === 'Core Banking') metaCategoryBadge.classList.add('badge-core');
    else if (categoryName === 'Migrasi') metaCategoryBadge.classList.add('badge-migrasi');
    else if (categoryName === 'Bisnis') metaCategoryBadge.classList.add('badge-bisnis');
    else metaCategoryBadge.classList.add('badge-default');
  }

  // Populate Folder Reassign Switcher in Toolbar
  const detailFolderSelect = document.getElementById('detailFolderSelect');
  if (detailFolderSelect) {
    let optionsHtml = '';
    if (state.folders.length === 0) {
      optionsHtml = `<option value="${escapeHtml(meeting.category || 'Umum')}">${escapeHtml(meeting.category || 'Umum')}</option>`;
    } else {
      state.folders.forEach(f => {
        optionsHtml += `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`;
      });
      if (meeting.category && !state.folders.some(f => f.id === meeting.category)) {
        optionsHtml += `<option value="${escapeHtml(meeting.category)}">${escapeHtml(meeting.category)}</option>`;
      }
    }
    detailFolderSelect.innerHTML = optionsHtml;
    detailFolderSelect.value = meeting.category || (state.folders[0] ? state.folders[0].id : 'Umum');
  }

  // Populate Agenda List
  const agendaContainer = document.getElementById('docAgendaContainer');
  if (agendaContainer) {
    if (meeting.agendas && meeting.agendas.length > 0) {
      agendaContainer.innerHTML = `
        <ol>
          ${meeting.agendas.map(agenda => `<li>${escapeHtml(agenda)}</li>`).join('')}
        </ol>
      `;
    } else {
      agendaContainer.innerHTML = '<p class="text-faint"><em>Tidak ada agenda spesifik yang dicatat.</em></p>';
    }
  }

  // Populate Decisions List
  const decisionsContainer = document.getElementById('docDecisionsContainer');
  if (decisionsContainer) {
    if (meeting.decisions && meeting.decisions.length > 0) {
      decisionsContainer.innerHTML = meeting.decisions.map(dec => `
        <div class="decision-topic-block">
          <div class="decision-topic-title">${escapeHtml(dec.topic)}</div>
          <ul class="decision-bullet-list">
            ${dec.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    } else {
      decisionsContainer.innerHTML = '<p class="text-faint"><em>Tidak ada keputusan resmi yang dicatat.</em></p>';
    }
  }

  // Populate Memo List
  const memoContainer = document.getElementById('docMemoContainer');
  if (memoContainer) {
    if (meeting.memos && meeting.memos.length > 0) {
      memoContainer.innerHTML = meeting.memos.map(memo => `
        <div class="memo-topic-block">
          <div class="memo-topic-title">${escapeHtml(memo.header)}</div>
          ${memo.speakers.map(spk => `
            <div class="memo-speaker-block">
              <div class="memo-speaker-label">${escapeHtml(spk.label)}</div>
              <ul class="memo-sub-bullet-list">
                ${spk.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `).join('');
    } else {
      memoContainer.innerHTML = '<p class="text-faint"><em>Tidak ada memo diskusi teknis yang dicatat.</em></p>';
    }
  }

  // Populate Executive Summary
  const summaryContainer = document.getElementById('docSummaryContainer');
  if (summaryContainer) {
    if (meeting.summary && meeting.summary.length > 0) {
      summaryContainer.innerHTML = `
        <ol>
          ${meeting.summary.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      `;
    } else {
      summaryContainer.innerHTML = '<p class="text-faint"><em>Tidak ada kesimpulan khusus.</em></p>';
    }
  }

  // Populate Action Items
  renderDetailActionItems(meeting);

  // Switch to detail view panel
  const viewPanels = document.querySelectorAll('.view-panel');
  viewPanels.forEach(p => p.classList.remove('active'));
  const detailPanel = document.getElementById('viewDetail');
  if (detailPanel) {
    detailPanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function renderDetailActionItems(meeting) {
  const container = document.getElementById('docActionItemsContainer');
  if (!container) return;

  if (meeting.actionItems && meeting.actionItems.length > 0) {
    container.innerHTML = meeting.actionItems.map(group => `
      <div class="action-team-group">
        <div class="action-team-name">${escapeHtml(group.team)}:</div>
        <ul class="action-team-list">
          ${group.tasks.map(t => `
            <li class="action-check-row ${t.done ? 'done' : ''}" data-task-id="${t.id}">
              <input type="checkbox" class="action-checkbox" data-task-id="${t.id}" ${t.done ? 'checked' : ''} aria-label="Tandai selesai">
              <span class="action-text-content">
                ${escapeHtml(t.text)}
                ${t.due ? `<span class="action-due-date">(Target: ${escapeHtml(t.due)})</span>` : ''}
              </span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    // Attach checkbox event listeners
    container.querySelectorAll('.action-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const taskId = e.target.dataset.taskId;
        const isDone = e.target.checked;
        toggleTaskStatus(meeting.id, taskId, isDone);
      });
    });
  } else {
    container.innerHTML = '<p class="text-faint"><em>Tidak ada action items tindak lanjut.</em></p>';
  }
}

export function toggleTaskStatus(meetingId, taskId, isDone) {
  state.toggleTask(meetingId, taskId, isDone);

  // Update detail view row style
  const container = document.getElementById('docActionItemsContainer');
  if (container) {
    const row = container.querySelector(`[data-task-id="${taskId}"]`);
    if (row) {
      row.classList.toggle('done', isDone);
    }
  }

  updateStats();
  showToast(isDone ? 'Tugas ditandai Selesai' : 'Tugas dikembalikan ke Menunggu');
}

export function changeMeetingFolder(meetingId, newFolderId) {
  state.updateMeetingFolder(meetingId, newFolderId);

  const metaCategory = document.getElementById('docMetaCategory');
  const metaCategoryBadge = document.getElementById('docMetaCategoryBadge');
  if (metaCategory) metaCategory.textContent = newFolderId;
  if (metaCategoryBadge) {
    metaCategoryBadge.textContent = newFolderId;
    metaCategoryBadge.className = 'badge-tag';
    if (newFolderId === 'FSCM') metaCategoryBadge.classList.add('badge-fscm');
    else if (newFolderId === 'Core Banking') metaCategoryBadge.classList.add('badge-core');
    else if (newFolderId === 'Migrasi') metaCategoryBadge.classList.add('badge-migrasi');
    else if (newFolderId === 'Bisnis') metaCategoryBadge.classList.add('badge-bisnis');
    else metaCategoryBadge.classList.add('badge-default');
  }

  showToast(`Folder notulen dipindahkan ke: "${newFolderId}"`);
}

export function copyMeetingForWhatsApp() {
  const meetingId = state.currentMeetingId;
  const meeting = state.meetings.find(m => m.id === meetingId);
  if (!meeting) return;

  let text = `*NOTULEN RAPAT KORPORAT*
`;
  text += `━━━━━━━━━━━━━━━━━━━━━━
`;
  text += `*Topik:* ${meeting.title.replace(/\n/g, ' ')}
`;
  text += `*Proyek / Folder:* ${meeting.category || '-'}
`;
  text += `*Waktu:* ${meeting.date}, ${meeting.time}
`;
  text += `*Tempat:* ${meeting.location}
`;
  text += `*Pimpinan:* ${meeting.leader}
`;
  text += `*Peserta:* ${meeting.attendees}

`;

  if (meeting.agendas && meeting.agendas.length > 0) {
    text += `*AGENDA MEETING:*
`;
    meeting.agendas.forEach((a, i) => {
      text += `${i + 1}. ${a}
`;
    });
    text += `
`;
  }

  if (meeting.decisions && meeting.decisions.length > 0) {
    text += `*POIN KEPUTUSAN:*
`;
    meeting.decisions.forEach(d => {
      text += `• *${d.topic}*
`;
      d.bullets.forEach(b => {
        text += `   - ${b}
`;
      });
    });
    text += `
`;
  }

  if (meeting.summary && meeting.summary.length > 0) {
    text += `*KESIMPULAN:*
`;
    meeting.summary.forEach((s, i) => {
      text += `${i + 1}. ${s}
`;
    });
    text += `
`;
  }

  if (meeting.actionItems && meeting.actionItems.length > 0) {
    text += `*ACTION ITEMS / TINDAK LANJUT:*
`;
    meeting.actionItems.forEach(group => {
      text += `📌 *${group.team}:*
`;
      group.tasks.forEach(t => {
        text += `   [${t.done ? '✓ SELESAI' : 'PENDING'}] ${t.text} ${t.due ? `(Due: ${t.due})` : ''}
`;
      });
    });
  }

  text += `
_Dicatat & diarsipkan otomatis melalui Notugen_`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Teks notulen rapi disalin ke clipboard! Siap kirim ke WA/Teams.');
  }).catch(() => {
    showToast('Gagal menyalin teks ke clipboard.');
  });
}

export async function deleteCurrentMeeting() {
  const meetingId = state.currentMeetingId;
  const meeting = state.meetings.find(m => m.id === meetingId);
  if (!meeting) return;

  const confirmed = await showModernConfirm({
    title: 'Hapus Dokumen Notulen?',
    message: `Apakah Anda yakin ingin menghapus dokumen notulen "${meeting.title.split('\n')[0]}"? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus Dokumen'
  });

  if (confirmed) {
    state.deleteMeeting(meetingId);
    updateStats();
    showToast('Dokumen notulen telah dihapus.');
    if (typeof backToArchiveHandler === 'function') {
      backToArchiveHandler();
    }
  }
}

export function initDetailView(onBack) {
  if (onBack) {
    setBackToArchiveCallback(onBack);
  }

  const btnBack = document.getElementById('btnBackToArchive');
  const btnCopyWA = document.getElementById('btnCopyWhatsApp');
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  const btnDeleteMeeting = document.getElementById('btnDeleteCurrentMeeting');
  const detailFolderSelect = document.getElementById('detailFolderSelect');

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (typeof backToArchiveHandler === 'function') {
        backToArchiveHandler();
      }
    });
  }

  if (btnCopyWA) {
    btnCopyWA.addEventListener('click', copyMeetingForWhatsApp);
  }

  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnDeleteMeeting) {
    btnDeleteMeeting.addEventListener('click', deleteCurrentMeeting);
  }

  if (detailFolderSelect) {
    detailFolderSelect.addEventListener('change', (e) => {
      if (state.currentMeetingId) {
        changeMeetingFolder(state.currentMeetingId, e.target.value);
      }
    });
  }
}
