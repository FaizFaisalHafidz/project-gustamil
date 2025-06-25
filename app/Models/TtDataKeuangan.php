<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TtDataKeuangan extends Model
{
    protected $table = 'tt_data_keuangan';

    protected $fillable = [
        'nomor_transaksi',
        'jenis_transaksi',
        'kategori_transaksi',
        'jumlah_uang',
        'anggota_id',
        'admin_id',
        'keterangan',
        'tanggal_transaksi',
        'waktu_transaksi',
    ];

    protected $casts = [
        'jumlah_uang' => 'decimal:2',
        'tanggal_transaksi' => 'date',
    ];

    /**
     * Generate nomor transaksi otomatis
     */
    public static function generateNomorTransaksi(): string
    {
        $today = now()->format('Ymd');
        $lastNumber = static::whereDate('created_at', today())
            ->where('nomor_transaksi', 'like', "KEU{$today}%")
            ->orderBy('nomor_transaksi', 'desc')
            ->first();

        if ($lastNumber) {
            $sequence = intval(substr($lastNumber->nomor_transaksi, -4)) + 1;
        } else {
            $sequence = 1;
        }

        return "KEU{$today}" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Relasi ke anggota
     */
    public function anggota(): BelongsTo
    {
        return $this->belongsTo(TmDataAnggota::class, 'anggota_id');
    }

    /**
     * Relasi ke admin
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Relasi ke history saldo
     */
    public function historySaldo(): HasOne
    {
        return $this->hasOne(TtDataHistorySaldoAnggota::class, 'keuangan_id');
    }
}
