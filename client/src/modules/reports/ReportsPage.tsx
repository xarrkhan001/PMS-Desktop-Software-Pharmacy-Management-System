import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, TrendingUp, DollarSign, Pill, Users, ShoppingBag } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const salesData = [
    { name: "Mon", sales: 42000, profit: 12000, orders: 45 },
    { name: "Tue", sales: 38000, profit: 10500, orders: 38 },
    { name: "Wed", sales: 52000, profit: 15000, orders: 58 },
    { name: "Thu", sales: 48000, profit: 13500, orders: 52 },
    { name: "Fri", sales: 61000, profit: 18000, orders: 65 },
    { name: "Sat", sales: 75000, profit: 22000, orders: 82 },
    { name: "Sun", sales: 55000, profit: 16000, orders: 60 },
];

const categoryData = [
    { name: "Tablets", value: 45, color: "#2563eb" },
    { name: "Syrups", value: 25, color: "#10b981" },
    { name: "Injections", value: 15, color: "#f59e0b" },
    { name: "Surgical", value: 10, color: "#ef4444" },
    { name: "Others", value: 5, color: "#8b5cf6" },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Insights</h1>
                    <p className="text-muted-foreground mt-1">Real-time performance reports and business intelligence.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> This Month</Button>
                    <Button><FileDown className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 flex justify-between items-center">
                            Total Revenue <DollarSign className="h-4 w-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tight">PKR 3.42M</div>
                        <p className="text-xs mt-1 font-bold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> +18.2% vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                            Net Profit <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tight">PKR 980k</div>
                        <p className="text-xs mt-1 text-emerald-600 font-bold flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" /> High Margin Week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                            New Customers <Users className="h-4 w-4 text-amber-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tight">+142</div>
                        <p className="text-xs mt-1 text-amber-600 font-bold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Trending Up
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                            Medicines Sold <Pill className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tight">12,450</div>
                        <p className="text-xs mt-1 text-primary font-bold">Units handled this month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Sales Revenue Forecast</CardTitle>
                        <CardDescription>Daily sales performance for the current week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Sales volume grouped by medicine class.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-between">
                        <div className="h-[300px] w-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 w-full max-w-[200px]">
                            {categoryData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Volume Trend</CardTitle>
                    <CardDescription>Number of bills processed daily.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
