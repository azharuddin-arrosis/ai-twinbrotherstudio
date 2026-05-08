<?php

use Illuminate\Support\Facades\Schedule;

// RSS fetch setiap 6 jam
Schedule::command('rss:fetch')->everySixHours()->withoutOverlapping();
Schedule::command('articles:clean-logs')->dailyAt('02:00');
