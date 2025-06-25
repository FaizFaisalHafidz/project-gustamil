<?php

namespace App\Http\Controllers;

use App\Models\TmDataAnggota;
use App\Models\TtDataHistorySaldoAnggota;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PoinController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get anggota data
        $anggota = TmDataAnggota::where('user_id', $user->id)->first();
        
        if (!$anggota) {
            return redirect()->route('login')->with('error', 'Akun Anda belum terdaftar sebagai anggota.');
        }

        // Get point exchange configuration
        $pointConfig = [
            'rate' => config('app.point_exchange.rate'),
            'value' => config('app.point_exchange.value'),
            'minimum' => config('app.point_exchange.minimum'),
        ];

        // Calculate exchange values
        $exchangeData = $this->calculateExchangeData($anggota->total_poin, $pointConfig);
        
        // Get point history
        $pointHistory = $this->getPointHistory($anggota->id);
        
        // Get point statistics
        $statistics = $this->getPointStatistics($anggota->id);

        return Inertia::render('Poin', [
            'anggota' => $anggota,
            'pointConfig' => $pointConfig,
            'exchangeData' => $exchangeData,
            'pointHistory' => $pointHistory,
            'statistics' => $statistics,
        ]);
    }

    public function exchangePoints(Request $request)
    {
        Log::info('=== POINT EXCHANGE PROCESS STARTED ===');
        Log::info('Request data:', $request->all());
        
        try {
            // Log validation start
            Log::info('Starting validation...');
            
            $request->validate([
                'points_to_exchange' => [
                    'required',
                    'integer',
                    'min:' . config('app.point_exchange.minimum'),
                    function ($attribute, $value, $fail) {
                        Log::info("Validating points: {$value}");
                        Log::info("Exchange rate: " . config('app.point_exchange.rate'));
                        
                        if ($value % config('app.point_exchange.rate') !== 0) {
                            $error = 'Poin harus kelipatan ' . config('app.point_exchange.rate');
                            Log::warning("Validation failed: {$error}");
                            $fail($error);
                        }
                    },
                ],
            ]);
            
            Log::info('Validation passed');

            $user = Auth::user();
            Log::info('User ID:', ['user_id' => $user->id]);
            
            $anggota = TmDataAnggota::where('user_id', $user->id)->first();
            
            if (!$anggota) {
                Log::error('Anggota not found for user:', ['user_id' => $user->id]);
                return back()->withErrors(['error' => 'Data anggota tidak ditemukan.']);
            }
            
            Log::info('Anggota found:', [
                'anggota_id' => $anggota->id,
                'current_points' => $anggota->total_poin,
                'current_saldo' => $anggota->saldo_aktif
            ]);

            $pointsToExchange = $request->points_to_exchange;
            Log::info('Points to exchange:', ['points' => $pointsToExchange]);
            
            // Check if user has enough points
            if ($anggota->total_poin < $pointsToExchange) {
                Log::warning('Insufficient points:', [
                    'required' => $pointsToExchange,
                    'available' => $anggota->total_poin
                ]);
                return back()->withErrors(['error' => 'Poin Anda tidak mencukupi.']);
            }

            // Get point exchange configuration
            $pointConfig = [
                'rate' => config('app.point_exchange.rate'),
                'value' => config('app.point_exchange.value'),
            ];
            
            Log::info('Point config:', $pointConfig);
            
            // Calculate exchange value
            $saldoAmount = ($pointsToExchange / $pointConfig['rate']) * $pointConfig['value'];
            Log::info('Calculated exchange:', [
                'points' => $pointsToExchange,
                'saldo_amount' => $saldoAmount
            ]);

            Log::info('Starting database transaction...');
            DB::beginTransaction();

            // Store values before update
            $saldoSebelum = $anggota->saldo_aktif;
            $poinSebelum = $anggota->total_poin;
            
            Log::info('Values before update:', [
                'saldo_sebelum' => $saldoSebelum,
                'poin_sebelum' => $poinSebelum
            ]);
            
            // Update anggota points and saldo
            $updateResult = $anggota->update([
                'total_poin' => $anggota->total_poin - $pointsToExchange,
                'saldo_aktif' => $anggota->saldo_aktif + $saldoAmount,
            ]);
            
            Log::info('Anggota update result:', ['success' => $updateResult]);
            
            // Refresh anggota to get updated values
            $anggota->refresh();
            
            Log::info('Values after update:', [
                'saldo_sesudah' => $anggota->saldo_aktif,
                'poin_sesudah' => $anggota->total_poin
            ]);

            // Generate transaction number
            $nomorTransaksi = TtDataHistorySaldoAnggota::generateNomorTransaksi();
            Log::info('Generated transaction number:', ['nomor' => $nomorTransaksi]);

            // FIXED: Prepare history data dengan ENUM yang benar
            $historyData = [
                'nomor_transaksi' => $nomorTransaksi,
                'anggota_id' => $anggota->id,
                'jenis_transaksi' => 'masuk', // FIXED: Gunakan 'masuk' karena saldo bertambah
                'kategori_transaksi' => 'tukar_poin', // Ini sudah ada di ENUM
                'jumlah_saldo' => $saldoAmount,
                'jumlah_poin' => $pointsToExchange, // Poin yang ditukar (akan berkurang)
                'saldo_sebelum' => $saldoSebelum,
                'saldo_sesudah' => $anggota->saldo_aktif,
                'poin_sebelum' => $poinSebelum,
                'poin_sesudah' => $anggota->total_poin,
                'setoran_id' => null, // Tidak ada setoran
                'keuangan_id' => null, // Tidak ada transaksi keuangan
                'admin_id' => $user->id, // Self-service, tapi tetap perlu admin_id
                'keterangan' => "Tukar {$pointsToExchange} poin menjadi saldo senilai " . number_format($saldoAmount, 0, ',', '.'),
                'tanggal_transaksi' => now()->toDateString(),
                'waktu_transaksi' => now()->toTimeString(),
            ];
            
            Log::info('History data to be created:', $historyData);

            // Create history record
            $historyRecord = TtDataHistorySaldoAnggota::create($historyData);
            
            Log::info('History record created:', ['id' => $historyRecord->id]);

            DB::commit();
            Log::info('Transaction committed successfully');

            $successMessage = "Berhasil menukar {$pointsToExchange} poin menjadi " . number_format($saldoAmount, 0, ',', '.') . " rupiah!";
            Log::info('Exchange completed successfully:', ['message' => $successMessage]);

            return back()->with('success', $successMessage);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation exception:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);
            DB::rollBack();
            return back()->withErrors($e->errors());
            
        } catch (\Exception $e) {
            Log::error('Exchange exception occurred:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            DB::rollBack();
            Log::info('Transaction rolled back due to exception');
            
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memproses penukaran poin: ' . $e->getMessage()]);
        }
    }

    private function calculateExchangeData($totalPoin, $pointConfig)
    {
        $maxExchangeablePoints = floor($totalPoin / $pointConfig['rate']) * $pointConfig['rate'];
        $maxExchangeValue = ($maxExchangeablePoints / $pointConfig['rate']) * $pointConfig['value'];
        
        return [
            'total_points' => $totalPoin,
            'exchangeable_points' => $maxExchangeablePoints,
            'max_exchange_value' => $maxExchangeValue,
            'rate_text' => "{$pointConfig['rate']} poin = Rp " . number_format($pointConfig['value'], 0, ',', '.'),
            'can_exchange' => $totalPoin >= $pointConfig['minimum'],
        ];
    }

    private function getPointHistory($anggotaId)
    {
        // Get setoran history (point earning)
        $setoranHistory = DB::table('tt_data_setoran')
            ->leftJoin('tm_data_jenis_sampah', 'tt_data_setoran.jenis_sampah_id', '=', 'tm_data_jenis_sampah.id')
            ->where('tt_data_setoran.anggota_id', $anggotaId)
            ->where('tt_data_setoran.poin_didapat', '>', 0)
            ->select(
                'tt_data_setoran.id',
                'tt_data_setoran.nomor_setoran as reference',
                'tt_data_setoran.poin_didapat as points',
                'tt_data_setoran.berat_kg',
                'tt_data_setoran.total_harga',
                'tm_data_jenis_sampah.nama_jenis',
                'tt_data_setoran.created_at',
                DB::raw("'earned' as type"),
                DB::raw("'Poin dari setoran sampah' as description")
            );

        // Get exchange history (point spending)
        $exchangeHistory = DB::table('tt_data_history_saldo_anggota')
            ->where('anggota_id', $anggotaId)
            ->where('kategori_transaksi', 'tukar_poin')
            ->where('jumlah_poin', '>', 0)
            ->select(
                'id',
                'nomor_transaksi as reference',
                'jumlah_poin as points',
                DB::raw('NULL as berat_kg'),
                'jumlah_saldo as total_harga',
                DB::raw('NULL as nama_jenis'),
                'created_at',
                DB::raw("'exchanged' as type"),
                'keterangan as description'
            );

        return $setoranHistory
            ->union($exchangeHistory)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
    }

    private function getPointStatistics($anggotaId)
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        // Points earned from setoran
        $pointsEarned = DB::table('tt_data_setoran')
            ->where('anggota_id', $anggotaId)
            ->selectRaw('
                SUM(poin_didapat) as total_earned,
                SUM(CASE WHEN created_at >= ? THEN poin_didapat ELSE 0 END) as earned_this_month,
                SUM(CASE WHEN created_at >= ? THEN poin_didapat ELSE 0 END) as earned_this_year
            ', [$thisMonth, $thisYear])
            ->first();

        // Points exchanged
        $pointsExchanged = DB::table('tt_data_history_saldo_anggota')
            ->where('anggota_id', $anggotaId)
            ->where('kategori_transaksi', 'tukar_poin')
            ->selectRaw('
                SUM(jumlah_poin) as total_exchanged,
                SUM(CASE WHEN created_at >= ? THEN jumlah_poin ELSE 0 END) as exchanged_this_month,
                SUM(CASE WHEN created_at >= ? THEN jumlah_poin ELSE 0 END) as exchanged_this_year,
                SUM(jumlah_saldo) as total_exchange_value
            ', [$thisMonth, $thisYear])
            ->first();

        return [
            'total_earned' => $pointsEarned->total_earned ?? 0,
            'earned_this_month' => $pointsEarned->earned_this_month ?? 0,
            'earned_this_year' => $pointsEarned->earned_this_year ?? 0,
            'total_exchanged' => $pointsExchanged->total_exchanged ?? 0,
            'exchanged_this_month' => $pointsExchanged->exchanged_this_month ?? 0,
            'exchanged_this_year' => $pointsExchanged->exchanged_this_year ?? 0,
            'total_exchange_value' => $pointsExchanged->total_exchange_value ?? 0,
            'exchange_count' => DB::table('tt_data_history_saldo_anggota')
                ->where('anggota_id', $anggotaId)
                ->where('kategori_transaksi', 'tukar_poin')
                ->count(),
        ];
    }
}