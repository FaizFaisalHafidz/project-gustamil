// resources/js/components/forms/AnggotaForm.tsx
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

interface Anggota {
  id?: number
  nama_lengkap: string
  email: string
  nomor_telepon: string | null
  status_aktif: boolean
}

interface AnggotaFormProps {
  anggota?: Anggota
  isEdit?: boolean
  onSuccess?: () => void
}

export default function AnggotaForm({ anggota, isEdit = false, onSuccess }: AnggotaFormProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama_lengkap: anggota?.nama_lengkap || '',
    email: anggota?.email || '',
    nomor_telepon: anggota?.nomor_telepon || '',
    status_aktif: anggota?.status_aktif ?? true,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    const options = {
      onSuccess: (page: any) => {
        // Handle password dari response jika create new user
        if (!isEdit && page.props.flash?.password) {
          toast.success(`Anggota berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`, {
            description: `Password: ${page.props.flash.password}`,
            duration: 10000,
          })
        } else {
          toast.success(`Anggota berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`)
        }
        reset()
        onSuccess?.()
      },
      onError: (errors: any) => {
        // Handle specific error messages
        if (errors.email) {
          toast.error('Email sudah digunakan!')
        } else {
          toast.error(`Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} anggota!`)
        }
      }
    }

    if (isEdit && anggota?.id) {
      put(`/data-anggota/${anggota.id}`, options)
    } else {
      post('/data-anggota', options)
    }
  }

  return (
    <DialogContent className="sm:max-w-[525px]">
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Perbarui informasi anggota bank sampah RT'
              : 'Tambahkan anggota baru bank sampah RT. Password akan dibuat otomatis.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nama Lengkap */}
          <div className="grid gap-2">
            <Label htmlFor="nama_lengkap">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_lengkap"
              type="text"
              value={data.nama_lengkap}
              onChange={(e) => setData('nama_lengkap', e.target.value)}
              placeholder="Masukkan nama lengkap"
              className={errors.nama_lengkap ? 'border-red-500' : ''}
            />
            {errors.nama_lengkap && (
              <p className="text-sm text-red-500">{errors.nama_lengkap}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="contoh@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Nomor Telepon */}
          <div className="grid gap-2">
            <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
            <Input
              id="nomor_telepon"
              type="tel"
              value={data.nomor_telepon || ''}
              onChange={(e) => setData('nomor_telepon', e.target.value)}
              placeholder="08123456789"
              className={errors.nomor_telepon ? 'border-red-500' : ''}
            />
            {errors.nomor_telepon && (
              <p className="text-sm text-red-500">{errors.nomor_telepon}</p>
            )}
          </div>

          {/* Status Aktif - Only show for edit */}
          {isEdit && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="status_aktif" className="text-base">
                  Status Anggota
                </Label>
                <p className="text-sm text-muted-foreground">
                  {data.status_aktif ? 'Anggota dapat melakukan setoran' : 'Anggota tidak dapat melakukan setoran'}
                </p>
              </div>
              <Switch
                id="status_aktif"
                checked={data.status_aktif}
                onCheckedChange={(checked) => setData('status_aktif', checked)}
              />
            </div>
          )}
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {processing ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Tambah Anggota')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}