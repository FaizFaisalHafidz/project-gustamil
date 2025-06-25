<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TmDataAnggota;
use App\Models\TmDataJenisSampah;
use App\Models\TtDataSetoran;
use App\Models\TtDataHistorySaldoAnggota;
use App\Models\User;
use Carbon\Carbon;

class SetoranDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada pengelola
        $pengelola = User::role('pengelola')->first();
        if (!$pengelola) {
            $this->command->error('Tidak ada user dengan role pengelola!');
            return;
        }

        // Pastikan ada anggota
        $anggotaList = TmDataAnggota::all();
        if ($anggotaList->count() === 0) {
            $this->command->error('Tidak ada data anggota!');
            return;
        }

        // Pastikan ada jenis sampah
        $jenisSampahList = TmDataJenisSampah::all();
        if ($jenisSampahList->count() === 0) {
            $this->command->error('Tidak ada data jenis sampah!');
            return;
        }

        $this->command->info('Membuat data setoran dummy...');

        // Generate dummy setoran untuk 3 bulan terakhir
        $startDate = Carbon::now()->subMonths(3);
        $endDate = Carbon::now();

        foreach ($anggotaList as $anggota) {
            // Setiap anggota setor 2-5 kali dalam 3 bulan
            $jumlahSetoran = rand(2, 5);
            
            for ($i = 0; $i < $jumlahSetoran; $i++) {
                $tanggalSetoran = Carbon::createFromTimestamp(
                    rand($startDate->timestamp, $endDate->timestamp)
                )->format('Y-m-d');
                
                $jenisSampah = $jenisSampahList->random();
                $beratKg = rand(100, 1099) / 100; // 1.00 - 10.99 kg
                $hargaPerKg = $jenisSampah->harga_per_kg;
                $totalHarga = $beratKg * $hargaPerKg;
                $poinDidapat = (int)($beratKg * $jenisSampah->poin_per_kg);

                // Create setoran
                $setoran = TtDataSetoran::create([
                    'nomor_setoran' => TtDataSetoran::generateNomorSetoran(),
                    'anggota_id' => $anggota->id,
                    'jenis_sampah_id' => $jenisSampah->id,
                    'admin_id' => $pengelola->id,
                    'berat_kg' => $beratKg,
                    'harga_per_kg' => $hargaPerKg,
                    'total_harga' => $totalHarga,
                    'poin_didapat' => $poinDidapat,
                    'tanggal_setoran' => $tanggalSetoran,
                    'waktu_setoran' => sprintf('%02d:%02d:00', rand(8, 17), rand(0, 59)),
                    'catatan' => 'Setoran sampah ' . $jenisSampah->nama_jenis,
                ]);

                // Get current saldo and poin
                $saldoSebelum = $anggota->saldo_aktif;
                $poinSebelum = $anggota->total_poin;
                
                // Update anggota saldo and poin
                $anggota->update([
                    'saldo_aktif' => $saldoSebelum + $totalHarga,
                    'total_poin' => $poinSebelum + $poinDidapat,
                    'total_setoran_kg' => $anggota->total_setoran_kg + $beratKg,
                ]);

                // Create history saldo
                TtDataHistorySaldoAnggota::create([
                    'nomor_transaksi' => TtDataHistorySaldoAnggota::generateNomorTransaksi(),
                    'anggota_id' => $anggota->id,
                    'jenis_transaksi' => 'masuk',
                    'kategori_transaksi' => 'setoran_sampah',
                    'jumlah_saldo' => $totalHarga,
                    'jumlah_poin' => $poinDidapat,
                    'saldo_sebelum' => $saldoSebelum,
                    'saldo_sesudah' => $saldoSebelum + $totalHarga,
                    'poin_sebelum' => $poinSebelum,
                    'poin_sesudah' => $poinSebelum + $poinDidapat,
                    'setoran_id' => $setoran->id,
                    'admin_id' => $pengelola->id,
                    'keterangan' => 'Setoran sampah ' . $jenisSampah->nama_jenis . ' (' . number_format($beratKg, 2) . ' kg)',
                    'tanggal_transaksi' => $tanggalSetoran,
                    'waktu_transaksi' => $setoran->waktu_setoran,
                ]);
            }

            $this->command->info("✓ Seeded setoran untuk: {$anggota->nama_lengkap}");
        }

        $this->command->info('✅ Seeder setoran dummy selesai!');
    }
}
