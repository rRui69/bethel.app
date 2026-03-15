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
use App\Http\Controllers\Admin\ClergyManagementController;
use App\Http\Controllers\Admin\ClergyController;
use App\Http\Controllers\Admin\MassScheduleController as AdminMassScheduleController;
use App\Http\Controllers\MassScheduleController;
use App\Http\Controllers\SacramentController;
use App\Http\Controllers\Admin\SacramentTypeController;
use App\Http\Controllers\LivestreamController;
use App\Http\Controllers\Admin\LivestreamController as AdminLivestreamController;
use App\Http\Controllers\Admin\ParishController;
use App\Http\Controllers\PublicParishController;
use App\Http\Controllers\PublicClergyController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// ── Public parish pages ───────────────────────────────────────────────────────
Route::get('/parish/{parish}',       [PublicParishController::class, 'show'])->name('parish.show');
Route::get('/api/public/parish/{parish}', [PublicParishController::class, 'data'])->name('api.parish.data');

// ── Public clergy profile pages ───────────────────────────────────────────────
Route::get('/parish/{parish}/clergy/{user}',       [PublicClergyController::class, 'show'])->name('parish.clergy.show');
Route::get('/api/public/parish/{parish}/clergy/{user}', [PublicClergyController::class, 'data'])->name('api.parish.clergy.data');

// Public APIs — no auth required
Route::get('/api/sacrament-types', [SacramentTypeController::class, 'publicIndex'])->name('api.sacrament-types.public');

Route::get('/mass-schedule',             [MassScheduleController::class, 'index'])->name('mass-schedule');
Route::get('/api/mass-schedules/public', [MassScheduleController::class, 'publicIndex'])->name('api.mass-schedules.public');
Route::get('/announcements',               [AnnouncementsController::class, 'index'])->name('announcements');
Route::get('/announcements/{announcement}',[AnnouncementsController::class, 'show'])->name('announcements.show');
Route::get('/events',                      [EventsController::class, 'index'])->name('events');
Route::get('/events/{event}',              [EventsController::class, 'show'])->name('events.show');
Route::get('/sacraments',                  [SacramentController::class, 'listing'])->name('sacraments');
Route::get('/sacraments/{slug}',           [SacramentController::class, 'form'])->name('sacraments.form');
Route::get('/contact',                     fn () => view('coming-soon'))->name('contact');

// Dedicated public livestream page
Route::get('/livestream', [LivestreamController::class, 'index'])
    ->name('livestream');

// Public API — no auth required (homepage widget + viewer token)
Route::prefix('api/livestreams')->name('api.livestreams.')->group(function () {

    // Homepage widget polls this every 30 seconds
    Route::get('/active',          [LivestreamController::class, 'active'])
        ->name('active');

    // Paginated archive for the /livestream public page
    Route::get('/archive',         [LivestreamController::class, 'archive'])
        ->name('archive');

    // Agora subscriber token — public viewers need this to join camera streams
    Route::post('/subscriber-token', [LivestreamController::class, 'subscriberToken'])
        ->name('subscriber-token');
});


require __DIR__.'/auth.php';

// Authenticated parishioner routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/sacraments/submit', [SacramentController::class, 'submit'])->name('sacraments.submit');

    // Inbox — dedicated notification + message
    Route::get('/inbox', [\App\Http\Controllers\InboxController::class, 'page'])->name('inbox');
    Route::prefix('api/inbox')->name('api.inbox.')->group(function () {
        Route::get('/',              [\App\Http\Controllers\InboxController::class, 'index'])->name('index');
        Route::post('/read',         [\App\Http\Controllers\InboxController::class, 'markRead'])->name('read');
        Route::post('/read-all',     [\App\Http\Controllers\InboxController::class, 'markAllRead'])->name('read-all');
    });

    // Profile pages
    Route::get('/profile',     [\App\Http\Controllers\ProfileController::class, 'page'])->name('profile');
    Route::prefix('api/profile')->name('api.profile.')->group(function () {
        Route::get('/',                [\App\Http\Controllers\ProfileController::class, 'show'])->name('show');
        Route::patch('/personal',      [\App\Http\Controllers\ProfileController::class, 'updatePersonal'])->name('personal');
        Route::patch('/account',       [\App\Http\Controllers\ProfileController::class, 'updateAccount'])->name('account');
        Route::patch('/avatar',        [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('avatar');
        Route::post('/password',       [\App\Http\Controllers\ProfileController::class, 'changePassword'])->name('password');
    });

    // My Bookings — page + API
    Route::get('/my-bookings', [BookingController::class, 'page'])->name('bookings');
    Route::prefix('api/bookings')->name('api.bookings.')->group(function () {
        Route::get('/',                                        [BookingController::class, 'index'])->name('index');
        Route::get('/{sacramentRequest}',                      [BookingController::class, 'show'])->name('show');
        Route::get('/{sacramentRequest}/certificate',          [BookingController::class, 'certificate'])->name('certificate');
        Route::post('/{sacramentRequest}/payment',             [BookingController::class, 'submitPayment'])->name('payment');
        Route::post('/{sacramentRequest}/clergy-respond',      [BookingController::class, 'respondClergy'])->name('clergy-respond');
        Route::post('/{sacramentRequest}/request-cancellation', [BookingController::class, 'requestCancellation'])->name('request-cancellation');
        Route::get('/{sacramentRequest}/messages',             [BookingController::class, 'messages'])->name('messages');
        Route::post('/{sacramentRequest}/messages',            [BookingController::class, 'sendMessage'])->name('messages.send');
    });

    // Parishioner notifications
    Route::prefix('api/my-notifications')->name('api.my-notifications.')->group(function () {
        Route::get('/',      [BookingController::class, 'notifications'])->name('index');
        Route::post('/read', [BookingController::class, 'markNotificationsRead'])->name('read');
    });
});

