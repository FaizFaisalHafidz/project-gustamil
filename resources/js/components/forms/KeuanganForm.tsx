import { useForm } from "@inertiajs/react"
import axios from "axios"
import { AlertCircle, DollarSign, User } from "lucide-react"
import { FormEventHandler, useEffect, useState } from "react"
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
  anggota_id: number | null
  keterangan: string
}

interface KeuanganFormProps {
  keuangan?: Keuangan | null
  onSuccess?: () => void
}

export default function KeuanganForm({ keuangan, onSuccess }: KeuanganFormProps) {
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([])
  const [isLoadingAnggota, setIsLoadingAnggota] = useState(false)
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null)

  const { data, setData, post, put, processing, errors, reset } = useForm({
    jenis_transaksi: keuangan?.jenis_transaksi || 'masuk',
    kategori_transaksi: keuangan?.kategori_transaksi || '',
    jumlah_uang: keuangan?.jumlah_uang || 0,
    anggota_id: keuangan?.anggota_id || null,
    keterangan: keuangan?.keterangan || '',
  })

  const isEditing = Boolean(keuangan)

  // Load anggota list
  useEffect(() => {
    const loadAnggota = async () => {
      setIsLoadingAnggota(true)
      try {
        const response = await axios.get('/data-anggota/api/aktif')
        setAnggotaList(response.data)
      } catch (error) {
        toast.error('Gagal memuat data anggota')
      } finally {
        setIsLoadingAnggota(false)
      }
    }

    loadAnggota()
  }, [])

  // Set selected anggota on edit
  useEffect(() => {
    if (keuangan?.anggota_id && anggotaList.length > 0) {
      const anggota = anggotaList.find(a => a.id === keuangan.anggota_id)
      setSelectedAnggota(anggota || null)
    }
  }, [keuangan, anggotaList])

  const handleAnggotaChange = (anggotaId: string) => {
    if (anggotaId === 'none') {
      setData('anggota_id', null)
      setSelectedAnggota(null)
    } else {
      const anggota = anggotaList.find(a => a.id.toString() === anggotaId)
      setData('anggota_id', parseInt(anggotaId))
      setSelectedAnggota(anggota || null)
    }
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    // Remove the data wrapper - send data directly
    const submitData = {
      jenis_transaksi: data.jenis_transaksi,
      kategori_transaksi: data.kategori_transaksi,
      jumlah_uang: data.jumlah_uang,
      anggota_id: data.anggota_id,
      keterangan: data.keterangan,
    }

    if (isEditing) {
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
          setSelectedAnggota(null)
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
    { value: 'penarikan_anggota', label: 'Penarikan Anggota' },
  ]

  const saldoAffectingCategories = ['keperluan_operasional'] // Only keperluan_operasional affects saldo
  const affectsSaldo = data.anggota_id && saldoAffectingCategories.includes(data.kategori_transaksi)

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

          {/* Anggota */}
          <div className="grid gap-2">
            <Label htmlFor="anggota_id">Anggota</Label>
            <Select 
              value={data.anggota_id?.toString() || 'none'}
              onValueChange={handleAnggotaChange}
              disabled={isLoadingAnggota}
            >
              <SelectTrigger className={errors.anggota_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={isLoadingAnggota ? "Memuat..." : "Pilih anggota (opsional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada anggota terkait</SelectItem>
                {anggotaList.map((anggota) => (
                  <SelectItem key={anggota.id} value={anggota.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{anggota.nama_lengkap}</span>
                      <span className="text-xs text-muted-foreground">
                        {anggota.nomor_anggota} • Saldo: {formatCurrency(anggota.saldo_aktif)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.anggota_id && (
              <p className="text-sm text-red-500">{errors.anggota_id}</p>
            )}
          </div>

          {/* Saldo Preview */}
          {affectsSaldo && selectedAnggota && (
            <Alert className="border-blue-200 bg-blue-50">
              <User className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-medium text-blue-900">Dampak pada Saldo Anggota:</div>
                <div className="text-sm text-blue-800 mt-1">
                  <div>Anggota: {selectedAnggota.nama_lengkap}</div>
                  <div>Saldo Saat Ini: {formatCurrency(selectedAnggota.saldo_aktif)}</div>
                  <div>
                    Saldo Setelah Transaksi: {formatCurrency(
                      selectedAnggota.saldo_aktif + (
                        data.jenis_transaksi === 'masuk' ? data.jumlah_uang : -data.jumlah_uang
                      )
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

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
              <strong>Perhatian:</strong> Transaksi dengan kategori "Keperluan Operasional" 
              akan mempengaruhi saldo anggota yang dipilih.
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