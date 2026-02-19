import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    FileText,
    Plus,
    CreditCard,
    DollarSign,
    Landmark,
    Receipt,
    History,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Users,
    Truck,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const API_BASE = "http://localhost:5000/api/finance";

export default function FinancePage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [customerLedgers, setCustomerLedgers] = useState<any[]>([]);
    const [supplierLedgers, setSupplierLedgers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        customerPending: 0,
        supplierPending: 0
    });

    // Form States
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: "",
        amount: "",
        categoryId: "",
        description: "",
        paymentMethod: "CASH"
    });
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: "",
        paymentMethod: "CASH",
        note: "",
        saleId: null as number | null,
        purchaseId: null as number | null,
        targetName: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [catPage, setCatPage] = useState(1);
    const itemsPerPage = 8;
    const catsPerPage = 12;

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            const [expRes, catRes, sumRes, custRes, suppRes] = await Promise.all([
                fetch(API_BASE, { headers }),
                fetch(`${API_BASE}/categories`, { headers }),
                fetch(`${API_BASE}/stats/summary`, { headers }),
                fetch(`${API_BASE}/ledgers/customers`, { headers }),
                fetch(`${API_BASE}/ledgers/suppliers`, { headers })
            ]);

            setExpenses(await expRes.json());
            setCategories(await catRes.json());
            setStats(await sumRes.json());
            setCustomerLedgers(await custRes.json());
            setSupplierLedgers(await suppRes.json());

        } catch (error) {
            console.error("Finance fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    amount: paymentData.amount,
                    paymentMethod: paymentData.paymentMethod,
                    note: paymentData.note,
                    saleId: paymentData.saleId,
                    purchaseId: paymentData.purchaseId
                })
            });
            if (res.ok) {
                setIsPaymentModalOpen(false);
                fetchData();
                alert("Payment recorded successfully!");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newExpense)
            });
            if (res.ok) {
                setIsAddExpenseOpen(false);
                setNewExpense({ title: "", amount: "", categoryId: "", description: "", paymentMethod: "CASH" });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newCategory)
            });
            if (res.ok) {
                setIsAddCategoryOpen(false);
                setNewCategory({ name: "", description: "" });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCategory = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}" and ALL its related expenses? This cannot be undone!`)) return;
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        Financial Hub
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Professional ledger and cash flow management for your pharmacy.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-2 font-bold h-11">
                                <Plus className="mr-2 h-4 w-4" /> New Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-slate-900 p-6 text-white text-center">
                                <DialogTitle className="text-xl font-black">Add Expense Category</DialogTitle>
                            </div>
                            <form onSubmit={handleAddCategory} className="p-8 space-y-4 bg-white">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category Name</Label>
                                    <Input value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="e.g. Utility Bills" required className="rounded-xl h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</Label>
                                    <Input value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Optional description" className="rounded-xl h-12" />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-indigo-600 font-bold rounded-xl mt-4">Create Category</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-slate-900 font-bold h-11 px-6">
                                <Plus className="mr-2 h-4 w-4" /> Record Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-indigo-600 p-6 text-white text-center">
                                <DialogTitle className="text-xl font-black">New Expense Entry</DialogTitle>
                            </div>
                            <form onSubmit={handleAddExpense} className="p-8 space-y-4 bg-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</Label>
                                        <Input value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="Tea, Rent, etc." required className="rounded-xl h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount (PKR)</Label>
                                        <Input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0.00" required className="rounded-xl h-12" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</Label>
                                    <select
                                        value={newExpense.categoryId}
                                        onChange={e => setNewExpense({ ...newExpense, categoryId: e.target.value })}
                                        className="w-full rounded-xl h-12 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</Label>
                                    <Input value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="Add notes..." className="rounded-xl h-12" />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-slate-900 font-bold rounded-xl mt-4">Save Entry</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 h-14 w-full md:w-auto grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="expenses" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Expenses</TabsTrigger>
                    <TabsTrigger value="customers" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Customer Ledger</TabsTrigger>
                    <TabsTrigger value="suppliers" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Supplier Ledger</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="rounded-3xl border-none shadow-sm bg-indigo-50/50 overflow-hidden relative">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><TrendingUp className="h-5 w-5" /></div>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Revenue</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Rs. {stats.totalIncome.toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Total sales to date</p>
                            </div>
                        </Card>

                        <Card className="rounded-3xl border-none shadow-sm bg-rose-50/50 overflow-hidden relative">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-rose-100 rounded-xl text-rose-600"><TrendingDown className="h-5 w-5" /></div>
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Expenses</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Rs. {stats.totalExpense.toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Operational costs</p>
                            </div>
                        </Card>

                        <Card className="rounded-3xl border-none shadow-sm bg-emerald-50/50 overflow-hidden relative">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Net Profit</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Rs. {stats.netProfit.toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Pure savings recorded</p>
                            </div>
                        </Card>

                        <Card className="rounded-3xl border-none shadow-sm bg-amber-50/50 overflow-hidden relative">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><History className="h-5 w-5" /></div>
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Payables</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Rs. {stats.supplierPending.toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase text-right">To Suppliers</p>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="rounded-[2.5rem] border-none shadow-sm p-6 overflow-hidden">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-black text-slate-900">Cash-Flow Performance</CardTitle>
                                <CardDescription className="font-medium text-xs">Visualizing income vs overhead costs.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="h-[300px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={expenses.slice(0, 7).reverse().map(e => ({ name: format(new Date(e.date), 'dd/MM'), amount: e.amount }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="amount" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-sm p-6 overflow-hidden">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-black text-slate-900">Recent Transactions</CardTitle>
                                <CardDescription className="font-medium text-xs">Latest activity across all accounts.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="space-y-4 pt-4">
                                    {expenses.slice(0, 5).map(e => (
                                        <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-100 rounded-xl text-rose-600"><ArrowDownLeft className="h-4 w-4" /></div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm leading-tight">{e.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.category.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-rose-600 text-sm">- Rs. {e.amount.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-400 font-medium tracking-tight">{format(new Date(e.date), 'MMM dd, yyyy')}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {expenses.length === 0 && <p className="text-center py-10 text-slate-400 font-medium">No transactions recorded yet.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-6">
                    {/* Categories Quick View */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Filter by Category</h3>
                            {selectedCategoryId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCategoryId(null)}
                                    className="h-6 text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50"
                                >
                                    Show All Expenses
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {categories.slice((catPage - 1) * catsPerPage, catPage * catsPerPage).map(cat => (
                                <Card
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategoryId(cat.id);
                                        setCurrentPage(1); // Reset table page
                                    }}
                                    className={`rounded-2xl border-none shadow-sm bg-white overflow-hidden group transition-all cursor-pointer relative ${selectedCategoryId === cat.id ? 'ring-2 ring-indigo-600 scale-[0.98]' : 'hover:ring-2 hover:ring-indigo-300'}`}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCategory(cat.id, cat.name);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 hover:text-white z-10"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                    <div className="p-4 text-center">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors ${selectedCategoryId === cat.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                            <Receipt className="h-5 w-5" />
                                        </div>
                                        <p className="font-black text-slate-900 text-[11px] truncate uppercase tracking-tighter">{cat.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{cat._count?.expenses || 0} Records</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Category Pagination */}
                        {categories.length > catsPerPage && (
                            <div className="flex justify-center gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={catPage === 1}
                                    onClick={() => setCatPage(prev => prev - 1)}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="text-[9px] font-black flex items-center uppercase text-slate-400 tracking-widest">Page {catPage}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={catPage >= Math.ceil(categories.length / catsPerPage)}
                                    onClick={() => setCatPage(prev => prev + 1)}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <CardTitle className="text-xl font-black">
                                    {selectedCategoryId ? `Expenses: ${categories.find(c => c.id === selectedCategoryId)?.name}` : "All Expenses"}
                                </CardTitle>
                                {selectedCategoryId && <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Showing category specific records</p>}
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Search records..." className="pl-9 h-10 w-64 rounded-xl border-slate-200 text-xs" />
                                </div>
                                <Button variant="outline" className="h-10 rounded-xl border-2 font-bold"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="border-none">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 pl-8">Date</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Expense Title</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Category</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Method</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Amount</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 text-center pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses
                                    .filter(e => !selectedCategoryId || e.categoryId === selectedCategoryId)
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((e) => (
                                        <TableRow key={e.id} className="border-slate-50 hover:bg-slate-50/50 transition-all">
                                            <TableCell className="pl-8 font-bold text-slate-400 text-xs">{format(new Date(e.date), 'dd MMM yyyy')}</TableCell>
                                            <TableCell className="font-black text-slate-900">{e.title}</TableCell>
                                            <TableCell>
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-tighter shadow-sm border border-slate-200">{e.category.name}</span>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-500 text-[10px] uppercase">{e.paymentMethod}</TableCell>
                                            <TableCell className="text-right font-black text-rose-600">- Rs. {e.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-center pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteExpense(e.id)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {(() => {
                                    const filtered = expenses.filter(e => !selectedCategoryId || e.categoryId === selectedCategoryId);
                                    return `Showing ${Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-${Math.min(filtered.length, currentPage * itemsPerPage)} of ${filtered.length} Records`;
                                })()}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-9 w-9 p-0 rounded-xl border-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center px-4 bg-white rounded-xl border-2 border-slate-100 text-[10px] font-black">
                                    PAGE {currentPage}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={(() => {
                                        const filtered = expenses.filter(e => !selectedCategoryId || e.categoryId === selectedCategoryId);
                                        return currentPage >= Math.ceil(filtered.length / itemsPerPage);
                                    })()}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-9 w-9 p-0 rounded-xl border-2"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="customers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customerLedgers.map(customer => (
                            <Card key={customer.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">{customer.name[0]}</div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Due</p>
                                            <p className="text-xl font-black text-rose-600">Rs. {customer.totalDue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <h4 className="mt-4 font-black text-slate-900">{customer.name}</h4>
                                    <p className="text-xs text-slate-500">{customer.phone || "No Contact"}</p>

                                    <div className="mt-6 space-y-3">
                                        {customer.sales.slice(0, 2).map((sale: any) => (
                                            <div key={sale.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-900">{sale.invoiceNo}</p>
                                                    <p className="text-[9px] text-slate-400">{format(new Date(sale.createdAt), 'dd MMM')}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setPaymentData({ ...paymentData, saleId: sale.id, purchaseId: null, targetName: customer.name, amount: sale.dueAmount.toString() });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="h-7 text-[9px] font-black uppercase tracking-tighter text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                >
                                                    Clear Due
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {customerLedgers.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="h-10 w-10 text-indigo-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">All Clear!</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm mt-2">
                                No customers currently owe any payments. New credit sales will appear here automatically.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="suppliers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {supplierLedgers.map(supplier => (
                            <Card key={supplier.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white border-l-4 border-l-amber-400">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Truck className="h-6 w-6" /></div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</p>
                                            <p className="text-xl font-black text-amber-600">Rs. {supplier.totalDue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <h4 className="mt-4 font-black text-slate-900">{supplier.name}</h4>

                                    <div className="mt-6 space-y-3">
                                        {supplier.purchases.map((purchase: any) => (
                                            <div key={purchase.id} className="flex justify-between items-center p-3 bg-amber-50/30 rounded-xl border border-amber-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-900">INV: {purchase.invoiceNo || purchase.id}</p>
                                                    <p className="text-[9px] text-slate-400">{format(new Date(purchase.createdAt), 'dd MMM')}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setPaymentData({ ...paymentData, purchaseId: purchase.id, saleId: null, targetName: supplier.name, amount: purchase.dueAmount.toString() });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="h-7 text-[9px] font-black uppercase tracking-tighter text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                >
                                                    Pay Now
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {supplierLedgers.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Truck className="h-10 w-10 text-amber-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">No Pending Bills</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm mt-2">
                                You are all caught up with your suppliers. Any unpaid purchase invoices will be listed here.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Payment Recording Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-emerald-600 p-8 text-white text-center">
                        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Receipt className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-black">Record Receipt / Payment</DialogTitle>
                        <p className="text-[10px] uppercase font-bold text-emerald-100 tracking-[0.2em] mt-1">{paymentData.targetName}</p>
                    </div>
                    <form onSubmit={handleRecordPayment} className="p-8 space-y-5 bg-white">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount Received/Paid</Label>
                            <Input
                                type="number"
                                value={paymentData.amount}
                                onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                                className="h-14 rounded-2xl text-xl font-black text-center text-emerald-600 border-2 border-emerald-50 focus:border-emerald-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Method</Label>
                            <select
                                value={paymentData.paymentMethod}
                                onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                className="w-full h-12 rounded-xl border border-slate-200 px-4 font-bold text-sm"
                            >
                                <option value="CASH">CASH</option>
                                <option value="BANK">BANK / CARD</option>
                                <option value="ONLINE">ONLINE TRANSFER</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Note (Internal)</Label>
                            <Input
                                value={paymentData.note}
                                onChange={e => setPaymentData({ ...paymentData, note: e.target.value })}
                                placeholder="Settlement against invoice..."
                                className="h-12 rounded-xl border-slate-100 text-xs"
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-slate-200">
                            Confirm Transaction
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
