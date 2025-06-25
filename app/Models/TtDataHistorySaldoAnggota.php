<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TtDataHistorySaldoAnggota extends Model
{
    protected $table = 'tt_data_history_saldo_anggota';

    protected $fillable = [
        'nomor_transaksi',
        'anggota_id',
        'jenis_transaksi',
        'kategori_transaksi',
        'jumlah_saldo',
        'jumlah_poin',
        'saldo_sebelum',
        'saldo_sesudah',
        'poin_sebelum',
        'poin_sesudah',
        'setoran_id',
        'keuangan_id',
        'admin_id',
        'keterangan',
        'tanggal_transaksi',
        'waktu_transaksi',
    ];

    protected $casts = [
        'jumlah_saldo' => 'decimal:2',
        'jumlah_poin' => 'decimal:2',
        'saldo_sebelum' => 'decimal:2',
        'saldo_sesudah' => 'decimal:2',
        'poin_sebelum' => 'decimal:2',
        'poin_sesudah' => 'decimal:2',
        'tanggal_transaksi' => 'date',
    ];

    /**
     * Generate nomor transaksi otomatis
     */
    public static function generateNomorTransaksi(): string
    {
        $today = now()->format('Ymd');
        $lastNumber = static::whereDate('created_at', today())
            ->where('nomor_transaksi', 'like', "HST{$today}%")
            ->orderBy('nomor_transaksi', 'desc')
            ->first();

        if ($lastNumber) {
            $sequence = intval(substr($lastNumber->nomor_transaksi, -4)) + 1;
        } else {
            $sequence = 1;
        }

        return "HST{$today}" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
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
     * Relasi ke setoran
     */
    public function setoran(): BelongsTo
    {
        return $this->belongsTo(TtDataSetoran::class, 'setoran_id');
    }

    /**
     * Relasi ke keuangan
     */
    public function keuangan(): BelongsTo
    {
        return $this->belongsTo(TtDataKeuangan::class, 'keuangan_id');
    }

    // Add scope for penarikan saldo
    public function scopePenarikanSaldo($query)
    {
        return $query->where('kategori_transaksi', 'penarikan_saldo');
    }

    // Add scope for kategori transaksi
    public function scopeKategori($query, $kategori)
    {
        return $query->where('kategori_transaksi', $kategori);
    }
}
