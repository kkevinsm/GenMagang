/**
 * notugen — Utilities, Statistics & Modal Dialog Helpers
 */

import { state } from './state.js';

// Global safety lock: prevent any native browser alert popup
window.alert = function (msg) {
  showToast(String(msg));
};

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function showToast(message, duration = 3000) {
  const hub = document.getElementById('toastHub');
  if (!hub) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  hub.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 200ms ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, duration);
}

export function showModernConfirm({ title, message, confirmText = 'Ya, Hapus' }) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDeleteDialog');
    if (!dialog) {
      resolve(true);
      return;
    }

    const titleEl = document.getElementById('confirmDeleteTitle');
    const msgEl = document.getElementById('confirmDeleteMessage');
    const btnExec = document.getElementById('btnExecuteConfirmDelete');
    const btnCancel = document.getElementById('btnCancelConfirmDelete');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnExec) btnExec.textContent = confirmText;

    const handleConfirm = () => {
      cleanup();
      dialog.close();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      dialog.close();
      resolve(false);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
      }
    };

    function cleanup() {
      if (btnExec) btnExec.removeEventListener('click', handleConfirm);
      if (btnCancel) btnCancel.removeEventListener('click', handleCancel);
      dialog.removeEventListener('keydown', handleKey);
    }

    if (btnExec) btnExec.addEventListener('click', handleConfirm);
    if (btnCancel) btnCancel.addEventListener('click', handleCancel);
    dialog.addEventListener('keydown', handleKey);

    dialog.showModal();
  });
}

export function setupGreeting(targetEl) {
  if (!targetEl) return;
  const hour = new Date().getHours();
  let greeting = 'Selamat Datang';
  if (hour >= 4 && hour < 11) greeting = 'Selamat Pagi';
  else if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
  else greeting = 'Selamat Malam';

  targetEl.textContent = greeting;
}

export function updateStats() {
  const stats = state.calculateStats();
  const statTotalMeetings = document.getElementById('statTotalMeetings');
  const statPendingActions = document.getElementById('statPendingActions');
  const statCompletedActions = document.getElementById('statCompletedActions');
  const countAllActions = document.getElementById('countAllActions');
  const countPendingActions = document.getElementById('countPendingActions');
  const countDoneActions = document.getElementById('countDoneActions');
  const pendingActionsBadge = document.getElementById('pendingActionsBadge');

  if (statTotalMeetings) statTotalMeetings.textContent = stats.totalMeetings;
  if (statPendingActions) statPendingActions.textContent = stats.pendingCount;
  if (statCompletedActions) statCompletedActions.textContent = stats.completedCount;
  if (countAllActions) countAllActions.textContent = stats.totalActions;
  if (countPendingActions) countPendingActions.textContent = stats.pendingCount;
  if (countDoneActions) countDoneActions.textContent = stats.completedCount;

  if (pendingActionsBadge && pendingActionsBadge.style) {
    pendingActionsBadge.textContent = stats.pendingCount;
    pendingActionsBadge.style.display = stats.pendingCount > 0 ? 'inline-flex' : 'none';
  }
}
