<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TmDataJenisSampah;

class JenisSampahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenisSampah = [
            [
                'nama_jenis' => 'Plastik Botol',
                'harga_per_kg' => 3000,
                'poin_per_kg' => 3,
                'deskripsi' => 'Botol plastik bekas minuman (PET)',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Kertas Koran',
                'harga_per_kg' => 2000,
                'poin_per_kg' => 2,
                'deskripsi' => 'Koran bekas dan kertas sejenis',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Kardus',
                'harga_per_kg' => 2500,
                'poin_per_kg' => 2,
                'deskripsi' => 'Kardus bekas dan kertas tebal',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Kaleng Aluminium',
                'harga_per_kg' => 5000,
                'poin_per_kg' => 5,
                'deskripsi' => 'Kaleng minuman bekas (aluminium)',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Besi/Metal',
                'harga_per_kg' => 4000,
                'poin_per_kg' => 4,
                'deskripsi' => 'Besi bekas dan logam lainnya',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Plastik Campur',
                'harga_per_kg' => 1500,
                'poin_per_kg' => 1,
                'deskripsi' => 'Plastik bekas lainnya (non-botol)',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Kertas Putih',
                'harga_per_kg' => 3500,
                'poin_per_kg' => 3,
                'deskripsi' => 'Kertas HVS bekas dan kertas putih',
                'status_aktif' => true,
            ],
            [
                'nama_jenis' => 'Tembaga',
                'harga_per_kg' => 85000,
                'poin_per_kg' => 85,
                'deskripsi' => 'Kabel tembaga dan logam tembaga',
                'status_aktif' => true,
            ],
        ];

        foreach ($jenisSampah as $jenis) {
            TmDataJenisSampah::create($jenis);
        }

        $this->command->info('Jenis sampah berhasil di-seed: ' . count($jenisSampah) . ' jenis');
    }
}
