# Content Pipeline — Setup & Production Guide

Auto-generate artikel dari RSS feed → AI rewrite → humanity check → translate 4 bahasa.

---

## Stack Pipeline

```
RSS Feed (OpenAI, TechCrunch, dll)
  └── FetchRssSourceJob         — download & filter items
        └── GenerateArticleFromRssJob  — AI generate artikel EN
              └── HumanizeArticleJob   — cek & rewrite sampai score ≥ 70 (max 5x)
                    └── TranslateArticleJob  — translate: PT-BR → DE → ID
```

---

## 1. Environment (.env)

```env
# OpenRouter API — daftar di openrouter.ai
OPENAI_API_KEY=sk-or-xxxx
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Model fallback — dipisah koma, dicoba urut dari kiri
# Cek model aktif: php artisan tinker --execute="..."
# atau GET https://openrouter.ai/api/v1/models (filter :free)
OPENAI_MODEL=openai/gpt-oss-120b:free,meta-llama/llama-3.3-70b-instruct:free,google/gemma-4-31b-it:free

# Queue — wajib database untuk shared hosting
QUEUE_CONNECTION=database

# Cache & Session — wajib file untuk shared hosting
CACHE_DRIVER=file
SESSION_DRIVER=file
```

---

## 2. First-Time Setup (setelah deploy)

```bash
# 1. Install dependencies
composer install --no-dev --optimize-autoloader
npm install && npm run build

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Migrate database
php artisan migrate --force

# 4. Link storage
php artisan storage:link

# 5. Seed data awal (categories + admin user)
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=AdminUserSeeder
php artisan db:seed --class=ContactSettingSeeder

# 6. Cache config untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 3. Tambah RSS Sources

Login admin → `/admin/rss-sources` → tambah source.

**Rekomendasi RSS per kategori:**

| Kategori | RSS URL |
|----------|---------|
| AI & Automation | `https://openai.com/news/rss.xml` |
| AI & Automation | `https://www.anthropic.com/rss.xml` |
| Tech News | `https://feeds.feedburner.com/TechCrunch/` |
| Tech News | `https://www.theverge.com/rss/index.xml` |
| Developer Tools | `https://github.blog/feed/` |
| Business & Marketing | `https://feeds.feedburner.com/entrepreneur/latest` |
| Design & Creativity | `https://feeds.feedburner.com/smashingmagazine` |
| Productivity & Tools | `https://www.producthunt.com/feed` |

**Assign kategori yang sesuai** saat tambah source — keywords filter otomatis ikut kategori.

---

## 4. Hostinger cPanel Cron Jobs

Masuk cPanel → **Cron Jobs** → tambah dua job:

### Job 1 — Queue Worker (setiap menit)
```
* * * * * cd /home/username/public_html && php artisan queue:work --once --max-time=50 >> /dev/null 2>&1
```
> `--max-time=50` supaya job tidak melebihi interval 1 menit.

### Job 2 — Scheduler (setiap menit)
```
* * * * * cd /home/username/public_html && php artisan schedule:run >> /dev/null 2>&1
```

Scheduler menjalankan:
- `rss:fetch` — setiap 6 jam (fetch semua active sources)
- `articles:clean-logs` — setiap hari jam 02:00 (hapus log H+7)

---

## 5. Jalankan Pipeline

### Satu command untuk semua (recommended)

```bash
# Normal — fetch source yang sudah waktunya
php artisan pipeline:start

# Force — paksa fetch semua source meskipun belum waktunya
php artisan pipeline:start --force
```

Command ini: clear config cache → tampilkan status → fetch RSS → info jobs queued.

Setelah dijalankan, queue worker di cPanel cron prosesnya otomatis.

---

## 6. Jalankan Manual (dev / troubleshoot)

```bash
# Fetch RSS source tertentu (bypass interval check)
php artisan rss:fetch --source=1
php artisan rss:fetch --source=2

# Fetch semua source yang sudah waktunya
php artisan rss:fetch

# Proses queue satu per satu (debug)
php artisan queue:work --once

# Proses semua queue (foreground)
php artisan queue:work

# Proses queue background (dev)
php artisan queue:work >> storage/logs/worker.log 2>&1 &

# Hapus log artikel lama manual
php artisan articles:clean-logs

# Cek model OpenRouter yang aktif saat ini
php artisan tinker --execute="
\$key = config('services.openai.key');
\$res = Illuminate\Support\Facades\Http::withToken(\$key)->get('https://openrouter.ai/api/v1/models');
collect(\$res->json('data'))->filter(fn(\$m) => str_contains(\$m['id'], ':free'))->pluck('id')->each(fn(\$m) => print(\$m.PHP_EOL));
"
```

---

## 6. Flow Detail

### Generate → Humanity → Translate

