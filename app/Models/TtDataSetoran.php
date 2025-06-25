<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TtDataSetoran extends Model
{
    protected $table = 'tt_data_setoran';

    protected $fillable = [
        'nomor_setoran',
        'anggota_id',
        'jenis_sampah_id',
        'berat_kg',
        'harga_per_kg',
        'total_harga',
        'poin_didapat',
        'tanggal_setoran',
        'waktu_setoran', // FIXED: Add this field
        'catatan',
        'admin_id',
        'status',
    ];

    protected $casts = [
        'tanggal_setoran' => 'date',
        // 'waktu_setoran' => 'time', // FIXED: Add cast for time
        'berat_kg' => 'decimal:2',
        'harga_per_kg' => 'decimal:2',
        'total_harga' => 'decimal:2',
        'poin_didapat' => 'integer',
    ];

    // Relationships
    public function anggota(): BelongsTo
    {
        return $this->belongsTo(TmDataAnggota::class, 'anggota_id');
    }

    public function jenisSampah(): BelongsTo
    {
        return $this->belongsTo(TmDataJenisSampah::class, 'jenis_sampah_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // FIXED: Add relationship to history saldo
    public function historySaldo(): HasOne
    {
        return $this->hasOne(TtDataHistorySaldoAnggota::class, 'setoran_id');
    }

    // Static method to generate setoran number
    public static function generateNomorSetoran(): string
    {
        $prefix = 'SET';
        $date = now()->format('Ymd');
        
        // Get the last setoran number for today
        $lastSetoran = static::where('nomor_setoran', 'like', "{$prefix}-{$date}-%")
            ->orderBy('nomor_setoran', 'desc')
            ->first();
        
        if ($lastSetoran) {
            // Extract the sequence number from the last setoran
            $lastNumber = explode('-', $lastSetoran->nomor_setoran);
            $sequence = isset($lastNumber[2]) ? intval($lastNumber[2]) + 1 : 1;
        } else {
            $sequence = 1;
        }
        
        return "{$prefix}-{$date}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
