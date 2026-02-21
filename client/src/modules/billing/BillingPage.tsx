import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Trash, Search, Printer, Receipt,
    Loader2, User as UserIcon, Activity, Package, TrendingUp, TrendingDown,
    ChevronLeft, ChevronRight, UserPlus, Calculator, History, XCircle, Trash2, ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

interface Batch {
    id: number;
    batchNo: string;
    quantity: number;
    expiryDate: string;
    purchasePrice: number;
}

interface Medicine {
    id: number;
    name: string;
    salePrice: number;
    unitPerPack: number;
    unitType: string;
    batches: Batch[];
    reorderLevel?: number;
    category?: string;
}

interface CartItem {
    id: string; // combination of medId and batchId
    medicineId: number;
    name: string;
    batchId: number;
    batchNo: string;
    packPrice: number;
    unitPrice: number;
    qty: number; // in smallest units (tablets)
    maxQty: number; // in smallest units
    isLoose: boolean;
    unitPerPack: number;
    unitType: string;
    itemDiscount: number; // percentage
    purchasePrice: number;
}

export default function BillingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [recentPage, setRecentPage] = useState(1);
    const recentLimit = 3;

    // Use a stable session ID that only changes on page refresh/mount
    const sessionId = useMemo(() => Date.now().toString().slice(-6), []);

    // Get Pharmacy Name from Local Storage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pharmacyName = user.pharmacyName || "MediCore PMS";
    const [paymentMethod] = useState<"CASH">("CASH");
    const [customerName, setCustomerName] = useState("Walk-in Customer");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isSelectingCustomer, setIsSelectingCustomer] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [cashReceived, setCashReceived] = useState<number | "">(0);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [pmsSettings, setPmsSettings] = useState<any>(null);
    const { toast } = useToast();

    // Fetch initial data
    useEffect(() => {
        fetchRecentInvoices();
        fetchCustomers();
        fetchPmsSettings();
    }, []);

    const fetchPmsSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/settings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPmsSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/customers", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecentInvoices = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/sales/recent", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setRecentInvoices(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Keyboard Shortcuts Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'F12') {
                e.preventDefault();
                handleCheckout();
            }
            if (e.key === 'Escape') {
                setSearchResults([]);
                setSearchTerm("");
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, totalDiscount, customerId, paymentMethod]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                searchMedicines();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchMedicines = async () => {
        setIsSearching(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/sales/search?q=${searchTerm}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const addToCart = (med: Medicine, batch: Batch, isLoose: boolean = false) => {
        const cartId = `${med.id}-${batch.id}`;
        const unitsToAdd = isLoose ? 1 : (med.unitPerPack || 1);
        const unitPrice = med.salePrice / (med.unitPerPack || 1);

        setCart(prev => {
            const existing = prev.find(item => item.id === cartId);
            if (existing) {
                if (existing.qty + unitsToAdd > batch.quantity) {
                    toast({ title: "Out of Stock", description: "Not enough units available", variant: "destructive" });
                    return prev;
                }
                return prev.map(c => c.id === cartId ? { ...c, qty: c.qty + unitsToAdd } : c);
            } else {
                return [...prev, {
                    id: cartId,
                    medicineId: med.id,
                    name: med.name,
                    batchId: batch.id,
                    batchNo: batch.batchNo,
                    packPrice: med.salePrice || 0,
                    unitPrice: unitPrice || 0,
                    qty: unitsToAdd,
                    maxQty: batch.quantity,
                    isLoose: isLoose,
                    unitPerPack: med.unitPerPack || 1,
                    unitType: med.unitType || "Unit",
                    itemDiscount: 0,
                    purchasePrice: batch.purchasePrice || 0
                }];
            }
        });

        // Clear search UI states
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false);
    };

    const updateQty = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return newQty <= item.maxQty ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const updateItemDiscount = (id: string, perc: number) => {
        setCart(cart.map(item => item.id === id ? { ...item, itemDiscount: perc } : item));
    };

    const removeItem = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // Calculations
    const calculateItemTotal = (item: CartItem) => {
        const gross = item.unitPrice * item.qty;
        const discountVal = (gross * item.itemDiscount) / 100;
        return gross - discountVal;
    };

    const subtotal = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    const total = subtotal - totalDiscount;
    const changeDue = cashReceived !== "" ? Math.max(0, Number(cashReceived) - total) : 0;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast({ title: "Counter Empty", description: "Add items to generate invoice", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const payload = {
                customerId: customerId,
                items: cart.map(item => ({
                    medicineId: item.medicineId,
                    batchId: item.batchId,
                    quantity: item.qty,
                    price: item.unitPrice
                })),
                discount: totalDiscount,
                paymentMethod,
                totalAmount: subtotal,
                netAmount: total,
                paidAmount: total,
                manualCustomerName: customerName,
                manualCustomerAddress: customerAddress
            };

            const res = await fetch("http://localhost:5000/api/sales/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                toast({ title: "Invoice Printed", description: `Net: PKR ${total.toLocaleString()}` });

                // Show receipt for printing
                setLastSale({
                    ...data.sale,
                    items: cart,
                    subtotal,
                    discount: totalDiscount,
                    total
                });
                setIsReceiptOpen(true);

                setCart([]);
                setTotalDiscount(0);
                setCustomerName("Walk-in Customer");
                setCustomerAddress("");
                setCustomerId(null);
                fetchRecentInvoices();
            } else {
                throw new Error("Failed to process sale");
            }
        } catch (error) {
            toast({ title: "System Error", description: "Terminal failure during checkout", variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            {/* Left Panel: Terminal & Ledger */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">

                {/* Search Bar (Fixed at Top) */}
                <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 flex items-center gap-2 relative z-30 mx-1 flex-shrink-0">
                    <div className="flex-1 relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Search className="h-4 w-4 text-indigo-500" />
                            <div className="h-4 w-[1px] bg-slate-200" />
                        </div>
                        <Input
                            ref={searchRef}
                            placeholder="Search Brand or Generic... (F1)"
                            className="h-11 pl-12 border-none bg-transparent text-sm font-black uppercase tracking-tight placeholder:text-slate-300 placeholder:font-bold focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isSearching && <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mr-2" />}
                    <div className="h-8 w-[1px] bg-slate-200 mx-1" />
                    <Button variant="ghost" className="h-10 w-10 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Calculator className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-50 scrollbar-track-transparent hover:scrollbar-thumb-slate-100 transition-colors z-10 scrollbar-w-1 mt-3">

                    {/* Search Results Dropdown Overlay */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-[100] px-1 pointer-events-none">
                            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] border-none overflow-hidden bg-white/98 backdrop-blur-xl ring-1 ring-slate-100 pointer-events-auto max-w-4xl mx-auto">
                                <div className="bg-slate-900/95 px-6 py-2 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Match Engine</h2>
                                            <Badge className="bg-white/10 text-white/50 border-none text-[7px] font-black px-1 py-0 rounded-md uppercase tracking-widest">{searchResults.length}</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchResults([])}
                                        className="h-6 rounded-md text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-rose-400 transition-all px-2"
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                                    {searchResults.map((med) => (
                                        <div key={med.id} className="p-3 bg-slate-50/40 hover:bg-white rounded-[1.2rem] border border-slate-100/50 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <Activity className="h-3 w-3" />
                                                        </div>
                                                        <h3 className="font-black text-slate-900 text-sm tracking-tighter uppercase">{med.name}</h3>
                                                        <Badge className="bg-indigo-600 text-white border-none text-[7px] font-black px-1.5 py-0 rounded-md uppercase tracking-widest">{med.category}</Badge>
                                                        {med.batches && med.batches.reduce((sum, b) => sum + b.quantity, 0) <= (pmsSettings?.lowStockThreshold || med.reorderLevel || 10) && (
                                                            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-[7px] font-black animate-pulse flex items-center gap-1 px-1.5">
                                                                <TrendingDown className="h-2 w-2" /> SHORTAGE
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ml-8">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pack: <span className="text-slate-900">Rs. {med.salePrice}</span></p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate: <span className="text-emerald-600">Rs. {(med.salePrice / (med.unitPerPack || 1)).toFixed(2)}</span></p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units: <span className="text-indigo-600">{med.unitPerPack}</span></p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    {med.batches && med.batches.filter(b => b.quantity > 0)
                                                        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                                                        .slice(0, 2)
                                                        .map(batch => (
                                                            <div key={batch.id} className="flex items-center gap-4 p-2.5 bg-white rounded-[1rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group/batch relative overflow-hidden">
                                                                {Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= (pmsSettings?.nearExpiryDays || 30) && (
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                                                )}
                                                                <div className="flex flex-col min-w-[80px]">
                                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">{batch.batchNo}</span>
                                                                        {Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= (pmsSettings?.nearExpiryDays || 30) && (
                                                                            <span className="text-rose-500 text-[7px] font-black uppercase animate-pulse leading-none italic">Expiring</span>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-tight ${batch.quantity < (med.reorderLevel || 10) ? 'text-amber-500' : 'text-slate-900'}`}>
                                                                        {batch.quantity} Left
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="h-8 w-20 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-black text-[8px] uppercase transition-all flex flex-col items-center justify-center gap-0"
                                                                        onClick={() => addToCart(med, batch, false)}
                                                                    >
                                                                        <span className="opacity-40 text-[6px]">PK</span>
                                                                        <span>WHOLE</span>
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="h-8 w-20 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[8px] uppercase shadow-md transition-all flex flex-col items-center justify-center gap-0"
                                                                        onClick={() => addToCart(med, batch, true)}
                                                                    >
                                                                        <span className="opacity-60 text-[6px]">UT</span>
                                                                        <span>SINGLE</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    {(!med.batches || med.batches.filter(b => b.quantity > 0).length === 0) && (
                                                        <p className="text-[10px] font-black text-rose-500 uppercase italic pr-4">Insufficient Stock</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Main Billing Table (TERMINAL ACTIVE) */}
                    <div className="flex-[2.5] min-h-[420px] flex flex-col bg-white rounded-none shadow-xl ring-1 ring-slate-100 overflow-hidden relative">
                        <div className="flex flex-row items-center justify-between border-b pb-4 px-8 pt-6 bg-white z-20">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Terminal <span className="text-indigo-600">Active</span></CardTitle>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {sessionId}</p>
                                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Operator: {user.name || "Admin"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCart([])}
                                    className="h-10 px-4 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all text-[10px] font-black uppercase tracking-widest gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> Clear
                                </Button>
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <UserIcon className={`h-4 w-4 ${customerId ? 'text-emerald-500' : 'text-slate-400'}`} />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{customerName}</span>
                                        {customerId && <span className="text-[8px] font-black text-emerald-500 uppercase">Linked Profile</span>}
                                    </div>
                                </div>
                                <Dialog open={isSelectingCustomer} onOpenChange={setIsSelectingCustomer}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-4xl">
                                        <div className="bg-slate-900 p-8 text-white">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Select Customer</DialogTitle>
                                                <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80 mt-1">Link sale to regular profile</DialogDescription>
                                            </DialogHeader>
                                        </div>
                                        <div className="p-6 space-y-4 bg-white">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search database..."
                                                    className="pl-11 h-12 bg-slate-50 border-none rounded-2xl font-bold"
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                <div
                                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                                                    onClick={() => {
                                                        setCustomerId(null);
                                                        setCustomerName("Walk-in Customer");
                                                        setCustomerAddress("");
                                                        setCustomerSearch("");
                                                        setIsSelectingCustomer(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                            <XCircle className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-black text-sm uppercase italic tracking-tight">Walk-in Customer</span>
                                                    </div>
                                                    <Badge className="bg-slate-200 text-slate-500 border-none rounded-lg text-[10px] font-black uppercase">Default</Badge>
                                                </div>

                                                {customers
                                                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.phone && c.phone.includes(customerSearch)))
                                                    .map(c => (
                                                        <div
                                                            key={c.id}
                                                            className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                                                            onClick={() => {
                                                                setCustomerId(c.id);
                                                                setCustomerName(c.name);
                                                                setCustomerAddress(c.phone || c.address || "");
                                                                setCustomerSearch("");
                                                                setIsSelectingCustomer(false);
                                                                toast({ title: "Customer Linked", description: `${c.name} selected for this terminal.` });
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-all font-black uppercase italic">
                                                                    {c.name.charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-sm uppercase italic tracking-tight">{c.name}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.phone || 'No Contact'}</span>
                                                                </div>
                                                            </div>
                                                            {c.totalDue > 0 && <Badge className="bg-rose-50 text-rose-600 border-none rounded-lg text-[9px] font-black uppercase">Due: {c.totalDue}</Badge>}
                                                        </div>
                                                    ))}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="w-full h-12 rounded-2xl text-indigo-600 font-black uppercase italic tracking-tighter gap-2"
                                                onClick={() => setIsSelectingCustomer(false)}
                                            >
                                                <ExternalLink className="h-4 w-4" /> Manage Customer Database
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="flex-1 px-0 pb-2">
                            <Table>
                                <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-black py-6 pl-8 uppercase text-[10px] tracking-widest text-slate-400">Medicine & Batch</TableHead>
                                        <TableHead className="w-[120px] text-right font-black py-6 uppercase text-[10px] tracking-widest text-slate-400">Base Unit Rate</TableHead>
                                        <TableHead className="w-[180px] text-center font-black py-6 uppercase text-[10px] tracking-widest text-slate-400">Quantity (Units)</TableHead>
                                        <TableHead className="w-[140px] text-center font-black py-6 uppercase text-[10px] tracking-widest text-slate-400">Discount</TableHead>
                                        <TableHead className="w-[120px] text-right font-black py-6 uppercase text-[10px] tracking-widest text-slate-400">Net Total</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={6} className="h-[320px] p-0">
                                                <div className="h-full w-full flex flex-col items-center justify-center gap-8 pb-16">
                                                    <div className="h-32 w-32 bg-indigo-50/50 rounded-[3.5rem] flex items-center justify-center relative group">
                                                        <div className="absolute inset-0 bg-indigo-100 rounded-[3.5rem] scale-90 group-hover:scale-100 transition-transform duration-500 opacity-50" />
                                                        <Package className="h-14 w-14 text-indigo-400 relative z-10" />
                                                    </div>
                                                    <div className="space-y-3 text-center">
                                                        <p className="text-3xl font-black uppercase italic tracking-tighter text-slate-300">Enter Bill Items</p>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center justify-center gap-3">
                                                            <span className="h-px w-8 bg-slate-100" />
                                                            Awaiting Input
                                                            <span className="h-px w-8 bg-slate-100" />
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cart.map((item) => (
                                            <TableRow key={item.id} className="group hover:bg-slate-50/50 border-slate-50">
                                                <TableCell className="font-black py-4 pl-8">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-slate-900 tracking-tight text-md">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-slate-100 text-slate-600 border-none rounded-lg text-[9px] px-2 py-0">BATCH: {item.batchNo}</Badge>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">({item.unitType})</span>
                                                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0 rounded-md border border-emerald-100/50" title="Estimated Profit per item">
                                                                <TrendingUp className="h-2.5 w-2.5" />
                                                                <span className="text-[8px] font-black uppercase">P: Rs. {(item.qty * (item.unitPrice - (item.purchasePrice / item.unitPerPack))).toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-500">
                                                    Rs. {item.unitPrice.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center justify-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => updateQty(item.id, -1)}>-</Button>
                                                            <span className="w-8 text-center font-black text-md">{item.qty}</span>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => updateQty(item.id, 1)}>+</Button>
                                                        </div>
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase">Available: {item.maxQty}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex gap-1 justify-center">
                                                        {[0, 5, 10].map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => updateItemDiscount(item.id, p)}
                                                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border transition-all ${item.itemDiscount === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400'}`}
                                                            >
                                                                {p}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-indigo-700 text-lg tracking-tighter">
                                                    Rs. {calculateItemTotal(item).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="pr-8">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Session Log / Recent Activity */}
                    <div className="flex-shrink-0 bg-slate-50/40 rounded-[2.5rem] border border-slate-100 p-3 pb-8 shadow-sm mt-0">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                    <History className="h-4 w-4" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Session Activity Log</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                                    disabled={recentPage === 1}
                                    className="h-8 w-8 rounded-lg bg-white border border-slate-100 shadow-sm disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 min-w-[60px] text-center">
                                    Page {recentPage} of {Math.ceil(recentInvoices.length / recentLimit) || 1}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRecentPage(p => Math.min(Math.ceil(recentInvoices.length / recentLimit), p + 1))}
                                    disabled={recentPage >= Math.ceil(recentInvoices.length / recentLimit)}
                                    className="h-8 w-8 rounded-lg bg-white border border-slate-100 shadow-sm disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentInvoices
                                .slice((recentPage - 1) * recentLimit, recentPage * recentLimit)
                                .map((inv, idx) => {
                                    const cardColors = [
                                        "border-t-indigo-500 text-indigo-600 bg-indigo-50/10",
                                        "border-t-emerald-500 text-emerald-600 bg-emerald-50/10",
                                        "border-t-amber-500 text-amber-600 bg-amber-50/10"
                                    ];
                                    const colorIndex = idx % cardColors.length;
                                    const currentStyle = cardColors[colorIndex];

                                    return (
                                        <div key={inv.id} className={`p-4 rounded-[1.8rem] border-t-2 ${currentStyle} transition-all hover:shadow-lg hover:-translate-y-1 group`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">INV: {inv.invoiceNo}</span>
                                                    <span className="text-sm font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                        {inv.manualCustomerName || inv.customer?.name || "Walk-in"}
                                                    </span>
                                                </div>
                                                <Badge className="bg-white/50 text-slate-900 border-none rounded-lg text-[9px] font-black">
                                                    Rs. {inv.netAmount.toLocaleString()}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl border border-white/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Payment</span>
                                                    <span className="text-[9px] font-black uppercase">{inv.paymentMethod}</span>
                                                </div>
                                                <div className="flex -space-x-1">
                                                    <div className="h-5 w-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            {recentInvoices.length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-white/50">
                                    <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Waiting for terminal transactions...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Check-out Summary */}
            <div className="flex-shrink-0 w-full lg:w-[360px] flex flex-col gap-6">
                <Card className="flex-1 flex flex-col rounded-[2.5rem] border-none shadow-2xl bg-slate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    <CardHeader className="bg-slate-900/40 pb-6 pt-8 px-8 border-b border-white/5">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                    <Calculator className="h-5 w-5 text-white" />
                                </div>
                                Checkout
                            </CardTitle>
                            <Badge className="bg-white/10 text-white/40 border-none text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight">
                                {cart.reduce((sum, item) => sum + item.qty, 0)} Units
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-8 px-8 overflow-y-auto flex-1">
                        <div className="space-y-5">
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Gross Total</span>
                                <span className="text-xl font-black italic tracking-tighter">Rs. {(subtotal || 0).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fixed Discount (PKR)</span>
                                <Input
                                    type="number"
                                    className="w-24 h-10 text-right bg-black/40 border-white/10 text-white font-black text-lg p-3 rounded-xl focus:ring-indigo-500"
                                    value={totalDiscount}
                                    onChange={(e) => setTotalDiscount(Number(e.target.value))}
                                />
                            </div>

                            <div className="pt-4 border-t border-indigo-500/20">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">Grand Total Payable</p>
                                <div className="flex items-end gap-4">
                                    <span className="text-5xl font-black text-white leading-none tracking-tighter italic">Rs. {(total || 0).toLocaleString()}</span>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Final</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Cash Given</p>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-12 bg-white/5 border-white/10 text-white font-black text-xl placeholder:text-slate-700 rounded-xl"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 ml-1">Baqiya / Return</p>
                                    <div className="h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl font-black text-emerald-400 tracking-tighter italic">
                                            <span className="text-xs not-italic mr-1 opacity-50">Rs.</span>
                                            {changeDue.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Customer Details</p>
                                <Input
                                    placeholder="Customer Name"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <Input
                                    placeholder="Customer Address / Phone"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-8 pb-8 pt-4">
                        <Button
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase italic tracking-tighter shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-4 group transition-all active:scale-95"
                            onClick={handleCheckout}
                        >
                            <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Printer className="h-5 w-5" />
                            </div>
                            Generate Invoice (F12)
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Receipt Modal (Elite Design) */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-sm rounded-[3rem] p-0 border-none shadow-5xl overflow-hidden bg-white">
                    <div id="receipt-content" className="p-8">
                        <div className="text-center space-y-2 mb-8">
                            {pmsSettings?.showPharmacyLogo !== false && (
                                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                    <Receipt className="h-6 w-6" />
                                </div>
                            )}
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">{pharmacyName}</h2>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">{pmsSettings?.billHeader || "Quality Healthcare Services"}</p>
                            {pmsSettings?.showTaxId && (
                                <p className="text-[10px] font-bold text-slate-400">NTN: 1234567-8</p>
                            )}
                        </div>

                        <div className="border-t border-b border-dashed border-slate-200 py-3 my-4 space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>{lastSale?.invoiceNo || 'INV-TEMP'}</span>
                                <span>{new Date().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-700">
                                <span>Customer: {lastSale?.manualCustomerName || lastSale?.customer?.name || "Walk-in"}</span>
                                <span>Mode: {lastSale?.paymentMethod || "CASH"}</span>
                            </div>
                            {lastSale?.manualCustomerAddress && (
                                <div className="text-[10px] font-bold text-slate-500 text-left">
                                    Address: {lastSale.manualCustomerAddress}
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
                            {lastSale?.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-700">
                                    <span className="flex-[2] uppercase">{item.name} <br /><span className="text-[8px] text-slate-400 opacity-60">Batch: {item.batchNo}</span></span>
                                    <span className="flex-1 text-center text-slate-500">{item.qty}</span>
                                    <span className="flex-1 text-right">{item.unitPrice.toFixed(2)}</span>
                                    <span className="flex-1 text-right text-slate-900">{(item.qty * item.unitPrice).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>Subtotal</span>
                                <span>Rs. {lastSale?.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-rose-600 print-color-exact">
                                <span>Discount</span>
                                <span>- Rs. {lastSale?.discount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black italic pt-2 border-t border-slate-100 text-indigo-700 print-color-exact">
                                <span className="uppercase tracking-tighter">Net Total</span>
                                <span>Rs. {lastSale?.total?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal: {sessionId}-ADMIN</p>
                            <p className="text-[10px] font-black uppercase tracking-tight text-slate-500">{pmsSettings?.billFooter || "**** Non-Refundable if Seal Broken ****"}</p>
                            <p className="text-[12px] font-black italic tracking-tighter text-indigo-500 print-color-exact">Thank You for Choosing MediCore PMS</p>
                        </div>
                        <Button className="w-full mt-6 h-12 rounded-2xl bg-slate-900 text-white font-black uppercase italic tracking-tighter" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" /> Print Receipt
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                    #receipt-content { visibility: visible !important; }
                    .print-color-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
