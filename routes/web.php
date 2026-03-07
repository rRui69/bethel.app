<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AnnouncementsController;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\SacramentRequestController as AdminSacramentRequestController;
use App\Http\Controllers\Admin\SacramentTypeController;
use App\Http\Controllers\SacramentController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public APIs — no auth required
Route::get('/api/sacrament-types', [SacramentTypeController::class, 'publicIndex'])->name('api.sacrament-types.public');

Route::get('/mass-schedule',                fn () => view('coming-soon'))->name('mass-schedule');
Route::get('/announcements',               [AnnouncementsController::class, 'index'])->name('announcements');
Route::get('/announcements/{announcement}',[AnnouncementsController::class, 'show'])->name('announcements.show');
Route::get('/events',                      [EventsController::class, 'index'])->name('events');
Route::get('/events/{event}',              [EventsController::class, 'show'])->name('events.show');
Route::get('/sacraments',                  [SacramentController::class, 'listing'])->name('sacraments');
Route::get('/sacraments/{slug}',           [SacramentController::class, 'form'])->name('sacraments.form');
Route::get('/contact',                     fn () => view('coming-soon'))->name('contact');

require __DIR__.'/auth.php';

// ── Authenticated parishioner routes ───────────────────────────
Route::middleware('auth')->group(function () {

    // Submit sacrament (must be before {slug} wildcard — handled via POST so no conflict)
    Route::post('/sacraments/submit', [SacramentController::class, 'submit'])->name('sacraments.submit');

    // Profile pages
    Route::get('/profile',     [\App\Http\Controllers\ProfileController::class, 'page'])->name('profile');
    Route::prefix('api/profile')->name('api.profile.')->group(function () {
        Route::get('/',          [\App\Http\Controllers\ProfileController::class, 'show'])->name('show');
        Route::patch('/',        [\App\Http\Controllers\ProfileController::class, 'update'])->name('update');
        Route::post('/password', [\App\Http\Controllers\ProfileController::class, 'changePassword'])->name('password');
    });

    // My Bookings — page + API
    Route::get('/my-bookings', [BookingController::class, 'page'])->name('bookings');
    Route::prefix('api/bookings')->name('api.bookings.')->group(function () {
        Route::get('/',                                        [BookingController::class, 'index'])->name('index');
        Route::get('/{sacramentRequest}',                      [BookingController::class, 'show'])->name('show');
        Route::post('/{sacramentRequest}/payment',             [BookingController::class, 'submitPayment'])->name('payment');
        Route::post('/{sacramentRequest}/clergy-respond',      [BookingController::class, 'respondClergy'])->name('clergy-respond');
        Route::get('/{sacramentRequest}/messages',             [BookingController::class, 'messages'])->name('messages');
        Route::post('/{sacramentRequest}/messages',            [BookingController::class, 'sendMessage'])->name('messages.send');
    });

    // Parishioner notifications
    Route::prefix('api/my-notifications')->name('api.my-notifications.')->group(function () {
        Route::get('/',      [BookingController::class, 'notifications'])->name('index');
        Route::post('/read', [BookingController::class, 'markNotificationsRead'])->name('read');
    });
});

