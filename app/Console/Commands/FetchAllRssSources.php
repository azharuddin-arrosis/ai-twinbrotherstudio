<?php

namespace App\Console\Commands;

use App\Jobs\FetchRssSourceJob;
use App\Models\RssSource;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('rss:fetch {--source= : Fetch specific source by ID}')]
#[Description('Fetch all active RSS sources and queue article generation')]
class FetchAllRssSources extends Command
{
    public function handle(): int
    {
        $query = RssSource::where('is_active', true);

        if ($id = $this->option('source')) {
            $query->where('id', $id);
        } else {
            $query->where(function ($q) {
                $q->whereNull('last_fetched_at')
                  ->orWhereRaw('last_fetched_at <= DATE_SUB(NOW(), INTERVAL fetch_interval_hours HOUR)');
            });
        }

        $sources = $query->get();

        if ($sources->isEmpty()) {
            $this->info('No sources due for fetching.');
            return self::SUCCESS;
        }

        foreach ($sources as $source) {
            FetchRssSourceJob::dispatch($source);
            $this->line("  Queued: {$source->name}");
        }

        $this->info("Dispatched {$sources->count()} fetch jobs.");

        return self::SUCCESS;
    }
}
