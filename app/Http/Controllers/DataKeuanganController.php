<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\TtDataKeuangan;
use App\Models\TmDataAnggota;
use App\Models\TtDataHistorySaldoAnggota;
use Inertia\Inertia;

class DataKeuanganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TtDataKeuangan::with(['anggota', 'admin'])
            ->orderBy('created_at', 'desc');

        // Filter by jenis transaksi
        if ($request->jenis_transaksi) {
            $query->where('jenis_transaksi', $request->jenis_transaksi);
        }

        // Filter by kategori transaksi
        if ($request->kategori_transaksi) {
            $query->where('kategori_transaksi', $request->kategori_transaksi);
        }

        // Filter by date range
        if ($request->tanggal_mulai) {
            $query->whereDate('tanggal_transaksi', '>=', $request->tanggal_mulai);
        }
        if ($request->tanggal_selesai) {
            $query->whereDate('tanggal_transaksi', '<=', $request->tanggal_selesai);
        }

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nomor_transaksi', 'like', "%{$request->search}%")
                  ->orWhere('keterangan', 'like', "%{$request->search}%")
                  ->orWhereHas('anggota', function ($sq) use ($request) {
                      $sq->where('nama_lengkap', 'like', "%{$request->search}%")
                        ->orWhere('nomor_anggota', 'like', "%{$request->search}%");
                  });
            });
        }

        $keuangan = $query->paginate(15)->withQueryString();

        // Get summary statistics
        $summary = $this->getSummaryStatistics($request);

        return Inertia::render('DataKeuangan/Index', [
            'keuangan' => $keuangan,
            'summary' => $summary,
            'filters' => $request->only(['jenis_transaksi', 'kategori_transaksi', 'tanggal_mulai', 'tanggal_selesai', 'search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Log::info('DataKeuangan Store Request:', $request->all());

        $request->validate([
            'jenis_transaksi' => 'required|in:masuk,keluar',
            'kategori_transaksi' => 'required|in:penjualan_pengepul,keperluan_operasional,penarikan_anggota',
            'jumlah_uang' => 'required|numeric|min:1000|max:100000000',
            'anggota_id' => 'nullable|exists:tm_data_anggota,id',
            'keterangan' => 'required|string|max:255',
        ], [
            'kategori_transaksi.in' => 'Kategori transaksi harus dipilih dari: Penjualan Pengepul, Keperluan Operasional, atau Penarikan Anggota',
            'jumlah_uang.min' => 'Minimal jumlah adalah Rp 1.000',
            'jumlah_uang.max' => 'Maksimal jumlah adalah Rp 100.000.000',
            'jenis_transaksi.required' => 'Jenis transaksi harus dipilih',
            'kategori_transaksi.required' => 'Kategori transaksi harus dipilih',
            'keterangan.required' => 'Keterangan harus diisi',
        ]);

        try {
            DB::beginTransaction();

            \Log::info('Creating TtDataKeuangan with data:', [
                'nomor_transaksi' => TtDataKeuangan::generateNomorTransaksi(),
                'jenis_transaksi' => $request->jenis_transaksi,
                'kategori_transaksi' => $request->kategori_transaksi,
                'jumlah_uang' => $request->jumlah_uang,
                'anggota_id' => $request->anggota_id,
                'admin_id' => Auth::id(),
                'keterangan' => $request->keterangan,
            ]);

            // Create data keuangan record
            $dataKeuangan = TtDataKeuangan::create([
                'nomor_transaksi' => TtDataKeuangan::generateNomorTransaksi(),
                'jenis_transaksi' => $request->jenis_transaksi,
                'kategori_transaksi' => $request->kategori_transaksi,
                'jumlah_uang' => $request->jumlah_uang,
                'anggota_id' => $request->anggota_id,
                'admin_id' => Auth::id(),
                'keterangan' => $request->keterangan,
                'tanggal_transaksi' => now()->toDateString(),
                'waktu_transaksi' => now()->toTimeString(),
            ]);

            \Log::info('TtDataKeuangan created successfully:', $dataKeuangan->toArray());

            // If this affects member's balance (only for keperluan_operasional with anggota)
            if ($request->anggota_id && $request->kategori_transaksi === 'keperluan_operasional') {
                $anggota = TmDataAnggota::findOrFail($request->anggota_id);
                
                $saldoSebelum = $anggota->saldo_aktif;
                $jumlahSaldo = $request->jenis_transaksi === 'masuk' 
                    ? $request->jumlah_uang 
                    : -$request->jumlah_uang;
                $saldoSesudah = $saldoSebelum + $jumlahSaldo;

                // Update anggota saldo
                $anggota->update([
                    'saldo_aktif' => $saldoSesudah,
                ]);

                // Create history saldo
                TtDataHistorySaldoAnggota::create([
                    'nomor_transaksi' => TtDataHistorySaldoAnggota::generateNomorTransaksi(),
                    'anggota_id' => $anggota->id,
                    'jenis_transaksi' => $request->jenis_transaksi,
                    'kategori_transaksi' => $request->kategori_transaksi,
                    'jumlah_saldo' => $request->jumlah_uang,
                    'jumlah_poin' => 0,
                    'saldo_sebelum' => $saldoSebelum,
                    'saldo_sesudah' => $saldoSesudah,
                    'poin_sebelum' => $anggota->total_poin,
                    'poin_sesudah' => $anggota->total_poin,
                    'setoran_id' => null,
                    'keuangan_id' => $dataKeuangan->id,
                    'admin_id' => Auth::id(),
                    'keterangan' => $request->keterangan,
                    'tanggal_transaksi' => now()->toDateString(),
                    'waktu_transaksi' => now()->toTimeString(),
                ]);

                \Log::info('History saldo created for anggota:', $anggota->id);
            }

            DB::commit();

            \Log::info('Transaction committed successfully');

            return redirect()->back()->with('success', 'Data transaksi keuangan berhasil ditambahkan!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error in DataKeuangan store:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->withErrors([
                'error' => 'Gagal menambahkan transaksi: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TtDataKeuangan $keuangan)
    {
        // Prevent editing of auto-generated transactions
        if (in_array($keuangan->kategori_transaksi, ['penarikan_anggota']) && 
            strpos($keuangan->keterangan, 'Penarikan saldo') !== false) {
            return back()->withErrors([
                'error' => 'Transaksi penarikan saldo otomatis tidak dapat diedit langsung. Gunakan fitur edit pada modul penarikan saldo.'
            ]);
        }

        $request->validate([
            'jenis_transaksi' => 'required|in:masuk,keluar',
            'kategori_transaksi' => 'required|in:penjualan_pengepul,keperluan_operasional,penarikan_anggota',
            'jumlah_uang' => 'required|numeric|min:1000|max:100000000',
            'anggota_id' => 'nullable|exists:tm_data_anggota,id',
            'keterangan' => 'required|string|max:255',
        ], [
            'kategori_transaksi.in' => 'Kategori transaksi harus dipilih dari: Penjualan Pengepul, Keperluan Operasional, atau Penarikan Anggota',
            'jumlah_uang.min' => 'Minimal jumlah adalah Rp 1.000',
            'jumlah_uang.max' => 'Maksimal jumlah adalah Rp 100.000.000',
        ]);

        try {
            DB::beginTransaction();

            $jumlahLama = $keuangan->jumlah_uang;
            $jenisLama = $keuangan->jenis_transaksi;
            
            // Update data keuangan
            $keuangan->update([
                'jenis_transaksi' => $request->jenis_transaksi,
                'kategori_transaksi' => $request->kategori_transaksi,
                'jumlah_uang' => $request->jumlah_uang,
                'anggota_id' => $request->anggota_id,
                'keterangan' => $request->keterangan,
            ]);

            // Update related history saldo if exists
            if ($keuangan->historySaldo) {
                $historyBalance = $keuangan->historySaldo;
                $anggota = $historyBalance->anggota;
                
                // Reverse old transaction
                $oldAmount = $jenisLama === 'masuk' ? $jumlahLama : -$jumlahLama;
                $newAmount = $request->jenis_transaksi === 'masuk' ? $request->jumlah_uang : -$request->jumlah_uang;
                $difference = $newAmount - $oldAmount;
                
                $saldoBaru = $anggota->saldo_aktif + $difference;
                
                // Update anggota saldo
                $anggota->update([
                    'saldo_aktif' => $saldoBaru,
                ]);

                // Update history record
                $historyBalance->update([
                    'jenis_transaksi' => $request->jenis_transaksi,
                    'kategori_transaksi' => $request->kategori_transaksi,
                    'jumlah_saldo' => $request->jumlah_uang,
                    'saldo_sesudah' => $saldoBaru,
                    'keterangan' => $request->keterangan . ' (diperbarui)',
                ]);
            }

            DB::commit();

            return back()->with('success', 'Data transaksi keuangan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal memperbarui transaksi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TtDataKeuangan $keuangan)
    {
        // Prevent deletion of auto-generated transactions
        if (in_array($keuangan->kategori_transaksi, ['penarikan_saldo', 'setoran_sampah'])) {
            return back()->withErrors([
                'error' => 'Transaksi otomatis tidak dapat dihapus langsung. Gunakan fitur hapus pada modul terkait.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Reverse saldo if this transaction affects member balance
            if ($keuangan->historySaldo) {
                $historyBalance = $keuangan->historySaldo;
                $anggota = $historyBalance->anggota;
                
                $amount = $keuangan->jenis_transaksi === 'masuk' ? $keuangan->jumlah_uang : -$keuangan->jumlah_uang;
                
                // Reverse the transaction
                $anggota->update([
                    'saldo_aktif' => $anggota->saldo_aktif - $amount,
                ]);

                // Delete history record
                $historyBalance->delete();
            }

            // Delete keuangan record
            $keuangan->delete();

            DB::commit();

            return back()->with('success', 'Data transaksi keuangan berhasil dihapus!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal menghapus transaksi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get summary statistics
     */
    private function getSummaryStatistics($request)
    {
        $query = TtDataKeuangan::query();

        // Apply same filters as main query
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

        return [
            'total_masuk' => (clone $query)->where('jenis_transaksi', 'masuk')->sum('jumlah_uang'),
            'total_keluar' => (clone $query)->where('jenis_transaksi', 'keluar')->sum('jumlah_uang'),
            'total_transaksi' => $query->count(),
            'saldo_bersih' => (clone $query)->where('jenis_transaksi', 'masuk')->sum('jumlah_uang') - 
                             (clone $query)->where('jenis_transaksi', 'keluar')->sum('jumlah_uang'),
        ];
    }

    /**
     * Get kategori transaksi untuk dropdown
     */
    public function getKategoriTransaksi()
    {
        $kategori = [
            'bonus' => 'Bonus',
            'koreksi_saldo' => 'Koreksi Saldo',
            'penalti' => 'Penalti',
            'operasional' => 'Biaya Operasional',
            'pemeliharaan' => 'Pemeliharaan',
            'peralatan' => 'Pembelian Peralatan',
            'transport' => 'Transport',
            'administrasi' => 'Administrasi',
            'lain_lain' => 'Lain-lain',
        ];

        return response()->json($kategori);
    }

    /**
     * Export data keuangan
     */
    public function export(Request $request)
    {
        // TODO: Implement export functionality
        return back()->with('info', 'Fitur export akan segera tersedia');
    }
}
