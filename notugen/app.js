/**
 * notugen — Modular Entry Forwarder
 *
 * Seluruh kode monolitik sebelumnya telah dipisahkan ke modul-modul independen:
 * - /js/state.js             : State terpusat & persistensi LocalStorage
 * - /js/utils.js             : Helper dialog modal konfirmasi, format size, toast, statistik
 * - /js/services/gemini.js   : Integrasi Gemini Multimodal (Teks, Audio mic, Video) & Fallback Resilience
 * - /js/components/navigation.js  : Navigasi top pill & shortcut navigasi
 * - /js/components/quickSearch.js : Modal pencarian instan (⌘K / Ctrl+K)
 * - /js/views/archive.js     : Rak folder proyek (tambah, edit nama, hapus) & grid kartu rapat
 * - /js/views/detail.js      : Lembar resmi notulen korporat & ekspor
 * - /js/views/actions.js     : Hub pelacak tindak lanjut & filter tim lintas notulensi
 * - /js/views/generator.js   : AI generator dengan input teks, voice recorder & video upload
 * - /js/views/settings.js    : Manajemen API key, model selector, export/import JSON
 * - /js/main.js              : Bootstrap orchestrator aplikasi
 */

import './js/main.js';
export * from './js/main.js';
