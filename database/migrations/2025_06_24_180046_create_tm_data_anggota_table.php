<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tm_data_anggota', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nomor_anggota', 20)->unique(); // ID Anggota (auto-generated)
            $table->string('nama_lengkap', 100);
            $table->string('nomor_telepon', 20)->nullable();
            $table->decimal('saldo_aktif', 15, 2)->default(0); // Saldo yang bisa ditarik
            $table->integer('total_poin')->default(0); // Total poin terkumpul
            $table->decimal('total_setoran_kg', 10, 2)->default(0); // Total berat setoran
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tm_data_anggota');
    }
};
