import { useForm } from "@inertiajs/react"
import { AlertCircle, DollarSign } from "lucide-react"
import { FormEventHandler, useEffect } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Anggota {
  id: number
  nomor_anggota: string
  nama_lengkap: string
  saldo_aktif: number
}

interface Keuangan {
  id: number
  jenis_transaksi: 'masuk' | 'keluar'
  kategori_transaksi: string
  jumlah_uang: number
  keterangan: string
}

interface KeuanganFormProps {
  keuangan?: Keuangan | null
  onSuccess?: () => void
}

export default function KeuanganForm({ keuangan, onSuccess }: KeuanganFormProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    jenis_transaksi: keuangan?.jenis_transaksi || 'masuk',
    kategori_transaksi: keuangan?.kategori_transaksi || '',
    jumlah_uang: keuangan?.jumlah_uang || 0,
    keterangan: keuangan?.keterangan || '',
  })

  const isEditing = Boolean(keuangan)

  // Re-initialize form data when keuangan prop changes (for editing)
  useEffect(() => {
    if (keuangan) {
      setData({
        jenis_transaksi: keuangan.jenis_transaksi,
        kategori_transaksi: keuangan.kategori_transaksi,
        jumlah_uang: keuangan.jumlah_uang,
        keterangan: keuangan.keterangan,
      })
    }
  }, [keuangan, setData])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    // Remove the data wrapper - send data directly
    const submitData = {
      jenis_transaksi: data.jenis_transaksi,
      kategori_transaksi: data.kategori_transaksi,
      jumlah_uang: data.jumlah_uang,
      keterangan: data.keterangan,
    }

    if (isEditing && keuangan) {
      put(`/data-keuangan/${keuangan.id}`, {
        onSuccess: () => {
          toast.success('Transaksi berhasil diperbarui!')
          onSuccess?.()
        },
        onError: (errors) => {
          console.log('Edit errors:', errors)
          if (errors.error) {
            toast.error(errors.error as string)
          } else {
            toast.error('Gagal memperbarui transaksi!')
          }
        }
      })
    } else {
      post('/data-keuangan', {
        onSuccess: () => {
          toast.success('Transaksi berhasil ditambahkan!')
          reset()
          onSuccess?.()
        },
        onError: (errors) => {
          console.log('Store errors:', errors)
          if (errors.error) {
            toast.error(errors.error as string)
          } else {
            toast.error('Gagal menambahkan transaksi!')
          }
        }
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const kategoriOptions = [
    { value: 'penjualan_pengepul', label: 'Penjualan Pengepul' },
    { value: 'keperluan_operasional', label: 'Keperluan Operasional' },
  ]

  return (
    <DialogContent className="sm:max-w-[600px]">
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {isEditing ? 'Edit Transaksi Keuangan' : 'Tambah Transaksi Keuangan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Perbarui data transaksi keuangan' : 'Tambahkan transaksi keuangan baru'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Jenis Transaksi */}
          <div className="grid gap-2">
            <Label htmlFor="jenis_transaksi">
              Jenis Transaksi <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={data.jenis_transaksi} 
              onValueChange={(value) => setData('jenis_transaksi', value as 'masuk' | 'keluar')}
            >
              <SelectTrigger className={errors.jenis_transaksi ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih jenis transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Masuk</SelectItem>
                <SelectItem value="keluar">Keluar</SelectItem>
              </SelectContent>
            </Select>
            {errors.jenis_transaksi && (
              <p className="text-sm text-red-500">{errors.jenis_transaksi}</p>
            )}
          </div>

          {/* Kategori Transaksi */}
          <div className="grid gap-2">
            <Label htmlFor="kategori_transaksi">
              Kategori Transaksi <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={data.kategori_transaksi} 
              onValueChange={(value) => setData('kategori_transaksi', value)}
            >
              <SelectTrigger className={errors.kategori_transaksi ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih kategori transaksi" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kategori_transaksi && (
              <p className="text-sm text-red-500">{errors.kategori_transaksi}</p>
            )}
          </div>

          {/* Jumlah Uang */}
          <div className="grid gap-2">
            <Label htmlFor="jumlah_uang">
              Jumlah Uang <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jumlah_uang"
              type="number"
              min="1000"
              max="100000000"
              value={data.jumlah_uang}
              onChange={(e) => setData('jumlah_uang', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.jumlah_uang ? 'border-red-500' : ''}
            />
            {errors.jumlah_uang && (
              <p className="text-sm text-red-500">{errors.jumlah_uang}</p>
            )}
            {data.jumlah_uang > 0 && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(data.jumlah_uang)}
              </p>
            )}
          </div>

          {/* Anggota - HIDDEN: Hanya keluar masuk uang saja */}
          <input type="hidden" name="anggota_id" value="" />

          {/* Keterangan */}
          <div className="grid gap-2">
            <Label htmlFor="keterangan">
              Keterangan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="keterangan"
              value={data.keterangan}
              onChange={(e) => setData('keterangan', e.target.value)}
              placeholder="Keterangan transaksi"
              className={errors.keterangan ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.keterangan && (
              <p className="text-sm text-red-500">{errors.keterangan}</p>
            )}
          </div>

          {/* Warning */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Informasi:</strong> Transaksi ini hanya mencatat keluar masuk uang 
              dan tidak mempengaruhi saldo anggota.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={processing}>
              Batal
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={processing || !data.kategori_transaksi || data.jumlah_uang <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? 'Menyimpan...' : (isEditing ? 'Perbarui' : 'Simpan')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}