<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TmDataJenisSampah;
use Illuminate\Support\Facades\DB;

class JenisSampahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TmDataJenisSampah::query()
            ->when($request->search, function ($query, $search) {
                return $query->where('nama_jenis', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status_aktif', $status === 'aktif');
            });

        $jenisSampah = $query->orderBy('nama_jenis')
            ->paginate(10)
            ->withQueryString();

        // Summary data
        $summary = [
            'total_jenis' => TmDataJenisSampah::count(),
            'aktif' => TmDataJenisSampah::where('status_aktif', true)->count(),
            'nonaktif' => TmDataJenisSampah::where('status_aktif', false)->count(),
            'harga_tertinggi' => TmDataJenisSampah::max('harga_per_kg') ?? 0,
        ];

        return Inertia::render('JenisSampah/Index', [
            'jenisSampah' => $jenisSampah,
            'filters' => $request->only(['search', 'status']),
            'summary' => $summary,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('JenisSampah/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_jenis' => 'required|string|max:100|unique:tm_data_jenis_sampah,nama_jenis',
            'harga_per_kg' => 'required|numeric|min:0|max:999999.99',
            'poin_per_kg' => 'required|integer|min:0|max:999',
            'deskripsi' => 'nullable|string|max:255',
            'status_aktif' => 'required|boolean',
        ]);

        TmDataJenisSampah::create([
            'nama_jenis' => $request->nama_jenis,
            'harga_per_kg' => $request->harga_per_kg,
            'poin_per_kg' => $request->poin_per_kg,
            'deskripsi' => $request->deskripsi,
            'status_aktif' => $request->status_aktif,
        ]);

        return redirect()->route('jenis-sampah.index')
            ->with('success', 'Jenis sampah berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(TmDataJenisSampah $jenisSampah)
    {
        // Load related data
        $jenisSampah->load(['setoran' => function($query) {
            $query->with(['anggota', 'admin'])
                ->orderBy('tanggal_setoran', 'desc')
                ->limit(10);
        }]);

        // Statistics
        $stats = [
            'total_setoran' => $jenisSampah->setoran()->count(),
            'total_berat_kg' => $jenisSampah->setoran()->sum('berat_kg'),
            'total_nilai' => $jenisSampah->setoran()->sum('total_harga'),
            'setoran_bulan_ini' => $jenisSampah->setoran()
                ->whereMonth('tanggal_setoran', now()->month)
                ->whereYear('tanggal_setoran', now()->year)
                ->count(),
        ];

        return Inertia::render('JenisSampah/Show', [
            'jenisSampah' => $jenisSampah,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TmDataJenisSampah $jenisSampah)
    {
        return Inertia::render('JenisSampah/Edit', [
            'jenisSampah' => $jenisSampah,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TmDataJenisSampah $jenisSampah)
    {
        $request->validate([
            'nama_jenis' => 'required|string|max:100|unique:tm_data_jenis_sampah,nama_jenis,' . $jenisSampah->id,
            'harga_per_kg' => 'required|numeric|min:0|max:999999.99',
            'poin_per_kg' => 'required|integer|min:0|max:999',
            'deskripsi' => 'nullable|string|max:255',
            'status_aktif' => 'required|boolean',
        ]);

        $jenisSampah->update([
            'nama_jenis' => $request->nama_jenis,
            'harga_per_kg' => $request->harga_per_kg,
            'poin_per_kg' => $request->poin_per_kg,
            'deskripsi' => $request->deskripsi,
            'status_aktif' => $request->status_aktif,
        ]);

        return redirect()->route('jenis-sampah.show', $jenisSampah)
            ->with('success', 'Jenis sampah berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TmDataJenisSampah $jenisSampah)
    {
        // Check if jenis sampah is being used in setoran
        $setoranCount = $jenisSampah->setoran()->count();
        
        if ($setoranCount > 0) {
            return back()->withErrors([
                'delete' => "Tidak dapat menghapus jenis sampah ini karena sudah digunakan dalam {$setoranCount} setoran."
            ]);
        }

        $jenisSampah->delete();

        return redirect()->route('jenis-sampah.index')
            ->with('success', 'Jenis sampah berhasil dihapus!');
    }

    /**
     * Toggle status aktif jenis sampah
     */
    public function toggleStatus(TmDataJenisSampah $jenisSampah)
    {
        $jenisSampah->update([
            'status_aktif' => !$jenisSampah->status_aktif,
        ]);

        $status = $jenisSampah->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Jenis sampah berhasil {$status}!");
    }

    /**
     * Duplicate jenis sampah
     */
    public function duplicate(TmDataJenisSampah $jenisSampah)
    {
        $newJenisSampah = $jenisSampah->replicate();
        $newJenisSampah->nama_jenis = $jenisSampah->nama_jenis . ' (Copy)';
        $newJenisSampah->status_aktif = false; // Set as inactive by default
        $newJenisSampah->save();

        return redirect()->route('jenis-sampah.edit', $newJenisSampah)
            ->with('success', 'Jenis sampah berhasil diduplikasi! Silakan edit data yang diperlukan.');
    }

    /**
     * Export data jenis sampah
     */
    public function export(Request $request)
    {
        // TODO: Implement export functionality
        return back()->with('info', 'Fitur export akan segera tersedia');
    }

    /**
     * Get active jenis sampah for API/AJAX
     */
    public function getActive()
    {
        $jenisSampah = TmDataJenisSampah::aktif()
            ->select('id', 'nama_jenis', 'harga_per_kg', 'poin_per_kg')
            ->orderBy('nama_jenis')
            ->get();

        return response()->json($jenisSampah);
    }
}
