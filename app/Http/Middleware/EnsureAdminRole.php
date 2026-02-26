<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureAdminRole
 *
 * Guards all /admin/* routes.
 * Allows: super_admin, parish_admin, clergymen
 * Denies: parishioner, unauthenticated
 *
 * Registered as alias 'admin' in bootstrap/app.php
 */
class EnsureAdminRole
{
    const ADMIN_ROLES = ['super_admin', 'parish_admin', 'clergymen'];

    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        if (! in_array(auth()->user()->role, self::ADMIN_ROLES)) {
            abort(403, 'Unauthorized. You do not have admin access.');
        }

        return $next($request);
    }
}
