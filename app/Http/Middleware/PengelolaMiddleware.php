<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PengelolaMiddleware
{
    /**
     * Handle an incoming request.
     * FIXED: Use Spatie roles
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        if (!$user->hasRole('pengelola')) {
            abort(403, 'Akses ditolak. Halaman ini khusus untuk pengelola.');
        }

        return $next($request);
    }
}