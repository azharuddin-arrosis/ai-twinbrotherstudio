# Setup Pending — Perlu Aksi Manual

Dokumen ini berisi semua konfigurasi yang membutuhkan aksi dari owner sebelum production deploy.
Isi satu per satu, lalu deploy ke Hostinger.

---

## 1. Resend SMTP (untuk email notifikasi inquiry)

**Langkah:**
1. Buat akun di https://resend.com
2. Dashboard → Domains → Add Domain → masukkan `twinbrotherstudio.com`
3. Ikuti instruksi verifikasi DNS (tambah TXT record di Hostinger DNS manager)
4. Setelah verified → API Keys → Create API Key → copy key
5. Isi di `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=re_XXXXXXXXXXXXXXXX        # ← ganti dengan API key dari Resend
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="hello@twinbrotherstudio.com"
MAIL_FROM_NAME="Twin Brother Studio"
```

**Test setelah isi:**
```bash
php artisan tinker
# Ketik:
Mail::raw('Test email', fn($m) => $m->to('azharoce@gmail.com')->subject('Test'));
```

---

## 2. OpenRouter API Key (untuk AI content generation dari RSS)

**Langkah:**
1. Buka https://openrouter.ai
2. Buat akun → Keys → Create Key → copy key
3. Isi di `.env`:

```env
OPENAI_API_KEY=sk-or-v1-XXXXXXXXXXXXXXXX    # ← ganti dengan key dari OpenRouter
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

**Model yang direkomendasikan (hemat biaya):**
- `google/gemini-flash-1.5` — gratis, cepat
- `meta-llama/llama-3.1-8b-instruct:free` — gratis

**Test setelah isi:**
```bash
php artisan app:fetch-all-rss-sources
# Cek di admin → Articles apakah ada artikel baru dengan status ai_draft
```

---

## 3. Hostinger cPanel Cron Jobs

**Langkah:**
1. Login cPanel Hostinger
2. Advanced → Cron Jobs
3. Tambahkan 2 cron job berikut:

**Cron 1 — Laravel Scheduler (wajib):**
```
* * * * * /usr/local/bin/php /home/USERNAME/public_html/artisan schedule:run >> /dev/null 2>&1
```

**Cron 2 — Queue Worker (untuk email inquiry):**
```
* * * * * /usr/local/bin/php /home/USERNAME/public_html/artisan queue:work --once >> /dev/null 2>&1
```

> **Ganti `USERNAME`** dengan username Hostinger kamu (cek di cPanel → General Information)

> **Note:** Jika path PHP berbeda, cek dengan perintah `which php` di SSH Hostinger terminal.

---

## 4. Production Deploy ke Hostinger

**Langkah setelah semua config di atas selesai:**

```bash
# 1. Upload semua file ke public_html (via FTP atau Git)

# 2. Di SSH terminal Hostinger, jalankan:
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Build assets (jika ada Node.js di Hostinger):
npm ci && npm run build

# Atau build di local dulu lalu upload folder public/build/
```

**File .env yang perlu diset di production:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://twinbrotherstudio.com

DB_HOST=localhost
DB_DATABASE=nama_database_hostinger
DB_USERNAME=username_db_hostinger
DB_PASSWORD=password_db_hostinger

QUEUE_CONNECTION=database
CACHE_DRIVER=file
SESSION_DRIVER=file

# + semua config Resend dan OpenRouter dari atas
```

---

## Checklist Deploy

- [ ] Resend: akun dibuat + domain verified + API key di .env
- [ ] OpenRouter: akun dibuat + key di .env
- [ ] Hostinger: cPanel cron 2 job ditambahkan
- [ ] .env production sudah diisi lengkap
- [ ] `php artisan migrate --force` berhasil
- [ ] `php artisan storage:link` berhasil
- [ ] Test kirim inquiry dari /hire-us → email masuk
- [ ] Test RSS fetch → artikel ter-generate di admin
