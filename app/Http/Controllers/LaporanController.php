<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\TtDataKeuangan;
use App\Models\TtDataSetoran;
use App\Models\TtDataHistorySaldoAnggota;
use App\Models\TmDataAnggota;
use App\Models\TmDataJenisSampah;
use App\Models\User;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanController extends Controller
{
    /**
     * Display laporan dashboard
     */
    public function index(Request $request)
    {
        $periode = $request->get('periode', 'bulan_ini');
        $tanggalMulai = $request->get('tanggal_mulai');
        $tanggalSelesai = $request->get('tanggal_selesai');

        // Set date range based on periode
        $dateRange = $this->getDateRange($periode, $tanggalMulai, $tanggalSelesai);

        // Get summary data
        $summary = $this->getSummaryData($dateRange);

        // Get chart data
        $chartData = $this->getChartData($dateRange);

        // Get top performers
        $topPerformers = $this->getTopPerformers($dateRange);

        return Inertia::render('Laporan/Index', [
            'summary' => $summary,
            'chartData' => $chartData,
            'topPerformers' => $topPerformers,
            'filters' => [
                'periode' => $periode,
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_selesai' => $tanggalSelesai,
            ]
        ]);
    }

    /**
     * Laporan Keuangan
     */
    public function keuangan(Request $request)
    {
        $query = TtDataKeuangan::with(['anggota', 'admin'])
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('waktu_transaksi', 'desc');

        // Apply filters
        if ($request->jenis_transaksi) {
            $query->where('jenis_transaksi', $request->jenis_transaksi);
        }

        if ($request->kategori_transaksi) {
            $query->where('kategori_transaksi', $request->kategori_transaksi);
        }

        if ($request->tanggal_mulai) {
            $query->whereDate('tanggal_transaksi', '>=', $request->tanggal_mulai);
        }

        if ($request->tanggal_selesai) {
            $query->whereDate('tanggal_transaksi', '<=', $request->tanggal_selesai);
        }

        // Get summary for filtered data
        $summaryQuery = clone $query;
        $summary = [
            'total_masuk' => (clone $summaryQuery)->where('jenis_transaksi', 'masuk')->sum('jumlah_uang'),
            'total_keluar' => (clone $summaryQuery)->where('jenis_transaksi', 'keluar')->sum('jumlah_uang'),
            'total_transaksi' => $summaryQuery->count(),
        ];
        $summary['saldo_bersih'] = $summary['total_masuk'] - $summary['total_keluar'];

        // Get paginated data
        $keuangan = $query->paginate(20)->withQueryString();

        return Inertia::render('Laporan/Keuangan', [
            'keuangan' => $keuangan,
            'summary' => $summary,
            'filters' => $request->only(['jenis_transaksi', 'kategori_transaksi', 'tanggal_mulai', 'tanggal_selesai'])
        ]);
    }

    /**
     * Laporan Setoran
     */
    public function setoran(Request $request)
    {
        // Debug: Cek apakah data jenis sampah ada
        $allJenisSampah = TmDataJenisSampah::all();
        \Log::info('All Jenis Sampah:', $allJenisSampah->toArray());

        $query = TtDataSetoran::with(['anggota', 'jenisSampah', 'admin'])
            ->orderBy('tanggal_setoran', 'desc')
            ->orderBy('waktu_setoran', 'desc');

        // Apply filters
        if ($request->anggota_id) {
            $query->where('anggota_id', $request->anggota_id);
        }

        if ($request->jenis_sampah_id) {
            $query->where('jenis_sampah_id', $request->jenis_sampah_id);
        }

        if ($request->tanggal_mulai) {
            $query->whereDate('tanggal_setoran', '>=', $request->tanggal_mulai);
        }

        if ($request->tanggal_selesai) {
            $query->whereDate('tanggal_setoran', '<=', $request->tanggal_selesai);
        }

        // Get summary for filtered data
        $summaryQuery = clone $query;
        $summary = [
            'total_berat' => $summaryQuery->sum('berat_kg'),
            'total_saldo' => $summaryQuery->sum('total_harga'),
            'total_poin' => $summaryQuery->sum('poin_didapat'),
            'total_transaksi' => $summaryQuery->count(),
        ];

        // Get breakdown by jenis sampah
        $breakdownQuery = TtDataSetoran::query();
        
        // Apply same filters for breakdown
        if ($request->anggota_id) {
            $breakdownQuery->where('anggota_id', $request->anggota_id);
        }
        if ($request->jenis_sampah_id) {
            $breakdownQuery->where('jenis_sampah_id', $request->jenis_sampah_id);
        }
        if ($request->tanggal_mulai) {
            $breakdownQuery->whereDate('tanggal_setoran', '>=', $request->tanggal_mulai);
        }
        if ($request->tanggal_selesai) {
            $breakdownQuery->whereDate('tanggal_setoran', '<=', $request->tanggal_selesai);
        }

        $breakdownJenis = $breakdownQuery
            ->select('jenis_sampah_id')
            ->selectRaw('SUM(berat_kg) as total_berat')
            ->selectRaw('SUM(total_harga) as total_saldo')
            ->selectRaw('COUNT(*) as total_transaksi')
            ->with(['jenisSampah:id,nama_jenis']) // Explicit column selection
            ->groupBy('jenis_sampah_id')
            ->orderByDesc('total_berat')
            ->get();

        // Debug: Cek breakdown data
        \Log::info('Breakdown Jenis:', $breakdownJenis->toArray());

        // Get paginated data dengan eager loading yang lebih eksplisit
        $setoran = $query->with([
                'anggota:id,nomor_anggota,nama_lengkap',
                'jenisSampah:id,nama_jenis', // Explicit column selection
                'admin:id,name'
            ])
            ->paginate(20)
            ->withQueryString();

        // Debug: Cek setoran data
        \Log::info('Setoran Data Sample:', $setoran->items() ? $setoran->items()[0]->toArray() : 'No data');

        // Get anggota aktif untuk filter
        $anggotaList = TmDataAnggota::where('status_aktif', true)
            ->select('id', 'nomor_anggota', 'nama_lengkap')
            ->orderBy('nama_lengkap')
            ->get();

        // Get jenis sampah untuk filter
        $jenisSampahList = TmDataJenisSampah::where('status_aktif', true)
            ->select('id', 'nama_jenis')
            ->orderBy('nama_jenis')
            ->get();

        // Debug: Cek jenis sampah list
        \Log::info('Jenis Sampah List:', $jenisSampahList->toArray());

        return Inertia::render('Laporan/Setoran', [
            'setoran' => $setoran,
            'summary' => $summary,
            'breakdownJenis' => $breakdownJenis,
            'anggotaList' => $anggotaList,
            'jenisSampahList' => $jenisSampahList,
            'filters' => $request->only(['anggota_id', 'jenis_sampah_id', 'tanggal_mulai', 'tanggal_selesai'])
        ]);
    }

    /**
     * Laporan Anggota
     */
    public function anggota(Request $request)
    {
        $query = TmDataAnggota::withCount(['setoran'])
            ->withSum('setoran', 'total_harga') // Fixed: total_harga not total_saldo
            ->withSum('setoran', 'poin_didapat') // Fixed: poin_didapat not total_poin
            ->withSum('setoran', 'berat_kg') // Fixed: berat_kg not berat_sampah
            ->orderBy('nama_lengkap');

        // Apply filters
        if ($request->status_aktif !== null) {
            $query->where('status_aktif', $request->status_aktif);
        }

        if ($request->tanggal_mulai || $request->tanggal_selesai) {
            $query->whereHas('setoran', function ($q) use ($request) {
                if ($request->tanggal_mulai) {
                    $q->whereDate('tanggal_setoran', '>=', $request->tanggal_mulai);
                }
                if ($request->tanggal_selesai) {
                    $q->whereDate('tanggal_setoran', '<=', $request->tanggal_selesai);
                }
            });
        }

        // Get summary
        $allAnggota = TmDataAnggota::query();
        $summary = [
            'total_anggota' => $allAnggota->count(),
            'anggota_aktif' => (clone $allAnggota)->where('status_aktif', true)->count(),
            'anggota_non_aktif' => (clone $allAnggota)->where('status_aktif', false)->count(),
            'total_saldo_all' => (clone $allAnggota)->sum('saldo_aktif'),
        ];

        // Get paginated data
        $anggota = $query->paginate(20)->withQueryString();

        return Inertia::render('Laporan/Anggota', [
            'anggota' => $anggota,
            'summary' => $summary,
            'filters' => $request->only(['status_aktif', 'tanggal_mulai', 'tanggal_selesai'])
        ]);
    }

    /**
     * Export data to various formats
     */
    public function export(Request $request)
    {
        $type = $request->get('type'); // keuangan, setoran, anggota
        $format = $request->get('format', 'excel'); // excel, pdf, csv

        switch ($type) {
            case 'keuangan':
                return $this->exportKeuangan($request, $format);
            case 'setoran':
                return $this->exportSetoran($request, $format);
            case 'anggota':
                return $this->exportAnggota($request, $format);
            default:
                return back()->withErrors(['error' => 'Tipe export tidak valid']);
        }
    }

    /**
     * Get date range based on periode
     */
    private function getDateRange($periode, $tanggalMulai = null, $tanggalSelesai = null)
    {
        $today = Carbon::today();

        switch ($periode) {
            case 'hari_ini':
                return [$today, $today];
            case 'minggu_ini':
                return [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()];
            case 'bulan_ini':
                return [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()];
            case 'tahun_ini':
                return [$today->copy()->startOfYear(), $today->copy()->endOfYear()];
            case 'custom':
                if ($tanggalMulai && $tanggalSelesai) {
                    return [Carbon::parse($tanggalMulai), Carbon::parse($tanggalSelesai)];
                }
                // Fallback to current month
                return [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()];
            default:
                return [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()];
        }
    }

    /**
     * Get summary data for dashboard
     */
    private function getSummaryData($dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        // Keuangan summary
        $keuanganMasuk = TtDataKeuangan::where('jenis_transaksi', 'masuk')
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('jumlah_uang');

        $keuanganKeluar = TtDataKeuangan::where('jenis_transaksi', 'keluar')
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('jumlah_uang');

        // Setoran summary
        $totalSetoran = TtDataSetoran::whereBetween('tanggal_setoran', [$startDate, $endDate])
            ->count();

        $totalBeratSampah = TtDataSetoran::whereBetween('tanggal_setoran', [$startDate, $endDate])
            ->sum('berat_kg'); // Fixed: berat_kg not berat_sampah

        $totalSaldoSetoran = TtDataSetoran::whereBetween('tanggal_setoran', [$startDate, $endDate])
            ->sum('total_harga'); // Fixed: total_harga not total_saldo

        // Anggota summary
        $anggotaAktif = TmDataAnggota::where('status_aktif', true)->count();
        $totalSaldoAnggota = TmDataAnggota::sum('saldo_aktif');

        return [
            'keuangan' => [
                'total_masuk' => $keuanganMasuk,
                'total_keluar' => $keuanganKeluar,
                'saldo_bersih' => $keuanganMasuk - $keuanganKeluar,
            ],
            'setoran' => [
                'total_transaksi' => $totalSetoran,
                'total_berat' => $totalBeratSampah,
                'total_saldo' => $totalSaldoSetoran,
            ],
            'anggota' => [
                'total_aktif' => $anggotaAktif,
                'total_saldo' => $totalSaldoAnggota,
            ]
        ];
    }

    /**
     * Get chart data for dashboard
     */
    private function getChartData($dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        // Daily transaction data for chart
        $dailyData = TtDataKeuangan::selectRaw('DATE(tanggal_transaksi) as tanggal')
            ->selectRaw('SUM(CASE WHEN jenis_transaksi = "masuk" THEN jumlah_uang ELSE 0 END) as masuk')
            ->selectRaw('SUM(CASE WHEN jenis_transaksi = "keluar" THEN jumlah_uang ELSE 0 END) as keluar')
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Kategori breakdown
        $kategoriData = TtDataKeuangan::select('kategori_transaksi')
            ->selectRaw('SUM(jumlah_uang) as total')
            ->selectRaw('COUNT(*) as count')
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->groupBy('kategori_transaksi')
            ->get();

        return [
            'daily_transactions' => $dailyData,
            'kategori_breakdown' => $kategoriData,
        ];
    }

    /**
     * Get top performers
     */
    private function getTopPerformers($dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        // Top anggota by setoran
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
            ->limit(10)
            ->get();

        // Top jenis sampah - FIXED COLUMN NAME
        $topJenisSampah = TmDataJenisSampah::withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'berat_kg')
            ->withSum(['setoran' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_setoran', [$startDate, $endDate]);
            }], 'total_harga')
            ->having('setoran_sum_berat_kg', '>', 0)
            ->orderByDesc('setoran_sum_berat_kg')
            ->limit(10)
            ->get();

        return [
            'top_anggota' => $topAnggota,
            'top_jenis_sampah' => $topJenisSampah,
        ];
    }

    /**
     * Export keuangan data
     */
    private function exportKeuangan($request, $format)
    {
        // Implementation for export functionality
        // This would use Laravel Excel or similar package
        return back()->with('info', 'Export keuangan akan segera tersedia');
    }

    /**
     * Export setoran data
     */
    private function exportSetoran($request, $format)
    {
        // Implementation for export functionality
        return back()->with('info', 'Export setoran akan segera tersedia');
    }

    /**
     * Export anggota data
     */
    private function exportAnggota($request, $format)
    {
        // Implementation for export functionality
        return back()->with('info', 'Export anggota akan segera tersedia');
    }
}