```
1. rss:fetch dijalankan
   └── FetchRssSourceJob per source
         ├── Download XML dari RSS URL
         ├── Filter: cek keyword dari category (null = semua diterima)
         ├── Skip: article dengan source_url yang sama sudah ada
         └── Dispatch GenerateArticleFromRssJob (max 10 item, stagger 5 detik)

2. GenerateArticleFromRssJob
   ├── Kirim title + excerpt ke OpenRouter (model fallback)
   ├── AI generate: title, excerpt, content HTML, meta, category_id
   ├── Simpan artikel (status: ai_draft)
   ├── Tulis log: storage/logs/articles/{slug}--{category}.log
   └── Dispatch HumanizeArticleJob(attempt=1, delay 3 detik)

3. HumanizeArticleJob
   ├── checkHumanity() → score 0-100
   ├── Tulis log: HUMANITY attempt N/5 | score | issues
   ├── score ≥ 70? → PASSED
   │     ├── Tulis log: PASSED
   │     └── Dispatch TranslateArticleJob(pt-BR, delay 10 detik)
   ├── attempt ≥ 5? → status: ai_needs_review, STOP
   └── score < 70 & attempt < 5?
         ├── rewriteForHumanity() — AI rewrite berdasarkan issues
         ├── Tulis log: REWRITE attempt N/5
         └── Dispatch HumanizeArticleJob(attempt+1, delay 5 detik)

4. TranslateArticleJob (chain: pt-BR → de → id)
   ├── translateArticle() → translate title, excerpt, content, meta
   ├── Simpan ke articles.translations JSON column
   ├── Tulis log: TRANSLATE lang | title
   └── Dispatch TranslateArticleJob(lang berikutnya, delay 10 detik)
```

### Status Artikel

| Status | Artinya |
|--------|---------|
| `ai_draft` | Generate selesai, siap review admin |
| `ai_needs_review` | 5x rewrite tapi score masih < 70, perlu edit manual |
| `draft` | Admin simpan sebagai draft |
| `published` | Live di website |
| `rejected` | Ditolak admin |

### Kolom Humanity

| Field | Keterangan |
|-------|-----------|
| `humanity_score` | Score 0-100 (null = belum dicek) |
| `humanity_attempts` | Sudah berapa kali dicek/rewrite |

Score ≥ 70 = lolos. Di bawah itu AI rewrite ulang.

### Translations JSON

```json
// articles.translations
{
  "pt-BR": {
    "title": "...",
    "excerpt": "...",
    "content": "<h2>...</h2>...",
    "meta_title": "...",
    "meta_description": "..."
  },
  "de": { ... },
  "id": { ... }
}
```

---

## 7. Monitoring

### Lihat artikel per status
```bash
php artisan tinker --execute="
App\Models\Article::selectRaw('status, count(*) as total')
  ->groupBy('status')->get()
  ->each(fn(\$r) => print(\$r->status.' → '.\$r->total.PHP_EOL));
"
```

### Lihat failed jobs
```bash
php artisan queue:failed
php artisan queue:retry all   # retry semua failed jobs
php artisan queue:flush       # hapus semua failed jobs
```

### Lihat log artikel
```bash
# List semua log file
ls -lh storage/logs/articles/

# Baca log artikel tertentu
cat "storage/logs/articles/how-ai-voice-agents--ai-automation.log"
```

### Monitor worker (dev)
```bash
tail -f storage/logs/worker.log
tail -f storage/logs/laravel.log | grep -E "(GENERATED|HUMANITY|REWRITE|PASSED|TRANSLATE|ERROR)"
```

---

## 8. Troubleshooting

### Model 404 / all models failed
Model OpenRouter sudah tidak aktif. Cek model terbaru dan update `OPENAI_MODEL` di `.env`:
```bash
php artisan config:clear
```

### Artikel tidak generate (0 items queued)
- Cek `is_active = true` di tabel `rss_sources`
- Cek `last_fetched_at` — kalau baru difetch, gunakan `--source=ID` untuk force
- Cek keywords di category — kalau terlalu strict, item difilter semua

### Queue tidak jalan di Hostinger
- Pastikan path di cron job sesuai: `cd /home/username/public_html`
- Test manual via SSH: `php artisan queue:work --once`
- Cek `QUEUE_CONNECTION=database` di `.env`

### JSON parse error / invalid output
Model tidak support `response_format: json_object`. Ganti ke model lain di `OPENAI_MODEL`.

---

## 9. Struktur File Penting

```
app/
  Jobs/
    FetchRssSourceJob.php       — download & filter RSS
    GenerateArticleFromRssJob.php — generate artikel via AI
    HumanizeArticleJob.php      — cek & rewrite humanity (max 5x)
    TranslateArticleJob.php     — translate EN → pt-BR → de → id
  Services/
    AiContentService.php        — semua call ke OpenRouter API
    ArticleLogger.php           — baca/tulis log file per artikel
  Console/Commands/
    FetchAllRssSources.php      — php artisan rss:fetch
    CleanArticleLogs.php        — php artisan articles:clean-logs

storage/logs/articles/          — log file per artikel ({slug}--{category}.log)
routes/console.php              — jadwal scheduler
```
