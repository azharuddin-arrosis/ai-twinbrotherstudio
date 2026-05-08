# Handoff Note: Jon → Rex
**Date**: 2026-05-08 | **Dari**: Jon (PM) | **Ke**: Rex (Tech Lead)

---

## Status PRD

| PRD | Fitur | Status | Prioritas |
|-----|-------|--------|-----------|
| PRD-01 | Portfolio Page | APPROVED — siap implementasi | P2 |
| PRD-02 | Contact / Hire Us (`/hire-us`) | APPROVED — siap implementasi | P1 (dahulukan ini) |

Prioritas Contact/Hire Us di atas Portfolio karena langsung berdampak ke lead generation bisnis.

---

## Decision Log (Open Questions — Sudah Final)

| # | Pertanyaan | Keputusan |
|---|------------|-----------|
| 1 | Storage gambar portfolio | Local Laravel storage, `public` disk |
| 2 | SMTP / Email | Setup dari nol — belum ada konfigurasi sama sekali |
| 3 | URL halaman kontak | `/hire-us` |
| 4 | Kontak alternatif (WA, email, dll) | Simpan di DB, dapat dikonfigurasi via admin panel — JANGAN hardcode |
| 5 | Hosting | Shared hosting Hostinger (~1 tahun) |

---

## Hostinger Shared Hosting Constraints — FLAG KRITIS UNTUK ARSITEKTUR

Rex, ini poin yang harus jadi input sprint planning sebelum Morgan/Riley mulai coding. Shared hosting Hostinger punya keterbatasan signifikan:

### 1. Queue Worker — Tidak Bisa Persistent
- `php artisan queue:work` tidak bisa jalan terus-menerus di shared hosting.
- **Solusi yang perlu Rex putuskan (bersama Morgan):**
  - **Opsi A**: Ubah `QUEUE_CONNECTION=sync` — job diproses langsung, tanpa queue. Paling simple, tapi blocking.
  - **Opsi B**: Hostinger cron job jalankan `php artisan queue:work --once` setiap N menit. Lebih proper tapi ada delay antar job.
- Untuk RSS pipeline (FetchRssSourceJob + GenerateArticleFromRssJob), Opsi B lebih cocok.

### 2. Laravel Horizon — Tidak Bisa Dipakai
- Horizon butuh persistent process. Drop dari scope sepenuhnya.
- Monitoring queue pakai `php artisan queue:monitor` via cron sebagai alternatif minimal.

### 3. Redis — Tidak Tersedia
- Cache, session, queue driver harus pakai `file` atau `database`, bukan Redis.
- Konfirmasi ke Morgan untuk set default driver di `.env` production:
  - `CACHE_DRIVER=file`
  - `SESSION_DRIVER=file`
  - `QUEUE_CONNECTION=database` atau `sync` (sesuai keputusan di poin 1)

### 4. Cron Job — Tersedia via cPanel
- Hostinger cPanel support cron job. Schedule `php artisan schedule:run` setiap menit adalah cara yang benar.
- RSS auto-pipeline harus dijalankan via cron ini, bukan persistent worker.

### 5. Email / SMTP — Setup dari Nol
- Belum ada konfigurasi SMTP sama sekali di project.
- Rekomendasi untuk budget minimal (Rex pilih sesuai kebutuhan):
  - **Resend** — free tier 3.000 email/bulan, paling mudah setup dengan Laravel
  - **Mailgun** — free tier 100 email/hari
  - **Gmail SMTP** — gratis tapi ada limit harian dan less reliable untuk production
- Perlu konfigurasi di `.env`: `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`

### 6. File Storage — Local Disk
- Local `public` disk aman di shared hosting.
- Pastikan saat deploy: folder `storage/app/public` sudah ada dan symlink `public/storage` ter-setup (`php artisan storage:link`).
- Catat: tidak ada CDN. File besar bisa jadi beban server. Kasih batasan ukuran upload di backend (rekomendasikan max 2MB per gambar portfolio).

---

## Scope Pekerjaan per Tim

### Morgan + Riley (Backend)
Untuk PRD-02 (Contact / Hire Us) — Prioritas pertama:
- Migration + Model: `contact_settings` (simpan email, WhatsApp, link lain yang dikonfigurasi admin)
- Migration + Model: `contact_submissions` (menyimpan form submission)
- Controller: `ContactController` — handle GET `/hire-us` dan POST submission
- Admin Controller: `Admin\ContactSettingController` — CRUD untuk kontak alternatif
- Admin Controller: `Admin\ContactSubmissionController` — list + mark as read submission masuk
- Mailable: `ContactSubmissionMail` — notifikasi email ke admin saat ada submission baru
- Setup SMTP dari nol (Rex konfirmasi provider dulu)
- Validasi form: name, email, message (required), company/budget (optional)

Untuk PRD-01 (Portfolio) — Setelah PRD-02 selesai:
- Migration + Model: `portfolio_items` (title, description, image_path, url, tech_stack, order, is_published)
- Controller: `PortfolioController` — public page
- Admin Controller: `Admin\PortfolioController` — CRUD + reorder + publish toggle
- Upload handler: local disk public, max 2MB, validasi mime type (jpg, png, webp)
- Storage symlink setup di deployment checklist

### Ara + Fen (Frontend)
Untuk PRD-02:
- Page: `/hire-us` — form kontak + tampilan info kontak (email, WA, dll dari DB)
- Admin Page: Contact Settings — form konfigurasi kontak alternatif
- Admin Page: Contact Submissions — list inbox submission dengan status read/unread

Untuk PRD-01:
- Page: `/portfolio` — grid/list portfolio items
- Admin Page: Portfolio Items — CRUD + drag reorder + publish toggle

### Dani (QA Manual)
Setelah backend + frontend selesai, Dani verifikasi:
- PRD-02: Form submission diterima, notifikasi email terkirim, admin bisa lihat dan tandai read
- PRD-02: Admin bisa ubah kontak info dan langsung reflect di public page
- PRD-01: Upload gambar berhasil, tampil di public page, admin bisa reorder dan publish/unpublish
- Edge case: form submission dengan field kosong, upload file oversized, karakter spesial di field text

---

## Yang TIDAK Masuk Scope (Out of Scope)

- Integrasi CRM atau ticketing system untuk submission
- Portfolio item dengan multiple images / gallery per item
- Form builder (field kontak tetap, tidak bisa dikustomisasi strukturnya)
- Real-time notifikasi submission (WebSocket, Pusher) — tidak support di shared hosting
- Laravel Horizon (tidak compatible, sudah di-drop)

---

## Final Decision (Semua Sudah Confirmed — Sprint Bisa Dimulai)

| # | Decision | Pilihan |
|---|----------|---------|
| SMTP Provider | **Resend** — free tier 3.000 email/bulan |
| Queue Strategy | **Opsi B** — database queue + Hostinger cPanel cron jalankan `queue:work --once` tiap 1 menit |

Morgan bisa langsung mulai implementasi. Tidak ada blocking item tersisa.

---

Jon — PM
