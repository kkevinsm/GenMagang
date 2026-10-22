/**
 * notugen — Multimodal Meeting Generator View (Gemini AI)
 * Handles Transcript text, Microphone voice note recording, and Video meeting upload
 */

import { state } from '../state.js';
import { showToast, formatFileSize, updateStats } from '../utils.js';
import { callGeminiApi, generateLocalCorporateNotulen } from '../services/gemini.js';

let activeInputMode = 'transcript'; // 'transcript' | 'voice' | 'video'
let activeMediaAttachment = null;   // { type, mimeType, base64, fileName, fileSize }
let mediaRecorder = null;
let audioChunks = [];
let recordTimerInterval = null;
let recordSeconds = 0;
let onMeetingCreatedHandler = null;

export function setMeetingCreatedCallback(fn) {
  onMeetingCreatedHandler = fn;
}

export function getActiveInputMode() {
  return activeInputMode;
}

export function switchInputMode(mode) {
  activeInputMode = mode;
  const btnModeTranscript = document.getElementById('btnModeTranscript');
  const btnModeVoice = document.getElementById('btnModeVoice');
  const btnModeVideo = document.getElementById('btnModeVideo');

  const paneTranscript = document.getElementById('paneTranscript');
  const paneVoice = document.getElementById('paneVoice');
  const paneVideo = document.getElementById('paneVideo');

  if (btnModeTranscript) btnModeTranscript.classList.toggle('active', mode === 'transcript');
  if (btnModeVoice) btnModeVoice.classList.toggle('active', mode === 'voice');
  if (btnModeVideo) btnModeVideo.classList.toggle('active', mode === 'video');

  if (paneTranscript) paneTranscript.classList.toggle('hidden', mode !== 'transcript');
  if (paneVoice) paneVoice.classList.toggle('hidden', mode !== 'voice');
  if (paneVideo) paneVideo.classList.toggle('hidden', mode !== 'video');
}

export async function toggleVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopVoiceRecording();
  } else {
    await startVoiceRecording();
  }
}

export async function startVoiceRecording() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Browser Anda tidak mendukung perekaman audio langsung.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      attachAudioFile(audioBlob, `Voice-Note-${new Date().toISOString().slice(0, 10)}.webm`);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    recordSeconds = 0;
    updateRecordTimer();
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      updateRecordTimer();
    }, 1000);

    const micPulseDot = document.getElementById('micPulseDot');
    const micStatusText = document.getElementById('micStatusText');
    const btnToggleRecord = document.getElementById('btnToggleRecord');
    const labelToggleRecord = document.getElementById('labelToggleRecord');

    if (micPulseDot) micPulseDot.classList.add('recording');
    if (micStatusText) micStatusText.textContent = 'Merekam suara rapat...';
    if (btnToggleRecord) btnToggleRecord.classList.add('recording');
    if (labelToggleRecord) labelToggleRecord.textContent = 'Hentikan Rekaman (Selesai)';
    showToast('Perekaman suara dimulai...');
  } catch (err) {
    console.error(err);
    showToast('Gagal mengakses mikrofon: ' + err.message);
  }
}

export function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  clearInterval(recordTimerInterval);
  const micPulseDot = document.getElementById('micPulseDot');
  const micStatusText = document.getElementById('micStatusText');
  const btnToggleRecord = document.getElementById('btnToggleRecord');
  const labelToggleRecord = document.getElementById('labelToggleRecord');

  if (micPulseDot) micPulseDot.classList.remove('recording');
  if (micStatusText) micStatusText.textContent = 'Rekaman Selesai';
  if (btnToggleRecord) btnToggleRecord.classList.remove('recording');
  if (labelToggleRecord) labelToggleRecord.textContent = 'Mulai Rekam Ulang';
}

function updateRecordTimer() {
  const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
  const secs = String(recordSeconds % 60).padStart(2, '0');
  const micTimerDisplay = document.getElementById('micTimerDisplay');
  if (micTimerDisplay) {
    micTimerDisplay.textContent = `${mins}:${secs}`;
  }
}

