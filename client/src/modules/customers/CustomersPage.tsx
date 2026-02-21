import { useState, useEffect } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Plus, Search, Download, User, Users, Calendar, CreditCard, Star, Trash2, CheckCircle2, DollarSign, Wallet, History, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [historyPage, setHistoryPage] = useState(1);
    const historyLimit = 5;
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const { toast } = useToast();

    // New Customer State
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
        address: ""
    });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/customers", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch customers", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleAddCustomer = async () => {
        if (!newCustomer.name) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/customers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newCustomer)
            });

            if (response.ok) {
                toast({ title: "Success", description: "Customer added successfully" });
                setIsAddOpen(false);
                setNewCustomer({ name: "", phone: "", address: "" });
                fetchCustomers();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not add customer", variant: "destructive" });
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/customers/${selectedCustomer.id}/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount: paymentAmount })
            });

            if (response.ok) {
                toast({ title: "Payment Recorded", description: `Rs. ${paymentAmount} deducted from balance.` });
                setIsPaymentOpen(false);
                setPaymentAmount("");
                fetchCustomers();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not record payment", variant: "destructive" });
        }
    };

    const handleDeleteSale = async (saleId: number) => {
        if (!window.confirm("Are you sure you want to delete this transaction? This will not revert stock but will clear from history.")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/sales/${saleId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast({ title: "Sale Deleted", description: "Record removed from customer ledger." });
                fetchCustomers();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not delete transaction", variant: "destructive" });
        }
    };

    const handleDeleteCustomer = async (id: number) => {
        if (!window.confirm("Permanently delete this customer profile? All history will be unlinked.")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                toast({ title: "Profile Deleted", description: "Customer removed from database." });
                fetchCustomers();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not delete customer", variant: "destructive" });
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedRows.length} selected profiles?`)) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/customers/bulk-delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ids: selectedRows })
            });

            if (response.ok) {
                toast({ title: "Profiles Deleted", description: `${selectedRows.length} records removed.` });
                setSelectedRows([]);
                fetchCustomers();
            }
        } catch (error) {
            toast({ title: "Error", description: "Bulk delete failed", variant: "destructive" });
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 60 },
        {
            field: 'name', headerName: 'Customer Profile', width: 250, renderCell: (params) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-100 uppercase italic">
                        {params.value.charAt(0)}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">{params.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{params.row.phone}</span>
                    </div>
                </div>
            )
        },
        {
            field: 'visits', headerName: 'Visits', width: 100, renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-700">{params.value}</span>
                </div>
            )
        },
        {
            field: 'totalSpent', headerName: 'Lifetime Value', width: 180, renderCell: (params) => (
                <div className="flex flex-col justify-center h-full space-y-1">
                    <span className="font-black text-slate-950 text-sm italic tracking-tighter leading-none">Rs. {params.value?.toLocaleString()}</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em] leading-tight">Total Revenue</span>
                </div>
            )
        },
        {
            field: 'totalDue', headerName: 'Balance Due', width: 180, renderCell: (params) => (
                <div className={`px-3 py-1.5 rounded-xl border ${params.value > 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} flex items-center gap-2`}>
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-black text-xs tracking-tighter uppercase italic">Rs. {params.value?.toLocaleString()}</span>
                </div>
            )
        },
        {
            field: 'loyaltyPoints', headerName: 'Loyalty', width: 140, renderCell: (params) => (
                <div className="flex items-center gap-1.5 text-amber-600 font-black italic tracking-tighter">
                    <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                    </div>
                    {params.value} <span className="text-[9px] uppercase not-italic tracking-normal text-amber-400 ml-1">Pts</span>
                </div>
            )
        },
        {
            field: 'actions', headerName: 'Actions', width: 220, sortable: false, renderCell: (params) => (
                <div className="flex items-center gap-2 pr-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm bg-white"
                        onClick={() => {
                            setSelectedCustomer(params.row);
                            setIsPaymentOpen(true);
                        }}
                        title="Record Payment"
                    >
                        <Wallet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all shadow-sm bg-white"
                        onClick={() => {
                            setSelectedCustomer(params.row);
                            setIsHistoryOpen(true);
                        }}
                        title="Sales History"
                    >
                        <History className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm bg-white"
                        onClick={() => handleDeleteCustomer(params.row.id)}
                        title="Delete Profile"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const filteredRows = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    const totalCustomers = customers.length;
    const activeThisMonth = customers.filter(c => {
        if (!c.lastVisit) return false;
        const lastVisitDate = new Date(c.lastVisit);
        const now = new Date();
        return lastVisitDate.getMonth() === now.getMonth() && lastVisitDate.getFullYear() === now.getFullYear();
    }).length;
    const totalDueSum = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
    const avgSpent = totalCustomers > 0 ? (customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / totalCustomers) : 0;

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-[2.2rem] bg-indigo-600 shadow-2xl shadow-indigo-200 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 rotate-3 transition-transform hover:rotate-0">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">Customer <span className="text-indigo-600">Database</span></h1>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Relationship Management Terminal</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    {selectedRows.length > 0 && (
                        <Button
                            variant="destructive"
                            className="h-14 px-8 rounded-[1.8rem] font-black uppercase italic tracking-tighter gap-3 animate-in fade-in slide-in-from-right-4 duration-300"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="h-5 w-5" /> Delete Selected ({selectedRows.length})
                        </Button>
                    )}
                    <Button variant="outline" className="h-14 px-8 rounded-[1.8rem] border-slate-200 font-black uppercase italic tracking-tighter gap-3 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <Download className="h-5 w-5" /> Export Data
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-10 rounded-[1.8rem] bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase italic tracking-tighter gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95">
                                <Plus className="h-5 w-5" /> Add New Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-4xl">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Register Customer</DialogTitle>
                                    <DialogDescription className="text-indigo-50 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80">Sync profiles for loyalty and credit</DialogDescription>
                                </DialogHeader>
                            </div>
                            <div className="p-8 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Full Name *</Label>
                                    <Input
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold"
                                        placeholder="Enter name..."
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Phone Number</Label>
                                    <Input
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold"
                                        placeholder="03XX-XXXXXXX"
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Address (Optional)</Label>
                                    <Input
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold"
                                        placeholder="Locality, City"
                                        value={newCustomer.address}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase italic tracking-tighter text-white transition-all shadow-lg" onClick={handleAddCustomer}>
                                    Save Profile
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Profiles", value: totalCustomers, icon: User, color: "blue", sub: "Growth +12%" },
                    { label: "Active Buyers", value: activeThisMonth, icon: Calendar, color: "emerald", sub: "Month to date" },
                    { label: "Accounts Receivable", value: `Rs. ${totalDueSum.toLocaleString()}`, icon: CreditCard, color: "rose", sub: "Total Udhaar" },
                    { label: "Average Value", value: `Rs. ${Math.round(avgSpent).toLocaleString()}`, icon: Star, color: "amber", sub: "Lifetime Avg" },
                ].map((stat, i) => (
                    <Card key={i} className="group overflow-hidden rounded-[2.5rem] border-none shadow-2xl shadow-slate-100 transition-all hover:-translate-y-2 hover:shadow-indigo-100 bg-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest text-${stat.color}-500 bg-${stat.color}-50 px-3 py-1 rounded-full`}>{stat.sub}</span>
                            </div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                            <div className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Section */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-100 bg-white overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/30">
                    <div className="relative w-full md:w-[500px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, phone or ID..."
                            className="pl-14 h-16 bg-white border-none rounded-2xl font-bold shadow-sm placeholder:text-slate-300 transition-all focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm italic font-black text-[10px] uppercase text-slate-500 tracking-widest">
                        <span className="px-4">Filter:</span>
                        <Button variant="ghost" className="h-10 rounded-xl hover:bg-slate-50 text-indigo-600 underline">High Credit</Button>
                        <Button variant="ghost" className="h-10 rounded-xl hover:bg-slate-50">Inactive</Button>
                    </div>
                </div>
                <div className="h-[600px] w-full p-6">
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={loading}
                        columnHeaderHeight={60}
                        rowHeight={80}
                        initialState={{
                            pagination: { paginationModel: { page: 0, pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 20]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectedRows(newSelection as unknown as any[]);
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                borderBottom: 'none',
                                borderRadius: '1rem',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontStyle: 'italic',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                color: '#64748b'
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#fcfdff'
                            }
                        }}
                    />
                </div>
            </Card>

            {/* Payment Recording Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-4xl">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Record Payment</DialogTitle>
                            <DialogDescription className="text-emerald-50 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80">Clearing accounts receivable</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Balance Due</h4>
                            <p className="text-2xl font-black text-rose-600 italic tracking-tighter">Rs. {selectedCustomer?.totalDue?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Amount Received (Rs.) *</Label>
                            <Input
                                type="number"
                                className="h-16 bg-slate-50 border-none rounded-2xl font-black text-xl italic text-slate-900"
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase italic tracking-tighter text-white transition-all shadow-lg flex items-center justify-center gap-2" onClick={handleRecordPayment}>
                            <CheckCircle2 className="h-5 w-5" /> Confirm Payment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Sales History Ledger Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={(open) => { setIsHistoryOpen(open); if (!open) setHistoryPage(1); }}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-5xl">
                    <div className="bg-slate-950 p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <History className="h-6 w-6 text-indigo-400" />
                                Sales History / Ledger
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80 mt-1">
                                {selectedCustomer?.name} • Profile ID: {selectedCustomer?.id}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white max-h-[700px] overflow-y-auto custom-scrollbar">
                        {customers.find(c => c.id === selectedCustomer?.id)?.sales?.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {customers.find(c => c.id === selectedCustomer?.id).sales
                                        .slice((historyPage - 1) * historyLimit, historyPage * historyLimit)
                                        .map((sale: any, idx: number) => (
                                            <div key={idx} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all group relative overflow-hidden">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                                                            <Receipt className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID # {sale.id}</span>
                                                            <span className="text-sm font-black text-slate-900 italic tracking-tight uppercase">
                                                                {new Date(sale.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">Rs. {sale.netAmount?.toLocaleString()}</span>
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black uppercase mt-1">Paid / Completed</Badge>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 text-slate-300 transition-all opacity-0 group-hover:opacity-100"
                                                            onClick={() => handleDeleteSale(sale.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Item Summary (What they bought) */}
                                                <div className="bg-white/80 rounded-2xl p-4 border border-slate-100/50">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Itemized Breakdown</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sale.items?.map((item: any, i: number) => (
                                                            <Badge key={i} variant="outline" className="bg-white text-slate-700 border-slate-100 px-3 py-1 rounded-xl font-bold text-[10px] uppercase gap-2">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                                {item.medicine?.name} <span className="text-slate-400">×{item.quantity}</span>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Pagination UI */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Showing page {historyPage} of {Math.ceil(customers.find(c => c.id === selectedCustomer?.id).sales.length / historyLimit)}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-10 rounded-xl font-black uppercase italic tracking-tighter text-[10px]"
                                            disabled={historyPage === 1}
                                            onClick={() => setHistoryPage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-10 rounded-xl font-black uppercase italic tracking-tighter text-[10px]"
                                            disabled={historyPage >= Math.ceil(customers.find(c => c.id === selectedCustomer?.id).sales.length / historyLimit)}
                                            onClick={() => setHistoryPage(p => p + 1)}
                                        >
                                            Next Page
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-24 text-center space-y-6">
                                <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                    <History className="h-10 w-10 text-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Empty Ledger</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">This customer has no past transaction history <br /> recorded in the terminal.</p>
                                </div>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                            onClick={() => setIsHistoryOpen(false)}
                        >
                            Dismiss Ledger
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
