/**
 * notugen — Centralized Reactive State & Storage Store
 */

export const STORAGE_KEY_MEETINGS = 'notugen_meetings_data';
export const STORAGE_KEY_FOLDERS = 'notugen_folders_data';
export const STORAGE_KEY_API_KEY = 'notugen_gemini_api_key';
export const STORAGE_KEY_MODEL = 'notugen_gemini_model';

// Default kosong tanpa file/folder dummy
const DEFAULT_FOLDERS = [];
const DEFAULT_MEETINGS = [];

class AppStore {
  constructor() {
    this.meetings = [];
    this.folders = [];
    this.currentMeetingId = null;
    this.activeFolderFilter = 'all';
    this.activeActionStatusFilter = 'all';
    this.activeActionTeamFilter = 'all';
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, payload) {
    this.subscribers.forEach(cb => cb(event, payload));
  }

  // --- DATA LOADING & SAVING ---
  loadFolders() {
    const stored = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Bersihkan folder dummy awal FSCM jika ada
          const cleaned = parsed.filter(f => f.id !== 'FSCM' || f.name !== 'FSCM Release');
          this.folders = cleaned;
          this.saveFolders();
          return this.folders;
        }
      } catch (e) {
        console.error('Error parsing folders from localStorage', e);
      }
    }
    this.folders = [];
    this.saveFolders();
    return this.folders;
  }

  saveFolders() {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(this.folders));
    this.notify('folders_changed', this.folders);
  }

  loadMeetings() {
    const stored = localStorage.getItem(STORAGE_KEY_MEETINGS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Bersihkan seluruh data rapat dummy lama
          const cleaned = parsed.filter(m => 
            m.id !== 'meet-fscm-r2-20261020' && 
            m.id !== 'meet-icons-core-20261014'
          );
          this.meetings = cleaned;
          this.saveMeetings();
          return this.meetings;
        }
      } catch (e) {
        console.error('Error parsing meetings from localStorage', e);
      }
    }
    this.meetings = [];
    this.saveMeetings();
    return this.meetings;
  }

  saveMeetings() {
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(this.meetings));
    this.notify('meetings_changed', this.meetings);
  }

  getApiKey() {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
  }

  saveApiKey(key) {
    localStorage.setItem(STORAGE_KEY_API_KEY, (key || '').trim());
    this.notify('api_key_changed', key);
  }

  getModel() {
    return localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-2.5-flash';
  }

  saveModel(model) {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
    this.notify('model_changed', model);
  }

  // --- MUTATORS ---
  addFolder({ name, gradient }) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const newFolder = {
      id: trimmed,
      name: trimmed,
      gradient: gradient || 'grad-sage'
    };
    this.folders.push(newFolder);
    this.saveFolders();
    return newFolder;
  }

  renameFolder(editId, newName, newGradient) {
    const trimmed = newName.trim();
    if (!trimmed) return null;

    const folder = this.folders.find(f => f.id === editId);
    if (!folder) return null;

    const oldName = folder.name;
    const oldId = folder.id;

    folder.name = trimmed;
    folder.id = trimmed;
    folder.gradient = newGradient || folder.gradient;

    // Migrate all meetings under this folder to the new name
    let migratedCount = 0;
    this.meetings.forEach(m => {
      if (m.category === oldId || m.category === oldName) {
        m.category = trimmed;
        migratedCount++;
      }
    });

    if (this.activeFolderFilter === oldId) {
      this.activeFolderFilter = trimmed;
    }

    this.saveFolders();
    if (migratedCount > 0) {
      this.saveMeetings();
    }
    return { folder, migratedCount };
  }

  deleteFolder(folderId) {
    const idx = this.folders.findIndex(f => f.id === folderId);
    if (idx === -1) return false;

    const removed = this.folders.splice(idx, 1)[0];

    // Migrate orphan meetings to 'Umum'
    let migratedCount = 0;
    this.meetings.forEach(m => {
      if (m.category === folderId || m.category === removed.name) {
        m.category = 'Umum';
        migratedCount++;
      }
    });

    if (this.activeFolderFilter === folderId) {
      this.activeFolderFilter = 'all';
    }

    this.saveFolders();
    if (migratedCount > 0) {
      this.saveMeetings();
    }
    return true;
  }

  addMeeting(meetingData) {
    if (!meetingData.id) {
      meetingData.id = 'meet-' + Date.now();
    }
    this.meetings.unshift(meetingData);
    this.saveMeetings();
    return meetingData;
  }

  deleteMeeting(meetingId) {
    const idx = this.meetings.findIndex(m => m.id === meetingId);
    if (idx === -1) return false;

    this.meetings.splice(idx, 1);
    this.saveMeetings();

    if (this.currentMeetingId === meetingId) {
      this.currentMeetingId = null;
    }
    return true;
  }

  updateMeetingFolder(meetingId, newFolderId) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return false;

    meeting.category = newFolderId;
    this.saveMeetings();
    return true;
  }

  toggleTask(meetingId, taskId, isDone) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting || !meeting.actionItems) return false;

    let found = false;
    meeting.actionItems.forEach(group => {
      if (group.tasks) {
        group.tasks.forEach(t => {
          if (t.id === taskId) {
            t.done = isDone;
            found = true;
          }
        });
      }
    });

    if (found) {
      this.saveMeetings();
    }
    return found;
  }

  resetToDefaults() {
    this.meetings = [];
    this.folders = [];
    this.currentMeetingId = null;
    this.activeFolderFilter = 'all';
    this.activeActionStatusFilter = 'all';
    this.activeActionTeamFilter = 'all';
    this.saveFolders();
    this.saveMeetings();
    this.notify('reset_defaults');
  }

  calculateStats() {
    const totalMeetings = this.meetings.length;
    let pendingCount = 0;
    let completedCount = 0;

    this.meetings.forEach(m => {
      if (m.actionItems) {
        m.actionItems.forEach(teamGroup => {
          if (teamGroup.tasks) {
            teamGroup.tasks.forEach(t => {
              if (t.done) {
                completedCount++;
              } else {
                pendingCount++;
              }
            });
          }
        });
      }
    });

    return {
      totalMeetings,
      pendingCount,
      completedCount,
      totalActions: pendingCount + completedCount
    };
  }
}

export const state = new AppStore();