export function attachAudioFile(blobOrFile, defaultName = 'audio-meeting.mp3') {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    const mime = blobOrFile.type || 'audio/webm';
    activeMediaAttachment = {
      type: 'audio',
      mimeType: mime,
      base64: base64,
      fileName: blobOrFile.name || defaultName,
      fileSize: formatFileSize(blobOrFile.size)
    };

    const audioFileName = document.getElementById('audioFileName');
    const audioFileSize = document.getElementById('audioFileSize');
    const audioPreviewPlayer = document.getElementById('audioPreviewPlayer');
    const audioPreviewBox = document.getElementById('audioPreviewBox');

    if (audioFileName) audioFileName.textContent = activeMediaAttachment.fileName;
    if (audioFileSize) audioFileSize.textContent = activeMediaAttachment.fileSize;
    if (audioPreviewPlayer) audioPreviewPlayer.src = URL.createObjectURL(blobOrFile);
    if (audioPreviewBox) audioPreviewBox.classList.remove('hidden');
    showToast(`Audio siap diproses: ${activeMediaAttachment.fileName}`);
  };
  reader.readAsDataURL(blobOrFile);
}

export function attachVideoFile(file) {
  if (file.size > 25 * 1024 * 1024) {
    showToast('Peringatan: Ukuran video > 20MB. Ukuran di bawah 20MB disarankan untuk efisiensi.');
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    activeMediaAttachment = {
      type: 'video',
      mimeType: file.type || 'video/mp4',
      base64: base64,
      fileName: file.name,
      fileSize: formatFileSize(file.size)
    };

    const videoFileName = document.getElementById('videoFileName');
    const videoFileSize = document.getElementById('videoFileSize');
    const videoPreviewPlayer = document.getElementById('videoPreviewPlayer');
    const videoPreviewBox = document.getElementById('videoPreviewBox');

    if (videoFileName) videoFileName.textContent = activeMediaAttachment.fileName;
    if (videoFileSize) videoFileSize.textContent = activeMediaAttachment.fileSize;
    if (videoPreviewPlayer) videoPreviewPlayer.src = URL.createObjectURL(file);
    if (videoPreviewBox) videoPreviewBox.classList.remove('hidden');
    showToast(`Video rapat siap diproses: ${file.name}`);
  };
  reader.readAsDataURL(file);
}

export function removeAudioAttachment() {
  activeMediaAttachment = null;
  const audioPreviewBox = document.getElementById('audioPreviewBox');
  const audioPreviewPlayer = document.getElementById('audioPreviewPlayer');
  const audioFileInput = document.getElementById('audioFileInput');

  if (audioPreviewBox) audioPreviewBox.classList.add('hidden');
  if (audioPreviewPlayer) {
    audioPreviewPlayer.pause();
    audioPreviewPlayer.src = '';
  }
  if (audioFileInput) audioFileInput.value = '';
  showToast('File audio dihapus.');
}

export function removeVideoAttachment() {
  activeMediaAttachment = null;
  const videoPreviewBox = document.getElementById('videoPreviewBox');
  const videoPreviewPlayer = document.getElementById('videoPreviewPlayer');
  const videoFileInput = document.getElementById('videoFileInput');

  if (videoPreviewBox) videoPreviewBox.classList.add('hidden');
  if (videoPreviewPlayer) {
    videoPreviewPlayer.pause();
    videoPreviewPlayer.src = '';
  }
  if (videoFileInput) videoFileInput.value = '';
  showToast('File video dihapus.');
}

