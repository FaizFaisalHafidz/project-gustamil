<?php

namespace App\Http\Controllers;

use App\Models\TmDataAnggota;
use App\Models\TmDataJenisSampah;
use App\Models\TtDataSetoran;
use App\Models\TtDataKeuangan;
use App\Models\TtDataHistorySaldoAnggota;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get date range for current month
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfYear = Carbon::now()->startOfYear();
        
        // Summary statistics
        $summary = $this->getSummaryStats();
        
        // Chart data for current month
        $chartData = $this->getChartData($startOfMonth, $endOfMonth);
        
        // Recent activities
        $recentActivities = $this->getRecentActivities();
        
        // Top performers
        $topPerformers = $this->getTopPerformers($startOfMonth, $endOfMonth);
        
        // Monthly trends
        $monthlyTrends = $this->getMonthlyTrends();
        
        // Jenis sampah breakdown
        $jenisSampahBreakdown = $this->getJenisSampahBreakdown($startOfMonth, $endOfMonth);

        return Inertia::render('dashboard', [
            'summary' => $summary,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'topPerformers' => $topPerformers,
            'monthlyTrends' => $monthlyTrends,
            'jenisSampahBreakdown' => $jenisSampahBreakdown,
        ]);
    }

    private function getSummaryStats()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            // Anggota stats
            'total_anggota' => TmDataAnggota::count(),
            'anggota_aktif' => TmDataAnggota::where('status_aktif', true)->count(),
            'anggota_baru_bulan_ini' => TmDataAnggota::where('created_at', '>=', $thisMonth)->count(),
            
            // Keuangan stats
            'total_saldo_anggota' => TmDataAnggota::sum('saldo_aktif'),
            'pemasukan_hari_ini' => TtDataKeuangan::where('jenis_transaksi', 'masuk')
                ->whereDate('tanggal_transaksi', $today)
                ->sum('jumlah_uang'),
            'pengeluaran_hari_ini' => TtDataKeuangan::where('jenis_transaksi', 'keluar')
                ->whereDate('tanggal_transaksi', $today)
                ->sum('jumlah_uang'),
            
            // Setoran stats  
            'total_setoran_hari_ini' => TtDataSetoran::whereDate('tanggal_setoran', $today)->count(),
            'total_berat_hari_ini' => TtDataSetoran::whereDate('tanggal_setoran', $today)->sum('berat_kg'),
            'total_nilai_hari_ini' => TtDataSetoran::whereDate('tanggal_setoran', $today)->sum('total_harga'),
            
            // Monthly stats
            'setoran_bulan_ini' => TtDataSetoran::where('tanggal_setoran', '>=', $thisMonth)->count(),
            'berat_bulan_ini' => TtDataSetoran::where('tanggal_setoran', '>=', $thisMonth)->sum('berat_kg'),
            'nilai_bulan_ini' => TtDataSetoran::where('tanggal_setoran', '>=', $thisMonth)->sum('total_harga'),
        ];
    }

    private function getChartData($startDate, $endDate)
    {
        // Daily setoran for the month
        $dailySetoran = TtDataSetoran::selectRaw('DATE(tanggal_setoran) as tanggal')
            ->selectRaw('COUNT(*) as jumlah_transaksi')
            ->selectRaw('SUM(berat_kg) as total_berat')
            ->selectRaw('SUM(total_harga) as total_nilai')
            ->whereBetween('tanggal_setoran', [$startDate, $endDate])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Keuangan harian
        $dailyKeuangan = TtDataKeuangan::selectRaw('DATE(tanggal_transaksi) as tanggal')
            ->selectRaw('SUM(CASE WHEN jenis_transaksi = "masuk" THEN jumlah_uang ELSE 0 END) as pemasukan')
            ->selectRaw('SUM(CASE WHEN jenis_transaksi = "keluar" THEN jumlah_uang ELSE 0 END) as pengeluaran')
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return [
            'daily_setoran' => $dailySetoran,
            'daily_keuangan' => $dailyKeuangan,
        ];
    }

    private function getRecentActivities()
    {
        // Recent setoran
        $recentSetoran = TtDataSetoran::with([
                'anggota:id,nama_lengkap,nomor_anggota', 
                'jenisSampah:id,nama_jenis' // Fixed: Use jenisSampah (camelCase)
            ])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent transactions
        $recentTransactions = TtDataKeuangan::with(['anggota:id,nama_lengkap,nomor_anggota'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'recent_setoran' => $recentSetoran,
            'recent_transactions' => $recentTransactions,
        ];
    }

    private function getTopPerformers($startDate, $endDate)
    {
        // Top anggota by setoran value
        $topAnggota = TmDataAnggota::withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'total_harga')
            ->withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'berat_kg')
            ->withCount(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }])
            ->having('setoran_sum_total_harga', '>', 0)
            ->orderByDesc('setoran_sum_total_harga')
            ->limit(5)
            ->get();

        // Top jenis sampah
        $topJenisSampah = TmDataJenisSampah::withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'berat_kg')
            ->withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'total_harga')
            ->having('setoran_sum_berat_kg', '>', 0)
            ->orderByDesc('setoran_sum_berat_kg')
            ->limit(5)
            ->get();

        return [
            'top_anggota' => $topAnggota,
            'top_jenis_sampah' => $topJenisSampah,
        ];
    }

    private function getMonthlyTrends()
    {
        // Get last 6 months data
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $setoran = TtDataSetoran::whereBetween('tanggal_setoran', [$startOfMonth, $endOfMonth])
                ->selectRaw('COUNT(*) as jumlah, SUM(berat_kg) as berat, SUM(total_harga) as nilai')
                ->first();

            $keuangan = TtDataKeuangan::whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth])
                ->selectRaw('
                    SUM(CASE WHEN jenis_transaksi = "masuk" THEN jumlah_uang ELSE 0 END) as pemasukan,
                    SUM(CASE WHEN jenis_transaksi = "keluar" THEN jumlah_uang ELSE 0 END) as pengeluaran
                ')
                ->first();

            $months->push([
                'bulan' => $date->format('M Y'),
                'setoran_jumlah' => $setoran->jumlah ?? 0,
                'setoran_berat' => $setoran->berat ?? 0,
                'setoran_nilai' => $setoran->nilai ?? 0,
                'pemasukan' => $keuangan->pemasukan ?? 0,
                'pengeluaran' => $keuangan->pengeluaran ?? 0,
            ]);
        }

        return $months;
    }

    private function getJenisSampahBreakdown($startDate, $endDate)
    {
        return TmDataJenisSampah::withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'berat_kg')
            ->withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'total_harga')
            ->withCount(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }])
            ->having('setoran_sum_berat_kg', '>', 0)
            ->orderByDesc('setoran_sum_berat_kg')
            ->get();
    }
}
