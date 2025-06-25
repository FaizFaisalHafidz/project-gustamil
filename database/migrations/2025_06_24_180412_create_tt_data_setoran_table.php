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
        Schema::create('tt_data_setoran', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_setoran', 50)->unique(); // Auto-generated
            $table->foreignId('anggota_id')->constrained('tm_data_anggota')->onDelete('cascade');
            $table->foreignId('jenis_sampah_id')->constrained('tm_data_jenis_sampah');
            $table->foreignId('admin_id')->constrained('users'); // Admin yang input
            $table->decimal('berat_kg', 8, 2); // Berat sampah dalam kg
            $table->decimal('harga_per_kg', 10, 2); // Harga saat setoran
            $table->decimal('total_harga', 15, 2); // berat_kg * harga_per_kg
            $table->integer('poin_didapat'); // Poin yang didapat
            $table->date('tanggal_setoran');
            $table->time('waktu_setoran');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_setoran');
    }
};
