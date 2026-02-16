import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DollarSign,
    Pill,
    AlertTriangle,
    Users,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Package,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid
} from "recharts";

interface DashboardData {
    stats: {
        totalRevenue: number;
        ordersToday: number;
        activeSkus: number;
        alerts: number;
        lowStockCount: number;
        nearExpiryCount: number;
        expiredCount: number;
    };
    revenueTrend: Array<{ name: string; sales: number; profit: number }>;
    topProducts: Array<{ name: string; sales: number; status: string }>;
    recentActivity: Array<{ id: string; name: string; email: string; amount: number; status: string; time: string }>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/dashboard/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.clear();
                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Initializing Terminal Control...</p>
            </div>
        );
    }

    if (!data || !data.stats) return <div className="p-8 text-center text-slate-500 font-bold">Failed to load dashboard intelligence. Please refresh.</div>;

    const { stats, revenueTrend, topProducts, recentActivity } = data;

    return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                        Cloud <span className="text-primary">Control</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Welcome back, Admin. Here's your pharmacy's live status.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 shadow-sm">Real-time</button>
                    <button className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-slate-900 transition-colors">Historical</button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black italic tracking-tighter">Rs. {stats.totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-indigo-100/60 uppercase tracking-tighter">
                            Enterprise Volume Status: Optimal
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                            Orders Today <ShoppingCart className="h-4 w-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">{stats.ordersToday}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                            <Activity className="h-3 w-3" /> Live Transaction Stream
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                            Active SKUs <Package className="h-4 w-4 text-indigo-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">{stats.activeSkus.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-indigo-600">
                            <Activity className="h-3 w-3" /> Catalog Synchronized
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ${stats.alerts > 0 ? 'ring-rose-500/50' : 'ring-slate-200 dark:ring-slate-800'}`}>
                    <CardHeader className={`pb-2 ${stats.alerts > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex justify-between">
                            Active Alerts <AlertTriangle className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-black italic tracking-tighter ${stats.alerts > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{stats.alerts}</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-rose-600/70">
                            {stats.lowStockCount > 0 ? `${stats.lowStockCount} Low Stock` : 'Stock Levels Healthy'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Main Revenue Chart */}
                <Card className="lg:col-span-8 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b dark:border-slate-800 pb-6 pt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold italic tracking-tight">Revenue Analytics</CardTitle>
                                <CardDescription>Business growth trend (Last 7 Days)</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold">
                                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-indigo-500" /> Sales</div>
                                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Profit</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                        tickFormatter={(val) => `Rs.${val / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performing List */}
                <Card className="lg:col-span-4 border-none shadow-2xl bg-white dark:bg-slate-900 border dark:border-slate-800">
                    <CardHeader className="border-b dark:border-slate-800 pb-6 pt-8">
                        <CardTitle className="text-xl font-bold italic tracking-tight">Top Movers</CardTitle>
                        <CardDescription>Most selling products identify.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {topProducts.map((product, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate("/inventory")}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:scale-[1.02] transition-transform cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{product.name}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{product.status} Demand</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic text-slate-900 dark:text-white">{product.sales}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Units</p>
                                    </div>
                                </div>
                            ))}
                            {topProducts.length === 0 && (
                                <p className="text-center text-slate-400 font-bold py-10 italic">No sales data yet.</p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/inventory")}
                            className="w-full mt-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50"
                        >
                            View Full Inventory
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Activity Ledger */}
            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-12 border-none shadow-2xl bg-white dark:bg-slate-900">
                    <CardHeader className="border-b dark:border-slate-800 pb-6 pt-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold italic tracking-tight">Recent Activity Ledger</CardTitle>
                                <CardDescription>Real-time transaction log for this terminal.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-900 shadow-sm disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 min-w-[60px] text-center">
                                        Page {currentPage} of {recentActivity.length > 0 ? Math.ceil(recentActivity.length / itemsPerPage) : 1}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentActivity.length / itemsPerPage), prev + 1))}
                                        disabled={currentPage >= Math.ceil(recentActivity.length / itemsPerPage)}
                                        className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-slate-900 shadow-sm disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/sales-history")}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 py-1 px-4 rounded-xl"
                                >
                                    <Users className="h-4 w-4" /> Global Accounts
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {recentActivity
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((activity, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate("/sales-history")}
                                        className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 relative overflow-hidden group border border-transparent hover:border-indigo-100 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-xl cursor-pointer"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-xs text-indigo-600 shadow-sm">
                                                {activity.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${activity.status === 'Paid' || activity.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        <div className="mb-6">
                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{activity.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{activity.email}</p>
                                        </div>
                                        <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Transaction</p>
                                                <p className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white">Rs. {activity.amount.toLocaleString()}</p>
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            {recentActivity.length === 0 && (
                                <div className="col-span-full py-16 text-center">
                                    <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold italic">Waiting for terminal activity...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
