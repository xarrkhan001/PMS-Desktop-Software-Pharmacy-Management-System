import { useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Plus, Search, Download, Pill, AlertTriangle, Calendar, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
        field: 'name', headerName: 'Medicine Name', width: 220, renderCell: (params) => (
            <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-slate-100">{params.value}</span>
                <span className="text-[10px] text-muted-foreground leading-none">Batch: {params.row.batch}</span>
            </div>
        )
    },
    { field: 'category', headerName: 'Category', width: 130 },
    {
        field: 'stock', headerName: 'Stock', type: 'number', width: 100, renderCell: (params) => (
            <span className={params.value < 20 ? "text-red-500 font-bold" : ""}>{params.value} Units</span>
        )
    },
    {
        field: 'price', headerName: 'Price (PKR)', type: 'number', width: 120, renderCell: (params) => (
            <span className="font-semibold">PKR {params.value.toLocaleString()}</span>
        )
    },
    {
        field: 'expiry', headerName: 'Expiry Date', width: 130, renderCell: (params) => {
            const isExpired = new Date(params.value) < new Date();
            return <span className={isExpired ? "text-red-600 font-bold underline" : ""}>{params.value}</span>
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params) => (
            <div className="flex items-center h-full">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${params.value === 'In Stock' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    params.value === 'Low Stock' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                    {params.value}
                </span>
            </div>
        )
    }
];

const initialRows = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Painkiller', stock: 150, price: 15, expiry: '2025-12-01', status: 'In Stock', batch: 'BT-001' },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 45, price: 120, expiry: '2024-06-15', status: 'In Stock', batch: 'BT-042' },
    { id: 3, name: 'Ibuprofen 400mg', category: 'Painkiller', stock: 12, price: 60, expiry: '2025-01-20', status: 'Low Stock', batch: 'BT-091' },
    { id: 4, name: 'Vitamin C 500mg', category: 'Supplement', stock: 200, price: 80, expiry: '2026-03-10', status: 'In Stock', batch: 'BT-112' },
    { id: 5, name: 'Omeprazole 20mg', category: 'Gastric', stock: 0, price: 150, expiry: '2024-01-01', status: 'Out of Stock', batch: 'BT-201' },
];

export default function InventoryPage() {
    const [rows] = useState(initialRows);
    const [open, setOpen] = useState(false);

    const handleAddMedicine = (e: React.FormEvent) => {
        e.preventDefault();
        setOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">Track medicine stock, batches, and shelf life.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add New Medicine
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleAddMedicine}>
                                <DialogHeader>
                                    <DialogTitle>Add New Medicine</DialogTitle>
                                    <DialogDescription>
                                        Enter details to add a new medicine to the stock.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" placeholder="e.g. Panadol" className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="batch" className="text-right">Batch No</Label>
                                        <Input id="batch" placeholder="BT-XXXX" className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Category</Label>
                                        <div className="col-span-3">
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="painkiller">Painkiller</SelectItem>
                                                    <SelectItem value="antibiotic">Antibiotic</SelectItem>
                                                    <SelectItem value="supplement">Supplement</SelectItem>
                                                    <SelectItem value="gastric">Gastric</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid grid-cols-2 items-center gap-2">
                                            <Label htmlFor="stock" className="text-right">Stock</Label>
                                            <Input id="stock" type="number" placeholder="0" />
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                            <Label htmlFor="price" className="text-right">Price</Label>
                                            <Input id="price" type="number" placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="expiry" className="text-right">Expiry Date</Label>
                                        <Input id="expiry" type="date" className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Medicine</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 shadow-none">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-600 flex justify-between items-center">
                            Total SKUs <Package className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-black">1,420</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50 shadow-none">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-600 flex justify-between items-center">
                            Low Stock <AlertTriangle className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-black">12 Items</div>
                    </CardContent>
                </Card>
                <Card className="bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 shadow-none">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-600 flex justify-between items-center">
                            Expiring Soon <Calendar className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-black">8 Batches</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 shadow-none">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex justify-between items-center">
                            In Stock <Pill className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-2xl font-black">84.2%</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-slate-900 shadow-sm border overflow-hidden">
                <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, category, batch..." className="pl-9" />
                    </div>
                </div>
                <div className="h-[550px] w-full p-2">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnHeaderHeight={45}
                        rowHeight={55}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 20]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
