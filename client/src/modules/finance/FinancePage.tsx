import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const financeData = [
    { name: "Mon", income: 45000, expense: 12000, profit: 33000 },
    { name: "Tue", income: 52000, expense: 15000, profit: 37000 },
    { name: "Wed", income: 48000, expense: 10000, profit: 38000 },
    { name: "Thu", income: 61000, expense: 22000, profit: 39000 },
    { name: "Fri", income: 55000, expense: 18000, profit: 37000 },
    { name: "Sat", income: 75000, expense: 25000, profit: 50000 },
    { name: "Sun", income: 40000, expense: 8000, profit: 32000 },
];

const transactions = [
    { id: 1, type: "Expense", desc: "Electricity Bill (IESCO)", amount: 15400, date: "2024-02-05", status: "Paid" },
    { id: 2, type: "Income", desc: "Daily Sales - Morning Shift", amount: 28500, date: "2024-02-05", status: "Received" },
    { id: 3, type: "Expense", desc: "Tea & Lunch (Staff)", amount: 1200, date: "2024-02-05", status: "Paid" },
    { id: 4, type: "Purchase", desc: "Medicine Restock (Ali Distributors)", amount: 45000, date: "2024-02-04", status: "Pending" },
    { id: 5, type: "Income", desc: "Daily Sales - Evening Shift", amount: 32100, date: "2024-02-04", status: "Received" },
];

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Finance & Accounts</h1>
                    <p className="text-muted-foreground mt-1">Manage cash flow, expenses, and supplier ledgers (Khata).</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Reports
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add New Entry
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income (This Month)</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">PKR 1,245,000</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">PKR 345,200</div>
                        <p className="text-xs text-red-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +4.2% (High Utility Bills)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">PKR 899,800</div>
                        <p className="text-xs text-muted-foreground mt-1">Pure profit after all costs</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payables</CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">PKR 125,000</div>
                        <p className="text-xs text-amber-600 mt-1">To 3 Suppliers (Due Soon)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Analytics */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Cash Flow Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Balance Sheet */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Add Expense</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expense Title</label>
                                <Input placeholder="e.g. Tea for Staff" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (PKR)</label>
                                <Input type="number" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option>Petty Cash</option>
                                    <option>Utility Bills</option>
                                    <option>Maintenance</option>
                                    <option>Staff Salary</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">Add Expense Record</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bank Accounts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Landmark className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">HBL Business</p>
                                        <p className="text-xs text-muted-foreground">**** 4291</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm">PKR 450k</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-full">
                                        <Landmark className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Cash in Hand</p>
                                        <p className="text-xs text-muted-foreground">Drawer #1</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm">PKR 85k</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount (PKR)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'Income' ? 'bg-green-100 text-green-700' :
                                                t.type === 'Expense' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {t.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{t.desc}</TableCell>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs ${t.status === 'Paid' || t.status === 'Received' ? 'text-green-600' : 'text-amber-600'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${t.type === 'Expense' || t.type === 'Purchase' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {t.type === 'Expense' || t.type === 'Purchase' ? '-' : '+'} {t.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
