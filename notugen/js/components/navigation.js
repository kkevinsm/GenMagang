/**
 * notugen — Navigation & View Switcher Component
 */

let viewChangeCallbacks = [];

export function onViewChange(cb) {
  viewChangeCallbacks.push(cb);
}

export function switchView(viewName) {
  const viewPanels = document.querySelectorAll('.view-panel');
  const navItems = document.querySelectorAll('.top-nav-pill .nav-item');
  const windowTitleText = document.getElementById('windowTitleText');

  viewPanels.forEach(panel => {
    panel.classList.remove('active');
  });

  navItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const targetPanel = document.getElementById('view' + viewName.charAt(0).toUpperCase() + viewName.slice(1));
  if (targetPanel) {
    targetPanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (windowTitleText) {
    const titles = {
      archive: 'Arsip Notulensi Rapat Korporat',
      generator: 'AI Meeting Generator & Formatter',
      actions: 'Pelacak Action Items & Tindak Lanjut',
      settings: 'Setelan & Manajemen Data',
      detail: 'Dokumen Resmi Notulensi Rapat'
    };
    if (titles[viewName]) {
      windowTitleText.textContent = titles[viewName];
    }
  }

  viewChangeCallbacks.forEach(cb => cb(viewName));
}

export function initNavigation() {
  const navBrand = document.getElementById('navBrand');
  const tabArchive = document.getElementById('tabArchive');
  const tabActions = document.getElementById('tabActions');
  const tabGenerator = document.getElementById('tabGenerator');
  const tabSettings = document.getElementById('tabSettings');
  const btnNewMeeting = document.getElementById('btnNewMeeting');

  if (navBrand) {
    navBrand.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('archive');
    });
  }

  if (btnNewMeeting) {
    btnNewMeeting.addEventListener('click', () => {
      switchView('generator');
    });
  }

  [tabArchive, tabActions, tabGenerator, tabSettings].forEach(tab => {
    if (tab) {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        if (view) switchView(view);
      });
    }
  });

  // Shortcut ⌘N / Ctrl+N to create new meeting via Generator
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      switchView('generator');
      const input = document.getElementById('rawMeetingNotesInput');
      if (input) input.focus();
    }
  });
}
