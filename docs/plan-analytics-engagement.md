# Plan: Analytics, Views, Likes & Comments
**Date**: 2026-05-08 | **Status**: Draft — menunggu konfirmasi owner
**Project**: twinbrotherstudio.com | **PM**: Jon

---

## Bagian 1: Analytics Options

### Perbandingan

| Kriteria | GA4 | Plausible | Custom In-App |
|---|---|---|---|
| Biaya | Gratis | $9/bln | Dev effort only |
| Privacy | Butuh cookie consent | No cookie, GDPR-ready | 100% data kita |
| Implementasi SPA | Perlu setup manual | Script tag, selesai | Custom dev |
| Data ownership | Google | Plausible/server kita | Kita sepenuhnya |
| Akurasi | Rendah (diblok adblock) | Sedang | Tinggi |
| Maintenance | Nol | Rendah | Perlu developer |

### Rekomendasi: Plausible + Custom In-App (partial)

1. **Plausible** untuk top-line metrics (total traffic, source, halaman populer) — $9/bln, zero maintenance, privacy-friendly, sudah SPA-aware native
2. **Custom in-app** untuk per-article detail (view count, like count) — bagian dari PRD-03 & PRD-04

**GA4 tidak direkomendasikan** untuk sekarang: cookie consent banner perlu dev effort tersendiri, akurasi rendah karena adblock, kompleksitas SPA setup tidak sebanding untuk studio kecil.

### Cara Setup GA4 di Inertia SPA (jika tetap mau GA4)

```php
{{-- resources/views/app.blade.php, di dalam <head> --}}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

```js
// resources/js/app.jsx — tambah listener Inertia navigate
import { router } from '@inertiajs/react';

router.on('navigate', (event) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_path: event.detail.page.url,
            page_title: document.title,
        });
    }
});
```

### Cara Setup Plausible (lebih simple)

```php
{{-- resources/views/app.blade.php, di dalam <head> --}}
<script defer data-domain="twinbrotherstudio.com"
        src="https://plausible.io/js/script.js"></script>
```

Selesai. Tidak perlu konfigurasi tambahan untuk SPA.

---

## PRD-03: Article View Counter

**Priority**: P1 | **Est**: 3 SP

### Problem
Kolom `view_count` sudah ada di tabel `articles` tapi belum ada mekanisme increment.

### Acceptance Criteria
- [ ] View count increment saat artikel dibuka (via background job, tidak delay halaman)
- [ ] Deduplication: 1 IP tidak count 2x dalam 24 jam untuk artikel yang sama (Laravel Cache)
- [ ] Format tampil: "1.2k views" jika >= 1000
- [ ] Admin panel: kolom view count sortable di Articles index

### Technical Notes
- Cache key: `view_{article_id}_{md5(ip)}`, TTL 24 jam
- Increment via queued job agar tidak delay response
- Tidak perlu tabel tambahan — cukup Laravel Cache (file driver)

---

## PRD-04: Article Like Counter

**Priority**: P1 | **Est**: 3 SP

### Problem
Tidak ada cara pembaca memberikan sinyal positif tanpa menulis komentar.

### Acceptance Criteria
- [ ] Tombol like di bawah konten artikel
- [ ] Anti-spam: localStorage (UX layer) + server-side cache IP check (30 hari)
- [ ] Optimistic update: counter +1 langsung tanpa tunggu server
- [ ] Kolom `like_count` baru di tabel articles (migration)
- [ ] Rate limiting: max 5 request/menit per IP di endpoint like
- [ ] Admin: like count tampil dan sortable

### Open Question
Tampilkan like count ke publik selalu, atau hanya jika >= 10?

---

## PRD-05: Comment System

**Priority**: P2 | **Est**: 8 SP

### Rekomendasi: Custom Comment (bukan Disqus, bukan utterances)

**Alasan:**
- Target audience general (bukan pure developer → utterances gugur)
- Disqus free plan ada iklan yang tidak bisa dikontrol → tidak cocok untuk brand studio profesional
- Custom = full data ownership, moderasi di tangan kita

### Schema
```sql
comments
  - id, article_id (FK), parent_id (nullable FK self-ref)
  - name, email (tidak tampil publik), body
  - status (enum: pending, approved, rejected)
  - ip_hash, created_at, updated_at
```

### Acceptance Criteria
- [ ] Form komentar: Nama, Email, Komentar (max 1000 char)
- [ ] Komentar baru masuk status `pending` — tidak tampil sebelum diapprove
- [ ] Admin: list pending + approve/reject/delete/reply
- [ ] Badge di nav admin untuk pending count
- [ ] Reply 1 level (tidak infinite nesting)
- [ ] Spam protection: honeypot field + rate limit 3/jam per IP
- [ ] Pesan sukses setelah submit: "Komentar sedang ditinjau moderator"

---

## Estimasi & Prioritasi Sprint

| Fitur | SP | Prioritas | Sprint |
|-------|-----|-----------|--------|
| Setup Plausible | 1 | P2 | N |
| PRD-03: View Counter | 3 | P1 | N |
| PRD-04: Like Counter | 3 | P1 | N |
| PRD-05: Comment System | 8 | P2 | N+1 |
| Custom Analytics Dashboard | 5 | P3 | Backlog |

**Sprint N (quick wins, 7 SP):** View + Like + Plausible setup
**Sprint N+1 (8 SP):** Comment System
**Backlog:** Custom analytics dashboard per artikel per hari

---

## Konfirmasi yang Dibutuhkan Sebelum ke Rex

- [ ] Budget $9/bln untuk Plausible? Atau full custom?
- [ ] View count tampil ke pembaca atau hanya admin?
- [ ] Like count: selalu tampil atau threshold minimum (misal >= 10)?
- [ ] Comment on by default di semua artikel?
- [ ] SMTP sudah siap untuk notif komentar baru ke admin?
