<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ArticleLikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\ContactSettingController;
use App\Http\Controllers\Admin\ContactSubmissionController;
use App\Http\Controllers\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\Admin\SubscriberController as AdminSubscriberController;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

// ── Public ──────────────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', function (): Response {
    return response(
        "User-agent: *\nAllow: /\nSitemap: " . url('/sitemap.xml'),
        200
    )->header('Content-Type', 'text/plain');
});

Route::get('/hire-us', [ContactController::class, 'show'])->name('hire-us');
Route::post('/hire-us/submit', [ContactController::class, 'submit'])->name('hire-us.submit')->middleware('throttle:5,1');

Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{portfolioItem:slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/tag/{tag:slug}', [TagController::class, 'show'])->name('tag.show');

Route::post('/subscribe', [SubscriberController::class, 'store'])->name('subscribe')->middleware('throttle:3,60');
Route::get('/unsubscribe/{token}', [SubscriberController::class, 'unsubscribe'])->name('unsubscribe');

Route::get('/category/{category:slug}', [CategoryController::class, 'show'])->name('category.show');

// ── Admin ────────────────────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('articles', Admin\ArticleController::class);
    Route::post('articles/{article}/publish', [Admin\ArticleController::class, 'publish'])->name('articles.publish');
    Route::post('articles/{article}/reject', [Admin\ArticleController::class, 'reject'])->name('articles.reject');
    Route::post('articles/{article}/check-humanity', [Admin\ArticleController::class, 'checkHumanity'])->name('articles.check-humanity');
    Route::get('articles/{article}/log', [Admin\ArticleController::class, 'log'])->name('articles.log');

    Route::resource('categories', Admin\CategoryController::class);
    Route::resource('tags', Admin\TagController::class);
    Route::resource('rss-sources', Admin\RssSourceController::class);
    Route::post('rss-sources/{rssSource}/fetch', [Admin\RssSourceController::class, 'fetchNow'])->name('rss-sources.fetch');

    Route::get('comments', [AdminCommentController::class, 'index'])->name('comments.index');
    Route::post('comments/{comment}/approve', [AdminCommentController::class, 'approve'])->name('comments.approve');
    Route::post('comments/{comment}/reject', [AdminCommentController::class, 'reject'])->name('comments.reject');
    Route::delete('comments/{comment}', [AdminCommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('comments/{comment}/reply', [AdminCommentController::class, 'reply'])->name('comments.reply');

    Route::get('contact-settings', [ContactSettingController::class, 'index'])->name('contact-settings.index');
    Route::post('contact-settings/bulk-update', [ContactSettingController::class, 'bulkUpdate'])->name('contact-settings.bulk-update');

    Route::get('contact-submissions', [ContactSubmissionController::class, 'index'])->name('contact-submissions.index');
    Route::patch('contact-submissions/{submission}/mark-read', [ContactSubmissionController::class, 'markRead'])->name('contact-submissions.mark-read');

    Route::post('portfolio/reorder', [AdminPortfolioController::class, 'reorder'])->name('portfolio.reorder');
    Route::resource('portfolio', AdminPortfolioController::class);
    Route::post('portfolio/{portfolioItem}/toggle-publish', [AdminPortfolioController::class, 'togglePublish'])->name('portfolio.toggle-publish');

    Route::get('subscribers', [AdminSubscriberController::class, 'index'])->name('subscribers.index');
    Route::delete('subscribers/{subscriber}', [AdminSubscriberController::class, 'destroy'])->name('subscribers.destroy');
    Route::get('subscribers/export', [AdminSubscriberController::class, 'export'])->name('subscribers.export');

    Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
});

// Wildcard article route — didaftarkan SETELAH admin group agar tidak intercept /admin/*
Route::get('/{category:slug}/{article:slug}', [ArticleController::class, 'show'])->name('article.show');
Route::post('/{category:slug}/{article:slug}/like', [ArticleLikeController::class, 'store'])->name('article.like')->middleware('throttle:5,1');
Route::post('/{category:slug}/{article:slug}/comments', [CommentController::class, 'store'])->name('article.comments.store')->middleware('throttle:3,60');

// ── Auth ─────────────────────────────────────────────────────────────────────
Route::get('/login', [App\Http\Controllers\Auth\LoginController::class, 'show'])->name('login');
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'store'])->name('login.store');
Route::post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');
