<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataAnggota extends Model
{
    protected $table = 'tm_data_anggota';

    protected $fillable = [
        'user_id',
        'nomor_anggota',
        'nama_lengkap',
        'alamat',
        'nomor_telepon',
        'tanggal_daftar',
        'saldo_aktif',
        'total_poin',
        'status_aktif',
    ];

    protected $casts = [
        'tanggal_daftar' => 'date',
        'saldo_aktif' => 'decimal:2',
        'total_poin' => 'integer',
        'status_aktif' => 'boolean',
    ];

    /**
     * Relasi ke tabel users
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke tabel setoran
     */
    public function setoran(): HasMany
    {
        return $this->hasMany(TtDataSetoran::class, 'anggota_id');
    }

    /**
     * Relasi ke tabel history saldo
     */
    public function historySaldo(): HasMany
    {
        return $this->hasMany(TtDataHistorySaldoAnggota::class, 'anggota_id');
    }

    /**
     * Relasi ke tabel keuangan (untuk penarikan)
     */
    public function keuangan(): HasMany
    {
        return $this->hasMany(TtDataKeuangan::class, 'anggota_id');
    }

    /**
     * Scope untuk anggota yang aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('status_aktif', true);
    }

    /**
     * Generate nomor anggota otomatis
     */
    public static function generateNomorAnggota(): string
    {
        $prefix = 'AGT';
        $year = date('Y');
        $lastNumber = static::where('nomor_anggota', 'like', "{$prefix}{$year}%")
            ->orderBy('nomor_anggota', 'desc')
            ->first();

        if ($lastNumber) {
            $lastSequence = (int) substr($lastNumber->nomor_anggota, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return $prefix . $year . str_pad($newSequence, 4, '0', STR_PAD_LEFT);
    }
}
