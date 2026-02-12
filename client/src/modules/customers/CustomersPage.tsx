import { useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Plus, Search, Download, User, Calendar, CreditCard, Star } from "lucide-react";
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
        field: 'name', headerName: 'Customer Name', width: 220, renderCell: (params) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                    {params.value.charAt(0)}
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{params.value}</span>
            </div>
        )
    },
    { field: 'phone', headerName: 'Contact', width: 140 },
    { field: 'totalVisits', headerName: 'Visits', type: 'number', width: 100 },
    {
        field: 'totalSpent', headerName: 'Total Spent', width: 150, renderCell: (params) => (
            <span className="font-bold">PKR {params.value.toLocaleString()}</span>
        )
    },
    {
        field: 'points', headerName: 'Loyalty Points', width: 140, renderCell: (params) => (
            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                {params.value}
            </div>
        )
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 130 },
];

const initialRows = [
    { id: 1, name: 'Asad Rahim', phone: '0300-1234567', totalVisits: 12, totalSpent: 25400, points: 250, lastVisit: '2024-02-05' },
    { id: 2, name: 'Mrs. Fatima', phone: '0321-7654321', totalVisits: 4, totalSpent: 8900, points: 85, lastVisit: '2024-02-07' },
    { id: 3, name: 'Kamran Akmal', phone: '0333-9988776', totalVisits: 28, totalSpent: 62000, points: 1200, lastVisit: '2024-01-20' },
    { id: 4, name: 'Zohaib Hassan', phone: '0312-4455667', totalVisits: 1, totalSpent: 1200, points: 10, lastVisit: '2024-02-01' },
];

export default function CustomersPage() {
    const [rows] = useState(initialRows);
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Database</h1>
                    <p className="text-muted-foreground mt-1">Manage profiles, loyalty programs, and purchase history.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export Data
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>New Customer Profile</DialogTitle>
                                <DialogDescription>Register a customer for loyalty points and history tracking.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="Saleem Ahmed" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" placeholder="03XX-XXXXXXX" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input id="email" type="email" placeholder="saleem@example.com" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setOpen(false)}>Save Profile</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Total Customers <User className="h-4 w-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">1,284</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Active This Month <Calendar className="h-4 w-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">425</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Loyalty Redeemed <Star className="h-4 w-4 text-amber-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">12.5k Pts</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Average LTV <CreditCard className="h-4 w-4 text-purple-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">PKR 4,200</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-none border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name or phone..." className="pl-10 h-11" />
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
