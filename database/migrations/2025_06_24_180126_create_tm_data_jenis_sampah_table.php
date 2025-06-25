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
        Schema::create('tm_data_jenis_sampah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jenis', 100);
            $table->decimal('harga_per_kg', 10, 2); // Harga per kilogram
            $table->integer('poin_per_kg')->default(1); // Poin per kilogram
            $table->text('deskripsi')->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tm_data_jenis_sampah');
    }
};
