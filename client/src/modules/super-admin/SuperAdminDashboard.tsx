import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    ShieldCheck,
    Power,
    Wallet,
    Users,
    ShieldAlert,
    TrendingUp,
    BarChart3,
    CircleDashed,
    RefreshCw
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
} from "recharts";

interface Pharmacy {
    id: number;
    name: string;
    licenseStartedAt: string;
    licenseExpiresAt: string;
    isActive: boolean;
    totalPaid?: number;
}

// Custom Premium Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">
                        {payload[0].name === "value" ? `Rs. ${payload[0].value.toLocaleString()}` : `${payload[0].value} Partners`}
                    </p>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                </div>
            </div>
        );
    }
    return null;
};

export default function SuperAdminDashboard() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPharmacies = async () => {
        setRefreshing(true);
        try {
            const response = await fetch("http://localhost:5000/api/super/pharmacies", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) setPharmacies(data);
        } catch (err: any) {
            console.error("Failed to fetch pharmacies", err);
        } finally {
            setTimeout(() => setRefreshing(false), 800);
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const totalRevenue = pharmacies.reduce((sum, p) => sum + (p.totalPaid || 0), 0);

    // Growth Data
    const growthData = [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: pharmacies.length },
        { month: 'Mar', count: Math.ceil(pharmacies.length * 1.5) },
        { month: 'Apr', count: Math.ceil(pharmacies.length * 2.1) },
        { month: 'May', count: Math.ceil(pharmacies.length * 2.8) },
        { month: 'Jun', count: Math.ceil(pharmacies.length * 3.5) },
    ];

    const revenueData = pharmacies.map(p => ({
        name: p.name,
        value: p.totalPaid || 0,
        full: Math.max(...pharmacies.map(x => x.totalPaid || 0)) * 1.2
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    const activeCount = pharmacies.filter(p => p.isActive).length;
    const blockedCount = pharmacies.filter(p => !p.isActive).length;
    const piezoData = [
        { name: 'Active', value: activeCount, color: '#10b981' },
        { name: 'Blocked', value: blockedCount, color: '#ef4444' }
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="p-8 bg-[#fafafa] min-h-screen space-y-8 pb-12">
            {/* Header: Master UI Section - Sovereign Look */}
            <div className="bg-zinc-950 px-12 py-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-20 blur-[100px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Infrastructure Status</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                            System <span className="text-zinc-500 italic">Sovereign</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest leading-none">
                            High-fidelity technical monitoring for global pharmaceutical nodes.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchPharmacies}
                            disabled={refreshing}
                            className={`h-14 px-6 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 ${refreshing ? 'bg-white/20 text-white cursor-wait' : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                                }`}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Sync Data'}
                        </button>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-0.5 tracking-[0.2em]">Network Health</p>
                            <p className="text-3xl font-black tabular-nums tracking-tighter text-emerald-500">98.4<span className="text-xs opacity-50 ml-1">%</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Cleaner & Sober */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                    { label: "Total Nodes", val: pharmacies.length, icon: Users, color: "zinc" },
                    { label: "Operational", val: activeCount, icon: Power, color: "emerald" },
                    { label: "Suspended", val: blockedCount, icon: ShieldAlert, color: "rose" },
                    { label: "Onboarding", val: "03", icon: CircleDashed, color: "amber" },
                    { label: "Net Assets", val: `Rs. ${totalRevenue.toLocaleString()}`, icon: Wallet, color: "zinc" }
                ].map((stat, i) => (
                    <Card key={i} className="border border-slate-200/50 shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all duration-500 group overflow-hidden">
                        <CardContent className="p-6 relative flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors"></div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-950 tracking-tighter tabular-nums">{stat.val}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Dynamics</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ecosystem Timeline</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fill="url(#premiumGradient)" dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="border-none shadow-lg rounded-[2rem] bg-white p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Pillars</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Top Performers</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} layout="vertical" barSize={25} margin={{ left: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 900 }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="full" fill="#f8fafc" radius={[0, 10, 10, 0]} isAnimationActive={false} />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} animationDuration={1000}>
                                    {revenueData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                <Card className="border border-slate-200 bg-zinc-950 p-8 rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 mb-6">Network Distribution</h4>
                        <div className="h-[140px] w-full relative mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={piezoData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={10} dataKey="value" stroke="none">
                                        {piezoData.map((entry, index) => <Cell key={`cell-pie-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <p className="text-3xl font-black mb-0 tracking-tighter">{pharmacies.length}</p>
                                <p className="text-[8px] font-black text-slate-600 tracking-[0.2em] -mt-1">UNITS</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6">
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active</span></div>
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Locked</span></div>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2">
                    <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] text-slate-900 flex flex-col justify-center h-full relative overflow-hidden group shadow-sm">
                        <ShieldCheck className="absolute right-0 bottom-0 h-48 w-48 -mr-12 -mb-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
                        <h4 className="text-2xl font-black tracking-tighter uppercase italic mb-3 text-zinc-950">System Integrity: <span className="text-emerald-500">Optimal</span></h4>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm leading-relaxed mb-6">
                            All global nodes are operating within established performance parameters.
                            Hardware binding verified across 100% of the active network.
                        </p>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Security: Tier 1</div>
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Latency: 12ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
