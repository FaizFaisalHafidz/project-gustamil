// resources/js/components/forms/PenarikanSaldoForm.tsx
import { useForm } from "@inertiajs/react"
import axios from "axios"
import { AlertCircle, CreditCard, DollarSign } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

interface PenarikanSaldoFormProps {
  anggotaId: number
  anggotaNama: string
  saldoAktif: number
  onSuccess?: () => void
}

export default function PenarikanSaldoForm({ 
  anggotaId, 
  anggotaNama, 
  saldoAktif,
  onSuccess 
}: PenarikanSaldoFormProps) {
  const [saldoInfo, setSaldoInfo] = useState({
    saldo_aktif: saldoAktif,
    status_aktif: true
  })

  const { data, setData, post, processing, errors, reset } = useForm({
    anggota_id: anggotaId,
    jumlah_penarikan: 0,
    catatan: '',
  })

  // Load latest saldo info
  useEffect(() => {
    const loadSaldoInfo = async () => {
      try {
        const response = await axios.get(`/penarikan-saldo/api/info-saldo/${anggotaId}`)
        setSaldoInfo(response.data)
      } catch (error) {
        console.error('Failed to load saldo info:', error)
      }
    }

    loadSaldoInfo()
  }, [anggotaId])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    post(`/data-anggota/${anggotaId}/penarikan-saldo`, {
      onSuccess: (page) => {
        const penarikanData = page.props.flash?.penarikan_data
        if (penarikanData) {
          toast.success('Penarikan saldo berhasil!', {
            description: `${penarikanData.anggota_nama} - ${formatCurrency(penarikanData.jumlah_penarikan)}`,
            duration: 5000,
          })
        } else {
          toast.success('Penarikan saldo berhasil!')
        }
        reset()
        onSuccess?.()
      },
      onError: (errors) => {
        if (errors.anggota_id) {
          toast.error(errors.anggota_id as string)
        } else if (errors.jumlah_penarikan) {
          toast.error(errors.jumlah_penarikan as string)
        } else if (errors.error) {
          toast.error(errors.error as string)
        } else {
          toast.error('Gagal melakukan penarikan saldo!')
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

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount)
  }

  // Quick amount buttons
  const quickAmounts = [50000, 100000, 250000, 500000, 1000000]

  const setQuickAmount = (amount: number) => {
    if (amount <= saldoInfo.saldo_aktif) {
      setData('jumlah_penarikan', amount)
    } else {
      toast.error('Jumlah melebihi saldo yang tersedia')
    }
  }

  const setMaxAmount = () => {
    setData('jumlah_penarikan', saldoInfo.saldo_aktif)
  }

  const sisaSaldo = saldoInfo.saldo_aktif - data.jumlah_penarikan

  return (
    <DialogContent className="sm:max-w-[525px]">
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Penarikan Saldo Tunai
          </DialogTitle>
          <DialogDescription>
            Penarikan saldo untuk anggota: <strong>{anggotaNama}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Saldo Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Saldo Tersedia</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(saldoInfo.saldo_aktif)}
            </div>
            <p className="text-sm text-green-700 mt-1">
              Rp {formatNumber(saldoInfo.saldo_aktif)}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Jumlah Cepat</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(amount)}
                  disabled={amount > saldoInfo.saldo_aktif}
                  className="text-xs"
                >
                  {amount >= 1000000 
                    ? `${amount / 1000000}jt` 
                    : `${amount / 1000}rb`
                  }
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setMaxAmount}
                className="text-xs font-medium"
              >
                Maksimal
              </Button>
            </div>
          </div>

          {/* Jumlah Penarikan */}
          <div className="grid gap-2">
            <Label htmlFor="jumlah_penarikan">
              Jumlah Penarikan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jumlah_penarikan"
              type="number"
              min="1000"
              max={saldoInfo.saldo_aktif}
              value={data.jumlah_penarikan}
              onChange={(e) => setData('jumlah_penarikan', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.jumlah_penarikan ? 'border-red-500' : ''}
            />
            {errors.jumlah_penarikan && (
              <p className="text-sm text-red-500">{errors.jumlah_penarikan}</p>
            )}
            {data.jumlah_penarikan > 0 && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(data.jumlah_penarikan)}
              </p>
            )}
          </div>

          {/* Sisa Saldo Preview */}
          {data.jumlah_penarikan > 0 && (
            <Alert className={sisaSaldo >= 0 ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">
                  Sisa saldo setelah penarikan: {formatCurrency(sisaSaldo)}
                </div>
                {sisaSaldo < 0 && (
                  <div className="text-red-600 text-sm mt-1">
                    Jumlah penarikan melebihi saldo yang tersedia
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Catatan */}
          <div className="grid gap-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              value={data.catatan}
              onChange={(e) => setData('catatan', e.target.value)}
              placeholder="Catatan penarikan (opsional)"
              className={errors.catatan ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.catatan && (
              <p className="text-sm text-red-500">{errors.catatan}</p>
            )}
          </div>

          {/* Warning */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Perhatian:</strong> Penarikan saldo akan langsung mengurangi saldo anggota 
              dan tidak dapat dibatalkan. Pastikan jumlah penarikan sudah benar.
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
            disabled={processing || data.jumlah_penarikan <= 0 || sisaSaldo < 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {processing ? 'Memproses...' : 'Proses Penarikan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}