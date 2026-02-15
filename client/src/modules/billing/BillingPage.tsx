import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Trash, Search, Printer,
    CreditCard, Receipt, HandCoins,
    Loader2, User as UserIcon, Activity, Package,
    Save, ChevronRight, UserPlus, Calculator, History, XCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

    // Get Pharmacy Name from Local Storage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pharmacyName = user.pharmacyName || "PharmPro Pharmacy";
    const [paymentMethod, setPaymentMethod] = useState<"CASH">("CASH");
    const [customerName, setCustomerName] = useState("Walk-in Customer");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const { toast } = useToast();

    // Fetch initial data
    useEffect(() => {
        fetchRecentInvoices();
    }, []);

    // Handle Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 1) {
                searchMedicines();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchRecentInvoices = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/sales/recent", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setRecentInvoices(data);
        } catch (error) {
            console.error(error);
        }
    };

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
        const existing = cart.find(item => item.id === cartId);

        const unitsToAdd = isLoose ? 1 : (med.unitPerPack || 1);
        const unitPrice = med.salePrice / (med.unitPerPack || 1);

        if (existing) {
            if (existing.qty + unitsToAdd > batch.quantity) {
                toast({ title: "Out of Stock", description: "Not enough units available", variant: "destructive" });
                return;
            }
            setCart(cart.map(c => c.id === cartId ? { ...c, qty: c.qty + unitsToAdd } : c));
        } else {
            setCart([...cart, {
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
            }]);
        }
        setSearchTerm("");
        setSearchResults([]);
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

                {/* Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 relative z-10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                            placeholder="Type Brand (Panadol, Augmentin...) or Generic..."
                            className="h-14 pl-12 border-none bg-transparent text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isSearching && <Loader2 className="h-5 w-5 animate-spin text-indigo-500 mr-4" />}
                    <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                    <Button variant="ghost" className="h-12 w-12 rounded-xl text-slate-400 hover:text-indigo-600">
                        <Calculator className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <Card className="absolute top-20 left-0 right-0 z-20 shadow-2xl rounded-2xl border-none overflow-hidden bg-white/95 backdrop-blur-md">
                        <div className="max-h-[400px] overflow-y-auto">
                            {searchResults.map((med) => (
                                <div key={med.id} className="p-5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase">{med.name}</h3>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-[11px] font-bold text-slate-400">Pack Cost: <span className="text-slate-700">Rs. {med.salePrice}</span></p>
                                            <p className="text-[11px] font-bold text-slate-400">{med.unitType} Cost: <span className="text-indigo-600 font-black">Rs. {(med.salePrice / (med.unitPerPack || 1)).toFixed(2)}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {med.batches.map(batch => (
                                            <div key={batch.id} className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl h-12 px-5 flex flex-col items-center gap-0 shadow-sm"
                                                    onClick={() => addToCart(med, batch, false)}
                                                >
                                                    <span className="text-[10px] uppercase opacity-60">Full Pack</span>
                                                    <span className="text-xs">{batch.batchNo}</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-4 flex flex-col items-center gap-0 shadow-md"
                                                    onClick={() => addToCart(med, batch, true)}
                                                >
                                                    <span className="text-[10px] uppercase opacity-80">Loose ({med.unitType})</span>
                                                    <span className="text-xs">Single</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Main Billing Table */}
                <Card className="flex-1 overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 px-8 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Receipt className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Terminal <span className="text-indigo-600">Active</span></CardTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Session ID: {Date.now().toString().slice(-6)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <UserIcon className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{customerName}</span>
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 h-10 rounded-xl border-slate-100">
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 scrollbar-hide">
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
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[350px] text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-20">
                                                <div className="h-28 w-28 bg-slate-200 rounded-[3rem] flex items-center justify-center">
                                                    <Package className="h-14 w-14 text-slate-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-black uppercase italic tracking-tighter">Enter Bill Items</p>
                                                    <p className="text-[11px] font-bold uppercase tracking-widest">Awaiting drug search or barcode input...</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-slate-50/50 border-slate-50">
                                            <TableCell className="font-black py-7 pl-8">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-900 tracking-tight text-md">{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-slate-100 text-slate-600 border-none rounded-lg text-[9px] px-2 py-0">BATCH: {item.batchNo}</Badge>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">({item.unitType})</span>
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
                    </CardContent>
                </Card>

                {/* Recent Activity Mini-Ledger */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pt-2">
                    {recentInvoices.slice(0, 5).map((inv) => (
                        <div key={inv.id} className="bg-white px-5 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 min-w-[220px]">
                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inv.invoiceNo.split('-').pop()}</p>
                                <p className="text-md font-black text-slate-800 tracking-tight">Rs. {inv.netAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {recentInvoices.length === 0 && (
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pl-4 pt-4">No recent sales detected</p>
                    )}
                </div>
            </div>

            {/* Right Panel: Check-out Summary */}
            <div className="w-full lg:w-[440px] flex flex-col gap-6">
                <Card className="flex flex-col rounded-[2.5rem] border-none shadow-2xl bg-slate-950 text-white relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    <CardHeader className="bg-slate-900/40 pb-6 pt-8 px-8 border-b border-white/5">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                    <Calculator className="h-5 w-5 text-white" />
                                </div>
                                Checkout
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-8 px-8 overflow-y-auto flex-1 max-h-[400px]">
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

                        <div className="space-y-4 pt-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Method</p>
                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-16 flex items-center justify-center gap-3 border-indigo-500 bg-indigo-600 text-white shadow-xl scale-105 transition-all rounded-xl"
                                >
                                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">CASH ONLY</span>
                                </Button>
                            </div>
                        </div>

                        {/* Profit Display (Admin/Owner View) */}
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Estimated Net Profit</span>
                                <span className="text-xl font-black text-emerald-700">
                                    Rs. {cart.reduce((acc, item) => {
                                        const unitCost = item.purchasePrice / item.unitPerPack;
                                        const unitSale = item.unitPrice;
                                        const profitPerUnit = unitSale - unitCost;
                                        return acc + (profitPerUnit * item.qty);
                                    }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-3 p-8 bg-slate-900/50 backdrop-blur-sm">
                        <Button
                            size="lg"
                            className="w-full h-16 text-xl font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic tracking-tighter gap-3"
                            onClick={handleCheckout}
                        >
                            Checkout & Print <Printer className="h-5 w-5" />
                        </Button>
                        <div className="flex w-full gap-2 opacity-50">
                            <Button variant="ghost" className="flex-1 rounded-xl text-slate-500 text-[9px] font-black uppercase h-10">
                                <Save className="h-3 w-3 mr-2" /> Hold
                            </Button>
                            <Button variant="ghost" className="flex-1 rounded-xl text-slate-500 text-[9px] font-black uppercase h-10">
                                Return
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            {/* Receipt Print Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 border-none bg-white rounded-3xl flex flex-col max-h-[85vh] overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 print:p-0 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent" id="receipt-content">
                        {/* Receipt Header */}
                        <div className="text-center space-y-2 mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">{pharmacyName}</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pakistan Official Drug License #4492-PK</p>
                            <p className="text-[10px] font-bold text-slate-400">Main Road, Commercial Area, Terminal 01</p>
                            <p className="text-[10px] font-bold text-slate-400">PH: +92 300 1234567</p>
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

                        {/* Receipt Items */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between border-b pb-2 text-[9px] font-black text-slate-400 uppercase">
                                <span className="flex-[2]">Item Description</span>
                                <span className="flex-1 text-center">Qty</span>
                                <span className="flex-1 text-right">Price</span>
                                <span className="flex-1 text-right">Total</span>
                            </div>
                            {lastSale?.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[11px] font-bold">
                                    <span className="flex-[2] uppercase">{item.name} <br /><span className="text-[8px] text-slate-400 opacity-60">Batch: {item.batchNo}</span></span>
                                    <span className="flex-1 text-center">{item.qty}</span>
                                    <span className="flex-1 text-right">{item.unitPrice.toFixed(2)}</span>
                                    <span className="flex-1 text-right">{(item.qty * item.unitPrice).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
                            <div className="flex justify-between text-[11px] font-bold">
                                <span>Subtotal</span>
                                <span>Rs. {lastSale?.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-rose-500">
                                <span>Discount</span>
                                <span>- Rs. {lastSale?.discount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black italic pt-2 border-t border-slate-100">
                                <span className="uppercase tracking-tighter text-indigo-600">Net Total</span>
                                <span>Rs. {lastSale?.total?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal: 01-PK-ADMIN</p>
                            <p className="text-[10px] font-black uppercase tracking-tight text-slate-500">**** Non-Refundable if Seal Broken ****</p>
                            <p className="text-[12px] font-black italic tracking-tighter text-indigo-500">Thank You for Choosing PharmPro</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 flex gap-3 print:hidden">
                        <Button
                            className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black gap-2 text-lg shadow-lg shadow-indigo-100"
                            onClick={() => {
                                const originalTitle = document.title;
                                document.title = `${pharmacyName} - Invoice ${lastSale?.invoiceNo || 'New'}`;
                                window.print();
                                document.title = originalTitle;
                            }}
                        >
                            <Printer className="h-5 w-5" /> Print Now
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
                        <p className="text-[10px] font-bold text-slate-400">PH: +92 300 1234567</p>
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
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal: 01-PK-ADMIN</p>
                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-500">**** Non-Refundable if Seal Broken ****</p>
                        <p className="text-[12px] font-black italic tracking-tighter text-indigo-500 print-color-exact">Thank You for Choosing PharmPro</p>
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

                    /* Hide everything else */
                    #receipt-content { display: none !important; }
                    .print\\:hidden, button, [role="separator"], [data-radix-portal] { display: none !important; }
                }
            ` }} />
        </div>
    );
}
