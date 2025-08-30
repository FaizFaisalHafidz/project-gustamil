import { Head, Link, router, useForm } from "@inertiajs/react"
import {
    Calendar,
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet,
    X
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import KeuanganForm from "@/components/forms/KeuanganForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  jenis_transaksi: 'masuk' | 'keluar'
  kategori_transaksi: string
  jumlah_uang: number
  anggota: Anggota | null
  admin: Admin
  keterangan: string
  tanggal_transaksi: string
  waktu_transaksi: string
  created_at: string
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
  search?: string
}

interface IndexProps {
  keuangan: {
    data: Keuangan[]
    links: any[]
    meta: any
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
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timeString: string) => {
  return timeString.slice(0, 5) // HH:MM
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

export default function Index({ keuangan, summary, filters }: IndexProps) {
  // States
  const [showKeuanganModal, setShowKeuanganModal] = React.useState(false)
  const [editingKeuangan, setEditingKeuangan] = React.useState<Keuangan | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)

  // Search form
  const searchForm = useForm({
    search: filters.search || '',
  })

  // Filter form
  const filterForm = useForm({
    jenis_transaksi: filters.jenis_transaksi || '',
    kategori_transaksi: filters.kategori_transaksi || '',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  })

  // Handlers
  const openKeuanganModal = React.useCallback(() => {
    setEditingKeuangan(null)
    setShowKeuanganModal(true)
  }, [])

  const openEditModal = React.useCallback((keuanganData: Keuangan) => {
    setEditingKeuangan(keuanganData)
    setShowKeuanganModal(true)
  }, [])

  const closeKeuanganModal = React.useCallback(() => {
    setShowKeuanganModal(false)
    setEditingKeuangan(null)
  }, [])

  const handleSearch = React.useCallback((e: React.FormEvent) => {
    e.preventDefault()
    router.get('/data-keuangan', {
      ...filters,
      search: searchForm.data.search,
    }, {
      preserveState: true,
      replace: true,
    })
  }, [searchForm.data.search, filters])

  const handleFilter = React.useCallback(() => {
    router.get('/data-keuangan', {
      ...filterForm.data,
      search: filters.search,
    }, {
      preserveState: true,
      replace: true,
    })
  }, [filterForm.data, filters.search])

  const clearFilters = React.useCallback(() => {
    filterForm.reset()
    router.get('/data-keuangan', {}, {
      preserveState: true,
      replace: true,
    })
  }, [])

  const deleteKeuangan = React.useCallback((keuanganId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      router.delete(`/data-keuangan/${keuanganId}`, {
        onSuccess: () => {
          toast.success('Transaksi berhasil dihapus!')
        },
        onError: (errors) => {
          if (errors.error) {
            toast.error(errors.error as string)
          } else {
            toast.error('Gagal menghapus transaksi!')
          }
        }
      })
    }
  }, [])

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <AppLayout>
      <Head title="Data Keuangan" />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Data Keuangan</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Kelola transaksi keuangan dan laporan finansial
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={showKeuanganModal} onOpenChange={setShowKeuanganModal}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openKeuanganModal}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <KeuanganForm 
                keuangan={editingKeuangan}
                onSuccess={closeKeuanganModal}
              />
            </Dialog>
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
                Masuk - Keluar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {summary.total_transaksi}
              </div>
              <p className="text-xs text-muted-foreground">
                Jumlah transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <CardTitle>Daftar Transaksi</CardTitle>
                <CardDescription>
                  Riwayat semua transaksi keuangan
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari transaksi..."
                      value={searchForm.data.search}
                      onChange={(e) => searchForm.setData('search', e.target.value)}
                      className="pl-8 w-[200px] lg:w-[250px]"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="outline">
                    Cari
                  </Button>
                </form>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Filter Panel */}
          {showFilters && (
            <CardContent className="border-t bg-gray-50">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="jenis_transaksi">Jenis Transaksi</Label>
                  <select
                    id="jenis_transaksi"
                    value={filterForm.data.jenis_transaksi}
                    onChange={(e) => filterForm.setData('jenis_transaksi', e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Semua</option>
                    <option value="penjualan_pengepul">Penjualan Pengepul</option>
                    <option value="keperluan_operasional">Keperluan Operasional</option>
                  </select>
                </div>
                
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
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFilter}
                >
                  Terapkan Filter
                </Button>
              </div>
            </CardContent>
          )}
          
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
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keuangan?.data?.length > 0 ? (
                    keuangan.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
                          {item.nomor_transaksi}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {formatDate(item.tanggal_transaksi)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(item.waktu_transaksi)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {item.jenis_transaksi === 'masuk' ? 
                              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" /> : 
                              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                            }
                            <Badge variant={item.jenis_transaksi === 'masuk' ? 'default' : 'destructive'} className="text-xs">
                              {item.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getKategoriColor(item.kategori_transaksi)}`}>
                            {getKategoriLabel(item.kategori_transaksi)}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          item.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.jenis_transaksi === 'masuk' ? '+' : '-'}
                          {formatCurrency(item.jumlah_uang)}
                        </TableCell>
                        <TableCell>
                          {item.anggota ? (
                            <div className="text-sm">
                              <div className="font-medium">{item.anggota.nama_lengkap}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.anggota.nomor_anggota}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate text-sm" title={item.keterangan}>
                            {item.keterangan}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.admin.name}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/data-keuangan/${item.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Detail
                                </Link>
                              </DropdownMenuItem>
                              {!['penarikan_saldo', 'setoran_sampah'].includes(item.kategori_transaksi) && (
                                <>
                                  <DropdownMenuItem onClick={() => openEditModal(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteKeuangan(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        Belum ada data transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {keuangan?.links && keuangan?.meta && (
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