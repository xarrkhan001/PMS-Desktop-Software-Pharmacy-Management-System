import { useState, useEffect } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Truck, Mail, Phone, MapPin, User, Trash2, Edit2, Loader2, ArrowUpRight, Scale, TrendingUp, BookText } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        partnerNetwork: 0,
        activeOrders: 0,
        wholesaleValue: 0,
        pendingPayables: 0
    });
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // Form State
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        contact: "",
        email: "",
        address: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Fetch Suppliers and Stats in parallel
            const [suppliersRes, statsRes] = await Promise.all([
                fetch("http://localhost:5000/api/suppliers", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("http://localhost:5000/api/suppliers/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const suppliersData = await suppliersRes.json();
            const statsData = await statsRes.json();

            if (suppliersRes.ok) setSuppliers(suppliersData);
            if (statsRes.ok) setStats(statsData);

        } catch (error) {
            console.error(error);
            toast({ title: "Connection Error", description: "Failed to fetch vendor data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!formData.name) {
            toast({ title: "Validation Error", description: "Company name is required", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const url = editingSupplier
                ? `http://localhost:5000/api/suppliers/${editingSupplier.id}`
                : "http://localhost:5000/api/suppliers";

            const method = editingSupplier ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: editingSupplier ? "Supplier Updated" : "Supplier Registered",
                    description: `Successfully ${editingSupplier ? 'updated' : 'added'} ${formData.name}`
                });
                setOpen(false);
                setEditingSupplier(null);
                setFormData({ name: "", contactPerson: "", contact: "", email: "", address: "" });
                fetchData();
            } else {
                const data = await response.json();
                toast({ title: "Operation Failed", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Could not save supplier", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this supplier?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast({ title: "Removed", description: "Supplier has been successfully removed." });
                fetchData();
            } else {
                const data = await response.json();
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete supplier", variant: "destructive" });
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name', headerName: 'Company Name', width: 300,
            renderCell: (params) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase tracking-tighter italic text-sm">{params.value}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{params.row.contactPerson || 'No Representative'}</span>
                    </div>
                </div>
            )
        },
        {
            field: 'contact', headerName: 'Contact Information', width: 250,
            renderCell: (params) => (
                <div className="flex flex-col gap-1 py-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase tracking-tight">
                        <Phone className="h-3 w-3 text-indigo-500" /> {params.value || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 lowercase">
                        <Mail className="h-3 w-3 text-slate-300" /> {params.row.email || 'no-email@vendor.pk'}
                    </div>
                </div>
            )
        },
        {
            field: 'address', headerName: 'Location', width: 300,
            renderCell: (params) => (
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 truncate max-w-[280px]">
                    <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{params.value || 'Address not listed'}</span>
                </div>
            )
        },
        {
            field: 'balance', headerName: 'Financial Status', width: 150,
            renderCell: (params) => (
                <div className="flex flex-col items-end gap-1">
                    <span className={`text-[12px] font-black italic tracking-tighter ${params.value > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        Rs. {(params.value || 0).toLocaleString()}
                    </span>
                    <Badge variant="outline" className={`text-[8px] font-black uppercase ${params.value > 0 ? 'text-rose-500 border-rose-100' : 'text-emerald-500 border-emerald-100'}`}>
                        {params.value > 0 ? 'Payable' : 'Clear'}
                    </Badge>
                </div>
            )
        },
        {
            field: 'transactions', headerName: 'History', width: 120,
            renderCell: (params) => (
                <Badge className="bg-slate-100/50 text-slate-500 border-none rounded-lg text-[10px] font-black px-2 shadow-sm">
                    {params.row._count?.purchases || 0} ORDERS
                </Badge>
            )
        },
        {
            field: 'actions', headerName: 'Manage', width: 120,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit Details"
                        onClick={() => {
                            setEditingSupplier(params.row);
                            setFormData({
                                name: params.row.name,
                                contactPerson: params.row.contactPerson || "",
                                contact: params.row.contact || "",
                                email: params.row.email || "",
                                address: params.row.address || ""
                            });
                            setOpen(true);
                        }}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        title="View Ledger"
                        onClick={() => toast({ title: "Ledger", description: `Viewing ledger for ${params.row.name}` })}
                    >
                        <BookText className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        title="Delete Supplier"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-[2.2rem] bg-indigo-600 shadow-2xl shadow-indigo-200 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rotate-3">
                            <Truck className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">Supplier <span className="text-indigo-600">Network</span></h1>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Procurement & Finance</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={(val) => {
                        setOpen(val);
                        if (!val) {
                            setEditingSupplier(null);
                            setFormData({ name: "", contactPerson: "", contact: "", email: "", address: "" });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 rounded-[1.8rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 text-white font-black uppercase italic tracking-tighter gap-3 transition-all hover:scale-105 active:scale-95 group">
                                <Plus className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                                Add New Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-3xl bg-white p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
                            <DialogHeader className="mb-8">
                                <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
                                    {editingSupplier ? 'Update' : 'Register'} <span className="text-indigo-600">Supplier</span>
                                </DialogTitle>
                                <DialogDescription className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    Fill in the vendor details for official records
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Company / Brand Name</Label>
                                    <Input
                                        className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm font-bold placeholder:text-slate-300"
                                        placeholder="e.g. Getz Pharma"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Representative</Label>
                                        <Input
                                            className="h-12 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                            placeholder="Ali Khan"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Direct Contact No.</Label>
                                        <Input
                                            className="h-12 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                            placeholder="021-344..."
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Official Email</Label>
                                    <Input
                                        className="h-12 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                        type="email"
                                        placeholder="sales@vendor.pk"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Warehouse Address</Label>
                                    <Input
                                        className="h-12 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                        placeholder="Plot #45, Korangi Industrial Area, Karachi"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-10">
                                <Button
                                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase italic tracking-tighter transition-all shadow-xl"
                                    onClick={handleSave}
                                >
                                    {editingSupplier ? 'Save Changes' : 'Confirm Registration'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Partner Network", value: stats.partnerNetwork, icon: Truck, color: "indigo" },
                    { label: "Active Orders", value: stats.activeOrders, icon: ArrowUpRight, color: "emerald" },
                    { label: "Wholesale Value", value: `Rs. ${(stats.wholesaleValue || 0).toLocaleString()}`, icon: TrendingUp, color: "slate" },
                    { label: "Pending Payables", value: `Rs. ${(stats.pendingPayables || 0).toLocaleString()}`, icon: Scale, color: "rose" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/50 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                        <CardHeader className="p-0 pb-4">
                            <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full md:w-[450px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                            placeholder="Find distribution partners..."
                            className="h-14 pl-14 pr-6 bg-white border-none shadow-lg shadow-slate-100/50 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus-visible:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-12 rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest gap-2">
                            <Download className="h-4 w-4" /> Export Report
                        </Button>
                        <Button variant="ghost" className="h-12 rounded-xl text-slate-400 font-bold uppercase text-[10px] tracking-widest" onClick={fetchData}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                        </Button>
                    </div>
                </div>

                <div className="h-[650px] w-full p-4">
                    <DataGrid
                        rows={filteredSuppliers}
                        columns={columns}
                        loading={loading}
                        columnHeaderHeight={60}
                        rowHeight={80}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 }
                            },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        pagination
                        checkboxSelection
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'transparent',
                                borderBottom: '1px solid #f8fafc',
                                fontStyle: 'italic',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                color: '#94a3b8'
                            },
                            '& .MuiDataGrid-virtualScroller': {
                                padding: '0 8px'
                            },
                            '& .MuiDataGrid-row': {
                                borderRadius: '1.2rem',
                                marginTop: '4px',
                                marginBottom: '4px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#f8fafc !important',
                                    transform: 'scale-[0.995]'
                                }
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #f8fafc',
                                borderBottomLeftRadius: '2.5rem',
                                borderBottomRightRadius: '2.5rem',
                                paddingRight: '2rem'
                            }
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
