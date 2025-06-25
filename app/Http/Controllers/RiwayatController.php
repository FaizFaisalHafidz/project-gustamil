<?php

namespace App\Http\Controllers;

use App\Models\TmDataAnggota;
use App\Models\TtDataSetoran;
use App\Models\TtDataHistorySaldoAnggota;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RiwayatController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get anggota data
        $anggota = TmDataAnggota::where('user_id', $user->id)->first();
        
        if (!$anggota) {
            return redirect()->route('login')->with('error', 'Akun Anda belum terdaftar sebagai anggota.');
        }

        // Get filters
        $filters = [
            'type' => $request->get('type', 'all'),
            'period' => $request->get('period', '30'),
            'search' => $request->get('search', ''),
        ];

        // Calculate date range
        $dateRange = $this->getDateRange($filters['period']);

        // Get setoran history
        $setoranHistory = $this->getSetoranHistory($anggota->id, $filters, $dateRange);
        
        // Get saldo history  
        $saldoHistory = $this->getSaldoHistory($anggota->id, $filters, $dateRange);
        
        // FIXED: Get accurate statistics using current anggota data
        $statistics = $this->getStatistics($anggota, $filters, $dateRange);

        return Inertia::render('Riwayat', [
            'anggota' => $anggota,
            'setoranHistory' => $setoranHistory,
            'saldoHistory' => $saldoHistory,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    private function getDateRange($period)
    {
        $endDate = Carbon::now();
        
        switch ($period) {
            case '7':
                $startDate = Carbon::now()->subDays(7);
                break;
            case '30':
                $startDate = Carbon::now()->subDays(30);
                break;
            case '90':
                $startDate = Carbon::now()->subDays(90);
                break;
            default:
                $startDate = null;
                break;
        }

        return ['start' => $startDate, 'end' => $endDate];
    }

    private function getSetoranHistory($anggotaId, $filters, $dateRange)
    {
        $query = TtDataSetoran::with('jenisSampah')
            ->where('anggota_id', $anggotaId);

        // Apply date filter
        if ($dateRange['start']) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('nomor_setoran', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('catatan', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('jenisSampah', function ($subQ) use ($filters) {
                      $subQ->where('nama_jenis', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($filters);
    }

    private function getSaldoHistory($anggotaId, $filters, $dateRange)
    {
        $query = TtDataHistorySaldoAnggota::where('anggota_id', $anggotaId);

        // Apply date filter
        if ($dateRange['start']) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('nomor_transaksi', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('keterangan', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('kategori_transaksi', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($filters);
    }

    private function getStatistics($anggota, $filters, $dateRange)
    {
        // FIXED: Use current anggota data for accurate totals
        $statistics = [
            // Current totals from anggota table (accurate)
            'current_saldo' => $anggota->saldo_aktif,
            'current_poin' => $anggota->total_poin,
        ];

        // Setoran statistics (for the filtered period)
        $setoranStats = DB::table('tt_data_setoran')
            ->where('anggota_id', $anggota->id);

        if ($dateRange['start']) {
            $setoranStats->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        $setoranData = $setoranStats->selectRaw('
            COUNT(*) as total_setoran,
            COALESCE(SUM(berat_kg), 0) as total_berat,
            COALESCE(SUM(total_harga), 0) as total_nilai,
            COALESCE(SUM(poin_didapat), 0) as total_poin
        ')->first();

        $statistics = array_merge($statistics, [
            'total_setoran' => $setoranData->total_setoran ?? 0,
            'total_berat' => $setoranData->total_berat ?? 0,
            'total_nilai' => $setoranData->total_nilai ?? 0,
            'total_poin' => $setoranData->total_poin ?? 0,
        ]);

        // FIXED: Saldo transaction statistics with correct ENUM values
        $saldoStats = DB::table('tt_data_history_saldo_anggota')
            ->where('anggota_id', $anggota->id);

        if ($dateRange['start']) {
            $saldoStats->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        $saldoData = $saldoStats->selectRaw('
            COUNT(*) as total_transaksi_saldo,
            COALESCE(SUM(CASE WHEN jenis_transaksi = "masuk" THEN jumlah_saldo ELSE 0 END), 0) as total_masuk,
            COALESCE(SUM(CASE WHEN jenis_transaksi = "keluar" THEN jumlah_saldo ELSE 0 END), 0) as total_keluar,
            COALESCE(SUM(CASE WHEN jenis_transaksi = "masuk" AND kategori_transaksi = "setoran_sampah" THEN jumlah_poin ELSE 0 END), 0) as total_poin_earned,
            COALESCE(SUM(CASE WHEN kategori_transaksi = "tukar_poin" THEN jumlah_poin ELSE 0 END), 0) as total_poin_used
        ')->first();

        $statistics = array_merge($statistics, [
            'total_transaksi_saldo' => $saldoData->total_transaksi_saldo ?? 0,
            'total_masuk' => $saldoData->total_masuk ?? 0, // FIXED: Changed from total_kredit
            'total_keluar' => $saldoData->total_keluar ?? 0, // FIXED: Changed from total_debit
            'total_poin_earned' => $saldoData->total_poin_earned ?? 0,
            'total_poin_used' => $saldoData->total_poin_used ?? 0,
        ]);

        return $statistics;
    }

    public function exportPdf(Request $request)
    {
        // Implementation for PDF export
        return response()->json(['message' => 'PDF export functionality coming soon']);
    }

    public function exportExcel(Request $request)
    {
        // Implementation for Excel export
        return response()->json(['message' => 'Excel export functionality coming soon']);
    }
}