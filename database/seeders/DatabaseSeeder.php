<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RolePermissionSeeder::class,     // 1. Role dan permission dulu
            JenisSampahSeeder::class,        // 2. Master data jenis sampah  
            UserSeeder::class,               // 3. Users dan anggota
            SetoranDummySeeder::class,       // 4. Data setoran dummy (terakhir)
        ]);
    }
}
