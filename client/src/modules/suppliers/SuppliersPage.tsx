import { useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Truck } from "lucide-react";
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

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
        field: 'name', headerName: 'Supplier Name', width: 250, renderCell: (params) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{params.value}</span>
            </div>
        )
    },
    { field: 'contactPerson', headerName: 'Contact Person', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
        field: 'balance', headerName: 'Pending Balance', width: 180, renderCell: (params) => (
            <span className={`font-bold ${params.value > 100000 ? "text-red-500" : "text-emerald-500"}`}>
                PKR {params.value.toLocaleString()}
            </span>
        )
    },
    {
        field: 'status', headerName: 'Status', width: 130, renderCell: (params) => (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${params.value === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-slate-100 text-slate-800'
                }`}>
                {params.value}
            </span>
        )
    },
];

const initialRows = [
    { id: 1, name: 'Medica Pharma Solutions', contactPerson: 'Ahsan Khan', phone: '021-3456789', email: 'ahsan@medica.pk', balance: 45000, status: 'Active', address: 'Korangi Industrial Area, Karachi' },
    { id: 2, name: 'Standard Drug Co.', contactPerson: 'Sarah Pervez', phone: '042-3556677', email: 'info@standarddrug.com', balance: 125000, status: 'Active', address: 'Gulberg III, Lahore' },
    { id: 3, name: 'Global Health Dist.', contactPerson: 'Imran Malik', phone: '051-2233445', email: 'sales@globalhealth.pk', balance: 0, status: 'Active', address: 'I-9 Sector, Islamabad' },
    { id: 4, name: 'Universal Pharma', contactPerson: 'Zeeshan Ahmed', phone: '021-9988776', email: 'zeeshan@universal.com', balance: 89000, status: 'Inactive', address: 'Site Area, Karachi' },
];

export default function SuppliersPage() {
    const [rows] = useState(initialRows);
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Supplier Network</h1>
                    <p className="text-muted-foreground mt-1">Manage wholesale partners and procurement channels.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add New Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Register Supplier</DialogTitle>
                                <DialogDescription>Add a new vendor to your procurement network.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input id="name" placeholder="ABC Pharmaceuticals" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="contact">Contact Person</Label>
                                        <Input id="contact" placeholder="Owais Tahir" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" placeholder="+92 XXX XXXXXXX" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="vendor@example.com" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Warehouse Address</Label>
                                    <Input id="address" placeholder="123 Street, City" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setOpen(false)}>Register Supplier</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Suppliers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24 Active</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Payables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">PKR 845,000</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Monthly Procurement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">PKR 1.2M</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, contact or location..." className="pl-9" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                            <Filter className="mr-2 h-4 w-4" /> Advanced Filters
                        </Button>
                    </div>
                </div>
                <div className="h-[500px] w-full p-2">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnHeaderHeight={45}
                        rowHeight={55}
                        initialState={{
                            pagination: { paginationModel: { page: 0, pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 25]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'transparent',
                                borderBottom: '1px solid #e2e8f0',
                            }
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
