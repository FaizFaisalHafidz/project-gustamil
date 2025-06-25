import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastContainer } from '@/components/ui/toast';
import { useDialog } from '@/hooks/useDialog';
import { useToast } from '@/hooks/useToast';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    Calculator,
    Coins,
    Gift,
    History,
    Home,
    Info,
    Recycle,
    Star,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Anggota {
    id: number;
    nomor_anggota: string;
    nama_lengkap: string;
    saldo_aktif: number;
    total_poin: number;
    status_aktif: boolean;
}

interface PointConfig {
    rate: number;
    value: number;
    minimum: number;
}

interface ExchangeData {
    total_points: number;
    exchangeable_points: number;
    max_exchange_value: number;
    rate_text: string;
    can_exchange: boolean;
}

interface PointHistoryItem {
    id: number;
    reference: string;
    points: number;
    berat_kg?: number;
    total_harga: number;
    nama_jenis?: string;
    created_at: string;
    type: 'earned' | 'exchanged';
    description: string;
}

interface Statistics {
    total_earned: number;
    earned_this_month: number;
    earned_this_year: number;
    total_exchanged: number;
    exchanged_this_month: number;
    exchanged_this_year: number;
    total_exchange_value: number;
    exchange_count: number;
}

interface PoinProps {
    anggota: Anggota;
    pointConfig: PointConfig;
    exchangeData: ExchangeData;
    pointHistory: PointHistoryItem[];
    statistics: Statistics;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
};

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function Poin({ anggota, pointConfig, exchangeData, pointHistory, statistics }: PoinProps) {
    const [pointsToExchange, setPointsToExchange] = useState('');
    const dialog = useDialog();
    const toast = useToast();

    const calculateExchangeValue = (points: number) => {
        if (points < pointConfig.minimum || points % pointConfig.rate !== 0) {
            return 0;
        }
        return (points / pointConfig.rate) * pointConfig.value;
    };

    const handleExchange = () => {
        const points = parseInt(pointsToExchange);
        
        if (!points || points < pointConfig.minimum) {
            toast.showWarning(
                'Poin Tidak Mencukupi',
                `Minimum ${formatNumber(pointConfig.minimum)} poin`
            );
            return;
        }
        
        if (points % pointConfig.rate !== 0) {
            toast.showWarning(
                'Format Poin Salah',
                `Harus kelipatan ${pointConfig.rate} poin`
            );
            return;
        }
        
        if (points > anggota.total_poin) {
            toast.showError(
                'Poin Tidak Mencukupi',
                'Jumlah melebihi poin yang dimiliki'
            );
            return;
        }

        const exchangeValue = calculateExchangeValue(points);
        
        dialog.showDialog({
            title: 'Konfirmasi Penukaran Poin',
            message: `Tukar ${formatNumber(points)} poin menjadi ${formatCurrency(exchangeValue)}?`,
            type: 'warning',
            confirmText: 'Ya, Tukar Sekarang',
            cancelText: 'Batal',
        }, async () => {
            return new Promise((resolve, reject) => {
                router.post('/poin/exchange', {
                    points_to_exchange: points
                }, {
                    onSuccess: () => {
                        setPointsToExchange('');
                        toast.showSuccess(
                            'Penukaran Berhasil!',
                            `+${formatCurrency(exchangeValue)} saldo`
                        );
                        resolve();
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors).flat().join(', ');
                        toast.showError(
                            'Penukaran Gagal',
                            errorMessage || 'Terjadi kesalahan sistem'
                        );
                        reject(new Error(errorMessage));
                    }
                });
            });
        });
    };

    // Handle flash messages dari server (update juga untuk lebih compact)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success')) {
            toast.showSuccess('Berhasil!', urlParams.get('success'));
        }
        if (urlParams.get('error')) {
            toast.showError('Gagal!', urlParams.get('error'));
        }
    }, []);

    const suggestedAmounts = [
        pointConfig.minimum,
        pointConfig.rate * 10,
        pointConfig.rate * 20,
        pointConfig.rate * 50
    ].filter(amount => amount <= anggota.total_poin);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
            <Head title="Kelola Poin" />
            
            {/* Toast Container */}
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
            
            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={dialog.isOpen}
                onClose={dialog.hideDialog}
                onConfirm={dialog.confirm}
                title={dialog.config.title}
                message={dialog.config.message}
                type={dialog.config.type}
                confirmText={dialog.config.confirmText}
                cancelText={dialog.config.cancelText}
                isLoading={dialog.isLoading}
            />

            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 pt-12 pb-6 px-4">
                <div className="relative max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Link href="/beranda">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Kelola Poin
                                </h1>
                                <p className="text-orange-100 text-sm">
                                    Tukar poin menjadi saldo
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-100 text-xs">Total Poin</p>
                            <p className="text-2xl font-bold text-white">
                                {formatNumber(anggota.total_poin)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
                
                {/* Current Balance */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Star className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Poin Tersedia</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatNumber(anggota.total_poin)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Saldo Aktif</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(anggota.saldo_aktif)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Exchange Rate Info */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Info className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-blue-900">Kurs Penukaran</p>
                                    <p className="text-sm text-blue-700">{exchangeData.rate_text}</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <ArrowRightLeft className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-blue-600">Tukar Sekarang</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Exchange Form */}
                {exchangeData.can_exchange ? (
                    <Card className="bg-white shadow-lg border-0 mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Calculator className="h-5 w-5 text-green-500 mr-2" />
                                Tukar Poin ke Saldo
                            </CardTitle>
                            <CardDescription>
                                Minimum {formatNumber(pointConfig.minimum)} poin, kelipatan {pointConfig.rate}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Input Field */}
                            <div>
                                <Label htmlFor="points">Jumlah Poin</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    placeholder={`Minimum ${pointConfig.minimum} poin`}
                                    value={pointsToExchange}
                                    onChange={(e) => setPointsToExchange(e.target.value)}
                                    min={pointConfig.minimum}
                                    max={anggota.total_poin}
                                    step={pointConfig.rate}
                                />
                                {pointsToExchange && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        = {formatCurrency(calculateExchangeValue(parseInt(pointsToExchange)))}
                                    </p>
                                )}
                            </div>

                            {/* Quick Select */}
                            <div>
                                <Label className="text-sm text-gray-600">Pilihan Cepat:</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {suggestedAmounts.map((amount) => (
                                        <Button
                                            key={amount}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPointsToExchange(amount.toString())}
                                            className="text-xs h-auto py-2"
                                        >
                                            <div className="text-center">
                                                <div>{formatNumber(amount)} poin</div>
                                                <div className="text-green-600 text-xs">
                                                    {formatCurrency(calculateExchangeValue(amount))}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Exchange Button */}
                            <Button
                                onClick={handleExchange}
                                disabled={!pointsToExchange || calculateExchangeValue(parseInt(pointsToExchange)) === 0}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Tukar Poin
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-gray-50 border-gray-200 mb-6">
                        <CardContent className="p-6 text-center">
                            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-600 mb-2">Poin Belum Mencukupi</h3>
                            <p className="text-sm text-gray-500">
                                Kumpulkan minimal {formatNumber(pointConfig.minimum)} poin untuk mulai menukar
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                            Statistik Poin
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-green-800">Poin Didapat</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatNumber(statistics.total_earned)}
                                </p>
                                <p className="text-xs text-green-600">
                                    {formatNumber(statistics.earned_this_month)} bulan ini
                                </p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-orange-800">Poin Ditukar</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {formatNumber(statistics.total_exchanged)}
                                </p>
                                <p className="text-xs text-orange-600">
                                    {statistics.exchange_count}x penukaran
                                </p>
                            </div>
                        </div>
                        
                        {statistics.total_exchange_value > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-sm text-blue-700">Total Nilai Penukaran</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {formatCurrency(statistics.total_exchange_value)}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Point History */}
                <Card className="bg-white shadow-lg border-0 mb-20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                            <History className="h-5 w-5 text-gray-600 mr-2" />
                            Riwayat Poin
                        </CardTitle>
                        <CardDescription>20 aktivitas poin terakhir</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {pointHistory.length > 0 ? (
                            <div className="space-y-3">
                                {pointHistory.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                item.type === 'earned' ? 'bg-green-100' : 'bg-orange-100'
                                            }`}>
                                                {item.type === 'earned' ? (
                                                    <Recycle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Wallet className="h-5 w-5 text-orange-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="font-medium text-sm text-gray-900">
                                                        {item.nama_jenis || 'Penukaran Poin'}
                                                    </p>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs ${
                                                            item.type === 'earned' ? 'border-green-500 text-green-700' : 'border-orange-500 text-orange-700'
                                                        }`}
                                                    >
                                                        {item.type === 'earned' ? 'Didapat' : 'Ditukar'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {item.reference}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${
                                                item.type === 'earned' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                                {item.type === 'earned' ? '+' : '-'}{formatNumber(item.points)} poin
                                            </p>
                                            {item.type === 'exchanged' && (
                                                <p className="text-xs text-green-600">
                                                    +{formatCurrency(item.total_harga)}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {formatDateTime(item.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Belum ada aktivitas poin</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* FIXED: Bottom Navigation - Always Floating */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-2 mx-4 mb-4 rounded-t-2xl">
                    <div className="flex justify-around">
                        <Link href="/beranda" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-gray-400 hover:text-gray-600 w-full">
                                <Home className="h-5 w-5 mb-1" />
                                <span className="text-xs">Beranda</span>
                            </Button>
                        </Link>
                        <Link href="/riwayat" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-gray-400 hover:text-gray-600 w-full">
                                <History className="h-5 w-5 mb-1" />
                                <span className="text-xs">Riwayat</span>
                            </Button>
                        </Link>
                        <Link href="/poin" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-green-600 w-full">
                                <Coins className="h-5 w-5 mb-1" />
                                <span className="text-xs font-medium">Poin</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}