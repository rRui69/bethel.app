<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): mixed
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // Route based on role
                return match($user->role) {
                    'super_admin', 'parish_admin', 'clergymen'
                        => redirect()->route('admin.dashboard'),
                    default
                        => redirect()->route('home'),
                };
            }
        }

        return $next($request);
    }
}