<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmDataJenisSampah extends Model
{
    protected $table = 'tm_data_jenis_sampah';

    protected $fillable = [
        'nama_jenis',
        'harga_per_kg',
        'poin_per_kg',
        'deskripsi',
        'status_aktif',
    ];

    protected $casts = [
        'harga_per_kg' => 'decimal:2',
        'poin_per_kg' => 'integer',
        'status_aktif' => 'boolean',
    ];

    /**
     * Relasi ke tabel setoran
     */
    public function setoran(): HasMany
    {
        return $this->hasMany(TtDataSetoran::class, 'jenis_sampah_id');
    }

    /**
     * Scope untuk jenis sampah yang aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('status_aktif', true);
    }
}
