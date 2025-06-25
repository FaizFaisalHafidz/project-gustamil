import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bell,
    ChevronRight,
    Coins,
    DollarSign,
    Gift,
    History,
    Home,
    LogOut,
    Recycle,
    Scale,
    Star,
    TrendingUp,
    Trophy,
    Wallet
} from 'lucide-react';
import { useState } from 'react';

interface Anggota {
    id: number;
    nomor_anggota: string;
    nama_lengkap: string;
    saldo_aktif: number;
    total_poin: number;
    status_aktif: boolean;
}

interface Summary {
    total_setoran: number;
    setoran_bulan_ini: number;
    setoran_tahun_ini: number;
    total_berat: number;
    berat_bulan_ini: number;
    total_nilai: number;
    nilai_bulan_ini: number;
    total_poin_earned: number;
    poin_bulan_ini: number;
}

interface JenisSampah {
    id: number;
    nama_jenis: string;
}

interface RecentSetoran {
    id: number;
    nomor_setoran: string;
    berat_kg: number;
    total_harga: number;
    poin_didapat: number;
    tanggal_setoran: string;
    jenisSampah?: JenisSampah;
}

interface RecentSaldoHistory {
    id: number;
    jenis_transaksi: string;
    jumlah_saldo: number;
    saldo_sebelum: number;
    saldo_sesudah: number;
    keterangan: string;
    created_at: string;
}

interface RecentActivities {
    recent_setoran: RecentSetoran[];
    recent_saldo_history: RecentSaldoHistory[];
}

interface TopPerformer {
    id: number;
    nama_lengkap: string;
    total_setoran: number;
    total_berat: number;
    total_nilai: number;
}

