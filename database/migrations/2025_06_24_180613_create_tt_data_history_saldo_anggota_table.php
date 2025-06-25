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
        Schema::create('tt_data_history_saldo_anggota', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transaksi', 50)->unique(); // Auto-generated
            $table->foreignId('anggota_id')->constrained('tm_data_anggota')->onDelete('cascade');
            $table->enum('jenis_transaksi', ['masuk', 'keluar']); // masuk = setoran, keluar = penarikan
            $table->enum('kategori_transaksi', [
                'setoran_sampah', // Saldo masuk dari setoran sampah
                'penarikan_saldo', // Saldo keluar karena penarikan
                'tukar_poin', // Tukar poin dengan saldo
                'koreksi_admin' // Koreksi manual oleh admin
            ]);
            $table->decimal('jumlah_saldo', 15, 2); // Jumlah saldo yang bertambah/berkurang
            $table->integer('jumlah_poin')->default(0); // Poin yang didapat (khusus setoran)
            $table->decimal('saldo_sebelum', 15, 2); // Saldo sebelum transaksi
            $table->decimal('saldo_sesudah', 15, 2); // Saldo sesudah transaksi
            $table->integer('poin_sebelum')->default(0); // Poin sebelum transaksi
            $table->integer('poin_sesudah')->default(0); // Poin sesudah transaksi
            $table->foreignId('setoran_id')->nullable()->constrained('tt_data_setoran'); // Referensi ke setoran (jika ada)
            $table->foreignId('keuangan_id')->nullable()->constrained('tt_data_keuangan'); // Referensi ke transaksi keuangan (jika penarikan)
            $table->foreignId('admin_id')->constrained('users'); // Admin yang memproses
            $table->text('keterangan')->nullable();
            $table->date('tanggal_transaksi');
            $table->time('waktu_transaksi');
            $table->timestamps();

            // Index dengan nama yang lebih pendek
            $table->index(['anggota_id', 'tanggal_transaksi'], 'idx_anggota_tanggal');
            $table->index(['jenis_transaksi', 'kategori_transaksi'], 'idx_jenis_kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_history_saldo_anggota');
    }
};
