<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PoinController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RiwayatController;
use App\Http\Controllers\SetoranController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataAnggotaController;
use App\Http\Controllers\JenisSampahController;
use App\Http\Controllers\DataKeuanganController;
use App\Http\Controllers\PenarikanSaldoController;

Route::redirect('/', '/dashboard')->name('home');

// Public routes
Route::get('/', function () {
    return redirect('/login');
});

// Auth routes (existing)
Route::middleware('guest')->group(function () {
    // ... existing auth routes
});

// Protected routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard untuk pengelola - FIXED: Use Spatie middleware
    Route::middleware(['role:pengelola'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Data Anggota Routes
        Route::prefix('data-anggota')->name('data-anggota.')->group(function () {
            Route::get('/', [DataAnggotaController::class, 'index'])->name('index');
            Route::get('/create', [DataAnggotaController::class, 'create'])->name('create');
            Route::post('/', [DataAnggotaController::class, 'store'])->name('store');
            Route::get('/{anggota}', [DataAnggotaController::class, 'show'])->name('show');
            Route::get('/{anggota}/edit', [DataAnggotaController::class, 'edit'])->name('edit');
            Route::put('/{anggota}', [DataAnggotaController::class, 'update'])->name('update');
            Route::delete('/{anggota}', [DataAnggotaController::class, 'destroy'])->name('destroy');
            
            // Additional actions
            Route::post('/{anggota}/reset-password', [DataAnggotaController::class, 'resetPassword'])->name('reset-password');
            Route::post('/{anggota}/toggle-status', [DataAnggotaController::class, 'toggleStatus'])->name('toggle-status');
            Route::get('/export/data', [DataAnggotaController::class, 'export'])->name('export');
            
            // API endpoints
            Route::get('/api/aktif', [DataAnggotaController::class, 'getAnggotaAktif'])->name('api.aktif');
            
            // Input Setoran untuk anggota tertentu (dari halaman detail anggota)
            Route::post('/{anggota}/input-setoran', [SetoranController::class, 'store'])->name('input-setoran');
        });

        // Jenis Sampah Routes
        Route::prefix('jenis-sampah')->name('jenis-sampah.')->group(function () {
            Route::get('/', [JenisSampahController::class, 'index'])->name('index');
            Route::get('/create', [JenisSampahController::class, 'create'])->name('create');
            Route::post('/', [JenisSampahController::class, 'store'])->name('store');
            Route::get('/{jenisSampah}', [JenisSampahController::class, 'show'])->name('show');
            Route::get('/{jenisSampah}/edit', [JenisSampahController::class, 'edit'])->name('edit');
            Route::put('/{jenisSampah}', [JenisSampahController::class, 'update'])->name('update');
            Route::delete('/{jenisSampah}', [JenisSampahController::class, 'destroy'])->name('destroy');
            
            // Additional actions
            Route::post('/{jenisSampah}/toggle-status', [JenisSampahController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{jenisSampah}/duplicate', [JenisSampahController::class, 'duplicate'])->name('duplicate');
            Route::get('/export/data', [JenisSampahController::class, 'export'])->name('export');
            
            // API endpoint
            Route::get('/api/active', [JenisSampahController::class, 'getActive'])->name('api.active');
        });

        // Setoran Management Routes (hanya untuk operasi CRUD)
        Route::prefix('setoran')->name('setoran.')->group(function () {
            Route::put('/{setoran}', [SetoranController::class, 'update'])->name('update');
            Route::delete('/{setoran}', [SetoranController::class, 'destroy'])->name('destroy');
            
            // API endpoints
            Route::get('/api/jenis-sampah-aktif', [SetoranController::class, 'getJenisSampahAktif'])->name('api.jenis-sampah-aktif');
            Route::get('/api/anggota-aktif', [SetoranController::class, 'getAnggotaAktif'])->name('api.anggota-aktif');
        });

        // Penarikan Saldo Routes (menggunakan history saldo)
        Route::prefix('penarikan-saldo')->name('penarikan-saldo.')->group(function () {
            Route::post('/', [PenarikanSaldoController::class, 'store'])->name('store');
            Route::put('/history/{historyTransaksi}', [PenarikanSaldoController::class, 'update'])->name('update');
            Route::delete('/history/{historyTransaksi}', [PenarikanSaldoController::class, 'destroy'])->name('destroy');
            
            // API endpoints
            Route::get('/api/info-saldo/{anggota}', [PenarikanSaldoController::class, 'getInfoSaldo'])->name('api.info-saldo');
            Route::get('/api/statistik', [PenarikanSaldoController::class, 'getStatistikPenarikan'])->name('api.statistik');
        });

        // Penarikan untuk anggota tertentu (dari halaman detail anggota)
        Route::post('/data-anggota/{anggota}/penarikan-saldo', [PenarikanSaldoController::class, 'store'])->name('data-anggota.penarikan-saldo');

        // Data Keuangan Routes
        Route::prefix('data-keuangan')->name('data-keuangan.')->group(function () {
            Route::get('/', [DataKeuanganController::class, 'index'])->name('index');
            Route::post('/', [DataKeuanganController::class, 'store'])->name('store');
            Route::put('/{keuangan}', [DataKeuanganController::class, 'update'])->name('update');
            Route::delete('/{keuangan}', [DataKeuanganController::class, 'destroy'])->name('destroy');
            
            // API endpoints
            Route::get('/api/kategori-transaksi', [DataKeuanganController::class, 'getKategoriTransaksi'])->name('api.kategori-transaksi');
            Route::get('/export/data', [DataKeuanganController::class, 'export'])->name('export');
        });

        // Laporan Routes
        Route::prefix('laporan')->name('laporan.')->group(function () {
            Route::get('/', [LaporanController::class, 'index'])->name('index');
            Route::get('/keuangan', [LaporanController::class, 'keuangan'])->name('keuangan');
            Route::get('/setoran', [LaporanController::class, 'setoran'])->name('setoran');
            Route::get('/anggota', [LaporanController::class, 'anggota'])->name('anggota');
            Route::get('/export', [LaporanController::class, 'export'])->name('export');
        });
    });
    
    // Beranda untuk anggota - FIXED: Use Spatie middleware
    Route::middleware(['role:anggota'])->group(function () {
        Route::get('/beranda', [BerandaController::class, 'index'])->name('beranda');
        
        // Riwayat routes
        Route::get('/riwayat', [RiwayatController::class, 'index'])->name('riwayat');
        Route::get('/riwayat/export-pdf', [RiwayatController::class, 'exportPdf'])->name('riwayat.export.pdf');
        Route::get('/riwayat/export-excel', [RiwayatController::class, 'exportExcel'])->name('riwayat.export.excel');
        
        // Poin routes
        Route::get('/poin', [PoinController::class, 'index'])->name('poin');
        Route::post('/poin/exchange', [PoinController::class, 'exchangePoints'])->name('poin.exchange');
        
        // Profile routes (if needed in future)
        Route::get('/profile-anggota', function () {
            return Inertia::render('ProfileAnggota');
        })->name('profile.anggota');
    });
    
    // Profile routes (accessible by both roles)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
