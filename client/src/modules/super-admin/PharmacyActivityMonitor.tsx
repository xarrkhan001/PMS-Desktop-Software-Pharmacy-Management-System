import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    TrendingUp,
    Package,
    Users,
    DollarSign,
    AlertTriangle,
    Search,
    RefreshCw,
    Clock,
    ShoppingCart,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PharmacyAnalytics {
    pharmacyId: number;
    pharmacyName: string;
    isActive: boolean;
    licenseExpiry: string;
    owner: {
        id: number;
        name: string;
        email: string;
    };
    stats: {
        totalSales: number;
        todaySales: number;
        totalRevenue: number;
        todayRevenue: number;
        totalMedicines: number;
        lowStockItems: number;
        totalCustomers: number;
    };
    recentTransactions: Array<{
        id: number;
        totalAmount: number;
        createdAt: string;
        customer: { name: string } | null;
    }>;
    lastActivity: string | null;
}

export default function PharmacyActivityMonitor() {
    const [analytics, setAnalytics] = useState<PharmacyAnalytics[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyAnalytics | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/super/pharmacy-analytics", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAnalytics(data);
            }
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredAnalytics = analytics.filter(p =>
        p.pharmacyName.toLowerCase().includes(search.toLowerCase()) ||
        p.owner?.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalStats = analytics.reduce((acc, curr) => ({
        sales: acc.sales + curr.stats.totalSales,
        revenue: acc.revenue + curr.stats.totalRevenue,
        customers: acc.customers + curr.stats.totalCustomers,
        medicines: acc.medicines + curr.stats.totalMedicines
    }), { sales: 0, revenue: 0, customers: 0, medicines: 0 });

    const getActivityStatus = (lastActivity: string | null) => {
        if (!lastActivity) return { label: "No Activity", color: "slate" };
        const hoursSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
        if (hoursSince < 1) return { label: "Active Now", color: "emerald" };
        if (hoursSince < 24) return { label: "Active Today", color: "blue" };
        if (hoursSince < 168) return { label: "This Week", color: "amber" };
        return { label: "Inactive", color: "red" };
    };

    return (
        <div className="p-8 bg-[#fafafa] min-h-screen space-y-8 pb-12">
            {/* Header: Network Intelligence */}
            <div className="bg-zinc-950 px-12 py-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-20 blur-[100px]"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-7 w-7 text-emerald-500" />
                        <h1 className="text-4xl font-black tracking-tight uppercase italic">
                            Activity <span className="text-zinc-500 italic">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                        High-fidelity telemetry tracking for all authorized pharmacy nodes.
                    </p>
                </div>
            </div>

            {/* Overall Stats - Cleaner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Network Sales", value: totalStats.sales.toLocaleString(), icon: ShoppingCart, color: "zinc" },
                    { label: "Global Revenue", value: `Rs. ${totalStats.revenue.toLocaleString()}`, icon: DollarSign, color: "emerald" },
                    { label: "Active Users", value: totalStats.customers.toLocaleString(), icon: Users, color: "blue" },
                    { label: "Stock Units", value: totalStats.medicines.toLocaleString(), icon: Package, color: "amber" }
                ].map((stat, i) => (
                    <Card key={i} className="border border-slate-200/50 shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all">
                        <CardContent className="p-6 flex items-center gap-5">
                            <div className="h-14 w-14 rounded-[1.2rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <stat.icon className="h-6 w-6 text-slate-900" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-950 tabular-nums tracking-tighter">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pharmacy List */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black">Pharmacy Performance</CardTitle>
                        <p className="text-sm text-slate-500 font-medium mt-1">Monitor individual pharmacy activities</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search pharmacy..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 h-11 w-64 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl"
                            onClick={fetchAnalytics}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest pl-8">Pharmacy</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Today's Activity</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Total Performance</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Inventory</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest pr-8 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAnalytics.map((pharmacy) => {
                                const activityStatus = getActivityStatus(pharmacy.lastActivity);
                                const isExpired = new Date(pharmacy.licenseExpiry) < new Date();

                                return (
                                    <TableRow key={pharmacy.pharmacyId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                                    <span className="text-lg font-black text-indigo-600">
                                                        {pharmacy.pharmacyName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{pharmacy.pharmacyName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{pharmacy.owner?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="h-3 w-3 text-indigo-500" />
                                                    <span className="text-sm font-bold text-slate-900">{pharmacy.stats.todaySales} sales</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-sm font-bold text-emerald-600">Rs. {pharmacy.stats.todayRevenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-3 w-3 text-blue-500" />
                                                    <span className="text-sm font-bold text-slate-900">{pharmacy.stats.totalSales} total sales</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-sm font-bold text-slate-600">Rs. {pharmacy.stats.totalRevenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-3 w-3 text-slate-500" />
                                                    <span className="text-sm font-medium text-slate-700">{pharmacy.stats.totalMedicines} items</span>
                                                </div>
                                                {pharmacy.stats.lowStockItems > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                        <span className="text-xs font-bold text-amber-600">{pharmacy.stats.lowStockItems} low stock</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Badge
                                                    className={`${pharmacy.isActive && !isExpired
                                                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                                                        : 'bg-red-500/10 text-red-700 border-red-200'
                                                        } font-bold text-[10px] uppercase tracking-wider border`}
                                                >
                                                    {pharmacy.isActive && !isExpired ? '● Active' : '● Inactive'}
                                                </Badge>
                                                <Badge
                                                    className={`bg-${activityStatus.color}-500/10 text-${activityStatus.color}-700 border-${activityStatus.color}-200 font-bold text-[10px] uppercase tracking-wider border`}
                                                >
                                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                                    {activityStatus.label}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPharmacy(pharmacy)}
                                                className="rounded-xl font-bold text-xs"
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredAnalytics.length === 0 && (
                        <div className="py-20 text-center">
                            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">No pharmacy data found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Pharmacy Details Modal */}
            {selectedPharmacy && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setSelectedPharmacy(null)}>
                    <Card className="w-full max-w-2xl border-none shadow-2xl rounded-3xl" onClick={e => e.stopPropagation()}>
                        <CardHeader className="p-8 border-b border-slate-100">
                            <CardTitle className="text-2xl font-black">{selectedPharmacy.pharmacyName} - Recent Activity</CardTitle>
                            <p className="text-sm text-slate-500 font-medium mt-1">Last 5 transactions</p>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {selectedPharmacy.recentTransactions.length > 0 ? (
                                selectedPharmacy.recentTransactions.map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {txn.customer?.name || 'Walk-in Customer'}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {new Date(txn.createdAt).toLocaleString('en-PK', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <p className="text-lg font-black text-emerald-600">
                                            Rs. {txn.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-8">No recent transactions</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
