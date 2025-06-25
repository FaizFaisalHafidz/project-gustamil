import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Coins,
    Download,
    Filter,
    History,
    Home,
    Recycle,
    Search,
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

interface JenisSampah {
    id: number;
    nama_jenis: string;
}

interface SetoranHistory {
    id: number;
    nomor_setoran: string;
    berat_kg: number;
    total_harga: number;
    poin_didapat: number;
    tanggal_setoran: string;
    waktu_setoran?: string;
    catatan?: string;
    created_at: string;
    jenisSampah?: JenisSampah;
}

interface SaldoHistory {
    id: number;
    nomor_transaksi: string;
    jenis_transaksi: 'masuk' | 'keluar'; // FIXED: Update sesuai ENUM
    kategori_transaksi: 'setoran_sampah' | 'penarikan_saldo' | 'tukar_poin' | 'koreksi_admin';
    jumlah_saldo: number;
    jumlah_poin: number;
    saldo_sebelum: number;
    saldo_sesudah: number;
    poin_sebelum: number;
    poin_sesudah: number;
    keterangan: string;
    setoran_id?: number;
    keuangan_id?: number;
    admin_id: number;
    tanggal_transaksi: string;
    waktu_transaksi?: string;
    created_at: string;
}

interface Statistics {
    // Current data (accurate from anggota table)
    current_saldo: number;
    current_poin: number;
    
    // Historical data (for the filtered period)
    total_setoran: number;
    total_berat: number;
    total_nilai: number;
    total_poin: number;
    total_transaksi_saldo: number;
    total_masuk: number; // FIXED: Changed from total_kredit
    total_keluar: number; // FIXED: Changed from total_debit
    total_poin_earned: number;
    total_poin_used: number;
}

interface Filters {
    type: string;
    period: string;
    search: string;
}

