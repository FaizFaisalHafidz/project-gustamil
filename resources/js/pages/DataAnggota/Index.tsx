// resources/js/pages/DataAnggota/Index.tsx
import { Head, Link, router } from "@inertiajs/react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX
} from "lucide-react"
import * as React from "react"
import { toast, Toaster } from "sonner"

import AnggotaForm from "@/components/forms/AnggotaForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"

export type Anggota = {
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

interface IndexProps {
  anggota: {
    data: Anggota[]
    links: any[]
    meta: any
  }
  filters: {
    search?: string
    status?: string
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function Index({ anggota, filters }: IndexProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState(filters.search || "")
  const [statusFilter, setStatusFilter] = React.useState(filters.status || "all")
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [selectedAnggota, setSelectedAnggota] = React.useState<Anggota | null>(null)

  // Stats calculation - FIXED: Handle NaN values
  const stats = React.useMemo(() => {
    const totalAnggota = anggota.data.length
    const anggotaAktif = anggota.data.filter(item => item.status_aktif).length
    const anggotaNonaktif = totalAnggota - anggotaAktif
    
    // FIXED: Properly handle saldo calculation
    const totalSaldo = anggota.data.reduce((sum, item) => {
      const saldo = typeof item.saldo_aktif === 'string' 
        ? parseFloat(item.saldo_aktif) 
        : (item.saldo_aktif || 0)
      
      // Check if the parsed value is a valid number
      return sum + (isNaN(saldo) ? 0 : saldo)
    }, 0)

    return {
      totalAnggota,
      anggotaAktif,
      anggotaNonaktif,
      totalSaldo
    }
  }, [anggota.data])

  const columns: ColumnDef<Anggota>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nomor_anggota",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium"
          >
            No. Anggota
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "nama_lengkap",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium"
          >
            Nama Lengkap
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.user.email}
        </div>
      ),
    },
    {
      accessorKey: "nomor_telepon",
      header: "No. Telepon",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("nomor_telepon") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "saldo_aktif",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium justify-end"
          >
            Saldo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        // FIXED: Handle saldo display with proper parsing
        const rawAmount = row.getValue("saldo_aktif")
        const amount = typeof rawAmount === 'string' 
          ? parseFloat(rawAmount) 
          : (rawAmount || 0)
        
        const validAmount = isNaN(amount) ? 0 : amount
        
        return (
          <div className="text-right font-medium text-green-600">
            {formatCurrency(validAmount)}
          </div>
        )
      },
    },
    {
      accessorKey: "total_poin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium justify-end"
          >
            Poin
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right font-medium text-blue-600">
          {row.getValue("total_poin")} pts
        </div>
      ),
    },
    {
      accessorKey: "status_aktif",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status_aktif") as boolean
        return (
          <Badge variant={status ? "default" : "secondary"}>
            {status ? "Aktif" : "Non-aktif"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const anggota = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/data-anggota/${anggota.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditModal(anggota)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => resetPassword(anggota.id)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => toggleStatus(anggota.id)}
                className={anggota.status_aktif ? "text-orange-600" : "text-green-600"}
              >
                {anggota.status_aktif ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {anggota.status_aktif ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteAnggota(anggota.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: anggota.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Handle search
  const handleSearch = (value: string) => {
    setGlobalFilter(value)
    router.get('/data-anggota', { search: value, status: statusFilter }, {
      preserveState: true,
      replace: true
    })
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    router.get('/data-anggota', { search: globalFilter, status: value === 'all' ? '' : value }, {
      preserveState: true,
      replace: true
    })
  }

  // Modal handlers
  const openCreateModal = () => {
    setSelectedAnggota(null)
    setShowCreateModal(true)
  }

  const openEditModal = (anggota: Anggota) => {
    setSelectedAnggota(anggota)
    setShowEditModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedAnggota(null)
  }

  // Actions
  const resetPassword = (id: number) => {
    router.post(`/data-anggota/${id}/reset-password`, {}, {
      onSuccess: (page) => {
        const password = page.props.flash?.password
        if (password) {
          toast.success(`Password berhasil direset!`, {
            description: `Password baru: ${password}`,
            duration: 10000,
          })
        } else {
          toast.success('Password berhasil direset!')
        }
      },
      onError: () => {
        toast.error('Gagal reset password!')
      }
    })
  }

  const toggleStatus = (id: number) => {
    router.post(`/data-anggota/${id}/toggle-status`, {}, {
      onSuccess: () => {
        toast.success('Status anggota berhasil diubah!')
      },
      onError: () => {
        toast.error('Gagal mengubah status anggota!')
      }
    })
  }

  const deleteAnggota = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      router.delete(`/data-anggota/${id}`, {
        onSuccess: () => {
          toast.success('Anggota berhasil dihapus!')
        },
        onError: () => {
          toast.error('Gagal menghapus anggota!')
        }
      })
    }
  }

  return (
    <AppLayout>
      <Head title="Data Anggota" />

      <Toaster position="top-right" richColors />

      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Data Anggota</h1>
            <p className="text-muted-foreground">
              Kelola data anggota bank sampah RT
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Anggota
              </Button>
            </DialogTrigger>
            <AnggotaForm onSuccess={closeCreateModal} />
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnggota}</div>
              <p className="text-xs text-muted-foreground">
                Anggota terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.anggotaAktif}</div>
              <p className="text-xs text-muted-foreground">
                Status aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-aktif</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.anggotaNonaktif}</div>
              <p className="text-xs text-muted-foreground">
                Status non-aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSaldo)} {/* FIXED: This will now show proper value */}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo keseluruhan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Anggota</CardTitle>
            <CardDescription>
              Kelola data anggota bank sampah RT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              {/* Filters */}
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 py-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari anggota..."
                      value={globalFilter}
                      onChange={(event) => handleSearch(event.target.value)}
                      className="pl-8 w-full sm:max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Kolom <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="whitespace-nowrap">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="whitespace-nowrap">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Tidak ada data.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                <div className="text-muted-foreground text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} dari{" "}
                  {table.getFilteredRowModel().rows.length} baris terpilih.
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          {selectedAnggota && (
            <AnggotaForm 
              anggota={{
                id: selectedAnggota.id,
                nama_lengkap: selectedAnggota.nama_lengkap,
                email: selectedAnggota.user.email,
                nomor_telepon: selectedAnggota.nomor_telepon,
                status_aktif: selectedAnggota.status_aktif
              }} 
              isEdit={true}
              onSuccess={closeEditModal} 
            />
          )}
        </Dialog>
      </div>
    </AppLayout>
  )
}