// resources/js/pages/JenisSampah/Index.tsx
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
    Copy,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Recycle,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2
} from "lucide-react"
import * as React from "react"
import { toast, Toaster } from "sonner"

import JenisSampahForm from "@/components/forms/JenisSampahForm"
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

export type JenisSampah = {
  id: number
  nama_jenis: string
  harga_per_kg: number
  poin_per_kg: number
  deskripsi: string | null
  status_aktif: boolean
  created_at: string
}

interface IndexProps {
  jenisSampah: {
    data: JenisSampah[]
    links: any[]
    meta: any
  }
  filters: {
    search?: string
    status?: string
  }
  summary: {
    total_jenis: number
    aktif: number
    nonaktif: number
    harga_tertinggi: number
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function Index({ jenisSampah, filters, summary }: IndexProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState(filters.search || "")
  const [statusFilter, setStatusFilter] = React.useState(filters.status || "all")
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [selectedJenisSampah, setSelectedJenisSampah] = React.useState<JenisSampah | null>(null)

  const columns: ColumnDef<JenisSampah>[] = [
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
      accessorKey: "nama_jenis",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium"
          >
            Nama Jenis
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nama_jenis")}</div>
      ),
    },
    {
      accessorKey: "harga_per_kg",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium justify-end"
          >
            Harga/Kg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("harga_per_kg"))
        return (
          <div className="text-right font-medium text-green-600">
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: "poin_per_kg",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium justify-end"
          >
            Poin/Kg
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right font-medium text-blue-600">
          {row.getValue("poin_per_kg")} pts
        </div>
      ),
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => {
        const deskripsi = row.getValue("deskripsi") as string
        return (
          <div className="max-w-xs truncate text-sm text-muted-foreground" title={deskripsi}>
            {deskripsi || "-"}
          </div>
        )
      },
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
        const jenisSampah = row.original

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
                <Link href={`/jenis-sampah/${jenisSampah.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditModal(jenisSampah)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateJenisSampah(jenisSampah.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplikasi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => toggleStatus(jenisSampah.id)}
                className={jenisSampah.status_aktif ? "text-orange-600" : "text-green-600"}
              >
                {jenisSampah.status_aktif ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                {jenisSampah.status_aktif ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteJenisSampah(jenisSampah.id)}
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
    data: jenisSampah.data,
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

  // Modal handlers
  const openCreateModal = () => {
    setSelectedJenisSampah(null)
    setShowCreateModal(true)
  }

  const openEditModal = (jenisSampah: JenisSampah) => {
    setSelectedJenisSampah(jenisSampah)
    setShowEditModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedJenisSampah(null)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setGlobalFilter(value)
    router.get('/jenis-sampah', { search: value, status: statusFilter }, {
      preserveState: true,
      replace: true
    })
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    router.get('/jenis-sampah', { search: globalFilter, status: value === 'all' ? '' : value }, {
      preserveState: true,
      replace: true
    })
  }

  // Actions
  const toggleStatus = (id: number) => {
    router.post(`/jenis-sampah/${id}/toggle-status`, {}, {
      onSuccess: () => {
        toast.success('Status jenis sampah berhasil diubah!')
      },
      onError: () => {
        toast.error('Gagal mengubah status jenis sampah!')
      }
    })
  }

  const duplicateJenisSampah = (id: number) => {
    router.post(`/jenis-sampah/${id}/duplicate`, {}, {
      onSuccess: () => {
        toast.success('Jenis sampah berhasil diduplikasi!')
      },
      onError: () => {
        toast.error('Gagal menduplikasi jenis sampah!')
      }
    })
  }

  const deleteJenisSampah = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jenis sampah ini?')) {
      router.delete(`/jenis-sampah/${id}`, {
        onSuccess: () => {
          toast.success('Jenis sampah berhasil dihapus!')
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

  return (
    <AppLayout>
      <Head title="Jenis Sampah" />

      <Toaster position="top-right" richColors />
      
      <div className="flex flex-col space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Jenis Sampah</h1>
            <p className="text-muted-foreground">
              Kelola jenis sampah dengan harga dan poin per kilogram
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jenis Sampah
              </Button>
            </DialogTrigger>
            <JenisSampahForm onSuccess={closeCreateModal} />
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jenis</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_jenis}</div>
              <p className="text-xs text-muted-foreground">
                Jenis sampah terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.aktif}</div>
              <p className="text-xs text-muted-foreground">
                Dapat digunakan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-aktif</CardTitle>
              <div className="h-4 w-4 rounded-full bg-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{summary.nonaktif}</div>
              <p className="text-xs text-muted-foreground">
                Tidak dapat digunakan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Harga Tertinggi</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.harga_tertinggi)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per kilogram
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Jenis Sampah</CardTitle>
            <CardDescription>
              Kelola jenis sampah dengan harga dan poin per kilogram
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
                      placeholder="Cari jenis sampah..."
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
                    <Button variant="outline">
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
          {selectedJenisSampah && (
            <JenisSampahForm 
              jenisSampah={selectedJenisSampah} 
              isEdit={true}
              onSuccess={closeEditModal} 
            />
          )}
        </Dialog>
      </div>
    </AppLayout>
  )
}