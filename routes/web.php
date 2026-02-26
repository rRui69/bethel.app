<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserManagementController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/mass-schedule',     fn () => view('coming-soon'))->name('mass-schedule');
Route::get('/announcements',     fn () => view('coming-soon'))->name('announcements');
Route::get('/events',            fn () => view('coming-soon'))->name('events');
Route::get('/sacraments',        fn () => view('coming-soon'))->name('sacraments');
Route::get('/sacraments/{type}', fn ($type) => view('coming-soon'))->name('sacraments.type');
Route::get('/contact',           fn () => view('coming-soon'))->name('contact');

/*
|--------------------------------------------------------------------------
| Auth Routes (login, register, password reset, email verify)
| Defined in routes/auth.php — do NOT redeclare them here.
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Authenticated Parishioner Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile',     fn () => view('coming-soon'))->name('profile');
    Route::get('/my-bookings', fn () => view('coming-soon'))->name('bookings');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->middleware(['auth', 'admin'])          // 'admin' alias → EnsureAdminRole
    ->name('admin.')
    ->group(function () {

        // ── Blade pages ───────────────────────────────────────────
        Route::get('/dashboard', [DashboardController::class,     'index'])->name('dashboard');
        Route::get('/users',     [UserManagementController::class, 'page'])->name('users');

        // Placeholder pages
        Route::get('/parishioners',  fn () => view('coming-soon'))->name('parishioners');
        Route::get('/sacraments',    fn () => view('coming-soon'))->name('sacraments');
        Route::get('/events',        fn () => view('coming-soon'))->name('events');
        Route::get('/announcements', fn () => view('coming-soon'))->name('announcements');
        Route::get('/roles',         fn () => view('coming-soon'))->name('roles');

        // ── JSON API ──────────────────────────────────────────────
        Route::prefix('api')
            ->middleware('throttle:60,1')   // Rate limit: 60 req/min per IP
            ->name('api.')
            ->group(function () {

                // Static routes before wildcard — prevents route fallthrough
                Route::get('/users/stats',                  [UserManagementController::class, 'stats'])->name('users.stats');
                Route::get('/users',                        [UserManagementController::class, 'index'])->name('users.index');
                Route::post('/users',                       [UserManagementController::class, 'store'])->name('users.store');
                Route::get('/users/{user}',                 [UserManagementController::class, 'show'])->name('users.show');
                Route::patch('/users/{user}',               [UserManagementController::class, 'update'])->name('users.update');
                Route::delete('/users/{user}',              [UserManagementController::class, 'destroy'])->name('users.destroy');
                Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');

                // Notifications
                Route::post('/notifications/read',          [UserManagementController::class, 'markNotificationRead'])->name('notifications.read');
            });
    });
