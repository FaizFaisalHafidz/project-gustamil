<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\TtDataSetoran;
use App\Models\TmDataAnggota;
use App\Models\TmDataJenisSampah;
use App\Models\TtDataHistorySaldoAnggota;

class SetoranController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'anggota_id' => 'required|exists:tm_data_anggota,id',
            'jenis_sampah_id' => 'required|exists:tm_data_jenis_sampah,id',
            'berat_kg' => 'required|numeric|min:0.01|max:9999.99',
            'catatan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Get anggota and jenis sampah data
            $anggota = TmDataAnggota::findOrFail($request->anggota_id);
            $jenisSampah = TmDataJenisSampah::findOrFail($request->jenis_sampah_id);

            // Check if anggota is active
            if (!$anggota->status_aktif) {
                return back()->withErrors([
                    'anggota_id' => 'Anggota tidak aktif, tidak dapat melakukan setoran.'
                ]);
            }

            // Check if jenis sampah is active
            if (!$jenisSampah->status_aktif) {
                return back()->withErrors([
                    'jenis_sampah_id' => 'Jenis sampah tidak aktif, tidak dapat digunakan untuk setoran.'
                ]);
            }

            // Calculate total harga and poin
            $beratKg = $request->berat_kg;
            $hargaPerKg = $jenisSampah->harga_per_kg;
            $poinPerKg = $jenisSampah->poin_per_kg;
            $totalHarga = $beratKg * $hargaPerKg;
            $poinDidapat = (int) ($beratKg * $poinPerKg);

            // FIXED: Create setoran record dengan waktu_setoran
            $setoran = TtDataSetoran::create([
                'nomor_setoran' => TtDataSetoran::generateNomorSetoran(),
                'anggota_id' => $anggota->id,
                'jenis_sampah_id' => $jenisSampah->id,
                'admin_id' => Auth::id(),
                'berat_kg' => $beratKg,
                'harga_per_kg' => $hargaPerKg,
                'total_harga' => $totalHarga,
                'poin_didapat' => $poinDidapat,
                'tanggal_setoran' => now()->toDateString(),
                'waktu_setoran' => now()->toTimeString(), // FIXED: Add this field
                'catatan' => $request->catatan,
                // 'status' => 'aktif', // FIXED: Add status field
            ]);

            // Update saldo and poin anggota
            $saldoSebelum = $anggota->saldo_aktif;
            $poinSebelum = $anggota->total_poin;
            $saldoSesudah = $saldoSebelum + $totalHarga;
            $poinSesudah = $poinSebelum + $poinDidapat;

            $anggota->update([
                'saldo_aktif' => $saldoSesudah,
                'total_poin' => $poinSesudah,
                'total_setoran_kg' => $anggota->total_setoran_kg + $beratKg,
            ]);

            // FIXED: Create history saldo record dengan waktu_transaksi
            TtDataHistorySaldoAnggota::create([
                'nomor_transaksi' => TtDataHistorySaldoAnggota::generateNomorTransaksi(),
                'anggota_id' => $anggota->id,
                'jenis_transaksi' => 'masuk',
                'kategori_transaksi' => 'setoran_sampah',
                'jumlah_saldo' => $totalHarga,
                'jumlah_poin' => $poinDidapat,
                'saldo_sebelum' => $saldoSebelum,
                'saldo_sesudah' => $saldoSesudah,
                'poin_sebelum' => $poinSebelum,
                'poin_sesudah' => $poinSesudah,
                'setoran_id' => $setoran->id,
                'admin_id' => Auth::id(),
                'keterangan' => "Setoran {$jenisSampah->nama_jenis} seberat {$beratKg} kg",
                'tanggal_transaksi' => now()->toDateString(),
                'waktu_transaksi' => now()->toTimeString(), // FIXED: Add this field
            ]);

            DB::commit();

            return back()->with('success', 'Setoran berhasil dicatat!')
                ->with('setoran_data', [
                    'nomor_setoran' => $setoran->nomor_setoran,
                    'jenis_sampah' => $jenisSampah->nama_jenis,
                    'berat_kg' => $beratKg,
                    'total_harga' => $totalHarga,
                    'poin_didapat' => $poinDidapat,
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal mencatat setoran: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TtDataSetoran $setoran)
    {
        $request->validate([
            'berat_kg' => 'required|numeric|min:0.01|max:9999.99',
            'catatan' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Get original data
            $beratLama = $setoran->berat_kg;
            $totalHargaLama = $setoran->total_harga;
            $poinLama = $setoran->poin_didapat;

            // Calculate new values
            $beratBaru = $request->berat_kg;
            $hargaPerKg = $setoran->harga_per_kg;
            $poinPerKg = $setoran->jenisSampah->poin_per_kg;
            $totalHargaBaru = $beratBaru * $hargaPerKg;
            $poinBaru = (int) ($beratBaru * $poinPerKg);

            // Calculate differences
            $selisihSaldo = $totalHargaBaru - $totalHargaLama;
            $selisihPoin = $poinBaru - $poinLama;
            $selisihBerat = $beratBaru - $beratLama;

            // Update setoran
            $setoran->update([
                'berat_kg' => $beratBaru,
                'total_harga' => $totalHargaBaru,
                'poin_didapat' => $poinBaru,
                'catatan' => $request->catatan,
            ]);

            // Update anggota saldo and poin
            $anggota = $setoran->anggota;
            $anggota->update([
                'saldo_aktif' => $anggota->saldo_aktif + $selisihSaldo,
                'total_poin' => $anggota->total_poin + $selisihPoin,
                'total_setoran_kg' => $anggota->total_setoran_kg + $selisihBerat,
            ]);

            // Update history saldo
            if ($setoran->historySaldo) {
                $historySaldo = $setoran->historySaldo;
                $historySaldo->update([
                    'jumlah_saldo' => $totalHargaBaru,
                    'jumlah_poin' => $poinBaru,
                    'saldo_sesudah' => $anggota->saldo_aktif,
                    'poin_sesudah' => $anggota->total_poin,
                    'keterangan' => "Setoran {$setoran->jenisSampah->nama_jenis} seberat {$beratBaru} kg (diperbarui)",
                ]);
            }

            DB::commit();

            return back()->with('success', 'Data setoran berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal memperbarui setoran: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TtDataSetoran $setoran)
    {
        try {
            DB::beginTransaction();

            // Get setoran data
            $totalHarga = $setoran->total_harga;
            $poinDidapat = $setoran->poin_didapat;
            $beratKg = $setoran->berat_kg;

            // Update anggota saldo and poin (reverse the transaction)
            $anggota = $setoran->anggota;
            $anggota->update([
                'saldo_aktif' => $anggota->saldo_aktif - $totalHarga,
                'total_poin' => $anggota->total_poin - $poinDidapat,
                'total_setoran_kg' => $anggota->total_setoran_kg - $beratKg,
            ]);

            // Delete related history saldo
            if ($setoran->historySaldo) {
                $setoran->historySaldo->delete();
            }

            // Delete setoran
            $setoran->delete();

            DB::commit();

            return back()->with('success', 'Data setoran berhasil dihapus!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Gagal menghapus setoran: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get jenis sampah aktif untuk dropdown
     */
    public function getJenisSampahAktif()
    {
        $jenisSampah = TmDataJenisSampah::aktif()
            ->select('id', 'nama_jenis', 'harga_per_kg', 'poin_per_kg')
            ->orderBy('nama_jenis')
            ->get();

        return response()->json($jenisSampah);
    }

    /**
     * Get anggota aktif untuk autocomplete
     */
    public function getAnggotaAktif(Request $request)
    {
        $query = TmDataAnggota::with('user:id,email')
            ->where('status_aktif', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                  ->orWhere('nomor_anggota', 'like', "%{$request->search}%");
            });
        }

        $anggota = $query->select('id', 'nomor_anggota', 'nama_lengkap', 'user_id')
            ->orderBy('nama_lengkap')
            ->limit(10)
            ->get();

        return response()->json($anggota);
    }
}
