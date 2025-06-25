<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\TmDataAnggota;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Pengelola User
        $pengelola = User::create([
            'name' => 'Pengelola Bank Sampah',
            'email' => 'pengelola@banksampahart.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $pengelola->assignRole('pengelola');

        // Create Anggota Users
        $anggotaData = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@example.com',
                'nama_lengkap' => 'Budi Santoso',
                'nomor_telepon' => '081234567890',
            ],
            [
                'name' => 'Siti Rahayu',
                'email' => 'siti@example.com',
                'nama_lengkap' => 'Siti Rahayu',
                'nomor_telepon' => '081234567891',
            ],
            [
                'name' => 'Ahmad Wijaya',
                'email' => 'ahmad@example.com',
                'nama_lengkap' => 'Ahmad Wijaya',
                'nomor_telepon' => '081234567892',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@example.com',
                'nama_lengkap' => 'Dewi Lestari',
                'nomor_telepon' => '081234567893',
            ],
            [
                'name' => 'Rudi Hartono',
                'email' => 'rudi@example.com',
                'nama_lengkap' => 'Rudi Hartono',
                'nomor_telepon' => '081234567894',
            ],
        ];

        foreach ($anggotaData as $data) {
            // Create User dengan password auto-generated
            $password = 'password123'; // Generate password sederhana
            
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('anggota');

            // Create Anggota Profile
            TmDataAnggota::create([
                'user_id' => $user->id,
                'nomor_anggota' => TmDataAnggota::generateNomorAnggota(),
                'nama_lengkap' => $data['nama_lengkap'],
                'nomor_telepon' => $data['nomor_telepon'],
                'saldo_aktif' => 0,
                'total_poin' => 0,
                'total_setoran_kg' => 0,
                'status_aktif' => true,
            ]);

            // Output info untuk development
            echo "Anggota: {$data['name']} | Email: {$data['email']} | Password: {$password}\n";
        }
    }
}