interface BerandaProps {
    anggota: Anggota;
    summary: Summary;
    recentActivities: RecentActivities;
    topPerformers?: TopPerformer[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatWeight = (weight: number) => {
    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(weight) + " kg";
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function Beranda({ anggota, summary, recentActivities, topPerformers = [] }: BerandaProps) {
    const [activeTab, setActiveTab] = useState<'setoran' | 'saldo'>('setoran');
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Handle logout
    const handleLogout = () => {
        setShowLogoutDialog(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            router.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    const cancelLogout = () => {
        setShowLogoutDialog(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
            <Head title="Beranda Anggota" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 pt-12 pb-6 px-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>
                
                {/* Header Content */}
                <div className="relative max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 border-2 border-white/30">
                                <AvatarFallback className="bg-white/20 text-white font-bold">
                                    {getInitials(anggota.nama_lengkap)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-lg font-bold text-white">
                                    Halo, {anggota.nama_lengkap.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-green-100 text-sm">
                                    {anggota.nomor_anggota}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-white/20"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-4">
                        <Badge className={`${anggota.status_aktif ? 'bg-emerald-500' : 'bg-red-500'} text-white border-0 px-3 py-1`}>
                            {anggota.status_aktif ? '✓ Status Aktif' : '⚠ Status Non-Aktif'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content - Keep existing content */}
            <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Saldo Card */}
                    <Link href="/poin">
                        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Wallet className="h-8 w-8 text-emerald-500" />
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Saldo Aktif</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatCurrency(anggota.saldo_aktif)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Poin Card */}
                    <Link href="/poin">
                        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Star className="h-8 w-8 text-yellow-500" />
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Poin</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatNumber(anggota.total_poin)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Stats */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                            Statistik Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                                    <Recycle className="h-6 w-6 text-blue-600" />
                                </div>
                                <p className="text-lg font-bold text-blue-600">{summary.setoran_bulan_ini}</p>
                                <p className="text-xs text-gray-500 mb-1">Setoran</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                                    <Scale className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-lg font-bold text-green-600">{formatWeight(summary.berat_bulan_ini)}</p>
                                <p className="text-xs text-gray-500 mb-1">Berat</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                                    <DollarSign className="h-6 w-6 text-purple-600" />
                                </div>
                                <p className="text-lg font-bold text-purple-600">{formatCurrency(summary.nilai_bulan_ini)}</p>
                                <p className="text-xs text-gray-500 mb-1">Nilai</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Tabs */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                                <History className="h-5 w-5 text-gray-600 mr-2" />
                                Aktivitas Terbaru
                            </CardTitle>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <Button
                                    variant={activeTab === 'setoran' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveTab('setoran')}
                                    className={`text-xs ${activeTab === 'setoran' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-transparent'}`}
                                >
                                    Setoran
                                </Button>
                                <Button
                                    variant={activeTab === 'saldo' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveTab('saldo')}
                                    className={`text-xs ${activeTab === 'saldo' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-transparent'}`}
                                >
                                    Saldo
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {activeTab === 'setoran' ? (
                            <div className="space-y-3">
                                {recentActivities.recent_setoran.length > 0 ? (
                                    recentActivities.recent_setoran.slice(0, 3).map((setoran) => (
                                        <div key={setoran.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Recycle className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">
                                                        {setoran.jenisSampah?.nama_jenis || 'Sampah'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatWeight(setoran.berat_kg)} • {setoran.poin_didapat} poin
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-green-600">
                                                    {formatCurrency(setoran.total_harga)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(setoran.tanggal_setoran).toLocaleDateString('id-ID', { 
                                                        day: 'numeric', 
                                                        month: 'short' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Recycle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Belum ada setoran</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.recent_saldo_history.length > 0 ? (
                                    recentActivities.recent_saldo_history.slice(0, 3).map((history) => (
                                        <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    history.jenis_transaksi === 'masuk' ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    <Wallet className={`h-5 w-5 ${
                                                        history.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 capitalize">
                                                        {history.jenis_transaksi}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {history.keterangan}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${
                                                    history.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {history.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrency(history.jumlah_saldo)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(history.created_at).toLocaleDateString('id-ID', { 
                                                        day: 'numeric', 
                                                        month: 'short' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Belum ada transaksi saldo</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                            Papan Peringkat
                        </CardTitle>
                        <CardDescription>Top anggota bulan ini</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {topPerformers.length > 0 ? (
                            <div className="space-y-3">
                                {topPerformers.slice(0, 3).map((performer, index) => (
                                    <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                                'bg-orange-100 text-orange-600'
                                            }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">
                                                    {performer.nama_lengkap}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {performer.total_setoran}x • {formatWeight(performer.total_berat)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-green-600">
                                                {formatCurrency(performer.total_nilai)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Belum ada data peringkat</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-0 mb-20">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <Gift className="h-12 w-12 text-white mx-auto mb-3" />
                            <h3 className="font-bold text-lg mb-2">Tukar Poin Anda!</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Kumpulkan poin dan tukar dengan hadiah menarik
                            </p>
                            <Link href="/poin">
                                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                    Lihat Hadiah
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FIXED: Bottom Navigation - Always Floating */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-2 mx-4 mb-4 rounded-t-2xl">
                    <div className="flex justify-around">
                        <Link href="/beranda" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-green-600 w-full">
                                <Home className="h-5 w-5 mb-1" />
                                <span className="text-xs font-medium">Beranda</span>
                            </Button>
                        </Link>
                        <Link href="/riwayat" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-gray-400 hover:text-gray-600 w-full">
                                <History className="h-5 w-5 mb-1" />
                                <span className="text-xs">Riwayat</span>
                            </Button>
                        </Link>
                        <Link href="/poin" className="flex-1">
                            <Button variant="ghost" className="flex-col h-auto py-2 text-gray-400 hover:text-gray-600 w-full">
                                <Coins className="h-5 w-5 mb-1" />
                                <span className="text-xs">Poin</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* FIXED: Add Confirm Dialog for Logout */}
            <ConfirmDialog
                isOpen={showLogoutDialog}
                onClose={cancelLogout}
                onConfirm={confirmLogout}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari aplikasi?"
                type="warning"
                confirmText={isLoggingOut ? "Logging out..." : "Ya, Keluar"}
                cancelText="Batal"
                isLoading={isLoggingOut}
            />
        </div>
    );
}