// ── Admin routes ───────────────────────────────────────────────
Route::prefix('admin')
    ->middleware(['auth', 'admin'])
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard',       [DashboardController::class,           'index'])->name('dashboard');
        Route::get('/users',           [UserManagementController::class,       'page'])->name('users');
        Route::get('/announcements',   [AnnouncementController::class,         'page'])->name('announcements');
        Route::get('/announcements/create', [AnnouncementController::class,    'page'])->name('announcements.create');
        Route::get('/events',          [EventController::class,                'page'])->name('events');
        Route::get('/events/create',   [EventController::class,                'page'])->name('events.create');
        Route::get('/parishioners',    fn () => view('coming-soon'))->name('parishioners');
        Route::get('/sacraments',      [AdminSacramentRequestController::class,'page'])->name('sacraments');
        Route::get('/sacrament-types', [SacramentTypeController::class,        'page'])->name('sacrament-types');
        Route::get('/roles',           fn () => view('coming-soon'))->name('roles');

        Route::prefix('api')
            ->middleware('throttle:60,1')
            ->name('api.')
            ->group(function () {

                // Users
                Route::get('/users/stats',                  [UserManagementController::class, 'stats'])->name('users.stats');
                Route::get('/users',                        [UserManagementController::class, 'index'])->name('users.index');
                Route::post('/users',                       [UserManagementController::class, 'store'])->name('users.store');
                Route::get('/users/{user}',                 [UserManagementController::class, 'show'])->name('users.show');
                Route::patch('/users/{user}',               [UserManagementController::class, 'update'])->name('users.update');
                Route::delete('/users/{user}',              [UserManagementController::class, 'destroy'])->name('users.destroy');
                Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');

                // Announcements
                Route::get('/announcements/stats',             [AnnouncementController::class, 'stats'])->name('announcements.stats');
                Route::get('/announcements',                   [AnnouncementController::class, 'index'])->name('announcements.index');
                Route::post('/announcements',                  [AnnouncementController::class, 'store'])->name('announcements.store');
                Route::get('/announcements/{announcement}',    [AnnouncementController::class, 'show'])->name('announcements.show');
                Route::patch('/announcements/{announcement}',  [AnnouncementController::class, 'update'])->name('announcements.update');
                Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

                // Events
                Route::get('/events/stats',      [EventController::class, 'stats'])->name('events.stats');
                Route::get('/events',            [EventController::class, 'index'])->name('events.index');
                Route::post('/events',           [EventController::class, 'store'])->name('events.store');
                Route::get('/events/{event}',    [EventController::class, 'show'])->name('events.show');
                Route::patch('/events/{event}',  [EventController::class, 'update'])->name('events.update');
                Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

                // Sacrament Types
                Route::get('/sacrament-types',                          [SacramentTypeController::class, 'index'])->name('sacrament-types.index');
                Route::post('/sacrament-types',                         [SacramentTypeController::class, 'store'])->name('sacrament-types.store');
                Route::get('/sacrament-types/{sacramentType}',          [SacramentTypeController::class, 'show'])->name('sacrament-types.show');
                Route::patch('/sacrament-types/{sacramentType}',        [SacramentTypeController::class, 'update'])->name('sacrament-types.update');
                Route::delete('/sacrament-types/{sacramentType}',       [SacramentTypeController::class, 'destroy'])->name('sacrament-types.destroy');
                Route::patch('/sacrament-types/{sacramentType}/toggle', [SacramentTypeController::class, 'toggle'])->name('sacrament-types.toggle');
                Route::post('/sacrament-types/reorder',                 [SacramentTypeController::class, 'reorder'])->name('sacrament-types.reorder');

                // Sacrament Requests — admin side
                Route::get('/sacrament-requests/stats',                                [AdminSacramentRequestController::class, 'stats'])->name('sacrament-requests.stats');
                Route::get('/sacrament-requests',                                      [AdminSacramentRequestController::class, 'index'])->name('sacrament-requests.index');
                Route::get('/sacrament-requests/{sacramentRequest}',                   [AdminSacramentRequestController::class, 'show'])->name('sacrament-requests.show');
                Route::patch('/sacrament-requests/{sacramentRequest}',                 [AdminSacramentRequestController::class, 'update'])->name('sacrament-requests.update');
                Route::post('/sacrament-requests/{sacramentRequest}/assign-clergy',    [AdminSacramentRequestController::class, 'assignClergy'])->name('sacrament-requests.assign-clergy');
                Route::get('/sacrament-requests/{sacramentRequest}/available-clergy',  [AdminSacramentRequestController::class, 'availableClergy'])->name('sacrament-requests.available-clergy');
                Route::post('/sacrament-requests/{sacramentRequest}/verify-payment',   [AdminSacramentRequestController::class, 'verifyPayment'])->name('sacrament-requests.verify-payment');
                Route::get('/sacrament-requests/{sacramentRequest}/messages',          [AdminSacramentRequestController::class, 'messages'])->name('sacrament-requests.messages');
                Route::post('/sacrament-requests/{sacramentRequest}/messages',         [AdminSacramentRequestController::class, 'sendMessage'])->name('sacrament-requests.messages.send');

                // Misc
                Route::post('/notifications/read', [UserManagementController::class, 'markNotificationRead'])->name('notifications.read');
            });
    });