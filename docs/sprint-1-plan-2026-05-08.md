# Sprint 1 Plan — Portfolio + Contact/Hire Us
**Tanggal**: 2026-05-08 s/d 2026-05-21 | **Tech Lead**: Rex

---

## Summary

| PRD | Fitur | Prioritas | Sprint |
|-----|-------|-----------|--------|
| PRD-02 | Contact / Hire Us (`/hire-us`) | P1 | Sprint 1 |
| PRD-01 | Portfolio (`/portfolio`, `/portfolio/{slug}`) | P2 | Sprint 1 (public pages) |
| PRD-01 | Admin Portfolio CRUD + Home Featured | P2 | Sprint 2 |

---

## Final Decisions

| Decision | Nilai |
|----------|-------|
| SMTP | Resend (free 3.000/bulan) |
| Queue | `QUEUE_CONNECTION=database` + Hostinger cPanel cron `queue:work --once` tiap 1 menit |
| Storage | Local public disk |
| Cache/Session | `CACHE_DRIVER=file`, `SESSION_DRIVER=file` |
| Horizon | Drop — tidak support shared hosting |
| Kontak info | Simpan di `contact_settings` DB, jangan hardcode |
| URL Contact | `/hire-us` |

---

## Phase 0 — Hari 1 (Blocker untuk semua)

| Task | Owner |
|------|-------|
| Migration `contact_settings` + `contact_submissions` | Riley |
| Migration `portfolio_items` | Riley |
| Draft JSON contract props controller → JSX pages | Riley + Fen |

---

## Sprint 1 Tasks per Engineer

### Riley (18 SP)
**PRD-02 dulu, selesai sebelum mulai PRD-01:**
- Migration + Model `ContactSetting` + `ContactSubmission`
- `ContactController` — GET `/hire-us` + POST `/hire-us/submit` + `throttle:5,1`
- `Admin\ContactSettingController` — upsert key-value
- `Admin\ContactSubmissionController` — list + markRead
- `ContactSubmissionMail` — implements `ShouldQueue`
- Migration + Model `PortfolioItem` (cast `tech_stack` array, scope `published()` + `featured()`)
- `PortfolioController` — GET `/portfolio` + GET `/portfolio/{slug}` (404 jika unpublished)
- `Admin\PortfolioController` — resource + publish toggle + reorder

### Sam (13 SP)
- **Hari 1**: Setup Resend, verifikasi domain (DNS 24-48 jam — jangan tunda!)
- Set `.env` vars Resend SMTP
- Test kirim email dari tinker → screenshot bukti
- `ContactSettingSeeder` — default keys: `admin_email`, `whatsapp_number`, `linkedin_url`, `instagram_url`
- Setup + verifikasi `storage:link`
- Checklist deployment Hostinger di `docs/deployment.md`

### Ara (6 SP)
- **Hari 1**: Update `AdminLayout.jsx` — tambah nav: Contact Settings, Submissions, Portfolio
- Update `PublicLayout.jsx` — tambah link Portfolio (statis) + button Hire Us (statis, bukan dari `navLinks` array)
- Submit ADR drag-reorder portfolio ke Rex
- Review setiap PR Fen

### Fen (18 SP) — tunggu Phase 0 contract dulu
- `Pages/Contact/HireUs.jsx` — form + kontak info dari props
- `Pages/Admin/ContactSettings/Index.jsx`
- `Pages/Admin/ContactSubmissions/Index.jsx` — dengan badge unread
- `Pages/Portfolio/Index.jsx`
- `Pages/Portfolio/Show.jsx` — CTA Hire Us → `/hire-us`

### Dani (12 SP)
- Hari 1-2: buat test plan
- Hari 8-10: eksekusi testing (setelah fitur di staging)
- Focus: form validation, XSS safety, email queue flow, upload validasi, 404 portfolio unpublished

---

## Dependency Map

```
Phase 0 (Migration + Contract)
    │
    ├── Riley: Backend PRD-02 → Sam: verifikasi queue + email
    ├── Riley: Model shapes → Fen: semua JSX pages
    ├── Ara: AdminLayout + PublicLayout (paralel hari 1)
    ├── Ara: ADR drag-reorder → Rex approve → Fen: Admin Portfolio
    └── Sam: Resend setup (paralel, hari 1 — path terpanjang)
```

---

## Risiko

- **HIGH**: Domain verify Resend 24-48 jam — Sam mulai hari 1
- **HIGH**: Fen original 26 SP → dimitigasi, Admin Portfolio Form + Home Featured geser Sprint 2
- **MEDIUM**: `forceFormData: true` untuk upload image — Riley + Fen koordinasi sebelum coding
- **MEDIUM**: Endpoint bulk-update contact settings — Riley tentukan dulu sebelum Fen mulai

---

## Sprint 2 Preview

- `Admin/Portfolio/Index.jsx` — dengan drag reorder
- `Admin/Portfolio/Form.jsx` — image upload
- Update `Home.jsx` — section Featured Projects
- `HomeController` — pass `featuredPortfolio` props
- Kira — mulai automated test Sprint 1 features