export async function runAiGeneration() {
  const rawMeetingNotesInput = document.getElementById('rawMeetingNotesInput');
  const voiceContextNotes = document.getElementById('voiceContextNotes');
  const videoContextNotes = document.getElementById('videoContextNotes');
  const genMeetingTitle = document.getElementById('genMeetingTitle');
  const genMeetingCategory = document.getElementById('genMeetingCategory');
  const genLoadingOverlay = document.getElementById('genLoadingOverlay');
  const genLoadingStatusText = document.getElementById('genLoadingStatusText');

  let rawNotes = '';
  let media = null;

  if (activeInputMode === 'transcript') {
    rawNotes = (rawMeetingNotesInput?.value || '').trim();
    if (!rawNotes) {
      showToast('Harap tempelkan transkrip atau catatan rapat terlebih dahulu.');
      if (rawMeetingNotesInput) rawMeetingNotesInput.focus();
      return;
    }
  } else if (activeInputMode === 'voice') {
    media = activeMediaAttachment;
    const context = (voiceContextNotes?.value || '').trim();
    rawNotes = context ? `Konteks/Catatan Tambahan Voice Note: ${context}` : '';
    if (!media && !rawNotes) {
      showToast('Harap rekam suara atau unggah file audio rapat terlebih dahulu.');
      return;
    }
  } else if (activeInputMode === 'video') {
    media = activeMediaAttachment;
    const context = (videoContextNotes?.value || '').trim();
    rawNotes = context ? `Konteks/Catatan Tambahan Video: ${context}` : '';
    if (!media && !rawNotes) {
      showToast('Harap unggah file video rekaman rapat terlebih dahulu.');
      return;
    }
  }

  const apiKey = state.getApiKey();
  const model = state.getModel();

  if (genLoadingOverlay) genLoadingOverlay.classList.remove('hidden');
  if (genLoadingStatusText) {
    if (media) {
      genLoadingStatusText.textContent = `Menganalisis rekaman ${media.type === 'video' ? 'video' : 'audio/suara'} dengan Gemini AI...`;
    } else {
      genLoadingStatusText.textContent = 'Menganalisis keputusan teknis & action items per tim...';
    }
  }

  try {
    let generatedData = null;

    if (apiKey && apiKey.trim().length > 10) {
      generatedData = await callGeminiApi(
        apiKey,
        model,
        rawNotes,
        genMeetingTitle?.value || '',
        genMeetingCategory?.value || '',
        media
      );
    } else {
      if (genLoadingStatusText) genLoadingStatusText.textContent = 'Menyusun dokumen resmi notulen korporat...';
      await new Promise(r => setTimeout(r, 1400));
      generatedData = generateLocalCorporateNotulen(
        rawNotes,
        genMeetingTitle?.value || '',
        genMeetingCategory?.value || '',
        media
      );
      showToast('Notulen dibuat dengan format korporat! (Masukkan API Key di Setelan untuk Gemini Live)');
    }

    if (!generatedData) {
      throw new Error('Gagal menghasilkan struktur data notulensi.');
    }

    // Add unique IDs to action items
    if (generatedData.actionItems) {
      generatedData.actionItems.forEach((grp, gIdx) => {
        if (grp.tasks) {
          grp.tasks.forEach((t, tIdx) => {
            if (!t.id) t.id = `gen-${Date.now()}-${gIdx}-${tIdx}`;
            if (t.done === undefined) t.done = false;
          });
        }
      });
    }

    // Prepend to meetings list
    generatedData.id = `meet-${Date.now()}`;
    state.addMeeting(generatedData);

    updateStats();

    if (genLoadingOverlay) genLoadingOverlay.classList.add('hidden');
    showToast('Notulen rapat berhasil dibuat & disimpan ke arsip!');

    if (typeof onMeetingCreatedHandler === 'function') {
      onMeetingCreatedHandler(generatedData.id);
    }

  } catch (err) {
    console.error('AI Generation Error:', err);
    if (genLoadingOverlay) genLoadingOverlay.classList.add('hidden');
    showToast('Kendala saat memproses: ' + err.message);
  }
}

