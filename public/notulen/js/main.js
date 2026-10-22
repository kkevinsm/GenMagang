/**
 * notugen — Modern Executive Meeting Intelligence Platform
 * Main Modular Entry Point & Orchestrator
 */

import { state } from './state.js';
import { setupGreeting, updateStats } from './utils.js';
import { switchView, initNavigation, onViewChange } from './components/navigation.js';
import { initQuickSearch } from './components/quickSearch.js';
import {
  initArchiveView,
  renderFolderShelf,
  updateProjectDropdowns,
  renderMeetingsGrid
} from './views/archive.js';
import {
  initDetailView,
  openMeetingDetail
} from './views/detail.js';
import {
  initActionsView,
  renderActionItemsHub
} from './views/actions.js';
import {
  initGeneratorView
} from './views/generator.js';
import {
  initSettingsView
} from './views/settings.js';

function handleOpenMeeting(meetingId) {
  switchView('detail');
  openMeetingDetail(meetingId);
}

function handleBackToArchive() {
  switchView('archive');
  renderFolderShelf();
  renderMeetingsGrid();
  updateStats();
}

function handleMeetingCreated(newMeetingId) {
  renderFolderShelf();
  updateProjectDropdowns();
  renderMeetingsGrid();
  renderActionItemsHub();
  updateStats();
  switchView('detail');
  openMeetingDetail(newMeetingId);
}

function handleDataResetOrImport() {
  renderFolderShelf();
  updateProjectDropdowns();
  renderMeetingsGrid();
  renderActionItemsHub();
  updateStats();
}

function initApp() {
  // 1. Load data from localStorage or seed initial defaults
  state.loadFolders();
  state.loadMeetings();

  // 2. Set dynamic greeting based on current local time
  const greetingEl = document.getElementById('greetingTimeText');
  if (greetingEl) {
    setupGreeting(greetingEl);
  }

  // 3. Initialize Top Navigation
  initNavigation();

  // 4. Initialize Quick Search (⌘K / Ctrl+K)
  initQuickSearch(handleOpenMeeting);

  // 5. Initialize Page Views
  initArchiveView(handleOpenMeeting);
  initDetailView(handleBackToArchive);
  initActionsView(handleOpenMeeting);
  initGeneratorView(handleMeetingCreated);
  initSettingsView(handleDataResetOrImport);

  // 6. Listen to view transitions for on-demand refreshes
  onViewChange((viewName) => {
    if (viewName === 'archive') {
      renderFolderShelf();
      renderMeetingsGrid();
    } else if (viewName === 'actions') {
      renderActionItemsHub();
    } else if (viewName === 'generator') {
      updateProjectDropdowns();
    }
    updateStats();
  });

  // 7. Initial Renders
  renderFolderShelf();
  updateProjectDropdowns();
  renderMeetingsGrid();
  renderActionItemsHub();
  updateStats();

  console.log('notugen v3.0.0 initialized successfully with modular ES architecture.');
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export {
  switchView,
  handleOpenMeeting,
  handleBackToArchive
};
