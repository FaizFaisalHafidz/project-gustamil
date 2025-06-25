<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TmDataAnggota;
use App\Models\TtDataSetoran;
use App\Models\TtDataHistorySaldoAnggota;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DataAnggotaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TmDataAnggota::with(['user'])
            ->when($request->search, function ($query, $search) {
                return $query->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nomor_anggota', 'like', "%{$search}%")
                    ->orWhere('nomor_telepon', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status_aktif', $status === 'aktif');
            });

        $anggota = $query->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('DataAnggota/Index', [
            'anggota' => $anggota,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('DataAnggota/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'nomor_telepon' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            // Generate password otomatis
            $password = 'password123';

            // Create User
            $user = User::create([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('anggota');

            // Create Anggota Profile
            TmDataAnggota::create([
                'user_id' => $user->id,
                'nomor_anggota' => TmDataAnggota::generateNomorAnggota(),
                'nama_lengkap' => $request->nama_lengkap,
                'nomor_telepon' => $request->nomor_telepon,
                'saldo_aktif' => 0,
                'total_poin' => 0,
                'total_setoran_kg' => 0,
                'status_aktif' => true,
            ]);

            // Store password untuk ditampilkan
            session()->flash('password', $password);
        });

        return redirect()->route('data-anggota.index')
            ->with('success', 'Anggota berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(TmDataAnggota $anggota)
    {
        $anggota->load(['user']);

        // Get setoran history
        $setoran = TtDataSetoran::with(['jenisSampah', 'admin'])
            ->where('anggota_id', $anggota->id)
            ->orderBy('tanggal_setoran', 'desc')
            ->orderBy('waktu_setoran', 'desc')
            ->paginate(10);

        // Get history saldo
        $historySaldo = TtDataHistorySaldoAnggota::with(['admin'])
            ->where('anggota_id', $anggota->id)
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('waktu_transaksi', 'desc')
            ->paginate(10);

        // Summary data
        $summary = [
            'total_setoran' => TtDataSetoran::where('anggota_id', $anggota->id)->count(),
            'total_berat_kg' => $anggota->total_setoran_kg,
            'saldo_aktif' => $anggota->saldo_aktif,
            'total_poin' => $anggota->total_poin,
            'setoran_bulan_ini' => TtDataSetoran::where('anggota_id', $anggota->id)
                ->whereMonth('tanggal_setoran', now()->month)
                ->whereYear('tanggal_setoran', now()->year)
                ->count(),
        ];

        return Inertia::render('DataAnggota/Show', [
            'anggota' => $anggota,
            'setoran' => $setoran,
            'historySaldo' => $historySaldo,
            'summary' => $summary,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TmDataAnggota $anggota)
    {
        $anggota->load(['user']);

        return Inertia::render('DataAnggota/Edit', [
            'anggota' => $anggota,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TmDataAnggota $anggota)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $anggota->user_id,
            'nomor_telepon' => 'nullable|string|max:20',
            'status_aktif' => 'required|boolean',
        ]);

        DB::transaction(function () use ($request, $anggota) {
            // Update User
            $anggota->user->update([
                'name' => $request->nama_lengkap,
                'email' => $request->email,
            ]);

            // Update Anggota
            $anggota->update([
                'nama_lengkap' => $request->nama_lengkap,
                'nomor_telepon' => $request->nomor_telepon,
                'status_aktif' => $request->status_aktif,
            ]);
        });

        return redirect()->route('data-anggota.index', $anggota)
            ->with('success', 'Data anggota berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TmDataAnggota $anggota)
    {
        DB::transaction(function () use ($anggota) {
            // Delete User (akan cascade delete anggota)
            $anggota->user->delete();
        });

        return redirect()->route('data-anggota.index')
            ->with('success', 'Anggota berhasil dihapus!');
    }

    /**
     * Reset password anggota
     */
    public function resetPassword(TmDataAnggota $anggota)
    {
        $newPassword = 'password123' ;

        $anggota->user->update([
            'password' => Hash::make($newPassword),
        ]);

        return back()->with([
            'success' => 'Password berhasil direset!',
            'password' => $newPassword,
        ]);
    }

    /**
     * Toggle status aktif anggota
     */
    public function toggleStatus(TmDataAnggota $anggota)
    {
        $anggota->update([
            'status_aktif' => !$anggota->status_aktif,
        ]);

        $status = $anggota->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Anggota berhasil {$status}!");
    }

    /**
     * Export data anggota
     */
    public function export(Request $request)
    {
        // TODO: Implement export functionality
        return back()->with('info', 'Fitur export akan segera tersedia');
    }

    /**
     * Get active anggota for API calls
     */
    public function getAnggotaAktif()
    {
        $anggotaAktif = TmDataAnggota::where('status_aktif', true)
            ->select('id', 'nomor_anggota', 'nama_lengkap', 'saldo_aktif')
            ->orderBy('nama_lengkap', 'asc')
            ->get();

        return response()->json($anggotaAktif);
    }
}
