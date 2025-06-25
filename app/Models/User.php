<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke tabel anggota (untuk user dengan role anggota)
     */
    public function anggota(): HasOne
    {
        return $this->hasOne(TmDataAnggota::class, 'user_id');
    }

    /**
     * Relasi ke tabel setoran (sebagai pengelola)
     */
    public function setoranAsPengelola(): HasMany
    {
        return $this->hasMany(TtDataSetoran::class, 'admin_id');
    }

    /**
     * Relasi ke tabel keuangan (sebagai pengelola)
     */
    public function keuanganAsPengelola(): HasMany
    {
        return $this->hasMany(TtDataKeuangan::class, 'admin_id');
    }

    /**
     * Relasi ke tabel history saldo (sebagai pengelola)
     */
    public function historySaldoAsPengelola(): HasMany
    {
        return $this->hasMany(TtDataHistorySaldoAnggota::class, 'admin_id');
    }

    /**
     * Check apakah user adalah pengelola
     */
    public function isPengelola(): bool
    {
        return $this->hasRole('pengelola');
    }

    /**
     * Check apakah user adalah anggota
     */
    public function isAnggota(): bool
    {
        return $this->hasRole('anggota');
    }
}
