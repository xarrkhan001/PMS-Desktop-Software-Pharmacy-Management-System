import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    FileText, Printer, Search, Filter,
    Calendar, History, Receipt,
    ChevronRight, Download, Eye, XCircle, Trash2, CheckCircle, Trash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function SalesHistoryPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [filteredSales, setFilteredSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { toast } = useToast();

    // Get Pharmacy Name
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pharmacyName = user.pharmacyName || "PharmPro Pharmacy";

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        const results = sales.filter(s =>
            s.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSales(results);
    }, [searchTerm, sales]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/sales/history", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setSales(data);
            setFilteredSales(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = (sale: any) => {
        setSelectedSale(sale);
        setIsReceiptOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:5000/api/sales/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast({ title: "Deleted", description: "Invoice deleted successfully" });
            fetchHistory();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) return;
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:5000/api/sales/bulk-delete", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selectedIds })
            });
            toast({ title: "Deleted", description: "Invoices deleted successfully" });
            setSelectedIds([]);
            fetchHistory();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSales.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSales.map(s => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `${pharmacyName} - Invoice ${selectedSale?.invoiceNo || 'Copy'}`;
        window.print();
        document.title = originalTitle;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <History className="h-6 w-6" />
                        </div>
                        Sales History
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Archived Invoices & Digital Receipts</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            className="flex items-center rounded-xl font-bold px-4 h-11 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 transition-all border-none"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length})
                        </button>
                    )}
                    <button
                        className="flex items-center rounded-xl font-bold px-4 h-11 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input
                        placeholder="Search by Invoice # or Customer Name..."
                        className="h-12 pl-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center h-12 rounded-xl border border-slate-100 px-4 font-bold text-slate-500 bg-white hover:bg-slate-50">
                        <Calendar className="mr-2 h-4 w-4" /> Date Range
                    </button>
                    <button className="flex items-center h-12 rounded-xl border border-slate-100 px-4 font-bold text-slate-500 bg-white hover:bg-slate-50">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">{selectedIds.length} Invoices Selected</h3>
                            <p className="text-xs text-indigo-100 uppercase tracking-[0.2em] font-bold">Bulk management mode active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            className="flex-1 md:flex-none text-white hover:bg-white/10 font-bold h-12 px-6 rounded-xl border border-white/20 bg-transparent transition-all"
                            onClick={() => setSelectedIds([])}
                        >
                            Cancel Selection
                        </button>
                        <button
                            className="flex-1 md:flex-none bg-rose-500 hover:bg-rose-600 text-white font-black h-12 px-8 rounded-xl shadow-xl shadow-rose-900/20 gap-2 border-none transition-all flex items-center justify-center"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="h-5 w-5" /> Delete Permanently
                        </button>
                    </div>
                </div>
            )}

            {/* History Table */}
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-12 pl-8">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    checked={selectedIds.length === filteredSales.length && filteredSales.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="font-black py-5 uppercase text-[10px] tracking-widest text-slate-400">Invoice No</TableHead>
                            <TableHead className="font-black py-5 uppercase text-[10px] tracking-widest text-slate-400">Customer</TableHead>
                            <TableHead className="font-black py-5 uppercase text-[10px] tracking-widest text-slate-400">Date & Time</TableHead>
                            <TableHead className="font-black py-5 uppercase text-[10px] tracking-widest text-slate-400">Payment</TableHead>
                            <TableHead className="text-right font-black py-5 uppercase text-[10px] tracking-widest text-slate-400">Net Amount</TableHead>
                            <TableHead className="text-center font-black py-5 uppercase text-[10px] tracking-widest text-slate-400 w-40">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.map((sale) => (
                            <TableRow key={sale.id} className={`group transition-all border-slate-50 ${selectedIds.includes(sale.id) ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                                <TableCell className="pl-8">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        checked={selectedIds.includes(sale.id)}
                                        onChange={() => toggleSelect(sale.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-black py-6">
                                    <span className="text-slate-900 tracking-tight">{sale.invoiceNo}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {sale.customer?.name?.charAt(0) || "W"}
                                        </div>
                                        <span className="font-bold text-slate-700">{sale.customer?.name || "Walk-in Customer"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-slate-500 text-sm">
                                    {new Date(sale.createdAt).toLocaleString('en-PK', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border-none ${sale.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-600' :
                                        sale.paymentMethod === 'CARD' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                        {sale.paymentMethod}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-black text-slate-900 text-md">
                                    Rs. {sale.netAmount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm"
                                            onClick={() => handleViewInvoice(sale)}
                                        >
                                            <Eye size={14} />
                                            <span>SHOW</span>
                                        </button>
                                        <button
                                            className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                                            onClick={() => handleDelete(sale.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Receipt Viewer Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 border-none bg-white rounded-3xl flex flex-col max-h-[85vh] overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 print:p-0 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent" id="receipt-content">
                        <div className="text-center space-y-2 mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">{pharmacyName}</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pakistan Official Drug License #4492-PK</p>
                            <p className="text-[10px] font-bold text-slate-400">Main Road, Commercial Area, Terminal 01</p>
                            <p className="text-[11px] font-black italic tracking-widest text-indigo-600 pt-2 uppercase">*** Duplicate Receipt ***</p>
                        </div>

                        <div className="border-t border-b border-dashed border-slate-200 py-3 my-4 space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>{selectedSale?.invoiceNo}</span>
                                <span>{selectedSale && new Date(selectedSale.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-700">
                                <span>Customer: {selectedSale?.manualCustomerName || selectedSale?.customer?.name || "Walk-in"}</span>
                                <span>Mode: {selectedSale?.paymentMethod || "CASH"}</span>
                            </div>
                            {selectedSale?.manualCustomerAddress && (
                                <div className="text-[10px] font-bold text-slate-500 text-left">
                                    Address: {selectedSale.manualCustomerAddress}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between border-b pb-2 text-[9px] font-black text-slate-400 uppercase">
                                <span className="flex-[2]">Item Description</span>
                                <span className="flex-1 text-center">Qty</span>
                                <span className="flex-1 text-right">Price</span>
                                <span className="flex-1 text-right">Total</span>
                            </div>
                            {selectedSale?.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] font-bold">
                                    <span className="flex-[2] uppercase">
                                        {item.medicine?.name}
                                    </span>
                                    <span className="flex-1 text-center">{item.quantity}</span>
                                    <span className="flex-1 text-right">{item.price.toFixed(2)}</span>
                                    <span className="flex-1 text-right">{item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
                            <div className="flex justify-between text-[11px] font-bold">
                                <span>Subtotal</span>
                                <span>Rs. {selectedSale?.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-rose-500">
                                <span>Discount</span>
                                <span>- Rs. {selectedSale?.discount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black italic pt-2 border-t border-slate-100 text-indigo-600">
                                <span className="uppercase tracking-tighter">Grand Total</span>
                                <span>Rs. {selectedSale?.netAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Original Terminal Sale Verified</p>
                            <p className="text-[12px] font-black italic tracking-tighter text-indigo-500 pt-2">Powered by PharmPro Enterprise</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 flex gap-3 print:hidden">
                        <Button
                            className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black gap-2 text-lg shadow-lg shadow-indigo-100"
                            onClick={handlePrint}
                        >
                            <Printer className="h-5 w-5" /> Reprint
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-14 w-14 rounded-2xl hover:bg-slate-200 border border-slate-200"
                            onClick={() => setIsReceiptOpen(false)}
                        >
                            <XCircle className="h-6 w-6 text-slate-400" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dedicated Print Overlay - Bypasses Modal/Portal Issues completely */}
            <div id="print-overlay" className="hidden print:block">
                <div className="p-8">
                    <div className="text-center space-y-2 mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{pharmacyName}</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pakistan Official Drug License #4492-PK</p>
                        <p className="text-[10px] font-bold text-slate-400">Main Road, Commercial Area, Terminal 01</p>
                        <p className="text-[11px] font-black italic tracking-widest text-indigo-600 pt-2 uppercase">*** Duplicate Receipt ***</p>
                    </div>

                    <div className="border-t border-b border-dashed border-slate-200 py-3 my-4 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>{selectedSale?.invoiceNo}</span>
                            <span>{selectedSale && new Date(selectedSale.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-700">
                            <span>Customer: {selectedSale?.manualCustomerName || selectedSale?.customer?.name || "Walk-in"}</span>
                            <span>Mode: {selectedSale?.paymentMethod || "CASH"}</span>
                        </div>
                        {selectedSale?.manualCustomerAddress && (
                            <div className="text-[10px] font-bold text-slate-500 text-left">
                                Address: {selectedSale.manualCustomerAddress}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between border-b pb-2 text-[9px] font-black text-slate-400 uppercase">
                            <span className="flex-[2]">Item Description</span>
                            <span className="flex-1 text-center">Qty</span>
                            <span className="flex-1 text-right">Price</span>
                            <span className="flex-1 text-right">Total</span>
                        </div>
                        {selectedSale?.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-700">
                                <span className="flex-[2] uppercase">
                                    {item.medicine?.name}
                                </span>
                                <span className="flex-1 text-center text-slate-500">{item.quantity}</span>
                                <span className="flex-1 text-right">{item.price.toFixed(2)}</span>
                                <span className="flex-1 text-right text-slate-900">{item.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span>Rs. {selectedSale?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-rose-600 print-color-exact">
                            <span>Discount</span>
                            <span>- Rs. {selectedSale?.discount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black italic pt-2 border-t border-slate-100 text-indigo-700 print-color-exact">
                            <span className="uppercase tracking-tighter">Grand Total</span>
                            <span>Rs. {selectedSale?.netAmount?.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Original Terminal Sale Verified</p>
                        <p className="text-[12px] font-black italic tracking-tighter text-indigo-500 pt-2">Powered by PharmPro Enterprise</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body { 
                        visibility: hidden !important; 
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Force Print Overlay to be the ONLY thing visible */
                    #print-overlay {
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: white !important;
                        z-index: 99999 !important;
                        display: block !important;
                        padding: 0 !important;
                    }
                    
                    #print-overlay * {
                        visibility: visible !important;
                    }

                    .print-color-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .text-rose-600 { color: #e11d48 !important; }
                    .text-indigo-700 { color: #4338ca !important; }
                    .text-indigo-500 { color: #6366f1 !important; }

                    .print-color-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Hide UI elements during print */
                    .print\:hidden, 
                    nav, 
                    header, 
                    aside,
                    .no-print { 
                        display: none !important; 
                    }
                }
            ` }} />
        </div>
    );
}
