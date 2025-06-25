<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Kelola Anggota
            'kelola-anggota-view',
            'kelola-anggota-create',
            'kelola-anggota-edit',
            'kelola-anggota-delete',
            
            // Setoran
            'setoran-view',
            'setoran-create',
            'setoran-edit',
            'setoran-delete',
            
            // Keuangan
            'keuangan-view',
            'keuangan-create',
            'keuangan-edit',
            'keuangan-delete',
            
            // Laporan
            'laporan-view',
            'laporan-export',
            
            // Master Data
            'master-data-view',
            'master-data-create',
            'master-data-edit',
            'master-data-delete',
            
            // History
            'history-view-all',
            'history-view-own',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $pengelolaRole = Role::create(['name' => 'pengelola']);
        $anggotaRole = Role::create(['name' => 'anggota']);

        // Pengelola mendapat semua permission
        $pengelolaRole->givePermissionTo(Permission::all());

        // Anggota hanya bisa melihat history sendiri
        $anggotaRole->givePermissionTo([
            'history-view-own'
        ]);
    }
}
