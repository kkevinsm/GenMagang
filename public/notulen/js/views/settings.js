/**
 * notugen — Settings & Data Management View
 * Handles API key persistence, model selection, backup JSON export/import, and factory reset
 */

import { state } from '../state.js';
import { showToast, showModernConfirm, updateStats } from '../utils.js';

let onStateResetHandler = null;

export function setStateResetCallback(fn) {
  onStateResetHandler = fn;
}

export function loadSettings() {
  const savedKey = state.getApiKey();
  const savedModel = state.getModel();
  const settingsApiKeyInput = document.getElementById('settingsApiKeyInput');
  const settingsModelSelect = document.getElementById('settingsModelSelect');

  if (settingsApiKeyInput) settingsApiKeyInput.value = savedKey;
  if (settingsModelSelect) settingsModelSelect.value = savedModel;
  updateApiKeyStatusIndicator();
}

export function updateApiKeyStatusIndicator() {
  const apiKeyStatusBox = document.getElementById('apiKeyStatusBox');
  if (!apiKeyStatusBox) return;

  const key = state.getApiKey();
  if (key && key.trim().length > 0) {
    apiKeyStatusBox.innerHTML = `
      <span class="status-dot green"></span>
      <span>Gemini API Siap (${state.getModel()})</span>
    `;
  } else {
    apiKeyStatusBox.innerHTML = `
      <span class="status-dot amber"></span>
      <span>Mode Standar / API Key Belum Disetel</span>
    `;
  }
}

export function exportDataAsJson() {
  const backupBundle = {
    app: 'notugen',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    folders: state.folders,
    meetings: state.meetings
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupBundle, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `notugen-backup-${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast(`Cadangan tersimpan: ${filename}`);
}

export function importDataFromJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.meetings && Array.isArray(parsed.meetings)) {
        state.meetings = parsed.meetings;
        if (parsed.folders && Array.isArray(parsed.folders)) {
          state.folders = parsed.folders;
          state.saveFolders();
        }
        state.saveMeetings();
        updateStats();
        if (typeof onStateResetHandler === 'function') {
          onStateResetHandler();
        }
        showToast(`Berhasil mengimpor ${parsed.meetings.length} notulensi rapat & folder`);
      } else if (Array.isArray(parsed)) {
        // Legacy array format
        state.meetings = parsed;
        state.saveMeetings();
        updateStats();
        if (typeof onStateResetHandler === 'function') {
          onStateResetHandler();
        }
        showToast(`Berhasil mengimpor ${parsed.length} notulensi rapat`);
      } else {
        showToast('Format file JSON tidak sesuai standar notugen');
      }
    } catch (err) {
      showToast('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

export async function handleResetToDefaults() {
  const confirmed = await showModernConfirm({
    title: 'Reset ke Data Contoh Asli?',
    message: 'Seluruh notulen dan folder kustom yang Anda buat akan dihapus dan dikembalikan ke data resmi bawaan awal.',
    confirmText: 'Ya, Reset Data'
  });

  if (confirmed) {
    state.resetToDefaults();
    updateStats();
    if (typeof onStateResetHandler === 'function') {
      onStateResetHandler();
    }
    showToast('Data dan folder telah direset ke bawaan');
  }
}

export function initSettingsView(onReset) {
  if (onReset) {
    setStateResetCallback(onReset);
  }

  const btnToggleApiKeyVisibility = document.getElementById('btnToggleApiKeyVisibility');
  const settingsApiKeyInput = document.getElementById('settingsApiKeyInput');
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  const settingsModelSelect = document.getElementById('settingsModelSelect');
  const btnExportAllJson = document.getElementById('btnExportAllJson');
  const btnExportJsonSettings = document.getElementById('btnExportJsonSettings');
  const importJsonFileInput = document.getElementById('importJsonFileInput');
  const btnResetToDefaults = document.getElementById('btnResetToDefaults');

  if (btnToggleApiKeyVisibility && settingsApiKeyInput) {
    btnToggleApiKeyVisibility.addEventListener('click', () => {
      if (settingsApiKeyInput.type === 'password') {
        settingsApiKeyInput.type = 'text';
        btnToggleApiKeyVisibility.textContent = 'Sembunyikan';
      } else {
        settingsApiKeyInput.type = 'password';
        btnToggleApiKeyVisibility.textContent = 'Tampilkan';
      }
    });
  }

  if (btnSaveApiKey && settingsApiKeyInput) {
    btnSaveApiKey.addEventListener('click', () => {
      const key = settingsApiKeyInput.value.trim();
      state.saveApiKey(key);
      updateApiKeyStatusIndicator();
      showToast(key ? 'Gemini API Key berhasil disimpan!' : 'API Key dihapus dari penyimpanan');
    });
  }

  if (settingsModelSelect) {
    settingsModelSelect.addEventListener('change', () => {
      state.saveModel(settingsModelSelect.value);
      updateApiKeyStatusIndicator();
      showToast(`Model diubah ke: ${settingsModelSelect.value}`);
    });
  }

  if (btnExportAllJson) btnExportAllJson.addEventListener('click', exportDataAsJson);
  if (btnExportJsonSettings) btnExportJsonSettings.addEventListener('click', exportDataAsJson);
  if (importJsonFileInput) importJsonFileInput.addEventListener('change', importDataFromJson);
  if (btnResetToDefaults) btnResetToDefaults.addEventListener('click', handleResetToDefaults);

  loadSettings();
}
