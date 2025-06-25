<?php

namespace App\Http\Controllers;

use App\Models\TmDataAnggota;
use App\Models\TtDataSetoran;
use App\Models\TtDataHistorySaldoAnggota;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BerandaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get anggota data
        $anggota = TmDataAnggota::where('user_id', $user->id)->first();
        
        if (!$anggota) {
            // Jika user belum terdaftar sebagai anggota, redirect dengan pesan
            return redirect()->route('login')->with('error', 'Akun Anda belum terdaftar sebagai anggota.');
        }

        // Get summary data for this anggota
        $summary = $this->getAnggotaSummary($anggota->id);
        
        // Get recent activities
        $recentActivities = $this->getRecentActivities($anggota->id);

        return Inertia::render('Beranda', [
            'anggota' => $anggota,
            'summary' => $summary,
            'recentActivities' => $recentActivities,
        ]);
    }

    private function getAnggotaSummary($anggotaId)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            // Setoran statistics
            'total_setoran' => TtDataSetoran::where('anggota_id', $anggotaId)->count(),
            'setoran_bulan_ini' => TtDataSetoran::where('anggota_id', $anggotaId)
                ->where('tanggal_setoran', '>=', $thisMonth)
                ->count(),
            'setoran_tahun_ini' => TtDataSetoran::where('anggota_id', $anggotaId)
                ->where('tanggal_setoran', '>=', $thisYear)
                ->count(),

            // Berat statistics
            'total_berat' => TtDataSetoran::where('anggota_id', $anggotaId)->sum('berat_kg'),
            'berat_bulan_ini' => TtDataSetoran::where('anggota_id', $anggotaId)
                ->where('tanggal_setoran', '>=', $thisMonth)
                ->sum('berat_kg'),

            // Nilai statistics
            'total_nilai' => TtDataSetoran::where('anggota_id', $anggotaId)->sum('total_harga'),
            'nilai_bulan_ini' => TtDataSetoran::where('anggota_id', $anggotaId)
                ->where('tanggal_setoran', '>=', $thisMonth)
                ->sum('total_harga'),

            // Poin statistics
            'total_poin_earned' => TtDataSetoran::where('anggota_id', $anggotaId)->sum('poin_didapat'),
            'poin_bulan_ini' => TtDataSetoran::where('anggota_id', $anggotaId)
                ->where('tanggal_setoran', '>=', $thisMonth)
                ->sum('poin_didapat'),
        ];
    }

    private function getRecentActivities($anggotaId)
    {
        // Recent setoran - FIXED: Load relationship properly
        $recentSetoran = TtDataSetoran::with(['jenisSampah' => function($query) {
                $query->select('id', 'nama_jenis');
            }])
            ->where('anggota_id', $anggotaId)
            ->select('id', 'nomor_setoran', 'jenis_sampah_id', 'berat_kg', 'total_harga', 'poin_didapat', 'tanggal_setoran', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent saldo history
        $recentSaldoHistory = TtDataHistorySaldoAnggota::where('anggota_id', $anggotaId)
            ->select('id', 'jenis_transaksi', 'jumlah_saldo', 'saldo_sebelum', 'saldo_sesudah', 'keterangan', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'recent_setoran' => $recentSetoran,
            'recent_saldo_history' => $recentSaldoHistory,
        ];
    }
}
