import { useState, useEffect } from "react";
import {
    Database,
    RefreshCcw,
    Search,
    Download,
    Table as TableIcon,
    ChevronRight,
    SearchX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const TABLES = [
    { id: "pharmacies", name: "Pharmacies", description: "Pharmacy registration & license data" },
    { id: "users", name: "System Users", description: "Admin, Pharmacist, and Staff accounts" },
    { id: "medicines", name: "Medication List", description: "Global medicine master data" },
    { id: "batches", name: "Stock Batches", description: "Inventory batch records & expiry" },
    { id: "sales", name: "Sales Records", description: "Customer invoices and totals" },
    { id: "sale-items", name: "Sale Line Items", description: "Individual items in each sale" },
    { id: "purchases", name: "Purchase History", description: "Supplier inward stock records" },
    { id: "purchase-items", name: "Purchase Line Items", description: "Individual items in each purchase" },
    { id: "suppliers", name: "Suppliers", description: "Manufacturer & distributor data" },
    { id: "customers", name: "Customers", description: "Patient and client registry" },
    { id: "expenses", name: "Expenses", description: "Operational cost transactions" },
    { id: "expense-categories", name: "Expense Categories", description: "Cost classification types" },
    { id: "logs", name: "Audit Logs", description: "Detailed system activity history" },
    { id: "settings", name: "Pharmacy Settings", description: "Custom configurations per pharmacy" },
    { id: "payments", name: "Payment Ledger", description: "Udhaar & credit tracking" }
];

export default function MasterDatabase() {
    const { toast } = useToast();
    const [selectedTable, setSelectedTable] = useState(TABLES[0]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async (tableId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/super/explorer/${tableId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                toast({
                    title: "Access Error",
                    description: "Unauthorized or missing table data.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Network Error",
                description: "Could not establish connection to the server.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedTable.id);
    }, [selectedTable]);

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Simple CSV Export
    const exportCSV = () => {
        const headers = Object.keys(data[0] || {}).join(",");
        const rows = data.map(item => Object.values(item).map(v => `"${v}"`).join(",")).join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `${selectedTable.id}_export.csv`);
        a.click();
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-xl shadow-slate-200">
                        <Database className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-950 border-b-4 border-zinc-950 inline-block mb-1">
                            MediCore <span className="text-zinc-500">Registry</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Master Database Explorer & Infrastructure Registry</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-slate-50 border-slate-200"
                        onClick={() => fetchData(selectedTable.id)}
                        disabled={loading}
                    >
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin text-indigo-500")} />
                        Refresh Data
                    </Button>
                    <Button
                        className="h-12 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-slate-900 hover:bg-emerald-600 text-white shadow-lg transition-all"
                        onClick={exportCSV}
                        disabled={loading || data.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        Export .CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Left Sidebar - Table Selector */}
                <div className="col-span-3 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {TABLES.map(table => (
                        <button
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            className={cn(
                                "w-full text-left p-5 rounded-[1.8rem] transition-all border text-slate-600 group flex items-center justify-between",
                                selectedTable.id === table.id
                                    ? "bg-zinc-950 border-zinc-950 shadow-2xl scale-[1.02] text-white"
                                    : "bg-white border-slate-100 hover:bg-slate-50"
                            )}
                        >
                            <div className="space-y-1">
                                <p className={cn(
                                    "font-black text-sm uppercase tracking-tighter italic",
                                    selectedTable.id === table.id ? "text-white" : "text-slate-900"
                                )}>
                                    {table.name}
                                </p>
                                <p className={cn(
                                    "text-[9px] font-black uppercase tracking-widest leading-none",
                                    selectedTable.id === table.id ? "text-zinc-500" : "text-slate-400"
                                )}>
                                    {table.description}
                                </p>
                            </div>
                            <ChevronRight className={cn(
                                "h-4 w-4 transition-transform group-hover:translate-x-1",
                                selectedTable.id === table.id ? "text-white" : "text-slate-300"
                            )} />
                        </button>
                    ))}
                </div>

                {/* Right Area - Data Grid */}
                <Card className="col-span-9 rounded-[2.5rem] border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
                    <div className="bg-zinc-950 p-6 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <TableIcon className="h-5 w-5 text-zinc-500" />
                            <h2 className="text-xl font-black italic tracking-tighter uppercase">{selectedTable.name} <span className="text-zinc-500 ml-2 tracking-widest text-xs">[{data.length} Nodes]</span></h2>
                        </div>
                        <div className="relative">
                            <Input
                                placeholder="Filter registry..."
                                className="h-10 w-64 bg-white/5 border-white/10 text-xs font-bold rounded-xl pl-10 focus:ring-zinc-500 placeholder:text-zinc-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        </div>
                    </div>
                    <CardContent className="p-0 flex-1 overflow-auto bg-slate-50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-300 animate-pulse">
                                <RefreshCcw className="h-12 w-12 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Registry...</p>
                            </div>
                        ) : filteredData.length > 0 ? (
                            <div className="overflow-x-auto h-full">
                                <table className="w-full text-left border-collapse min-w-max">
                                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                                        <tr className="bg-slate-100">
                                            {Object.keys(data[0] || {}).map(header => (
                                                <th key={header} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, i) => (
                                            <tr key={i} className="hover:bg-indigo-50/50 transition-colors border-b border-slate-100 last:border-0">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="px-6 py-4">
                                                        {typeof val === 'boolean' ? (
                                                            <span className={cn(
                                                                "px-2 py-1 rounded text-[9px] font-black uppercase",
                                                                val ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                            )}>
                                                                {String(val)}
                                                            </span>
                                                        ) : typeof val === 'object' && val !== null ? (
                                                            <code className="text-[10px] bg-slate-100 p-1 rounded font-bold text-slate-500">Obj</code>
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-600">
                                                                {String(val || "-")}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
                                <SearchX className="h-20 w-20 opacity-20" />
                                <div className="text-center">
                                    <p className="text-xl font-black italic tracking-tighter uppercase text-slate-400">No Data Found</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Try changing your search term or select another table</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
