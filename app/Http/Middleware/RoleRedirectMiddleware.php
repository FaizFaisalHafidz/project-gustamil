<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleRedirectMiddleware
{
    /**
     * Handle an incoming request.
     * FIXED: Use Spatie roles
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Block anggota from accessing admin routes
            if ($user->hasRole('anggota')) {
                if ($request->is('dashboard') || 
                    $request->is('data-*') || 
                    $request->is('laporan*') || 
                    $request->is('keuangan*')) {
                    abort(403, 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.');
                }
            }
            
            // Block pengelola from accessing anggota routes  
            if ($user->hasRole('pengelola')) {
                if ($request->is('beranda')) {
                    abort(403, 'Akses ditolak. Halaman ini khusus untuk anggota.');
                }
            }
        }

        return $next($request);
    }
}