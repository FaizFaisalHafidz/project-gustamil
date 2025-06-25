<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\TmDataAnggota;
use App\Models\TtDataHistorySaldoAnggota;
use App\Models\TtDataKeuangan;

class PenarikanSaldoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'anggota_id' => 'required|exists:tm_data_anggota,id',
            'jumlah_penarikan' => 'required|numeric|min:1000|max:50000000',
            'catatan' => 'nullable|string|max:255',
        ], [
            'jumlah_penarikan.min' => 'Minimal penarikan adalah Rp 1.000',
            'jumlah_penarikan.max' => 'Maksimal penarikan adalah Rp 50.000.000',
        ]);

        try {
            DB::beginTransaction();

            // Get anggota data
            $anggota = TmDataAnggota::findOrFail($request->anggota_id);

            // Check if anggota is active
            if (!$anggota->status_aktif) {
                return back()->withErrors([
                    'anggota_id' => 'Anggota tidak aktif, tidak dapat melakukan penarikan saldo.'
                ]);
            }

            $jumlahPenarikan = $request->jumlah_penarikan;

            // Check if saldo sufficient
            if ($anggota->saldo_aktif < $jumlahPenarikan) {
                return back()->withErrors([
                    'jumlah_penarikan' => 'Saldo tidak mencukupi. Saldo tersedia: ' . 
                        number_format($anggota->saldo_aktif, 0, ',', '.')
                ]);
            }

            // Calculate saldo after withdrawal
            $saldoSebelum = $anggota->saldo_aktif;
            $saldoSesudah = $saldoSebelum - $jumlahPenarikan;

            // Create data keuangan record (transaksi keluar)
            $dataKeuangan = TtDataKeuangan::create([
                'nomor_transaksi' => TtDataKeuangan::generateNomorTransaksi(),
                'jenis_transaksi' => 'keluar',
                'kategori_transaksi' => 'penarikan_anggota', // Update from 'penarikan_saldo'
                'jumlah_uang' => $jumlahPenarikan,
                'anggota_id' => $anggota->id,
                'admin_id' => Auth::id(),
                'keterangan' => $request->catatan 
                    ? "Penarikan saldo tunai a.n {$anggota->nama_lengkap} - " . $request->catatan
                    : "Penarikan saldo tunai a.n {$anggota->nama_lengkap} sebesar " . number_format($jumlahPenarikan, 0, ',', '.'),
                'tanggal_transaksi' => now()->toDateString(),
                'waktu_transaksi' => now()->toTimeString(),
            ]);

            // Create history saldo record for penarikan
            $historyTransaksi = TtDataHistorySaldoAnggota::create([
                'nomor_transaksi' => TtDataHistorySaldoAnggota::generateNomorTransaksi(),
                'anggota_id' => $anggota->id,
                'jenis_transaksi' => 'keluar',
                'kategori_transaksi' => 'penarikan_saldo',
                'jumlah_saldo' => $jumlahPenarikan,
                'jumlah_poin' => 0, // Penarikan tidak mempengaruhi poin
                'saldo_sebelum' => $saldoSebelum,
                'saldo_sesudah' => $saldoSesudah,
                'poin_sebelum' => $anggota->total_poin,
                'poin_sesudah' => $anggota->total_poin,
                'setoran_id' => null,
                'keuangan_id' => $dataKeuangan->id, // Link ke data keuangan
                'admin_id' => Auth::id(),
                'keterangan' => $request->catatan 
                    ? "Penarikan saldo tunai - " . $request->catatan
                    : "Penarikan saldo tunai sebesar " . number_format($jumlahPenarikan, 0, ',', '.'),
                'tanggal_transaksi' => now()->toDateString(),
                'waktu_transaksi' => now()->toTimeString(),
            ]);

            // Update anggota saldo
            $anggota->update([
                'saldo_aktif' => $saldoSesudah,
            ]);

            DB::commit();

            return back()->with('success', 'Penarikan saldo berhasil!')
                ->with('penarikan_data', [
                    'nomor_transaksi' => $historyTransaksi->nomor_transaksi,
                    'nomor_keuangan' => $dataKeuangan->nomor_transaksi,
                    'jumlah_penarikan' => $jumlahPenarikan,
                    'saldo_tersisa' => $saldoSesudah,
                    'anggota_nama' => $anggota->nama_lengkap,
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal melakukan penarikan saldo: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update penarikan saldo (edit history transaksi dan keuangan)
     */
    public function update(Request $request, TtDataHistorySaldoAnggota $historyTransaksi)
    {
        // Pastikan ini adalah transaksi penarikan saldo
        if ($historyTransaksi->kategori_transaksi !== 'penarikan_saldo') {
            return back()->withErrors([
                'error' => 'Transaksi ini bukan penarikan saldo.'
            ]);
        }

        $request->validate([
            'jumlah_penarikan' => 'required|numeric|min:1000|max:50000000',
            'catatan' => 'nullable|string|max:255',
        ], [
            'jumlah_penarikan.min' => 'Minimal penarikan adalah Rp 1.000',
            'jumlah_penarikan.max' => 'Maksimal penarikan adalah Rp 50.000.000',
        ]);

        try {
            DB::beginTransaction();

            // Get original data
            $jumlahLama = $historyTransaksi->jumlah_saldo;
            $jumlahBaru = $request->jumlah_penarikan;
            $selisih = $jumlahBaru - $jumlahLama;

            // Get anggota
            $anggota = $historyTransaksi->anggota;

            // Check if new amount is valid with current saldo + old amount
            $saldoTersedia = $anggota->saldo_aktif + $jumlahLama;
            if ($saldoTersedia < $jumlahBaru) {
                return back()->withErrors([
                    'jumlah_penarikan' => 'Saldo tidak mencukupi. Saldo tersedia: ' . 
                        number_format($saldoTersedia, 0, ',', '.')
                ]);
            }

            // Calculate new saldo
            $saldoBaru = $anggota->saldo_aktif - $selisih;

            // Update data keuangan if exists
            if ($historyTransaksi->keuangan) {
                $historyTransaksi->keuangan->update([
                    'jumlah_uang' => $jumlahBaru,
                    'keterangan' => $request->catatan 
                        ? "Penarikan saldo tunai a.n {$anggota->nama_lengkap} - " . $request->catatan . " (diperbarui)"
                        : "Penarikan saldo tunai a.n {$anggota->nama_lengkap} sebesar " . number_format($jumlahBaru, 0, ',', '.') . " (diperbarui)",
                ]);
            }

            // Update history transaksi
            $historyTransaksi->update([
                'jumlah_saldo' => $jumlahBaru,
                'saldo_sesudah' => $saldoBaru,
                'keterangan' => $request->catatan 
                    ? "Penarikan saldo tunai - " . $request->catatan . " (diperbarui)"
                    : "Penarikan saldo tunai sebesar " . number_format($jumlahBaru, 0, ',', '.') . " (diperbarui)",
            ]);

            // Update anggota saldo
            $anggota->update([
                'saldo_aktif' => $saldoBaru,
            ]);

            DB::commit();

            return back()->with('success', 'Data penarikan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal memperbarui penarikan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete penarikan saldo (hapus history transaksi dan keuangan)
     */
    public function destroy(TtDataHistorySaldoAnggota $historyTransaksi)
    {
        // Pastikan ini adalah transaksi penarikan saldo
        if ($historyTransaksi->kategori_transaksi !== 'penarikan_saldo') {
            return back()->withErrors([
                'error' => 'Transaksi ini bukan penarikan saldo.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Get penarikan data
            $jumlahPenarikan = $historyTransaksi->jumlah_saldo;

            // Update anggota saldo (restore the withdrawn amount)
            $anggota = $historyTransaksi->anggota;
            $anggota->update([
                'saldo_aktif' => $anggota->saldo_aktif + $jumlahPenarikan,
            ]);

            // Delete related data keuangan
            if ($historyTransaksi->keuangan) {
                $historyTransaksi->keuangan->delete();
            }

            // Delete history transaksi
            $historyTransaksi->delete();

            DB::commit();

            return back()->with('success', 'Data penarikan berhasil dihapus dan saldo dikembalikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal menghapus penarikan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get info saldo anggota untuk validasi
     */
    public function getInfoSaldo(Request $request, TmDataAnggota $anggota)
    {
        return response()->json([
            'saldo_aktif' => $anggota->saldo_aktif,
            'saldo_formatted' => number_format($anggota->saldo_aktif, 0, ',', '.'),
            'status_aktif' => $anggota->status_aktif,
        ]);
    }

    /**
     * Get statistik penarikan untuk dashboard
     */
    public function getStatistikPenarikan()
    {
        $today = today();
        $statistik = [
            'hari_ini' => TtDataKeuangan::where('kategori_transaksi', 'penarikan_saldo')
                ->whereDate('tanggal_transaksi', $today)
                ->count(),
            'total_hari_ini' => TtDataKeuangan::where('kategori_transaksi', 'penarikan_saldo')
                ->whereDate('tanggal_transaksi', $today)
                ->sum('jumlah_uang'),
            'minggu_ini' => TtDataKeuangan::where('kategori_transaksi', 'penarikan_saldo')
                ->whereBetween('tanggal_transaksi', [
                    $today->copy()->startOfWeek(),
                    $today->copy()->endOfWeek()
                ])->count(),
            'bulan_ini' => TtDataKeuangan::where('kategori_transaksi', 'penarikan_saldo')
                ->whereMonth('tanggal_transaksi', $today->month)
                ->whereYear('tanggal_transaksi', $today->year)
                ->count(),
        ];

        return response()->json($statistik);
    }
}
