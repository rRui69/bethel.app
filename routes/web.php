<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AnnouncementsController;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\SacramentRequestController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/mass-schedule',               fn () => view('coming-soon'))->name('mass-schedule');
Route::get('/announcements',               [AnnouncementsController::class, 'index'])->name('announcements');
Route::get('/announcements/{announcement}',[AnnouncementsController::class, 'show'])->name('announcements.show');
Route::get('/events',                      [EventsController::class, 'index'])->name('events');
Route::get('/events/{event}',              [EventsController::class, 'show'])->name('events.show');
Route::get('/sacraments',                  fn () => view('coming-soon'))->name('sacraments');
Route::get('/sacraments/{type}',           fn ($type) => view('coming-soon'))->name('sacraments.type');
Route::get('/contact',                     fn () => view('coming-soon'))->name('contact');

require __DIR__.'/auth.php';

Route::middleware('auth')->group(function () {
    Route::get('/profile',     [\App\Http\Controllers\ProfileController::class, 'page'])->name('profile');
    Route::get('/my-bookings', fn () => view('coming-soon'))->name('bookings');

    // Profile API — all authenticated users (any role)
    Route::prefix('api/profile')->name('api.profile.')->group(function () {
        Route::get('/',          [\App\Http\Controllers\ProfileController::class, 'show'])->name('show');
        Route::patch('/',        [\App\Http\Controllers\ProfileController::class, 'update'])->name('update');
        Route::post('/password', [\App\Http\Controllers\ProfileController::class, 'changePassword'])->name('password');
    });
});

Route::prefix('admin')
    ->middleware(['auth', 'admin'])
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard',     [DashboardController::class,     'index'])->name('dashboard');
        Route::get('/users',         [UserManagementController::class, 'page'])->name('users');
        Route::get('/announcements', [AnnouncementController::class,   'page'])->name('announcements');
        Route::get('/announcements/create', [AnnouncementController::class, 'page'])->name('announcements.create');
        Route::get('/events',        [EventController::class,          'page'])->name('events');
        Route::get('/events/create', [EventController::class,          'page'])->name('events.create');

        Route::get('/parishioners',  fn () => view('coming-soon'))->name('parishioners');
        Route::get('/sacraments',    [SacramentRequestController::class, 'page'])->name('sacraments');
        Route::get('/roles',         fn () => view('coming-soon'))->name('roles');

        Route::prefix('api')
            ->middleware('throttle:60,1')
            ->name('api.')
            ->group(function () {

                Route::get('/users/stats',                  [UserManagementController::class, 'stats'])->name('users.stats');
                Route::get('/users',                        [UserManagementController::class, 'index'])->name('users.index');
                Route::post('/users',                       [UserManagementController::class, 'store'])->name('users.store');
                Route::get('/users/{user}',                 [UserManagementController::class, 'show'])->name('users.show');
                Route::patch('/users/{user}',               [UserManagementController::class, 'update'])->name('users.update');
                Route::delete('/users/{user}',              [UserManagementController::class, 'destroy'])->name('users.destroy');
                Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');

                Route::get('/announcements/stats',            [AnnouncementController::class, 'stats'])->name('announcements.stats');
                Route::get('/announcements',                  [AnnouncementController::class, 'index'])->name('announcements.index');
                Route::post('/announcements',                 [AnnouncementController::class, 'store'])->name('announcements.store');
                Route::get('/announcements/{announcement}',   [AnnouncementController::class, 'show'])->name('announcements.show');
                Route::patch('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
                Route::delete('/announcements/{announcement}',[AnnouncementController::class, 'destroy'])->name('announcements.destroy');

                Route::get('/events/stats',          [EventController::class, 'stats'])->name('events.stats');
                Route::get('/events',                [EventController::class, 'index'])->name('events.index');
                Route::post('/events',               [EventController::class, 'store'])->name('events.store');
                Route::get('/events/{event}',        [EventController::class, 'show'])->name('events.show');
                Route::patch('/events/{event}',      [EventController::class, 'update'])->name('events.update');
                Route::delete('/events/{event}',     [EventController::class, 'destroy'])->name('events.destroy');

                Route::get('/sacrament-requests/stats', [SacramentRequestController::class, 'stats'])->name('sacrament-requests.stats');
                Route::get('/sacrament-requests', [SacramentRequestController::class, 'index'])->name('sacrament-requests.index');
                Route::get('/sacrament-requests/{sacramentRequest}', [SacramentRequestController::class, 'show'])->name('sacrament-requests.show');
                Route::patch('/sacrament-requests/{sacramentRequest}', [SacramentRequestController::class, 'update'])->name('sacrament-requests.update');

                Route::post('/notifications/read',   [UserManagementController::class, 'markNotificationRead'])->name('notifications.read');
            });
    });