import { Head, Link, router, useForm } from "@inertiajs/react"
import {
  Filter,
  Search,
  UserCheck,
  Users,
  UserX
} from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  email: string
  nomor_telepon: string
  saldo_aktif: number
  total_poin: number
  status_aktif: boolean
  setoran_count: number
  setoran_sum_total_harga: number
  setoran_sum_poin_didapat: number
  setoran_sum_berat_kg: number
}

interface Summary {
  total_anggota: number
  anggota_aktif: number
  anggota_non_aktif: number
  total_saldo_all: number
}

interface Filters {
  status_aktif?: number
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface AnggotaProps {
  anggota: {
    data: Anggota[]
    links?: Array<{  // Made optional
      url: string | null
      label: string
      active: boolean
    }>
    meta?: {  // Made optional
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

const formatWeight = (weight: number) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(weight) + " kg"
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Anggota({ anggota, summary, filters }: AnggotaProps) {
  // Filter form
  const filterForm = useForm({
    status_aktif: filters.status_aktif?.toString() || '',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  })

  const handleFilter = React.useCallback(() => {
    const data = {
      ...filterForm.data,
      status_aktif: filterForm.data.status_aktif === '' ? undefined : parseInt(filterForm.data.status_aktif)
    }
    router.get('/laporan/anggota', data, {
      preserveState: true,
      replace: true,
    })
  }, [filterForm.data])

  const handleReset = React.useCallback(() => {
    filterForm.reset()
    router.get('/laporan/anggota')
  }, [])

  const handleExport = React.useCallback(() => {
    router.get('/laporan/export', {
      type: 'anggota',
      format: 'excel',
      ...filterForm.data,
    })
  }, [filterForm.data])

  return (
    <AppLayout>
      <Head title="Laporan Anggota" />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/laporan" className="text-muted-foreground hover:text-foreground">
                Laporan
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">Anggota</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Laporan Anggota</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Performa dan aktivitas anggota
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
              <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
              <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-blue-600">
                {summary.total_anggota}
              </div>
              <p className="text-xs text-muted-foreground">
                Semua anggota terdaftar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {summary.anggota_aktif}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.total_anggota > 0 ? Math.round((summary.anggota_aktif / summary.total_anggota) * 100) : 0}% dari total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Non-Aktif</CardTitle>
              <UserX className="h-4 w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-red-600">
                {summary.anggota_non_aktif}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.total_anggota > 0 ? Math.round((summary.anggota_non_aktif / summary.total_anggota) * 100) : 0}% dari total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
              <div className="h-4 w-4 bg-purple-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">Rp</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {formatCurrency(summary.total_saldo_all)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo keseluruhan anggota
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="status_aktif">Status</Label>
                <select
                  id="status_aktif"
                  value={filterForm.data.status_aktif}
                  onChange={(e) => filterForm.setData('status_aktif', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Semua status</option>
                  <option value="1">Aktif</option>
                  <option value="0">Non-Aktif</option>
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
            <CardTitle>Data Anggota</CardTitle>
            <CardDescription>
              {anggota.meta?.total || 0} anggota ditemukan {/* FIXED: Added optional chaining and fallback */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Saldo Aktif</TableHead>
                    <TableHead className="text-right">Total Poin</TableHead> 
                    <TableHead className="text-right">Setoran</TableHead>
                    <TableHead className="text-right">Total Berat</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                    <TableHead className="text-right">Performa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* FIXED: Added null check */}
                  {anggota.data && anggota.data.length > 0 ? (
                    anggota.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(item.nama_lengkap)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{item.nama_lengkap}</div>
                              <div className="text-xs text-muted-foreground">{item.nomor_anggota}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.email}</div>
                            <div className="text-xs text-muted-foreground">{item.nomor_telepon}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.status_aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {item.status_aktif ? 'Aktif' : 'Non-Aktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.saldo_aktif)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.total_poin.toLocaleString('id-ID')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {item.setoran_count || 0}x
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatWeight(item.setoran_sum_berat_kg || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(item.setoran_sum_total_harga || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <div className="font-medium">
                              {item.setoran_sum_total_harga && item.setoran_sum_berat_kg ? 
                                formatCurrency(item.setoran_sum_total_harga / item.setoran_sum_berat_kg) : 
                                formatCurrency(0)
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">per kg</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-16 text-center">
                        Belum ada data anggota.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - FIXED: Added null checks */}
            {anggota.links && anggota.meta && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {anggota.meta.from || 0} sampai {anggota.meta.to || 0} dari {anggota.meta.total || 0} data
                </div>
                <div className="flex items-center space-x-2">
                  {anggota.links.map((link, index) => (
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