// Admin routes
Route::prefix('admin')
    ->middleware(['auth', 'verified', 'admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('',                      [DashboardController::class,           'index'])->name('dashboard');
        Route::get('/users',                [UserManagementController::class,       'page'])->name('users');
        Route::get('/announcements',        [AnnouncementController::class,         'page'])->name('announcements');
        Route::get('/announcements/create', [AnnouncementController::class,    'page'])->name('announcements.create');
        Route::get('/events',               [EventController::class,                'page'])->name('events');
        Route::get('/events/create',        [EventController::class,                'page'])->name('events.create');
        Route::get('/parishioners',         fn () => view('coming-soon'))->name('parishioners');
        Route::get('/sacraments',           [AdminSacramentRequestController::class,'page'])->name('sacraments');
        Route::get('/sacrament-types',      [SacramentTypeController::class,        'page'])->name('sacrament-types');
        Route::get('/roles',                fn () => view('coming-soon'))->name('roles');

        // Clergy Management (super_admin creates/manage clergy accounts)
        Route::get('/clergy',               [ClergyManagementController::class,'page'])->name('clergy');

        // Clergy Dashboard
        Route::get('/clergy-dashboard',     [ClergyController::class,'page'])->name('clergy-dashboard');

        // Mass Schedules
        Route::get('/mass-schedules',       [AdminMassScheduleController::class,'page'])->name('mass-schedules');

        // Livestreams
        Route::get('/livestreams',          [AdminLivestreamController::class,'page'])->name('livestreams');

        // Parish Management
        Route::get('/parishes',             [ParishController::class, 'page'])->name('parishes');

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
                Route::patch('/sacrament-requests/{sacramentRequest}',                          [AdminSacramentRequestController::class, 'update'])->name('sacrament-requests.update');
                Route::post('/sacrament-requests/{sacramentRequest}/cancel',                    [AdminSacramentRequestController::class, 'adminCancel'])->name('sacrament-requests.cancel');
                Route::post('/sacrament-requests/{sacramentRequest}/review-cancellation',       [AdminSacramentRequestController::class, 'reviewCancellation'])->name('sacrament-requests.review-cancellation');
                Route::post('/sacrament-requests/{sacramentRequest}/assign-clergy',    [AdminSacramentRequestController::class, 'assignClergy'])->name('sacrament-requests.assign-clergy');
                Route::get('/sacrament-requests/{sacramentRequest}/available-clergy',  [AdminSacramentRequestController::class, 'availableClergy'])->name('sacrament-requests.available-clergy');
                Route::post('/sacrament-requests/{sacramentRequest}/verify-payment',   [AdminSacramentRequestController::class, 'verifyPayment'])->name('sacrament-requests.verify-payment');
                Route::post('/sacrament-requests/{sacramentRequest}/mark-paid',        [AdminSacramentRequestController::class, 'markPaid'])->name('sacrament-requests.mark-paid');
                Route::get('/sacrament-requests/{sacramentRequest}/certificate',       [AdminSacramentRequestController::class, 'certificate'])->name('sacrament-requests.certificate');
                Route::get('/sacrament-requests/{sacramentRequest}/messages',          [AdminSacramentRequestController::class, 'messages'])->name('sacrament-requests.messages');
                Route::post('/sacrament-requests/{sacramentRequest}/messages',         [AdminSacramentRequestController::class, 'sendMessage'])->name('sacrament-requests.messages.send');

                // Misc
                Route::post('/notifications/read', [UserManagementController::class, 'markNotificationRead'])->name('notifications.read');

                // Clergy Management API (super_admin only, enforced in controller)
                Route::get('/clergy/stats',                [ClergyManagementController::class, 'stats'])->name('clergy.stats');
                Route::get('/clergy',                      [ClergyManagementController::class, 'index'])->name('clergy.index');
                Route::post('/clergy',                     [ClergyManagementController::class, 'store'])->name('clergy.store');
                Route::get('/clergy/{user}',               [ClergyManagementController::class, 'show'])->name('clergy.show');
                Route::patch('/clergy/{user}',             [ClergyManagementController::class, 'update'])->name('clergy.update');
                Route::delete('/clergy/{user}',            [ClergyManagementController::class, 'destroy'])->name('clergy.destroy');
                Route::post('/clergy/{user}/reset-password',[ClergyManagementController::class, 'resetPassword'])->name('clergy.reset-password');

                // Clergy Dashboard
                Route::get('/clergy-profile',                              [ClergyController::class, 'myProfile'])->name('clergy-profile');
                Route::get('/clergy-assignments',                          [ClergyController::class, 'assignments'])->name('clergy-assignments');
                Route::post('/clergy-assignments/{sacramentRequest}/respond', [ClergyController::class, 'respond'])->name('clergy-assignments.respond');
                Route::get('/clergy-records',                              [ClergyController::class, 'records'])->name('clergy-records');

                // Mass Schedules
                Route::get('/mass-schedules',                              [AdminMassScheduleController::class, 'index'])->name('mass-schedules.index');
                Route::post('/mass-schedules',                             [AdminMassScheduleController::class, 'store'])->name('mass-schedules.store');
                Route::get('/mass-schedules/{massSchedule}',               [AdminMassScheduleController::class, 'show'])->name('mass-schedules.show');
                Route::patch('/mass-schedules/{massSchedule}',             [AdminMassScheduleController::class, 'update'])->name('mass-schedules.update');
                Route::delete('/mass-schedules/{massSchedule}',            [AdminMassScheduleController::class, 'destroy'])->name('mass-schedules.destroy');
                Route::post('/mass-schedules/{massSchedule}/cancel',       [AdminMassScheduleController::class, 'cancel'])->name('mass-schedules.cancel');
                Route::delete('/mass-schedules/{massSchedule}/cancel/{cancellation}', [AdminMassScheduleController::class, 'removeCancel'])->name('mass-schedules.cancel.remove');

                // Livestreams
                Route::get('/livestreams/stats',                    [AdminLivestreamController::class, 'stats'])->name('livestreams.stats');
                Route::get('/livestreams',                          [AdminLivestreamController::class, 'index'])->name('livestreams.index');
                Route::post('/livestreams',                         [AdminLivestreamController::class, 'store'])->name('livestreams.store');
                Route::get('/livestreams/{livestream}',             [AdminLivestreamController::class, 'show'])->name('livestreams.show');
                Route::patch('/livestreams/{livestream}',           [AdminLivestreamController::class, 'update'])->name('livestreams.update');
                Route::delete('/livestreams/{livestream}',          [AdminLivestreamController::class, 'destroy'])->name('livestreams.destroy');
                Route::patch('/livestreams/{livestream}/start',     [AdminLivestreamController::class, 'start'])->name('livestreams.start');
                Route::patch('/livestreams/{livestream}/end',       [AdminLivestreamController::class, 'end'])->name('livestreams.end');
                Route::patch('/livestreams/{livestream}/archive',   [AdminLivestreamController::class, 'toggleArchive'])->name('livestreams.archive');

                // Agora publisher token
                Route::post('/livestreams/publisher-token',         [AdminLivestreamController::class, 'publisherToken'])->name('livestreams.publisher-token');

                // Parish Images (max 5 per parish)
                Route::get('/parishes/{parish}/images',            [\App\Http\Controllers\Admin\ParishImageController::class, 'index'])->name('parishes.images.index');
                Route::post('/parishes/{parish}/images',           [\App\Http\Controllers\Admin\ParishImageController::class, 'store'])->name('parishes.images.store');
                Route::delete('/parishes/{parish}/images/{image}', [\App\Http\Controllers\Admin\ParishImageController::class, 'destroy'])->name('parishes.images.destroy');
                Route::patch('/parishes/{parish}/images/reorder',  [\App\Http\Controllers\Admin\ParishImageController::class, 'reorder'])->name('parishes.images.reorder');

                // Clergy image upload (stored in clergy_profiles.image_url)
                Route::post('/clergy/{user}/image',   [\App\Http\Controllers\Admin\ClergyImageController::class, 'store'])->name('clergy.image.store');
                Route::delete('/clergy/{user}/image', [\App\Http\Controllers\Admin\ClergyImageController::class, 'destroy'])->name('clergy.image.destroy');

                // Parish Management (super_admin only — enforced in controller)
                Route::get('/parishes',                                    [ParishController::class, 'index'])->name('parishes.index');
                Route::post('/parishes',                                   [ParishController::class, 'store'])->name('parishes.store');
                Route::get('/parishes/{parish}',                           [ParishController::class, 'show'])->name('parishes.show');
                Route::patch('/parishes/{parish}',                         [ParishController::class, 'update'])->name('parishes.update');
                Route::delete('/parishes/{parish}',                        [ParishController::class, 'destroy'])->name('parishes.destroy');
                Route::get('/parishes/{parish}/users',                     [ParishController::class, 'users'])->name('parishes.users');
                Route::get('/parishes/{parish}/available-users',           [ParishController::class, 'availableUsers'])->name('parishes.available-users');
                Route::post('/parishes/{parish}/assign-user',              [ParishController::class, 'assignUser'])->name('parishes.assign-user');
                Route::delete('/parishes/{parish}/users/{user}',           [ParishController::class, 'removeUser'])->name('parishes.remove-user');
            });
    });
