/**
 * notugen — Cross-Meeting Action Items Tracker Hub View
 */

import { state } from '../state.js';
import { escapeHtml, updateStats, showToast } from '../utils.js';

let openDetailHandler = null;

export function setOpenDetailCallback(fn) {
  openDetailHandler = fn;
}

export function renderActionItemsHub() {
  const container = document.getElementById('actionCardsContainer');
  const teamSelect = document.getElementById('actionTeamSelect');
  if (!container) return;

  const allTasks = [];
  const teamSet = new Set();

  state.meetings.forEach(m => {
    if (m.actionItems) {
      m.actionItems.forEach(group => {
        if (group.team) teamSet.add(group.team);
        if (group.tasks) {
          group.tasks.forEach(t => {
            allTasks.push({
              meetingId: m.id,
              meetingTitle: (m.title || '').split('\n')[0],
              meetingCategory: m.category,
              meetingDate: m.date,
              team: group.team,
              task: t
            });
          });
        }
      });
    }
  });

  // Populate team filter dropdown
  if (teamSelect) {
    const currentTeam = state.activeActionTeamFilter || 'all';
    let teamOptions = `<option value="all">Semua Tim / Divisi</option>`;
    Array.from(teamSet).sort().forEach(tName => {
      teamOptions += `<option value="${escapeHtml(tName)}">${escapeHtml(tName)}</option>`;
    });
    teamSelect.innerHTML = teamOptions;
    teamSelect.value = currentTeam;
  }

  // Filter tasks by status and team
  const filteredTasks = allTasks.filter(item => {
    if (state.activeActionStatusFilter === 'pending' && item.task.done) return false;
    if (state.activeActionStatusFilter === 'done' && !item.task.done) return false;
    if (state.activeActionTeamFilter !== 'all' && item.team !== state.activeActionTeamFilter) return false;
    return true;
  });

  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✓</div>
        <h3>Tidak ada action item pada filter ini</h3>
        <p>Semua tindak lanjut sesuai kriteria telah diselesaikan atau belum ditambahkan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredTasks.map(item => `
    <div class="action-hub-item ${item.task.done ? 'done' : ''}">
      <div class="action-hub-left">
        <input type="checkbox" class="action-checkbox" data-meet-id="${item.meetingId}" data-task-id="${item.task.id}" ${item.task.done ? 'checked' : ''} aria-label="Status tugas ${escapeHtml(item.task.text)}">
        <div>
          <div class="action-hub-title">${escapeHtml(item.task.text)}</div>
          <div class="action-hub-meta">
            <span class="action-team-tag">👥 ${escapeHtml(item.team)}</span>
            <span>📅 ${escapeHtml(item.meetingDate)}</span>
            <span>📂 ${escapeHtml(item.meetingCategory || 'Umum')}</span>
            ${item.task.due ? `<span>⏰ Due: ${escapeHtml(item.task.due)}</span>` : ''}
          </div>
        </div>
      </div>

      <button type="button" class="btn-ghost-sm btn-open-parent-meeting" data-meet-id="${item.meetingId}">
        Buka Rapat →
      </button>
    </div>
  `).join('');

  // Checkbox event listeners
  container.querySelectorAll('.action-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const mId = e.target.dataset.meetId;
      const tId = e.target.dataset.taskId;
      toggleTaskStatus(mId, tId, e.target.checked);
    });
  });

  // Open meeting button listeners
  container.querySelectorAll('.btn-open-parent-meeting').forEach(btn => {
    btn.addEventListener('click', () => {
      const mId = btn.dataset.meetId;
      if (typeof openDetailHandler === 'function') {
        openDetailHandler(mId);
      }
    });
  });
}

export function toggleTaskStatus(meetingId, taskId, isDone) {
  state.toggleTask(meetingId, taskId, isDone);
  renderActionItemsHub();
  updateStats();
  showToast(isDone ? 'Tugas ditandai Selesai' : 'Tugas dikembalikan ke Menunggu');
}

export function initActionsView(onOpenMeeting) {
  if (onOpenMeeting) {
    setOpenDetailCallback(onOpenMeeting);
  }

  const actionStatusPills = document.querySelectorAll('.status-pill');
  const actionTeamSelect = document.getElementById('actionTeamSelect');

  actionStatusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      actionStatusPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeActionStatusFilter = pill.dataset.status || 'all';
      renderActionItemsHub();
    });
  });

  if (actionTeamSelect) {
    actionTeamSelect.addEventListener('change', () => {
      state.activeActionTeamFilter = actionTeamSelect.value;
      renderActionItemsHub();
    });
  }
}
