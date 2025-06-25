import { Head, router, useForm } from "@inertiajs/react"
import {
  BarChart3,
  Filter,
  Scale,
  Users,
  Wallet
} from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"

interface Summary {
  keuangan: {
    total_masuk: number
    total_keluar: number
    saldo_bersih: number
  }
  setoran: {
    total_transaksi: number
    total_berat: number
    total_saldo: number
  }
  anggota: {
    total_aktif: number
    total_saldo: number
  }
}

interface ChartData {
  daily_transactions: Array<{
    tanggal: string
    masuk: number
    keluar: number
  }>
  kategori_breakdown: Array<{
    kategori_transaksi: string
    total: number
    count: number
  }>
}

interface TopPerformers {
  top_anggota: Array<{
    id: number
    nama_lengkap: string
    nomor_anggota: string
    setoran_sum_total_harga: number
    setoran_sum_berat_kg: number
    setoran_count: number
  }>
  top_jenis_sampah: Array<{
    id: number
    nama_jenis: string // FIXED: use nama_jenis from model
    setoran_sum_berat_kg: number
    setoran_sum_total_harga: number
  }>
}

interface Filters {
  periode: string
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface IndexProps {
  summary: Summary
  chartData: ChartData
  topPerformers: TopPerformers
  filters: Filters
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatWeight = (weight: number) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(weight) + " kg"
}

const getKategoriLabel = (kategori: string) => {
  const labels: Record<string, string> = {
    'penjualan_pengepul': 'Penjualan Pengepul',
    'keperluan_operasional': 'Keperluan Operasional',
    'penarikan_anggota': 'Penarikan Anggota',
  }
  return labels[kategori] || kategori
}

export default function Index({ summary, chartData, topPerformers, filters }: IndexProps) {
  // Filter form
  const filterForm = useForm({
    periode: filters.periode || 'bulan_ini',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  })

  const handleFilter = React.useCallback(() => {
    router.get('/laporan', filterForm.data, {
      preserveState: true,
      replace: true,
    })
  }, [filterForm.data])

  const handleExport = React.useCallback((type: string, format: string = 'excel') => {
    router.get('/laporan/export', {
      type,
      format,
      ...filterForm.data,
    }, {
      onSuccess: () => {
        // Handle success
      }
    })
  }, [filterForm.data])

  return (
    <AppLayout>
      <Head title="Laporan" />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Laporan</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Dashboard dan laporan komprehensif sistem
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('keuangan')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button> */}
          </div>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="periode">Periode</Label>
                <Select
                  value={filterForm.data.periode}
                  onValueChange={(value) => filterForm.setData('periode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hari_ini">Hari Ini</SelectItem>
                    <SelectItem value="minggu_ini">Minggu Ini</SelectItem>
                    <SelectItem value="bulan_ini">Bulan Ini</SelectItem>
                    <SelectItem value="tahun_ini">Tahun Ini</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filterForm.data.periode === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                    <Input
                      type="date"
                      value={filterForm.data.tanggal_mulai}
                      onChange={(e) => filterForm.setData('tanggal_mulai', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                    <Input
                      type="date"
                      value={filterForm.data.tanggal_selesai}
                      onChange={(e) => filterForm.setData('tanggal_selesai', e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl lg:text-2xl font-bold ${
                summary.keuangan.saldo_bersih >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.keuangan.saldo_bersih)}
              </div>
              <p className="text-xs text-muted-foreground">
                Masuk: {formatCurrency(summary.keuangan.total_masuk)} | 
                Keluar: {formatCurrency(summary.keuangan.total_keluar)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
              <Scale className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatWeight(summary.setoran.total_berat)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.setoran.total_transaksi} transaksi | 
                {formatCurrency(summary.setoran.total_saldo)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
              <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {summary.anggota.total_aktif}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Saldo: {formatCurrency(summary.anggota.total_saldo)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategori Transaksi</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-orange-600">
                {chartData.kategori_breakdown.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Jenis kategori aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.get('/laporan/keuangan')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Laporan Keuangan
              </CardTitle>
              <CardDescription>
                Detail transaksi keuangan masuk dan keluar
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.get('/laporan/setoran')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" />
                Laporan Setoran
              </CardTitle>
              <CardDescription>
                Riwayat setoran sampah dan analisis
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.get('/laporan/anggota')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Laporan Anggota
              </CardTitle>
              <CardDescription>
                Performa dan aktivitas anggota
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top Anggota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Top Anggota
              </CardTitle>
              <CardDescription>
                Anggota dengan setoran terbanyak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead className="text-right">Berat</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Transaksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.top_anggota.length > 0 ? (
                      topPerformers.top_anggota.slice(0, 5).map((anggota, index) => (
                        <TableRow key={anggota.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{anggota.nama_lengkap}</div>
                              <div className="text-xs text-muted-foreground">{anggota.nomor_anggota}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatWeight(anggota.setoran_sum_berat_kg || 0)} {/* Fixed */}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(anggota.setoran_sum_total_harga || 0)} {/* Fixed */}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{anggota.setoran_count || 0}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-16 text-center">
                          Belum ada data setoran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Jenis Sampah */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" />
                Top Jenis Sampah
              </CardTitle>
              <CardDescription>
                Jenis sampah dengan berat terbanyak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Sampah</TableHead>
                      <TableHead className="text-right">Berat</TableHead>
                      <TableHead className="text-right">Total Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.top_jenis_sampah.length > 0 ? (
                      topPerformers.top_jenis_sampah.slice(0, 5).map((jenis) => (
                        <TableRow key={jenis.id}>
                          <TableCell className="font-medium">
                            {jenis.nama_jenis} {/* FIXED: use nama_jenis */}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatWeight(jenis.setoran_sum_berat_kg || 0)} {/* Fixed */}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(jenis.setoran_sum_total_harga || 0)} {/* Fixed */}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-16 text-center">
                          Belum ada data setoran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kategori Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Breakdown Kategori Transaksi
            </CardTitle>
            <CardDescription>
              Distribusi transaksi berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Total Nominal</TableHead>
                    <TableHead className="text-right">Jumlah Transaksi</TableHead>
                    <TableHead className="text-right">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.kategori_breakdown.length > 0 ? (
                    chartData.kategori_breakdown.map((kategori) => (
                      <TableRow key={kategori.kategori_transaksi}>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {getKategoriLabel(kategori.kategori_transaksi)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(kategori.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{kategori.count}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(kategori.total / kategori.count)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-16 text-center">
                        Belum ada data transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}