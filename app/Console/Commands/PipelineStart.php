<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\RssSource;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('pipeline:start {--force : Force fetch all sources even if interval not due}')]
#[Description('Start the content pipeline: clear config, fetch RSS, show queue status')]
class PipelineStart extends Command
{
    public function handle(): int
    {
        $this->info('=== Content Pipeline Start ===');
        $this->newLine();

        // 1. Clear config cache
        $this->line('→ Clearing config cache...');
        $this->call('config:clear');

        // 2. Status sebelum fetch
        $this->newLine();
        $this->line('→ Current state:');
        $this->table(
            ['', 'Count'],
            [
                ['Articles (total)', Article::count()],
                ['Articles (ai_draft)', Article::where('status', 'ai_draft')->count()],
                ['Articles (published)', Article::where('status', 'published')->count()],
                ['Articles (needs_review)', Article::where('status', 'ai_needs_review')->count()],
                ['Jobs in queue', DB::table('jobs')->count()],
                ['Failed jobs', DB::table('failed_jobs')->count()],
            ]
        );

        // 3. RSS sources
        $sources = RssSource::with('category')
            ->where('is_active', true)
            ->get();

        if ($sources->isEmpty()) {
            $this->warn('No active RSS sources found. Add sources at /admin/rss-sources');
            return self::SUCCESS;
        }

        $this->newLine();
        $this->line('→ Active RSS sources:');
        $this->table(
            ['ID', 'Name', 'Category', 'Last Fetched'],
            $sources->map(fn ($s) => [
                $s->id,
                $s->name,
                $s->category?->name ?? '—',
                $s->last_fetched_at?->diffForHumans() ?? 'never',
            ])
        );

        // 4. Fetch RSS
        $this->newLine();
        $this->line('→ Fetching RSS sources...');

        $force = $this->option('force');

        foreach ($sources as $source) {
            if ($force) {
                $this->call('rss:fetch', ['--source' => $source->id]);
            }
        }

        if (! $force) {
            $this->call('rss:fetch');
        }

        // 5. Status setelah fetch
        $queued = DB::table('jobs')->count();
        $this->newLine();

        if ($queued > 0) {
            $this->info("✓ {$queued} jobs queued. Queue worker akan prosesnya otomatis via cron.");
            $this->newLine();
            $this->line('  Hostinger cron harus sudah aktif:');
            $this->line('  <info>* * * * * cd /home/user/public_html && php artisan queue:work --once --max-time=50 >> /dev/null 2>&1</info>');
        } else {
            $this->warn('No new jobs queued — semua source mungkin belum waktunya di-fetch.');
            $this->line('  Gunakan --force untuk paksa fetch semua source:');
            $this->line('  <info>php artisan pipeline:start --force</info>');
        }

        $this->newLine();
        $this->line('→ Monitor progress:');
        $this->line('  tail -f storage/logs/laravel.log');
        $this->line('  ls storage/logs/articles/');

        $this->newLine();
        $this->info('=== Done ===');

        return self::SUCCESS;
    }
}