interface RiwayatProps {
    anggota: Anggota;
    setoranHistory: {
        data: SetoranHistory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    saldoHistory: {
        data: SaldoHistory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    statistics: Statistics;
    filters: Filters;
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

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function Riwayat({ anggota, setoranHistory, saldoHistory, statistics, filters }: RiwayatProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedType, setSelectedType] = useState(filters.type);
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period);
    const [showFilters, setShowFilters] = useState(false);

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        
        router.get('/riwayat', {
            type: newFilters.type,
            period: newFilters.period,
            search: newFilters.search,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        handleFilterChange('search', searchTerm);
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm !== filters.search) {
                handleFilterChange('search', searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    const periodOptions = [
        { value: '7', label: '7 Hari Terakhir' },
        { value: '30', label: '30 Hari Terakhir' },
        { value: '90', label: '90 Hari Terakhir' },
        { value: 'all', label: 'Semua Waktu' },
    ];

    const typeOptions = [
        { value: 'all', label: 'Semua Aktivitas' },
        { value: 'setoran', label: 'Riwayat Setoran' },
        { value: 'saldo', label: 'Riwayat Saldo' },
    ];

    const getCurrentData = () => {
        if (filters.type === 'setoran') return setoranHistory;
        if (filters.type === 'saldo') return saldoHistory;
        
        // Combine both for 'all' type
        const combinedData = [
            ...setoranHistory.data.map(item => ({ ...item, type: 'setoran' })),
            ...saldoHistory.data.map(item => ({ ...item, type: 'saldo' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
            data: combinedData,
            current_page: 1,
            last_page: 1,
            total: combinedData.length
        };
    };

    const currentData = getCurrentData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
            <Head title="Riwayat Aktivitas" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 pt-12 pb-6 px-4">
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
                                    Riwayat Aktivitas
                                </h1>
                                <p className="text-green-100 text-sm">
                                    Pantau semua aktivitas Anda
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
                
                {/* Statistics Cards - FIXED: Show current data accurately */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Recycle className="h-6 w-6 text-blue-500" />
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Saldo Aktif</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(statistics.current_saldo)}
                                </p>
                                <p className="text-xs text-blue-600">
                                    Periode: {formatCurrency(statistics.total_nilai)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Wallet className="h-6 w-6 text-yellow-500" />
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Poin Aktif</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatNumber(statistics.current_poin)}
                                </p>
                                <p className="text-xs text-yellow-600">
                                    Periode: {formatNumber(statistics.total_poin)} poin
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Optional: Add additional statistics card for saldo transactions */}
                {(filters.type === 'saldo' || filters.type === 'all') && statistics.total_transaksi_saldo > 0 && (
                    <Card className="bg-white shadow-lg border-0 mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Wallet className="h-5 w-5 text-green-500 mr-2" />
                                Ringkasan Transaksi Saldo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">Saldo Masuk</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(statistics.total_masuk)}
                                    </p>
                                    {statistics.total_poin_earned > 0 && (
                                        <p className="text-xs text-green-600">
                                            +{formatNumber(statistics.total_poin_earned)} poin
                                        </p>
                                    )}
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm font-medium text-red-800">Saldo Keluar</p>
                                    <p className="text-lg font-bold text-red-600">
                                        {formatCurrency(statistics.total_keluar)}
                                    </p>
                                    {statistics.total_poin_used > 0 && (
                                        <p className="text-xs text-red-600">
                                            -{formatNumber(statistics.total_poin_used)} poin
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Show net change */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                                <p className="text-sm text-blue-700">Perubahan Bersih (Periode Ini)</p>
                                <div className="flex justify-center items-center space-x-4 mt-1">
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${
                                            (statistics.total_masuk - statistics.total_keluar) >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {(statistics.total_masuk - statistics.total_keluar) >= 0 ? '+' : ''}
                                            {formatCurrency(statistics.total_masuk - statistics.total_keluar)}
                                        </p>
                                        <p className="text-xs text-blue-600">Saldo</p>
                                    </div>
                                    
                                    {(statistics.total_poin_earned - statistics.total_poin_used) !== 0 && (
                                        <div className="text-center">
                                            <p className={`text-lg font-bold ${
                                                (statistics.total_poin_earned - statistics.total_poin_used) >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {(statistics.total_poin_earned - statistics.total_poin_used) >= 0 ? '+' : ''}
                                                {formatNumber(statistics.total_poin_earned - statistics.total_poin_used)}
                                            </p>
                                            <p className="text-xs text-blue-600">Poin</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                {showFilters && (
                    <Card className="bg-white shadow-lg border-0 mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Cari berdasarkan nomor, jenis, atau keterangan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Jenis Aktivitas
                                </label>
                                <Select
                                    value={selectedType}
                                    onValueChange={(value) => {
                                        setSelectedType(value);
                                        handleFilterChange('type', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Period Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Periode Waktu
                                </label>
                                <Select
                                    value={selectedPeriod}
                                    onValueChange={(value) => {
                                        setSelectedPeriod(value);
                                        handleFilterChange('period', value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Export Buttons */}
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Download className="h-4 w-4 mr-2" />
                                    Excel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* History List */}
                <Card className="bg-white shadow-lg border-0 mb-20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center">
                                <History className="h-5 w-5 text-gray-600 mr-2" />
                                {typeOptions.find(t => t.value === filters.type)?.label}
                            </CardTitle>
                            <Badge variant="secondary">
                                {currentData.total} item
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {currentData.data.length > 0 ? (
                            <div className="space-y-3">
                                {currentData.data.map((item: any, index) => (
                                    <div key={`${item.type || 'unknown'}-${item.id}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                                        {(item.type === 'setoran' || !item.type) && 'nomor_setoran' in item ? (
                                            // Setoran Item
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Recycle className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <p className="font-medium text-sm text-gray-900">
                                                                {item.jenisSampah?.nama_jenis || 'Sampah'}
                                                            </p>
                                                            <Badge variant="outline" className="text-xs">
                                                                Setoran
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            {item.nomor_setoran}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{formatWeight(item.berat_kg)}</span>
                                                            <span>•</span>
                                                            <span>{item.poin_didapat} poin</span>
                                                        </div>
                                                        {item.catatan && (
                                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                                "{item.catatan}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-sm text-green-600">
                                                        {formatCurrency(item.total_harga)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDateTime(item.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Saldo Item
                                            (item.type === 'saldo' || 'nomor_transaksi' in item) && (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                            item.jenis_transaksi === 'masuk' ? 'bg-green-100' : 'bg-red-100'
                                                        }`}>
                                                            <Wallet className={`h-5 w-5 ${
                                                                item.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <p className="font-medium text-sm text-gray-900 capitalize">
                                                                    {item.kategori_transaksi?.replace(/_/g, ' ') || item.jenis_transaksi}
                                                                </p>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {item.nomor_transaksi}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {item.keterangan}
                                                            </p>
                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                <span>Saldo: {formatCurrency(item.saldo_sebelum)} → {formatCurrency(item.saldo_sesudah)}</span>
                                                                {item.jumlah_poin > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>Poin: {formatNumber(item.poin_sebelum)} → {formatNumber(item.poin_sesudah)}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="space-y-1">
                                                            <p className={`font-bold text-sm ${
                                                                item.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {item.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah_saldo)}
                                                            </p>
                                                            {item.jumlah_poin > 0 && (
                                                                <p className={`font-medium text-xs ${
                                                                    item.kategori_transaksi === 'tukar_poin' ? 'text-red-600' : 'text-yellow-600'
                                                                }`}>
                                                                    {item.kategori_transaksi === 'tukar_poin' ? '-' : '+'}{formatNumber(item.jumlah_poin)} poin
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDateTime(item.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Tidak ada data riwayat</p>
                                <p className="text-gray-400 text-xs">Coba ubah filter atau periode waktu</p>
                            </div>
                        )}

                        {/* Pagination Info */}
                        {currentData.total > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-center text-xs text-gray-500">
                                    Menampilkan {currentData.data.length} dari {currentData.total} item
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Navigation */}
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
                            <Button variant="ghost" className="flex-col h-auto py-2 text-green-600 w-full">
                                <History className="h-5 w-5 mb-1" />
                                <span className="text-xs font-medium">Riwayat</span>
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
        </div>
    );
}