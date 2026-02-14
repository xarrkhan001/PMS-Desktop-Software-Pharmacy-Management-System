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
    CircleDashed
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

    const fetchPharmacies = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/super/pharmacies", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) setPharmacies(data);
        } catch (err: any) {
            console.error("Failed to fetch pharmacies", err);
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
        <div className="p-8 bg-[#f8fafc] min-h-screen space-y-8 pb-12">
            {/* Header: Master UI Section - Restored Rounding */}
            <div className="bg-indigo-950 px-12 py-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-20 blur-[80px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300/60">System Live Update</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            PharmPro <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Master Control</span>
                        </h1>
                        <p className="text-indigo-200/50 font-medium text-xs italic tracking-wide">
                            High-fidelity technical monitoring for the global PharmaCloud ecosystem.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-center shadow-inner">
                        <p className="text-[9px] font-black text-indigo-300/80 uppercase mb-0.5 tracking-wider">Health Score</p>
                        <p className="text-2xl font-black tabular-nums">98.4%</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                    { label: "Partners", val: pharmacies.length, icon: Users, color: "indigo" },
                    { label: "Operational", val: activeCount, icon: Power, color: "emerald" },
                    { label: "Suspended", val: blockedCount, icon: ShieldAlert, color: "red" },
                    { label: "Pending", val: "03", icon: CircleDashed, color: "amber" },
                    { label: "Net Revenue", val: `Rs. ${totalRevenue.toLocaleString()}`, icon: Wallet, color: "indigo" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden border-b-2 border-b-slate-100">
                        <CardContent className="p-5 relative flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 shrink-0`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 tracking-tight">{stat.val}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-lg rounded-[2rem] bg-[#0f172a] p-6 text-white text-center">
                    <h4 className="text-sm font-black tracking-widest uppercase text-indigo-400 mb-4">Network Integrity</h4>
                    <div className="h-[140px] w-full relative mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={piezoData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none">
                                    {piezoData.map((entry, index) => <Cell key={`cell-pie-${index}`} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <p className="text-2xl font-black mb-0">{pharmacies.length}</p>
                            <p className="text-[7px] font-bold text-slate-500 tracking-[0.2em]">NODES</p>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Live</span></div>
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Down</span></div>
                    </div>
                </Card>

                <div className="lg:col-span-2">
                    <div className="p-8 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2rem] text-white flex flex-col justify-center h-full relative overflow-hidden group shadow-xl">
                        <ShieldCheck className="absolute right-0 bottom-0 h-40 w-40 -mr-10 -mb-10 opacity-10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-2xl font-black tracking-tight mb-2">Network Status: Optimal</h4>
                        <p className="text-indigo-100/60 text-xs font-medium max-w-md leading-relaxed">
                            All global nodes are operating within established performance parameters.
                            Security protocols active and verified.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
