import { Head, Link, router } from "@inertiajs/react"
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Edit,
    Mail,
    MoreHorizontal,
    Package,
    Phone,
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
    UserCheck,
    UserX,
    Wallet
} from "lucide-react"
import * as React from "react"
import { toast, Toaster } from "sonner"

import PenarikanSaldoForm from "@/components/forms/PenarikanSaldoForm"
import SetoranForm from "@/components/forms/SetoranForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/layouts/app-layout"

interface Anggota {
  id: number
  nomor_anggota: string
  nama_lengkap: string
  nomor_telepon: string | null
  saldo_aktif: number
  total_poin: number
  total_setoran_kg: number
  status_aktif: boolean
  user: {
    id: number
    name: string
    email: string
  }
  created_at: string
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
  catatan: string | null
  jenis_sampah: {
    id: number
    nama_jenis: string
  }
  admin: {
    id: number
    name: string
  }
}

interface HistorySaldo {
  id: number
  nomor_transaksi: string
  jenis_transaksi: 'masuk' | 'keluar'
  kategori_transaksi: string
  jumlah_saldo: number
  jumlah_poin: number
  saldo_sebelum: number
  saldo_sesudah: number
  poin_sebelum: number
  poin_sesudah: number
  keterangan: string | null
  tanggal_transaksi: string
  waktu_transaksi: string
  admin: {
    id: number
    name: string
  }
}

