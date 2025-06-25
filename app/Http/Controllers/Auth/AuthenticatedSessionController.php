<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\TmDataAnggota;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * FIXED: Check anggota status before redirect
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // FIXED: Check if user is anggota and if account is active
        if ($user->hasRole('anggota')) {
            $anggota = TmDataAnggota::where('user_id', $user->id)->first();
            
            // If anggota data doesn't exist or is inactive
            if (!$anggota || !$anggota->status_aktif) {
                // Logout the user immediately
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                
                // Redirect to account inactive page
                return redirect()->route('account.inactive', ['user_id' => $user->id])
                    ->with('error', 'Akun Anda tidak aktif. Silakan hubungi pengelola untuk aktivasi.');
            }
        }

        $request->session()->regenerate();

        // Redirect berdasarkan role menggunakan Spatie
        if ($user->hasRole('anggota')) {
            return redirect()->intended(route('beranda'));
        }
        
        // Default untuk pengelola
        return redirect()->intended(route('dashboard'));
    }

    /**
     * Show account inactive page
     */
    public function accountInactive(Request $request)
    {
        $userId = $request->get('user_id');
        
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return redirect()->route('login');
        }

        $anggota = null;
        if ($user->hasRole('anggota')) {
            $anggota = TmDataAnggota::where('user_id', $user->id)->first();
        }

        return Inertia::render('auth/account-inactive', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'anggota' => $anggota ? [
                'nomor_anggota' => $anggota->nomor_anggota,
                'nama_lengkap' => $anggota->nama_lengkap,
                'tanggal_daftar' => $anggota->tanggal_daftar->toDateString(),
            ] : null,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
