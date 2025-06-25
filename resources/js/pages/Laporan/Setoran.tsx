import { Head, Link, router, useForm } from "@inertiajs/react"
import {
  Filter,
  Scale,
  Search
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

interface JenisSampah {
  id: number
  nama_jenis: string
}

interface Admin {
  id: number
  name: string
}

interface Setoran {
  id: number
  nomor_setoran: string
  berat_kg: number
  harga_per_kg: number
  total_harga: number
  poin_didapat: number
  tanggal_setoran: string
  waktu_setoran: string
  anggota: Anggota
  jenis_sampah: JenisSampah // FIXED: dari log backend, property ini adalah jenis_sampah bukan jenisSampah
  admin: Admin
}

interface Summary {
  total_berat: number
  total_saldo: number
  total_poin: number
  total_transaksi: number
}

interface BreakdownJenis {
  jenis_sampah_id: number
  total_berat: number
  total_saldo: number
  total_transaksi: number
  jenis_sampah: JenisSampah // FIXED: dari log backend, property ini adalah jenis_sampah bukan jenisSampah
}

interface Filters {
  anggota_id?: string
  jenis_sampah_id?: string
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface SetoranProps {
  setoran: {
    data: Setoran[]
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
  breakdownJenis: BreakdownJenis[]
  anggotaList: Anggota[]
  jenisSampahList: JenisSampah[]
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

export default function Setoran({ setoran, summary, breakdownJenis, anggotaList, jenisSampahList, filters }: SetoranProps) {
  // Debug: Log data untuk memastikan
  React.useEffect(() => {
    console.log('Setoran data:', setoran)
    console.log('BreakdownJenis:', breakdownJenis)
    if (setoran.data && setoran.data[0]) {
      console.log('First setoran item:', setoran.data[0])
      console.log('First setoran jenis_sampah:', setoran.data[0].jenis_sampah)
    }
  }, [setoran, breakdownJenis])

  // Filter form
  const filterForm = useForm({
    anggota_id: filters.anggota_id || '',
    jenis_sampah_id: filters.jenis_sampah_id || '',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  })

  const handleFilter = React.useCallback(() => {
    router.get('/laporan/setoran', filterForm.data, {
      preserveState: true,
      replace: true,
    })
  }, [filterForm.data])

  const handleReset = React.useCallback(() => {
    filterForm.reset()
    router.get('/laporan/setoran')
  }, [])

  const handleExport = React.useCallback(() => {
    router.get('/laporan/export', {
      type: 'setoran', 
      format: 'excel',
      ...filterForm.data,
    })
  }, [filterForm.data])

  return (
    <AppLayout>
      <Head title="Laporan Setoran" />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/laporan" className="text-muted-foreground hover:text-foreground">
                Laporan
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">Setoran</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Laporan Setoran</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Riwayat setoran sampah dan analisis
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
              <CardTitle className="text-sm font-medium">Total Berat</CardTitle>
              <Scale className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatWeight(summary.total_berat)}
              </div>
              <p className="text-xs text-muted-foreground">
                Berat sampah total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
              <div className="h-4 w-4 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">Rp</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-blue-600">
                {formatCurrency(summary.total_saldo)}
              </div>
              <p className="text-xs text-muted-foreground">
                Nilai setoran total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
              <div className="h-4 w-4 bg-yellow-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-600">★</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                {summary.total_poin.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-muted-foreground">
                Poin yang didapat
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <div className="h-4 w-4 bg-purple-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">#</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {summary.total_transaksi}
              </div>
              <p className="text-xs text-muted-foreground">
                Jumlah setoran
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
                <Label htmlFor="anggota_id">Anggota</Label>
                <select
                  id="anggota_id"
                  value={filterForm.data.anggota_id}
                  onChange={(e) => filterForm.setData('anggota_id', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua anggota</option>
                  {anggotaList && anggotaList.length > 0 && anggotaList.map((anggota) => (
                    <option key={anggota.id} value={anggota.id.toString()}>
                      {anggota.nama_lengkap} ({anggota.nomor_anggota})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jenis_sampah_id">Jenis Sampah</Label>
                <select
                  id="jenis_sampah_id"
                  value={filterForm.data.jenis_sampah_id}
                  onChange={(e) => filterForm.setData('jenis_sampah_id', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua jenis</option>
                  {jenisSampahList && jenisSampahList.length > 0 && jenisSampahList.map((jenis) => (
                    <option key={jenis.id} value={jenis.id.toString()}>
                      {jenis.nama_jenis}
                    </option>
                  ))}
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

        {/* Breakdown by Jenis Sampah */}
        {breakdownJenis && breakdownJenis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Breakdown per Jenis Sampah</CardTitle>
              <CardDescription>
                Distribusi setoran berdasarkan jenis sampah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Sampah</TableHead>
                      <TableHead className="text-right">Total Berat</TableHead>
                      <TableHead className="text-right">Total Saldo</TableHead>
                      <TableHead className="text-right">Transaksi</TableHead>
                      <TableHead className="text-right">Rata-rata/kg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdownJenis.map((item) => (
                      <TableRow key={item.jenis_sampah_id}>
                        <TableCell className="font-medium">
                          {item.jenis_sampah?.nama_jenis || 'Tidak diketahui'} {/* FIXED: use jenis_sampah instead of jenisSampah */}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatWeight(item.total_berat)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(item.total_saldo)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{item.total_transaksi}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.total_berat > 0 ? formatCurrency(item.total_saldo / item.total_berat) : formatCurrency(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Setoran Sampah</CardTitle>
            <CardDescription>
              {setoran.meta?.total || 0} setoran ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Setoran</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Jenis Sampah</TableHead>
                    <TableHead className="text-right">Berat</TableHead>
                    <TableHead className="text-right">Harga/kg</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Poin</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setoran.data && setoran.data.length > 0 ? (
                    setoran.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.nomor_setoran}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{formatDate(item.tanggal_setoran)}</div>
                            <div className="text-xs text-muted-foreground">{formatTime(item.waktu_setoran)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{item.anggota?.nama_lengkap || 'Tidak diketahui'}</div>
                            <div className="text-xs text-muted-foreground">{item.anggota?.nomor_anggota || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.jenis_sampah?.nama_jenis || 'Tidak diketahui'} {/* FIXED: use jenis_sampah instead of jenisSampah */}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatWeight(item.berat_kg)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.harga_per_kg)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(item.total_harga)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.poin_didapat}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.admin?.name || 'Tidak diketahui'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-16 text-center">
                        Belum ada data setoran sampah.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {setoran.links && setoran.meta && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {setoran.meta.from || 0} sampai {setoran.meta.to || 0} dari {setoran.meta.total || 0} data
                </div>
                <div className="flex items-center space-x-2">
                  {setoran.links.map((link, index) => (
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