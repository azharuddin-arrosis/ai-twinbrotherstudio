# Prompt Twin Brother Studio

Website resmi **Twin Brother Studio** — studio website yang menggabungkan branding, AI tutorial content, portfolio, dan client acquisition dalam satu platform.

**Domain:** [twinbrotherstudio.com](https://twinbrotherstudio.com)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13 (PHP 8.2+) |
| Frontend | React 19 + Inertia.js v3 |
| Styling | Tailwind CSS v4 |
| Database | MySQL |
| Queue | Laravel Queue (database driver) |
| Email | Resend SMTP |
| AI | OpenRouter API (Google Gemini Flash 1.5) |
| Analytics | Google Analytics 4 (SPA-aware) |
| Icons | Lucide React |
| Table | TanStack Table v8 |
| Toast | Sonner |

---

## Fitur Publik

### Halaman Utama (`/`)
- Hero section artikel terbaru
- Section **Our Work** — 3 featured portfolio projects
- Artikel per kategori (grid 4 kolom)
- Empty state jika belum ada konten

### Artikel (`/{category}/{slug}`)
- Konten artikel dengan syntax highlighting (Tailwind Typography)
- **View counter** — increment otomatis, dedup per IP 24 jam via cache
- **Like button** — optimistic UI, state tersimpan di localStorage, dedup per IP 30 hari
- **Comment section** — form submit komentar (name, email, body), tampil komentar yang sudah diapprove beserta 1-level reply dari admin
- Metadata: reading time, publish date, view count, kategori
- Share ke Twitter/X + copy link
- Related articles di sidebar (desktop)
- AI disclosure jika konten buatan AI

### Kategori (`/category/{slug}`)
- Grid artikel per kategori
- Pagination

### Search (`/search`)
- Full-text search artikel

### Portfolio (`/portfolio`)
- Grid semua portfolio project yang dipublish
- Informasi: judul, deskripsi, tech stack chips, link live

### Portfolio Detail (`/portfolio/{slug}`)
- Hero image, full description, tech stack
- CTA "Get in Touch" → Hire Us page

### Hire Us (`/hire-us`)
- Form inquiry: Nama, Email, Perusahaan, Jenis Project, Budget Range, Pesan
- Info kontak alternatif (email, WhatsApp, LinkedIn, dll — dikonfigurasi via admin)
- Email notifikasi otomatis ke studio saat ada inquiry masuk (via queue)

### SEO
- `sitemap.xml` otomatis dari semua artikel published
- `robots.txt`
- Meta title, description, og:image per halaman

---

## Admin Panel (`/admin`)

Login diperlukan untuk mengakses semua halaman admin.

### Dashboard
- Overview statistik website

### Articles (`/admin/articles`)
- List semua artikel dengan filter status dan kategori
- Status: `ai_draft` → `review` → `published` / `rejected`
- Quick action: Publish / Reject langsung dari tabel
- Full CRUD dengan rich text editor (Tiptap v3)
- Support artikel manual dan AI-generated

### Categories (`/admin/categories`)
- CRUD kategori dengan color picker
- Sort order untuk urutan tampil di homepage

### Tags (`/admin/tags`)
- Tambah dan hapus tag inline

### RSS Sources (`/admin/rss-sources`)
- Manage sumber RSS untuk auto-content pipeline
- Tombol "Fetch Now" untuk trigger manual

### Portfolio (`/admin/portfolio`)
- Full CRUD portfolio project
- Upload cover image (max 2MB, jpg/png/webp)
- Toggle publish/unpublish per item
- **Drag & drop reorder** — seret baris untuk ubah urutan tampil
- Mark sebagai "Featured" untuk tampil di homepage

### Contact Settings (`/admin/contact-settings`)
- Konfigurasi info kontak yang tampil di halaman `/hire-us`
- Keys: `admin_email`, `whatsapp_number`, `linkedin_url`, `instagram_url`, `twitter_url`, `github_url`

### Submissions (`/admin/contact-submissions`)
- Inbox semua inquiry dari form Hire Us
- Badge unread count di sidebar
- Expand row untuk lihat detail pesan
- Mark as read

### Comments (`/admin/comments`)
- Moderasi semua komentar artikel
- Badge pending count di sidebar
- Filter: All / Pending / Approved / Rejected
- Aksi per komentar: Approve, Reject, Delete, Reply
- Reply admin langsung published (tidak perlu moderasi)

---

## AI Content Pipeline

Artikel bisa di-generate otomatis dari sumber RSS menggunakan OpenRouter AI.

### Flow
```
RSS Source → FetchRssSourceJob → GenerateArticleFromRssJob → Article (status: ai_draft)
```

1. Tambah RSS Source di admin panel
2. Queue worker fetch item dari feed
3. Setiap item dikirim ke OpenRouter API untuk generate artikel lengkap
4. Artikel tersimpan dengan status `ai_draft`
5. Admin review dan publish / reject dari admin panel

### Command Manual
```bash
php artisan app:fetch-all-rss-sources
```

### Model AI Default
`google/gemini-flash-1.5` via OpenRouter (gratis, cepat)

---

## Engagement Features

### View Counter
- Increment otomatis saat artikel dibuka
- Deduplication: 1 IP tidak count lebih dari 1x per 24 jam
- Implementasi via queued job agar tidak delay response halaman
- Format: `1.2k`, `2.5M` untuk angka besar

### Like Button
- Klik tanpa perlu login
- Optimistic UI — counter naik langsung sebelum server response
- State tersimpan di `localStorage` → tombol tetap "Liked" setelah refresh
- Server-side dedup: 1 IP per artikel per 30 hari
- Rate limit: 5 request per menit per IP

### Comment System
- Submit komentar tanpa perlu akun (nama + email + pesan)
- Semua komentar masuk status `pending` dan menunggu moderasi admin
- Admin bisa Approve / Reject / Delete / Reply
- Reply admin tampil dengan identitas "Twin Brother Studio" dan nested di bawah parent comment
- Anti-spam: honeypot field + rate limit 3 komentar per jam per IP
- Email notifikasi ke admin saat ada komentar baru masuk

---

## UI/UX Features

### DataTable (Admin)
Semua halaman index di admin menggunakan komponen DataTable dengan:
- **Sort** — klik header kolom untuk sort ascending/descending
- **Global search** — filter semua kolom sekaligus
- **Client-side pagination** — navigasi halaman tanpa request ke server
- **Row expand** — klik baris untuk lihat detail (Submissions, Comments)
- **Row numbers** — nomor urut otomatis

### Form Validation
- Per-field real-time validation saat `onBlur`
- Visual error: border merah + pesan error inline
- Client-side validation via custom `useValidation` hook + server-side via Laravel
- Zod-compatible schema definition

### Toast Notifications (Sonner)
- Flash session dari Laravel otomatis tampil sebagai toast
- Posisi: top-right
- Type: success (hijau), error (merah)
- Auto-dismiss + tombol close manual

### Responsive
- Mobile-first design
- Hamburger menu di mobile
- Grid layout adaptive: 1 kolom (mobile) → 2/3/4 kolom (desktop)
- Admin sidebar collapse di mobile (overlay)

---

## Analytics

### Google Analytics 4
- Script dimuat hanya jika `GA_MEASUREMENT_ID` diset di `.env`
- **SPA-aware**: setiap navigasi Inertia otomatis mengirim `page_view` event ke GA4
- Konfigurasi: isi `GA_MEASUREMENT_ID=G-XXXXXXXXXX` di `.env`

---

## Setup & Installation

### Requirements
- PHP 8.2+
- Node.js 18+
- MySQL 8+
- Composer

### Install

```bash
# Clone repo
git clone git@github.com-arrosisoce:azharuddin-arrosis/ai-twinbrotherstudio.git
cd ai-twinbrotherstudio

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Edit .env (database, mail, API keys)
```

### Konfigurasi `.env` Wajib

```env
APP_NAME="Prompt Twin Brother Studio"
APP_URL=https://twinbrotherstudio.com

DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Resend SMTP — https://resend.com
MAIL_PASSWORD=re_xxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS="hello@twinbrotherstudio.com"

# OpenRouter — https://openrouter.ai
OPENAI_API_KEY=sk-or-v1-xxxxxxxxxx
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Google Analytics 4
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Database & Seed

```bash
php artisan migrate
php artisan db:seed
```

Seeder akan membuat:
- User admin (`admin@aitutorials.com` / `password`)
- 6 kategori default
- Contact settings default
- 100 artikel demo (opsional)

### Build & Run

```bash
# Development
npm run start
# Menjalankan: Vite dev + php artisan serve + queue:work + schedule:work

# Production build
npm run build
```

### Storage Link

```bash
php artisan storage:link
```

---

## Deployment (Hostinger Shared Hosting)

Lihat panduan lengkap di [`docs/setup-pending.md`](docs/setup-pending.md).

### Cron Jobs (cPanel)

```bash
# Laravel Scheduler
* * * * * /usr/local/bin/php /home/USERNAME/public_html/artisan schedule:run >> /dev/null 2>&1

# Queue Worker
* * * * * /usr/local/bin/php /home/USERNAME/public_html/artisan queue:work --once >> /dev/null 2>&1
```

### Post-deploy Commands

```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Struktur Direktori Penting

```
app/
├── Http/Controllers/
│   ├── Admin/               # Admin panel controllers
│   ├── ArticleController    # Public article + view tracking
│   ├── ArticleLikeController
│   ├── CommentController    # Public comment submission
│   ├── ContactController    # Hire Us form
│   ├── HomeController
│   └── PortfolioController
├── Jobs/
│   ├── FetchRssSourceJob
│   ├── GenerateArticleFromRssJob
│   └── IncrementArticleViewJob
├── Mail/
│   ├── ContactSubmissionMail
│   └── NewCommentMail
├── Models/
│   ├── Article, Category, Tag
│   ├── Comment, ContactSetting, ContactSubmission
│   ├── PortfolioItem, RssSource
│   └── User
└── Services/
    └── AiContentService     # OpenRouter/OpenAI wrapper

resources/js/
├── Components/
│   ├── Admin/DataTable      # Shared table component (TanStack Table v8)
│   ├── Layout/AdminLayout   # Admin sidebar + toast
│   ├── Layout/PublicLayout  # Public header/footer/nav
│   └── UI/                  # ArticleCard, ArticleImage, PageMeta, RichEditor
├── Pages/
│   ├── Admin/               # Dashboard, Articles, Categories, Tags,
│   │                        # Portfolio, ContactSettings, Submissions, Comments
│   ├── Article/Show
│   ├── Portfolio/           # Index, Show
│   ├── Contact/HireUs
│   ├── Home, Search, Category/Show
│   └── Auth/Login
└── hooks/
    └── useValidation        # Per-field validation hook

docs/
├── setup-pending.md         # Panduan setup Resend, OpenRouter, Hostinger cron
├── plan-analytics-engagement.md
├── sprint-1-plan-2026-05-08.md
└── handoff-rex-2026-05-08.md
```

---

## Sprint History

| Sprint | Fitur |
|--------|-------|
| Sprint 1 | Setup, Articles, Categories, Tags, RSS Sources, Portfolio, Hire Us, Admin Panel |
| Sprint 2 | Featured Projects di homepage, drag reorder portfolio admin |
| Sprint 3 | View counter, Like button, DataTable, Form validation, Toast |
| Sprint 4 | Comment system, GA4 integration |

---

## Admin Login (Development)

```
URL:      http://localhost:8000/admin
Email:    admin@aitutorials.com
Password: password
```

---

## License

Private — Twin Brother Studio © 2026
