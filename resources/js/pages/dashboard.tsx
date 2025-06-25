import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Scale,
    Users,
    Wallet
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Summary {
    total_anggota: number;
    anggota_aktif: number;
    anggota_baru_bulan_ini: number;
    total_saldo_anggota: number;
    pemasukan_hari_ini: number;
    pengeluaran_hari_ini: number;
    total_setoran_hari_ini: number;
    total_berat_hari_ini: number;
    total_nilai_hari_ini: number;
    setoran_bulan_ini: number;
    berat_bulan_ini: number;
    nilai_bulan_ini: number;
}

interface ChartData {
    daily_setoran: Array<{
        tanggal: string;
        jumlah_transaksi: number;
        total_berat: number;
        total_nilai: number;
    }>;
    daily_keuangan: Array<{
        tanggal: string;
        pemasukan: number;
        pengeluaran: number;
    }>;
}

interface Anggota {
    id: number;
    nama_lengkap: string;
    nomor_anggota: string;
}

interface JenisSampah {
    id: number;
    nama_jenis: string;
}

interface RecentActivities {
    recent_setoran: Array<{
        id: number;
        nomor_setoran: string;
        berat_kg: number;
        total_harga: number;
        tanggal_setoran: string;
        anggota: Anggota;
        jenis_sampah: JenisSampah;
    }>;
    recent_transactions: Array<{
        id: number;
        jenis_transaksi: string;
        kategori_transaksi: string;
        jumlah_uang: number;
        tanggal_transaksi: string;
        anggota?: Anggota;
    }>;
}

interface TopPerformers {
    top_anggota: Array<{
        id: number;
        nama_lengkap: string;
        nomor_anggota: string;
        setoran_sum_total_harga: number;
        setoran_sum_berat_kg: number;
        setoran_count: number;
    }>;
    top_jenis_sampah: Array<{
        id: number;
        nama_jenis: string;
        setoran_sum_berat_kg: number;
        setoran_sum_total_harga: number;
    }>;
}

interface MonthlyTrend {
    bulan: string;
    setoran_jumlah: number;
    setoran_berat: number;
    setoran_nilai: number;
    pemasukan: number;
    pengeluaran: number;
}

interface JenisSampahBreakdown {
    id: number;
    nama_jenis: string;
    setoran_sum_berat_kg: number;
    setoran_sum_total_harga: number;
    setoran_count: number;
}

interface DashboardProps {
    summary: Summary;
    chartData: ChartData;
    recentActivities: RecentActivities;
    topPerformers: TopPerformers;
    monthlyTrends: MonthlyTrend[];
    jenisSampahBreakdown: JenisSampahBreakdown[];
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(weight) + " kg";
};

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateString));
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard({ 
    summary, 
    chartData, 
    recentActivities, 
    topPerformers, 
    monthlyTrends,
    jenisSampahBreakdown 
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Section */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Selamat datang di Bank Sampah RT. Berikut adalah ringkasan aktivitas hari ini.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{summary.total_anggota}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.anggota_aktif} aktif • {summary.anggota_baru_bulan_ini} baru bulan ini
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Anggota</CardTitle>
                            <Wallet className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(summary.total_saldo_anggota)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total saldo seluruh anggota
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Setoran Hari Ini</CardTitle>
                            <Scale className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{summary.total_setoran_hari_ini}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatWeight(summary.total_berat_hari_ini)} • {formatCurrency(summary.total_nilai_hari_ini)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Keuangan Hari Ini</CardTitle>
                            <DollarSign className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center text-green-600">
                                    <ArrowUpRight className="h-4 w-4" />
                                    <span className="text-sm font-medium">{formatCurrency(summary.pemasukan_hari_ini)}</span>
                                </div>
                                <div className="flex items-center text-red-600">
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span className="text-sm font-medium">{formatCurrency(summary.pengeluaran_hari_ini)}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Net: {formatCurrency(summary.pemasukan_hari_ini - summary.pengeluaran_hari_ini)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Daily Setoran Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trend Setoran Harian</CardTitle>
                            <CardDescription>Jumlah dan nilai setoran per hari dalam bulan ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData.daily_setoran}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="tanggal" 
                                            tickFormatter={(value) => new Date(value).getDate().toString()}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(value) => formatDate(value)}
                                            formatter={(value: number, name: string) => {
                                                if (name === 'total_nilai') return [formatCurrency(value), 'Total Nilai'];
                                                if (name === 'total_berat') return [formatWeight(value), 'Total Berat'];
                                                return [value, 'Jumlah Transaksi'];
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="jumlah_transaksi" 
                                            stroke="#8b5cf6" 
                                            strokeWidth={2}
                                            name="jumlah_transaksi"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="total_nilai" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            name="total_nilai"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Jenis Sampah Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Breakdown Jenis Sampah</CardTitle>
                            <CardDescription>Distribusi berdasarkan berat (bulan ini)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={jenisSampahBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ nama_jenis, percent }) => `${nama_jenis} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="setoran_sum_berat_kg"
                                        >
                                            {jenisSampahBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [formatWeight(value), 'Berat']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Aktivitas Terbaru
                                <Link href="/data-setoran">
                                    {/* <Button variant="outline" size="sm">
                                        Lihat Semua
                                    </Button> */}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-2">
                                {recentActivities.recent_setoran.map((setoran) => (
                                    <div key={setoran.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <Scale className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{setoran.anggota.nama_lengkap}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {setoran.jenis_sampah.nama_jenis} • {formatWeight(setoran.berat_kg)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-green-600">
                                                {formatCurrency(setoran.total_harga)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(setoran.tanggal_setoran)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Anggota */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Top Anggota
                                <Link href="/laporan/anggota">
                                    <Button variant="outline" size="sm">
                                        Lihat Semua
                                    </Button>
                                </Link>
                            </CardTitle>
                            <CardDescription>Berdasarkan nilai setoran bulan ini</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-2">
                                {topPerformers.top_anggota.map((anggota, index) => (
                                    <div key={anggota.id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(anggota.nama_lengkap)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{anggota.nama_lengkap}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {anggota.setoran_count}x • {formatWeight(anggota.setoran_sum_berat_kg)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-green-600">
                                                {formatCurrency(anggota.setoran_sum_total_harga)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trend 6 Bulan</CardTitle>
                            <CardDescription>Perbandingan pemasukan vs pengeluaran</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="bulan" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Bar dataKey="pemasukan" fill="#10b981" name="Pemasukan" />
                                        <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
