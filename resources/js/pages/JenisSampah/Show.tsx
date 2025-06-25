// resources/js/pages/JenisSampah/Show.tsx
import { Head, Link, router } from "@inertiajs/react"
import {
    ArrowLeft,
    Coins,
    Copy,
    Edit,
    Package,
    Scale,
    ToggleLeft,
    ToggleRight,
    Trash2,
    TrendingUp
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import JenisSampahForm from "@/components/forms/JenisSampahForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"

interface JenisSampah {
  id: number
  nama_jenis: string
  harga_per_kg: number
  poin_per_kg: number
  deskripsi: string | null
  status_aktif: boolean
  created_at: string
  setoran: Array<{
    id: number
    nomor_setoran: string
    berat_kg: number
    total_harga: number
    poin_didapat: number
    tanggal_setoran: string
    waktu_setoran: string
    anggota: {
      id: number
      nama_lengkap: string
      nomor_anggota: string
    }
    admin: {
      id: number
      name: string
    }
  }>
}

interface ShowProps {
  jenisSampah: JenisSampah
  stats: {
    total_setoran: number
    total_berat_kg: number
    total_nilai: number
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

export default function Show({ jenisSampah, stats }: ShowProps) {
  const [showEditModal, setShowEditModal] = React.useState(false)

  // Actions
  const toggleStatus = () => {
    router.post(`/jenis-sampah/${jenisSampah.id}/toggle-status`, {}, {
      onSuccess: () => {
        toast.success('Status jenis sampah berhasil diubah!')
      },
      onError: () => {
        toast.error('Gagal mengubah status jenis sampah!')
      }
    })
  }

  const duplicateJenisSampah = () => {
    router.post(`/jenis-sampah/${jenisSampah.id}/duplicate`, {}, {
      onSuccess: () => {
        toast.success('Jenis sampah berhasil diduplikasi!')
      },
      onError: () => {
        toast.error('Gagal menduplikasi jenis sampah!')
      }
    })
  }

  const deleteJenisSampah = () => {
    if (confirm('Apakah Anda yakin ingin menghapus jenis sampah ini?')) {
      router.delete(`/jenis-sampah/${jenisSampah.id}`, {
        onSuccess: () => {
          toast.success('Jenis sampah berhasil dihapus!')
          router.visit('/jenis-sampah')
        },
        onError: (errors) => {
          if (errors.delete) {
            toast.error(errors.delete as string)
          } else {
            toast.error('Gagal menghapus jenis sampah!')
          }
        }
      })
    }
  }

  const openEditModal = () => {
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
  }

  return (
    <AppLayout>
      <Head title={`Detail Jenis Sampah - ${jenisSampah.nama_jenis}`} />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/jenis-sampah">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Detail Jenis Sampah</h1>
              <p className="text-muted-foreground">
                {jenisSampah.nama_jenis}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={duplicateJenisSampah}>
              <Copy className="mr-2 h-4 w-4" />
              Duplikasi
            </Button>
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <Button variant="outline" size="sm" onClick={openEditModal}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <JenisSampahForm 
                jenisSampah={jenisSampah}
                isEdit={true}
                onSuccess={closeEditModal}
              />
            </Dialog>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <CardTitle className="text-2xl">{jenisSampah.nama_jenis}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {jenisSampah.deskripsi || "Tidak ada deskripsi"}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={jenisSampah.status_aktif ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {jenisSampah.status_aktif ? "Aktif" : "Non-aktif"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harga per Kg</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(jenisSampah.harga_per_kg)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poin per Kg</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {jenisSampah.poin_per_kg} pts
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
                  <p className="text-lg font-semibold">
                    {formatDate(jenisSampah.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleStatus}
                className={jenisSampah.status_aktif ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
              >
                {jenisSampah.status_aktif ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                {jenisSampah.status_aktif ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.total_setoran}x
              </div>
              <p className="text-xs text-muted-foreground">
                Transaksi setoran
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Berat</CardTitle>
              <Scale className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Number(stats.total_berat_kg).toFixed(2)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Berat keseluruhan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
              <Coins className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_nilai)}
              </div>
              <p className="text-xs text-muted-foreground">
                Nilai keseluruhan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.setoran_bulan_ini}x
              </div>
              <p className="text-xs text-muted-foreground">
                Setoran bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Setoran */}
        <Card>
          <CardHeader>
            <CardTitle>Setoran Terbaru</CardTitle>
            <CardDescription>
              10 setoran terbaru untuk jenis sampah ini
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
                    <TableHead className="text-right">Berat (kg)</TableHead>
                    <TableHead className="text-right">Total Harga</TableHead>
                    <TableHead className="text-right">Poin</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jenisSampah.setoran.length > 0 ? (
                    jenisSampah.setoran.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
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
                          <div>
                            <div className="font-medium text-sm">
                              {item.anggota.nama_lengkap}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.anggota.nomor_anggota}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {Number(item.berat_kg).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600 text-sm">
                          {formatCurrency(item.total_harga)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600 text-sm">
                          {item.poin_didapat} pts
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.admin.name}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Belum ada data setoran.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
              onClick={deleteJenisSampah}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Jenis Sampah
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}