export function initGeneratorView(onMeetingCreated) {
  if (onMeetingCreated) {
    setMeetingCreatedCallback(onMeetingCreated);
  }

  const btnModeTranscript = document.getElementById('btnModeTranscript');
  const btnModeVoice = document.getElementById('btnModeVoice');
  const btnModeVideo = document.getElementById('btnModeVideo');

  if (btnModeTranscript) btnModeTranscript.addEventListener('click', () => switchInputMode('transcript'));
  if (btnModeVoice) btnModeVoice.addEventListener('click', () => switchInputMode('voice'));
  if (btnModeVideo) btnModeVideo.addEventListener('click', () => switchInputMode('video'));

  const btnToggleRecord = document.getElementById('btnToggleRecord');
  if (btnToggleRecord) btnToggleRecord.addEventListener('click', toggleVoiceRecording);

  const audioFileInput = document.getElementById('audioFileInput');
  if (audioFileInput) {
    audioFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        attachAudioFile(e.target.files[0]);
      }
    });
  }

  const btnRemoveAudio = document.getElementById('btnRemoveAudio');
  if (btnRemoveAudio) btnRemoveAudio.addEventListener('click', removeAudioAttachment);

  const videoFileInput = document.getElementById('videoFileInput');
  if (videoFileInput) {
    videoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        attachVideoFile(e.target.files[0]);
      }
    });
  }

  const btnRemoveVideo = document.getElementById('btnRemoveVideo');
  if (btnRemoveVideo) btnRemoveVideo.addEventListener('click', removeVideoAttachment);

  const btnRunAiGenerate = document.getElementById('btnRunAiGenerate');
  if (btnRunAiGenerate) btnRunAiGenerate.addEventListener('click', runAiGeneration);

  const btnLoadSampleDraft = document.getElementById('btnLoadSampleDraft');
  if (btnLoadSampleDraft) {
    btnLoadSampleDraft.addEventListener('click', () => {
      const rawMeetingNotesInput = document.getElementById('rawMeetingNotesInput');
      const genMeetingTitle = document.getElementById('genMeetingTitle');
      const genMeetingCategory = document.getElementById('genMeetingCategory');

      if (rawMeetingNotesInput) {
        rawMeetingNotesInput.value = `Rapat Selasa 20 Oktober 2026 jam 14.00 di RDTX Square Lt.35 dan Ms. Teams.
Hadir: Pak Indra, Mas Eko, Mas Fatchur, Mba Arisa, Pak Jeffry, Mba Maryani, Mas Egi, Tim WDL, TSA, WDC, STA.
Agenda:
1. Evaluasi kebutuhan Perf Test FSCM R2 Re-promote dan modul Balance Widget.
2. Penyelarasan timeline migrasi Semen Baturaja, Pupuk Indonesia, dan opsi BPJS-KS.
3. Progres uji Core Banking iCons Fase 1 & rencana rilis Fase 2.
4. Usulan 8 kebutuhan bisnis baru untuk Release 2.1 sebelum system freeze Desember.

Hasil diskusi:
- Mba Arisa konfirmasi TCB tidak wajibkan perf test formal karena tidak ada modul baru.
- Mas Eko sampaikan uji latensi Balance Widget di UAT 2 CPU memang 1 menit, tapi di Pre-prod 10 CPU sudah di bawah 30 detik. Lanjut UAT s.d. 27 Oktober 2026.
- Migrasi: Baturaja & Pupuk dieksekusi dulu (239 ribu dokumen, 7 jam). Kalau BPJS-KS ada kendala, displit penanganannya ke November agar tidak tabrak freeze 15 Desember.
- Action Items:
  * Tim Dev WDL: Pastikan query Balance Widget stabil di Pre-Prod (due: 27 Okt), kerjakan workaround script migrasi (due: 30 Okt).
  * Tim QA TSA: Kawal joint test SIT-UAT (due: 27 Okt), siapkan 100 test case migrasi.
  * Tim Bisnis WDC: Buat requirement 8 list request rilis 2.1 (due: 01 Nov).
  * Tim PM STA: Update timeline terpadu sebelum freeze Desember.`;
      }
      if (genMeetingTitle) genMeetingTitle.value = 'Timeline FSCM R2 Re-promote & Preparation Release 3';
      if (genMeetingCategory && state.folders.length > 0) genMeetingCategory.value = state.folders[0].id;
      showToast('Contoh catatan kasar rapat berhasil dimuat!');
    });
  }
}
