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
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid
} from "recharts";

const salesData = [
    { name: '01 Feb', sales: 42000, profit: 12000 },
    { name: '02 Feb', sales: 38000, profit: 10500 },
    { name: '03 Feb', sales: 52000, profit: 15600 },
    { name: '04 Feb', sales: 48000, profit: 13200 },
    { name: '05 Feb', sales: 61000, profit: 18400 },
    { name: '06 Feb', sales: 75000, profit: 22800 },
    { name: '07 Feb', sales: 55000, profit: 16200 },
];

const topProducts = [
    { name: 'Panadol 500mg', sales: 1240, status: 'High' },
    { name: 'Amoxicillin 250mg', sales: 850, status: 'Stable' },
    { name: 'Ibuprofen 400mg', sales: 620, status: 'Rising' },
];

const recentSales = [
    { name: 'Ahmed Ali', email: 'ahmed.ali@email.pk', amount: 1999, status: 'Paid', time: '2 mins ago' },
    { name: 'Fatima Zahra', email: 'fatima@gmail.com', amount: 450, status: 'Paid', time: '15 mins ago' },
    { name: 'Zeeshan Khan', email: 'zkhan@outlook.pk', amount: 3200, status: 'Paid', time: '1 hour ago' },
    { name: 'Ayesha Siddiqui', email: 'ayesha.s@email.pk', amount: 120, status: 'Paid', time: '3 hours ago' },
    { name: 'Kamran Akmal', email: 'kamran.a@gmail.com', amount: 890, status: 'Pending', time: '5 hours ago' },
];

export default function DashboardPage() {
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
                <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black italic tracking-tighter">PKR 1.24M</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-blue-100">
                            <ArrowUpRight className="h-3 w-3" /> +12.5% from last week
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
                        <div className="text-3xl font-black italic tracking-tighter">842</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                            <ArrowUpRight className="h-3 w-3" /> +18.2% vs yesterday
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                            Active SKUs <Package className="h-4 w-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter">12,450</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-blue-600">
                            <Activity className="h-3 w-3" /> 98% in-stock rate
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="pb-2 text-rose-600">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex justify-between">
                            Alerts <AlertTriangle className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-rose-600">24</div>
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-rose-600/70">
                            <ArrowDownRight className="h-3 w-3" /> 8 Expiring soon
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
                                <CardDescription>Sales vs Net Profit (Weekly Trend)</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold">
                                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Sales</div>
                                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Profit</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                                        tickFormatter={(val) => `${val / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
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
                        <CardDescription>Most selling products today.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {topProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:scale-[1.02] transition-transform cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{product.name}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{product.status} Demand</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic">{product.sales}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">Units</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6 h-12 rounded-xl text-xs font-bold uppercase tracking-widest border-2">View Inventory Report</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Activity Ledger */}
            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-12 border-none shadow-2xl bg-white dark:bg-slate-900">
                    <CardHeader className="border-b dark:border-slate-800 pb-6 pt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold italic tracking-tight">Recent Activity Ledger</CardTitle>
                                <CardDescription>Real-time transaction log for all branches.</CardDescription>
                            </div>
                            <Button variant="ghost" className="text-xs font-bold text-primary flex items-center gap-2">
                                <Users className="h-4 w-4" /> View Customer Profiles
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {recentSales.map((sale, idx) => (
                                <div key={idx} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 relative overflow-hidden group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center font-bold text-xs text-primary">
                                            {sale.name.charAt(0)}
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sale.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {sale.status}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm font-bold truncate">{sale.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{sale.email}</p>
                                    </div>
                                    <div className="flex items-end justify-between border-t dark:border-slate-700 pt-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Amount</p>
                                            <p className="text-md font-black italic tracking-tighter">PKR {sale.amount}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground">{sale.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