interface ShowProps {
  anggota: Anggota
  setoran: {
    data: Setoran[]
    links: any[]
    meta: any
  }
  historySaldo: {
    data: HistorySaldo[]
    links: any[]
    meta: any
  }
  summary: {
    total_setoran: number
    total_berat_kg: number
    saldo_aktif: number
    total_poin: number
    setoran_bulan_ini: number
  }
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

export default function Show({ anggota, setoran, historySaldo, summary }: ShowProps) {
  // Modal state
  const [showSetoranModal, setShowSetoranModal] = React.useState(false)
  const [showPenarikanModal, setShowPenarikanModal] = React.useState(false)

  // Modal handlers
  const openSetoranModal = React.useCallback(() => {
    setShowSetoranModal(true)
  }, [])

  const closeSetoranModal = React.useCallback(() => {
    setShowSetoranModal(false)
  }, [])

  const openPenarikanModal = React.useCallback(() => {
    setShowPenarikanModal(true)
  }, [])

  const closePenarikanModal = React.useCallback(() => {
    setShowPenarikanModal(false)
  }, [])

  // Actions
  const toggleStatus = React.useCallback(() => {
    router.post(`/data-anggota/${anggota.id}/toggle-status`, {}, {
      onSuccess: () => {
        toast.success('Status anggota berhasil diubah!')
      },
      onError: () => {
        toast.error('Gagal mengubah status anggota!')
      }
    })
  }, [anggota.id])

  const deleteAnggota = React.useCallback(() => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      router.delete(`/data-anggota/${anggota.id}`, {
        onSuccess: () => {
          toast.success('Anggota berhasil dihapus!')
          router.visit('/data-anggota')
        },
        onError: () => {
          toast.error('Gagal menghapus anggota!')
        }
      })
    }
  }, [anggota.id])

  const deleteSetoran = React.useCallback((setoranId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data setoran ini?')) {
      router.delete(`/setoran/${setoranId}`, {
        onSuccess: () => {
          toast.success('Data setoran berhasil dihapus!')
        },
        onError: (errors) => {
          if (errors.error) {
            toast.error(errors.error as string)
          } else {
            toast.error('Gagal menghapus data setoran!')
          }
        }
      })
    }
  }, [])

  // Error boundary check
  if (!anggota || !setoran || !historySaldo || !summary) {
    return (
      <AppLayout>
        <Head title="Error - Data tidak ditemukan" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground">Data tidak dapat dimuat</p>
            <Button asChild className="mt-4">
              <Link href="/data-anggota">Kembali ke Daftar Anggota</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Head title={`Detail Anggota - ${anggota.nama_lengkap}`} />

      <Toaster position="top-right" richColors />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/data-anggota">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Detail Anggota</h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                {anggota.nomor_anggota} • {anggota.nama_lengkap}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={showSetoranModal} onOpenChange={setShowSetoranModal}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openSetoranModal}
                  disabled={!anggota.status_aktif}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Input Setoran
                </Button>
              </DialogTrigger>
              <SetoranForm 
                anggotaId={anggota.id}
                anggotaNama={anggota.nama_lengkap}
                onSuccess={closeSetoranModal}
              />
            </Dialog>
            
            <Dialog open={showPenarikanModal} onOpenChange={setShowPenarikanModal}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!anggota.status_aktif || anggota.saldo_aktif < 1000}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Penarikan Saldo
                </Button>
              </DialogTrigger>
              <PenarikanSaldoForm 
                anggotaId={anggota.id}
                anggotaNama={anggota.nama_lengkap}
                saldoAktif={anggota.saldo_aktif}
                onSuccess={closePenarikanModal}
              />
            </Dialog>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xl lg:text-2xl truncate">{anggota.nama_lengkap}</CardTitle>
                  <CardDescription className="text-base lg:text-lg">
                    {anggota.nomor_anggota}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={anggota.status_aktif ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {anggota.status_aktif ? "Aktif" : "Non-aktif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Contact Information */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground truncate">{anggota.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">No. Telepon</p>
                  <p className="text-sm text-muted-foreground">
                    {anggota.nomor_telepon || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Bergabung</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(anggota.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/data-anggota/${anggota.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Anggota
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleStatus}
                className={anggota.status_aktif ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
              >
                {anggota.status_aktif ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {anggota.status_aktif ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Aktif</CardTitle>
              <Wallet className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(anggota.saldo_aktif)}
              </div>
              <p className="text-xs text-muted-foreground">
                Dapat ditarik
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-blue-600">
                {anggota.total_poin} pts
              </div>
              <p className="text-xs text-muted-foreground">
                Poin terkumpul
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
              <Package className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-purple-600">
                {summary.total_setoran}x
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(anggota.total_setoran_kg).toFixed(2)} kg total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-orange-600">
                {summary.setoran_bulan_ini}x
              </div>
              <p className="text-xs text-muted-foreground">
                Setoran bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="setoran" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setoran">Riwayat Setoran</TabsTrigger>
            <TabsTrigger value="saldo">Mutasi Saldo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setoran" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle>Riwayat Setoran</CardTitle>
                    <CardDescription>
                      Daftar semua setoran sampah yang telah dilakukan
                    </CardDescription>
                  </div>
                  <Dialog open={showSetoranModal} onOpenChange={setShowSetoranModal}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        onClick={openSetoranModal}
                        disabled={!anggota.status_aktif}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Setoran
                      </Button>
                    </DialogTrigger>
                    <SetoranForm 
                      anggotaId={anggota.id}
                      anggotaNama={anggota.nama_lengkap}
                      onSuccess={closeSetoranModal}
                    />
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Setoran</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis Sampah</TableHead>
                        <TableHead className="text-right">Berat (kg)</TableHead>
                        <TableHead className="text-right">Harga/kg</TableHead>
                        <TableHead className="text-right">Total Harga</TableHead>
                        <TableHead className="text-right">Poin</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {setoran?.data?.length > 0 ? (
                        setoran.data.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">
                              {item.nomor_setoran}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">
                                  {formatDate(item.tanggal_setoran)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(item.waktu_setoran)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">
                                {item.jenis_sampah.nama_jenis}
                              </div>
                              {item.catatan && (
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {item.catatan}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {Number(item.berat_kg).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-green-600">
                              {formatCurrency(item.harga_per_kg)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(item.total_harga)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-blue-600">
                              {item.poin_didapat} pts
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
                                  <DropdownMenuItem 
                                    onClick={() => deleteSetoran(item.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            Belum ada data setoran.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saldo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mutasi Saldo</CardTitle>
                <CardDescription>
                  Riwayat perubahan saldo dan poin anggota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">No. Transaksi</TableHead>
                        <TableHead className="min-w-[120px]">Tanggal</TableHead>
                        <TableHead className="min-w-[100px]">Jenis</TableHead>
                        <TableHead className="min-w-[200px]">Keterangan</TableHead>
                        <TableHead className="text-right min-w-[100px]">Jumlah</TableHead>
                        <TableHead className="text-right min-w-[80px]">Poin</TableHead>
                        <TableHead className="text-right min-w-[100px]">Saldo Akhir</TableHead>
                        <TableHead className="min-w-[120px]">Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historySaldo?.data?.length > 0 ? (
                        historySaldo.data.map((item) => (
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
                            <TableCell className="max-w-[200px]">
                              <div className="truncate text-sm" title={item.keterangan || ''}>
                                {item.keterangan || '-'}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right font-medium text-sm ${
                              item.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.jenis_transaksi === 'masuk' ? '+' : '-'}
                              {formatCurrency(Math.abs(item.jumlah_saldo))}
                            </TableCell>
                            <TableCell className="text-right font-medium text-blue-600 text-sm">
                              {item.jumlah_poin > 0 ? `+${item.jumlah_poin}` : item.jumlah_poin} pts
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                              {formatCurrency(item.saldo_sesudah)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.admin.name}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Belum ada riwayat transaksi.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
            <CardDescription>
              Aksi ini tidak dapat dibatalkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={deleteAnggota}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Anggota
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}