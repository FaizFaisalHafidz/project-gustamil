// resources/js/components/forms/SetoranForm.tsx
import { useForm } from "@inertiajs/react"
import axios from "axios"
import { FormEventHandler, useEffect, useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface JenisSampah {
  id: number
  nama_jenis: string
  harga_per_kg: number
  poin_per_kg: number
}

interface SetoranFormProps {
  anggotaId: number
  anggotaNama: string
  onSuccess?: () => void
}

export default function SetoranForm({ anggotaId, anggotaNama, onSuccess }: SetoranFormProps) {
  const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([])
  const [selectedJenis, setSelectedJenis] = useState<JenisSampah | null>(null)
  const [isLoadingJenis, setIsLoadingJenis] = useState(true)

  const { data, setData, post, processing, errors, reset } = useForm({
    anggota_id: anggotaId,
    jenis_sampah_id: '',
    berat_kg: 0,
    catatan: '',
  })

  // Load jenis sampah aktif
  useEffect(() => {
    const loadJenisSampah = async () => {
      try {
        const response = await axios.get('/setoran/api/jenis-sampah-aktif')
        setJenisSampah(response.data)
      } catch (error) {
        toast.error('Gagal memuat jenis sampah')
      } finally {
        setIsLoadingJenis(false)
      }
    }

    loadJenisSampah()
  }, [])

  // Handle jenis sampah selection
  const handleJenisChange = (jenisId: string) => {
    setData('jenis_sampah_id', jenisId)
    const selected = jenisSampah.find(item => item.id.toString() === jenisId)
    setSelectedJenis(selected || null)
  }

  // Calculate estimated values
  const estimatedHarga = selectedJenis && data.berat_kg > 0 
    ? data.berat_kg * selectedJenis.harga_per_kg 
    : 0

  const estimatedPoin = selectedJenis && data.berat_kg > 0 
    ? Math.floor(data.berat_kg * selectedJenis.poin_per_kg)
    : 0

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    post(`/data-anggota/${anggotaId}/input-setoran`, {
      onSuccess: (page) => {
        const setoranData = page.props.flash?.setoran_data
        if (setoranData) {
          toast.success('Setoran berhasil dicatat!', {
            description: `${setoranData.jenis_sampah} - ${setoranData.berat_kg} kg`,
            duration: 5000,
          })
        } else {
          toast.success('Setoran berhasil dicatat!')
        }
        reset()
        onSuccess?.()
      },
      onError: (errors) => {
        if (errors.anggota_id) {
          toast.error(errors.anggota_id as string)
        } else if (errors.jenis_sampah_id) {
          toast.error(errors.jenis_sampah_id as string)
        } else if (errors.error) {
          toast.error(errors.error as string)
        } else {
          toast.error('Gagal mencatat setoran!')
        }
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DialogContent className="sm:max-w-[525px]">
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Input Setoran Sampah</DialogTitle>
          <DialogDescription>
            Catat setoran sampah untuk anggota: <strong>{anggotaNama}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Jenis Sampah */}
          <div className="grid gap-2">
            <Label htmlFor="jenis_sampah_id">
              Jenis Sampah <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={data.jenis_sampah_id} 
              onValueChange={handleJenisChange}
              disabled={isLoadingJenis}
            >
              <SelectTrigger className={errors.jenis_sampah_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={isLoadingJenis ? "Memuat..." : "Pilih jenis sampah"} />
              </SelectTrigger>
              <SelectContent>
                {jenisSampah.map((jenis) => (
                  <SelectItem key={jenis.id} value={jenis.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{jenis.nama_jenis}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(jenis.harga_per_kg)}/kg • {jenis.poin_per_kg} poin/kg
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jenis_sampah_id && (
              <p className="text-sm text-red-500">{errors.jenis_sampah_id}</p>
            )}
          </div>

          {/* Berat */}
          <div className="grid gap-2">
            <Label htmlFor="berat_kg">
              Berat (Kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="berat_kg"
              type="number"
              step="0.01"
              min="0.01"
              max="9999.99"
              value={data.berat_kg}
              onChange={(e) => setData('berat_kg', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.berat_kg ? 'border-red-500' : ''}
            />
            {errors.berat_kg && (
              <p className="text-sm text-red-500">{errors.berat_kg}</p>
            )}
          </div>

          {/* Estimasi Perhitungan */}
          {selectedJenis && data.berat_kg > 0 && (
            <div className="grid gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Estimasi Perhitungan</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Harga per kg:</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(selectedJenis.harga_per_kg)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Poin per kg:</span>
                  <span className="font-medium text-blue-900">
                    {selectedJenis.poin_per_kg} pts
                  </span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Harga:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(estimatedHarga)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Poin:</span>
                  <span className="font-bold text-blue-600">
                    {estimatedPoin} pts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Catatan */}
          <div className="grid gap-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              value={data.catatan}
              onChange={(e) => setData('catatan', e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              className={errors.catatan ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.catatan && (
              <p className="text-sm text-red-500">{errors.catatan}</p>
            )}
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
            disabled={processing || !selectedJenis || data.berat_kg <= 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processing ? 'Menyimpan...' : 'Catat Setoran'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}