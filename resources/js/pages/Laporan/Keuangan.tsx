import { Head, Link, router, useForm } from "@inertiajs/react"
import {
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"

interface Anggota {
  id: number
  nomor_anggota: string
  nama_lengkap: string
}

interface Admin {
  id: number
  name: string
}

interface Keuangan {
  id: number
  nomor_transaksi: string
  jenis_transaksi: string
  kategori_transaksi: string
  jumlah_uang: number
  keterangan: string
  tanggal_transaksi: string
  waktu_transaksi: string
  anggota?: Anggota
  admin: Admin
}

interface Summary {
  total_masuk: number
  total_keluar: number
  total_transaksi: number
  saldo_bersih: number
}

interface Filters {
  jenis_transaksi?: string
  kategori_transaksi?: string
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface KeuanganProps {
  keuangan: {
    data: Keuangan[]
    links?: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    meta?: {
      current_page: number
      from: number | null
      last_page: number
      path: string
      per_page: number
      to: number | null
      total: number
    }
  }
  summary: Summary
  filters: Filters
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString))
}

const formatTime = (timeString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`2000-01-01T${timeString}`))
}

const getJenisLabel = (jenis: string) => {
  return jenis === 'masuk' ? 'Masuk' : 'Keluar'
}

const getJenisColor = (jenis: string) => {
  return jenis === 'masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

const getKategoriLabel = (kategori: string) => {
  const labels: Record<string, string> = {
    'penjualan_pengepul': 'Penjualan Pengepul',
    'keperluan_operasional': 'Keperluan Operasional',
    'penarikan_anggota': 'Penarikan Anggota',
  }
  return labels[kategori] || kategori
}

const getKategoriColor = (kategori: string) => {
  const colors: Record<string, string> = {
    'penjualan_pengepul': 'bg-green-100 text-green-800',
    'keperluan_operasional': 'bg-blue-100 text-blue-800',
    'penarikan_anggota': 'bg-orange-100 text-orange-800',
  }
  return colors[kategori] || 'bg-gray-100 text-gray-800'
}

export default function Keuangan({ keuangan, summary, filters }: KeuanganProps) {
  // Filter form
  const filterForm = useForm({
    jenis_transaksi: filters.jenis_transaksi || '',
    kategori_transaksi: filters.kategori_transaksi || '',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  })

  const handleFilter = React.useCallback(() => {
    router.get('/laporan/keuangan', filterForm.data, {
      preserveState: true,
      replace: true,
    })
  }, [filterForm.data])

  const handleReset = React.useCallback(() => {
    filterForm.reset()
    router.get('/laporan/keuangan')
  }, [])

  const handleExport = React.useCallback(() => {
    router.get('/laporan/export', {
      type: 'keuangan',
      format: 'excel',
      ...filterForm.data,
    })
  }, [filterForm.data])

  return (
    <AppLayout>
      <Head title="Laporan Keuangan" />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/laporan" className="text-muted-foreground hover:text-foreground">
                Laporan
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">Keuangan</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Detail transaksi keuangan masuk dan keluar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button> */}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Masuk</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_masuk)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pemasukan total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_keluar)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengeluaran total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl lg:text-2xl font-bold ${
                summary.saldo_bersih >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.saldo_bersih)}
              </div>
              <p className="text-xs text-muted-foreground">
                Selisih masuk - keluar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <div className="h-4 w-4 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">#</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-blue-600">
                {summary.total_transaksi}
              </div>
              <p className="text-xs text-muted-foreground">
                Jumlah transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="jenis_transaksi">Jenis Transaksi</Label>
                <select
                  id="jenis_transaksi"
                  value={filterForm.data.jenis_transaksi}
                  onChange={(e) => filterForm.setData('jenis_transaksi', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua</option>
                  <option value="masuk">Masuk</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kategori_transaksi">Kategori</Label>
                <select
                  id="kategori_transaksi"
                  value={filterForm.data.kategori_transaksi}
                  onChange={(e) => filterForm.setData('kategori_transaksi', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua</option>
                  <option value="penjualan_pengepul">Penjualan Pengepul</option>
                  <option value="keperluan_operasional">Keperluan Operasional</option>
                  <option value="penarikan_anggota">Penarikan Anggota</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                <Input
                  id="tanggal_mulai"
                  type="date"
                  value={filterForm.data.tanggal_mulai}
                  onChange={(e) => filterForm.setData('tanggal_mulai', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                <Input
                  id="tanggal_selesai"
                  type="date"
                  value={filterForm.data.tanggal_selesai}
                  onChange={(e) => filterForm.setData('tanggal_selesai', e.target.value)}
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Transaksi Keuangan</CardTitle>
            <CardDescription>
              {keuangan.meta?.total || 0} transaksi ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keuangan.data && keuangan.data.length > 0 ? (
                    keuangan.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.nomor_transaksi}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{formatDate(item.tanggal_transaksi)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(item.waktu_transaksi)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getJenisColor(item.jenis_transaksi)}>
                            {getJenisLabel(item.jenis_transaksi)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getKategoriColor(item.kategori_transaksi)}>
                            {getKategoriLabel(item.kategori_transaksi)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            item.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.jenis_transaksi === 'keluar' ? '-' : '+'}{formatCurrency(item.jumlah_uang)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.anggota ? (
                            <div className="text-sm">
                              <div className="font-medium">{item.anggota.nama_lengkap}</div>
                              <div className="text-xs text-muted-foreground">{item.anggota.nomor_anggota}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.admin.name}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm truncate" title={item.keterangan}>
                            {item.keterangan}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-16 text-center">
                        Belum ada data transaksi keuangan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {keuangan.links && keuangan.meta && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {keuangan.meta.from || 0} sampai {keuangan.meta.to || 0} dari {keuangan.meta.total || 0} data
                </div>
                <div className="flex items-center space-x-2">
                  {keuangan.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (link.url) {
                          router.get(link.url)
                        }
                      }}
                      disabled={!link.url}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}