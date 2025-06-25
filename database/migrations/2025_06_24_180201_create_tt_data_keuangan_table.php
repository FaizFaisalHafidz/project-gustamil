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
        Schema::create('tt_data_keuangan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transaksi', 50)->unique(); // Auto-generated
            $table->enum('jenis_transaksi', ['masuk', 'keluar']); // masuk/keluar
            $table->enum('kategori_transaksi', [
                'penjualan_pengepul', // Uang masuk dari penjualan ke pengepul
                'keperluan_operasional', // Uang keluar untuk operasional
                'penarikan_anggota' // Uang keluar untuk penarikan saldo anggota
            ]);
            $table->decimal('jumlah_uang', 15, 2);
            $table->foreignId('anggota_id')->nullable()->constrained('tm_data_anggota'); // Untuk penarikan anggota
            $table->foreignId('admin_id')->constrained('users'); // Admin yang input
            $table->text('keterangan')->nullable();
            $table->date('tanggal_transaksi');
            $table->time('waktu_transaksi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_keuangan');
    }
};
