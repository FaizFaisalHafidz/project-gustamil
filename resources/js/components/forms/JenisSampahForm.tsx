// resources/js/components/forms/JenisSampahForm.tsx
import { useForm } from "@inertiajs/react"
import { FormEventHandler } from "react"
import { toast } from "sonner"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface JenisSampah {
  id?: number
  nama_jenis: string
  harga_per_kg: number
  poin_per_kg: number
  deskripsi: string | null
  status_aktif: boolean
}

interface JenisSampahFormProps {
  jenisSampah?: JenisSampah
  isEdit?: boolean
  onSuccess?: () => void
}

export default function JenisSampahForm({ jenisSampah, isEdit = false, onSuccess }: JenisSampahFormProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama_jenis: jenisSampah?.nama_jenis || '',
    harga_per_kg: jenisSampah?.harga_per_kg || 0,
    poin_per_kg: jenisSampah?.poin_per_kg || 0,
    deskripsi: jenisSampah?.deskripsi || '',
    status_aktif: jenisSampah?.status_aktif ?? true,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const options = {
      onSuccess: () => {
        toast.success(`Jenis sampah berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`)
        reset()
        onSuccess?.()
      },
      onError: (errors: any) => {
        if (errors.nama_jenis) {
          toast.error('Nama jenis sampah sudah ada!')
        } else {
          toast.error(`Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} jenis sampah!`)
        }
      }
    }

    if (isEdit && jenisSampah?.id) {
      put(`/jenis-sampah/${jenisSampah.id}`, options)
    } else {
      post('/jenis-sampah', options)
    }
  }

  return (
    <DialogContent className="sm:max-w-[525px]">
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Perbarui informasi jenis sampah'
              : 'Tambahkan jenis sampah baru dengan harga dan poin per kg'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nama Jenis */}
          <div className="grid gap-2">
            <Label htmlFor="nama_jenis">
              Nama Jenis <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_jenis"
              type="text"
              value={data.nama_jenis}
              onChange={(e) => setData('nama_jenis', e.target.value)}
              placeholder="Contoh: Kertas, Plastik, Logam"
              className={errors.nama_jenis ? 'border-red-500' : ''}
            />
            {errors.nama_jenis && (
              <p className="text-sm text-red-500">{errors.nama_jenis}</p>
            )}
          </div>

          {/* Harga dan Poin */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="harga_per_kg">
                Harga per Kg <span className="text-red-500">*</span>
              </Label>
              <Input
                id="harga_per_kg"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                value={data.harga_per_kg}
                onChange={(e) => setData('harga_per_kg', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.harga_per_kg ? 'border-red-500' : ''}
              />
              {errors.harga_per_kg && (
                <p className="text-sm text-red-500">{errors.harga_per_kg}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="poin_per_kg">
                Poin per Kg <span className="text-red-500">*</span>
              </Label>
              <Input
                id="poin_per_kg"
                type="number"
                min="0"
                max="999"
                value={data.poin_per_kg}
                onChange={(e) => setData('poin_per_kg', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.poin_per_kg ? 'border-red-500' : ''}
              />
              {errors.poin_per_kg && (
                <p className="text-sm text-red-500">{errors.poin_per_kg}</p>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="grid gap-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={data.deskripsi || ''}
              onChange={(e) => setData('deskripsi', e.target.value)}
              placeholder="Deskripsi optional untuk jenis sampah ini..."
              className={errors.deskripsi ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.deskripsi && (
              <p className="text-sm text-red-500">{errors.deskripsi}</p>
            )}
          </div>

          {/* Status Aktif */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="status_aktif" className="text-base">
                Status Aktif
              </Label>
              <p className="text-sm text-muted-foreground">
                {data.status_aktif ? 'Jenis sampah dapat digunakan untuk setoran' : 'Jenis sampah tidak dapat digunakan untuk setoran'}
              </p>
            </div>
            <Switch
              id="status_aktif"
              checked={data.status_aktif}
              onCheckedChange={(checked) => setData('status_aktif', checked)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={processing}>
              Batal
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processing ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Tambah')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}