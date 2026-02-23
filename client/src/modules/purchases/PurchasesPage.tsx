import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, PackagePlus, Calendar, CreditCard, ChevronLeft, ChevronRight, Trash2, Loader2, Save, ShoppingBag, ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    // New Purchase Form State
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
    const [paidAmount, setPaidAmount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Quick Add Medicine Dialog State
    const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        name: "",
        category: "Tablet",
        genericName: "",
        manufacturer: "",
        price: "0",
        salePrice: "0",
        taxRate: "0",
        unitPerPack: "1",
        unitType: "Tablet",
        reorderLevel: "10",
        rackNo: "",
        margin: "14.5",
        initialBatchNo: "",
        initialQuantity: "",
        initialExpiryDate: ""
    });

    const [masterSuggestions, setMasterSuggestions] = useState<any[]>([]);
    const [isSearchingMaster, setIsSearchingMaster] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const [pRes, sRes, mRes] = await Promise.all([
                fetch("http://localhost:5000/api/purchases", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:5000/api/suppliers", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:5000/api/inventory/medicines?limit=100", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const pData = await pRes.json();
            const sData = await sRes.json();
            const mData = await mRes.json();

            if (pRes.ok) setPurchases(pData);
            if (sRes.ok) setSuppliers(sData);
            if (mRes.ok) setMedicines(mData.data || []);
        } catch (error) {
            toast({ title: "Connection Error", description: "Failed to load records", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const lookupMasterMedicine = async (query: string) => {
        setNewMedicine(prev => ({ ...prev, name: query }));
        if (query.length < 2) {
            setMasterSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearchingMaster(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/master-medicines/lookup?search=${encodeURIComponent(query)}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            // Enrich data for consistency
            const enrichedData = data.map((med: any) => ({
                ...med,
                isLocal: medicines.some(m => m.name.toLowerCase() === med.name.toLowerCase())
            }));

            setMasterSuggestions(enrichedData);
            setShowSuggestions(enrichedData.length > 0);
        } catch (error) {
            console.error("Master search failed", error);
        } finally {
            setIsSearchingMaster(false);
        }
    };

    const handleSelectMaster = (med: any) => {
        setNewMedicine(prev => ({
            ...prev,
            name: med.name,
            genericName: med.genericName || "",
            manufacturer: med.manufacturer || "",
            category: med.category || "Tablet",
            unitType: med.unitType || "Tablet"
        }));
        setShowSuggestions(false);
    };

    const calculateTradePrice = (mrp: string, margin: string) => {
        const mrpValue = parseFloat(mrp);
        const marginValue = parseFloat(margin);
        if (!isNaN(mrpValue) && !isNaN(marginValue)) {
            const tp = mrpValue * (1 - marginValue / 100);
            setNewMedicine(prev => ({ ...prev, price: tp.toFixed(2), salePrice: mrp }));
        } else {
            setNewMedicine(prev => ({ ...prev, salePrice: mrp }));
        }
    };

    const calculateMargin = (tp: string, mrp: string) => {
        const tpValue = parseFloat(tp);
        const mrpValue = parseFloat(mrp);
        if (!isNaN(tpValue) && !isNaN(mrpValue) && mrpValue > 0) {
            const margin = ((mrpValue - tpValue) / mrpValue) * 100;
            setNewMedicine(prev => ({ ...prev, price: tp, margin: margin.toFixed(2) }));
        } else {
            setNewMedicine(prev => ({ ...prev, price: tp }));
        }
    };

    const addItem = (medicine: any) => {
        const exists = purchaseItems.find(i => i.medicineId === medicine.id);
        if (exists) {
            toast({ title: "Already Added", description: `${medicine.name} is already in the list.` });
            return;
        }
        setPurchaseItems([...purchaseItems, {
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 1,
            price: medicine.price || 0,
            batchNo: "",
            expiryDate: ""
        }]);
        setSearchTerm("");
    };

    const removeItem = (id: number) => {
        setPurchaseItems(purchaseItems.filter(i => i.medicineId !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setPurchaseItems(purchaseItems.map(i =>
            i.medicineId === id ? { ...i, [field]: value } : i
        ));
    };

    const totalAmount = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSavePurchase = async () => {
        if (!selectedSupplier || !invoiceNo || purchaseItems.length === 0) {
            toast({ title: "Missing Details", description: "Please fill all required fields and add items.", variant: "destructive" });
            return;
        }

        // Validation for batch and expiry
        const invalid = purchaseItems.some(i => !i.batchNo || !i.expiryDate);
        if (invalid) {
            toast({ title: "Batch/Expiry Required", description: "Please provide batch no and expiry for all items.", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/purchases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    supplierId: parseInt(selectedSupplier),
                    invoiceNo,
                    items: purchaseItems,
                    totalAmount,
                    paidAmount,
                    status: "COMPLETED"
                })
            });

            if (response.ok) {
                toast({ title: "Purchase Recorded", description: "Stock updated successfully!" });
                setIsCreating(false);
                setPurchaseItems([]);
                setInvoiceNo("");
                setSelectedSupplier("");
                setPaidAmount(0);
                fetchData();
            } else {
                const data = await response.json();
                toast({ title: "Failed", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Network failure", variant: "destructive" });
        }
    };

    const handleCancelPurchase = async (id: number) => {
        if (!confirm("Are you sure? This will delete the record and REVERSE (remove) the stock from inventory.")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/purchases/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast({ title: "Purchase Canceled", description: "Stock and records updated successfully." });
                fetchData();
            } else {
                const data = await response.json();
                toast({ title: "Action Blocked", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not cancel purchase", variant: "destructive" });
        }
    };

    const handleQuickAddMedicine = async () => {
        if (!newMedicine.name || !newMedicine.category || !newMedicine.price || !newMedicine.salePrice) {
            toast({ title: "Missing Fields", description: "Please fill Name, Category, Purchase Price, and Sale Price.", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/inventory/medicines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newMedicine,
                    price: parseFloat(newMedicine.price),
                    salePrice: parseFloat(newMedicine.salePrice)
                })
            });

            if (response.ok) {
                const createdMedicine = await response.json();
                toast({ title: "Medicine Added!", description: `${createdMedicine.name} is now in your inventory.` });

                // Refresh medicines list
                fetchData();

                // Auto-add to purchase list
                addItem(createdMedicine);

                // Reset form and close
                setNewMedicine({
                    name: "",
                    category: "Tablet",
                    genericName: "",
                    manufacturer: "",
                    price: "0",
                    salePrice: "0",
                    taxRate: "0",
                    unitPerPack: "1",
                    unitType: "Tablet",
                    reorderLevel: "10",
                    rackNo: "",
                    margin: "14.5",
                    initialBatchNo: "",
                    initialQuantity: "",
                    initialExpiryDate: ""
                });
                setIsAddMedicineOpen(false);
                setSearchTerm("");
            } else {
                const data = await response.json();
                toast({ title: "Failed", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not add medicine", variant: "destructive" });
        }
    };

    if (isCreating) {
        return (
            <>
                <div className="p-8 space-y-8 animate-in slide-in-from-bottom duration-500 max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white shadow-sm border-slate-100" onClick={() => setIsCreating(false)}>
                                <ChevronLeft className="h-6 w-6 text-slate-900" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">New <span className="text-emerald-600">Stock Entry</span></h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Procurement Record</p>
                            </div>
                        </div>
                        <Button
                            className="h-14 px-10 rounded-[1.8rem] bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase italic tracking-tighter gap-3 transition-all shadow-xl shadow-slate-200"
                            onClick={handleSavePurchase}
                        >
                            <Save className="h-5 w-5" /> Confirm & Save
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Metadata */}
                        <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white p-8 space-y-6 lg:h-fit">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Supplier</Label>
                                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                        <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-emerald-500">
                                            <SelectValue placeholder="Choose a Distributor" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-3xl">
                                            {suppliers.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl font-bold">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Supplier Invoice #</Label>
                                    <Input
                                        className="h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300"
                                        placeholder="e.g. INV-2024-001"
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Financial Summary</h3>
                                <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4 shadow-2xl shadow-slate-300">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Total Bill</span>
                                        <span className="font-bold">Rs. {totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount Paid Now</Label>
                                        <Input
                                            type="number"
                                            className="h-12 bg-white/10 border-none rounded-xl text-lg font-black text-emerald-400 focus:ring-emerald-500"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Balance (Debt)</span>
                                        <span className="text-xl font-black italic tracking-tighter text-rose-400">Rs. {(totalAmount - paidAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Right: Items Table */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white overflow-hidden">
                                <div className="p-6 bg-slate-50/50 border-b border-slate-100 relative">
                                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                                    <Input
                                        className="h-14 pl-14 bg-white border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 shadow-sm"
                                        placeholder="Search medicine to add in stock list..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <div className="absolute top-[calc(100%+8px)] left-6 right-6 bg-white rounded-[2rem] shadow-4xl border border-slate-50 z-50 p-4 max-h-[300px] overflow-y-auto animate-in zoom-in-95 duration-200">
                                            {medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                                medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                                                    <div
                                                        key={m.id}
                                                        className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center group transition-colors"
                                                        onClick={() => addItem(m)}
                                                    >
                                                        <div>
                                                            <p className="font-black text-slate-900 uppercase italic text-sm tracking-tighter">{m.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.manufacturer}</p>
                                                        </div>
                                                        <Plus className="h-5 w-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 space-y-3">
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Medicine Not Found</p>
                                                    <Button
                                                        className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black uppercase text-xs tracking-wider shadow-lg transition-all"
                                                        onClick={() => {
                                                            setNewMedicine({ ...newMedicine, name: searchTerm });
                                                            setIsAddMedicineOpen(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" /> Add "{searchTerm}" to Inventory
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-0 overflow-x-auto min-h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 pl-8">Medicine</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Quantity</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Pur. Price</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Batch No</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Expiry Date</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 pr-8 text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchaseItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-[200px] text-center">
                                                        <ShoppingBag className="h-10 w-10 text-slate-100 mx-auto mb-3" />
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No items added to stock list yet</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                purchaseItems.map((item) => (
                                                    <TableRow key={item.medicineId} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <TableCell className="pl-8">
                                                            <p className="font-black text-slate-900 uppercase italic text-[11px] tracking-tighter">{item.name}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                className="h-10 w-20 bg-slate-100/50 border-none rounded-xl text-xs font-black"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.medicineId, 'quantity', parseInt(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                className="h-10 w-24 bg-slate-100/50 border-none rounded-xl text-xs font-black"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(item.medicineId, 'price', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                className="h-10 w-28 bg-slate-100/50 border-none rounded-xl text-xs font-bold placeholder:text-slate-300"
                                                                placeholder="BN-123"
                                                                value={item.batchNo}
                                                                onChange={(e) => updateItem(item.medicineId, 'batchNo', e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="date"
                                                                className="h-10 w-32 bg-slate-100/50 border-none rounded-xl text-xs font-bold"
                                                                value={item.expiryDate}
                                                                onChange={(e) => updateItem(item.medicineId, 'expiryDate', e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="pr-8 text-right">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50" onClick={() => removeItem(item.medicineId)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Quick Add Medicine Dialog */}
                <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                    <DialogContent className="sm:max-w-[460px] rounded-2xl p-4 border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                                <div className="h-7 w-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Plus className="h-3.5 w-3.5" />
                                </div>
                                Product Registration
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 py-0.5 font-medium">
                            <div className="space-y-1 col-span-2 md:col-span-1 relative">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                <Input
                                    placeholder="e.g. Panadol"
                                    className="h-8 text-xs rounded-lg border-slate-200"
                                    value={newMedicine.name}
                                    onChange={(e) => lookupMasterMedicine(e.target.value)}
                                    onFocus={() => { if (masterSuggestions.length > 0) setShowSuggestions(true); }}
                                />
                                {showSuggestions && (
                                    <div className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden max-h-[180px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Master Database Results</span>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] h-3.5">Quick Find</Badge>
                                        </div>
                                        {masterSuggestions.map((med, index) => (
                                            <div
                                                key={index}
                                                className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-50 last:border-none group flex justify-between items-center"
                                                onClick={() => handleSelectMaster(med)}
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors">
                                                            {med.name}
                                                        </div>
                                                        {med.isLocal && <Badge className="text-[6px] h-3 px-1 bg-amber-50 text-amber-600 border-none">In Inventory</Badge>}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-medium truncate italic">
                                                        {med.genericName || "Formula not listed"}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-none bg-indigo-50 text-indigo-600 uppercase">
                                                    {med.category}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSearchingMaster && (
                                    <div className="absolute right-3 top-8">
                                        <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <Select value={newMedicine.category} onValueChange={(val) => setNewMedicine({ ...newMedicine, category: val })}>
                                    <SelectTrigger className="h-8 text-xs rounded-lg border-slate-200">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        {["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Sachet", "Inhaler"].map(cat => (
                                            <SelectItem key={cat} value={cat} className="rounded-xl font-bold">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1 col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                                <Input
                                    placeholder="e.g. Paracetamol"
                                    className="h-8 text-xs rounded-lg border-slate-200"
                                    value={newMedicine.genericName}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manufacturer</label>
                                <Input
                                    placeholder="e.g. GSK"
                                    className="h-8 text-xs rounded-lg border-slate-200"
                                    value={newMedicine.manufacturer}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1 col-span-2 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rack No (Storage)</label>
                                <Input
                                    placeholder="e.g. A-1"
                                    className="h-8 text-xs rounded-lg border-slate-200"
                                    value={newMedicine.rackNo}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, rackNo: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Retail Price (MRP)</label>
                                    <Input
                                        type="number"
                                        placeholder="MRP"
                                        className="h-8 text-xs rounded-md border-slate-200 bg-white"
                                        value={newMedicine.salePrice}
                                        onChange={(e) => calculateTradePrice(e.target.value, newMedicine.margin)}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Margin %</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs rounded-md border-slate-200 bg-white pr-5"
                                            value={newMedicine.margin}
                                            onChange={(e) => {
                                                setNewMedicine({ ...newMedicine, margin: e.target.value });
                                                calculateTradePrice(newMedicine.salePrice, e.target.value);
                                            }}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price (Cost)</label>
                                    <Input
                                        type="number"
                                        placeholder="Cost Price"
                                        className="h-8 text-xs rounded-md border-slate-200 bg-white"
                                        value={newMedicine.price}
                                        onChange={(e) => calculateMargin(e.target.value, newMedicine.salePrice)}
                                    />
                                </div>
                                <div className="space-y-0.5 col-span-3">
                                    <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">GST / Tax Rate</label>
                                    <Select
                                        value={newMedicine.taxRate}
                                        onValueChange={(val) => setNewMedicine({ ...newMedicine, taxRate: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs rounded-md border-amber-200 bg-amber-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="0">0% — Exempt (Medicines)</SelectItem>
                                            <SelectItem value="5">5% — Reduced Rate</SelectItem>
                                            <SelectItem value="12">12% — Standard</SelectItem>
                                            <SelectItem value="18">18% — Full GST (Supplements/Cosmetics)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-0.5 col-span-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                    <Select
                                        value={newMedicine.unitType}
                                        onValueChange={(val) => setNewMedicine({ ...newMedicine, unitType: val })}
                                    >
                                        <SelectTrigger className="h-8 text-xs rounded-md border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="Tablet">Tablet</SelectItem>
                                            <SelectItem value="Capsule">Capsule</SelectItem>
                                            <SelectItem value="Bottle">Bottle (Syrup/Drops)</SelectItem>
                                            <SelectItem value="Sachet">Sachet</SelectItem>
                                            <SelectItem value="Injection">Injection (Vial/Ampule)</SelectItem>
                                            <SelectItem value="Tube">Tube (Cream/Gel)</SelectItem>
                                            <SelectItem value="Inhaler">Inhaler</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 py-0.5 px-0.5">
                            <div className="flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Initial Stock Entry (Optional)</span>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch No</label>
                                    <Input
                                        placeholder="e.g. B-101"
                                        className="h-7 text-xs rounded-md border-slate-200"
                                        value={newMedicine.initialBatchNo}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, initialBatchNo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-7 text-xs rounded-md border-slate-200"
                                        value={newMedicine.initialQuantity}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, initialQuantity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                    <Input
                                        type="date"
                                        className="h-7 text-xs rounded-md border-slate-200"
                                        value={newMedicine.initialExpiryDate}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, initialExpiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-2 flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-8 rounded-lg border-slate-200 font-bold uppercase text-[10px] tracking-widest"
                                onClick={() => {
                                    setIsAddMedicineOpen(false);
                                    setNewMedicine({
                                        name: "",
                                        category: "Tablet",
                                        genericName: "",
                                        manufacturer: "",
                                        price: "0",
                                        salePrice: "0",
                                        taxRate: "0",
                                        unitPerPack: "1",
                                        unitType: "Tablet",
                                        reorderLevel: "10",
                                        rackNo: "",
                                        margin: "14.5",
                                        initialBatchNo: "",
                                        initialQuantity: "",
                                        initialExpiryDate: ""
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-[2] h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 transition-all"
                                onClick={handleQuickAddMedicine}
                            >
                                <Save className="h-3.5 w-3.5 mr-1.5" /> Register Product
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-[2.2rem] bg-indigo-600 shadow-2xl shadow-indigo-200 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rotate-3">
                            <PackagePlus className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">Stock <span className="text-indigo-600">Inward</span></h1>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Supply Chain Transaction Log</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    className="h-14 px-8 rounded-[1.8rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 text-white font-black uppercase italic tracking-tighter gap-3 transition-all hover:scale-105 active:scale-95 group"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    Record New Purchase
                </Button>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Purchases", value: purchases.length, icon: ShoppingBag, color: "indigo" },
                    { label: "Pending Deliveries", value: "0", icon: Loader2, color: "emerald" },
                    { label: "Monthly Procurement", value: `Rs. ${purchases.reduce((s, p) => s + p.totalAmount, 0).toLocaleString()}`, icon: ArrowUpRight, color: "slate" },
                    { label: "Unpaid Balance", value: `Rs. ${purchases.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0).toLocaleString()}`, icon: CreditCard, color: "rose" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/50 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                        <CardHeader className="p-0 pb-4">
                            <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white overflow-hidden">
                <div className="min-h-[500px] w-full p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 pl-8 h-14">Date</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14">Invoice #</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14">Distributor</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14">Items</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14">Total Bill</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14">Paid</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 text-center">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 pr-8 text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-[400px] text-center">
                                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching procurement history...</p>
                                    </TableCell>
                                </TableRow>
                            ) : purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-[400px] text-center">
                                        <PackagePlus className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                                        <p className="text-xl font-black italic tracking-tighter text-slate-300 uppercase">No purchases recorded</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2">Start by recording your first stock inward</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                purchases.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p) => (
                                    <TableRow key={p.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-300">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="font-black text-slate-900 text-xs tracking-tight">{new Date(p.createdAt).toLocaleDateString('en-GB')}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 lowercase">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-slate-900 text-white border-none rounded-lg text-[10px] font-black px-2 py-0.5 shadow-lg shadow-slate-200">{p.invoiceNo}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <p className="font-black text-slate-900 uppercase italic text-[11px] tracking-tighter">{p.supplier?.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.supplier?.contactPerson}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[11px] font-black text-slate-600 tracking-tighter">{p.items?.length || 0} VARIETIES</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-black italic tracking-tighter text-slate-900">Rs. {p.totalAmount.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-black italic tracking-tighter text-emerald-600">Rs. {p.paidAmount.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`rounded-lg border-none text-[8px] font-black uppercase tracking-widest px-2 py-1 ${p.totalAmount - p.paidAmount > 0
                                                ? 'bg-rose-50 text-rose-500 border border-rose-100'
                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                {p.totalAmount - p.paidAmount > 0 ? 'Partial/Due' : 'Completed'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50">
                                                    View <CheckCircle2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50"
                                                    onClick={() => handleCancelPurchase(p.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Footer */}
                {purchases.length > pageSize && (
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Showing <span className="text-slate-900">{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, purchases.length)}</span> of {purchases.length} Purchase Records
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-xl border-slate-200 bg-white"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="h-10 px-4 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-xs font-black italic tracking-tighter">
                                PAGE <span className="text-indigo-600 mx-1">{currentPage}</span> / {Math.ceil(purchases.length / pageSize)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-xl border-slate-200 bg-white"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(purchases.length / pageSize)))}
                                disabled={currentPage === Math.ceil(purchases.length / pageSize)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Quick Add Medicine Dialog */}
            <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                <DialogContent className="sm:max-w-[460px] rounded-2xl p-4 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <div className="h-7 w-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                <Plus className="h-3.5 w-3.5" />
                            </div>
                            Product Registration
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 py-0.5 font-medium">
                        <div className="space-y-1 col-span-2 md:col-span-1 relative">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                            <Input
                                placeholder="e.g. Panadol"
                                className="h-8 text-xs rounded-lg border-slate-200"
                                value={newMedicine.name}
                                onChange={(e) => lookupMasterMedicine(e.target.value)}
                                onFocus={() => { if (masterSuggestions.length > 0) setShowSuggestions(true); }}
                            />
                            {showSuggestions && (
                                <div className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden max-h-[180px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Master Database Results</span>
                                        <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] h-3.5">Quick Find</Badge>
                                    </div>
                                    {masterSuggestions.map((med, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-50 last:border-none group flex justify-between items-center"
                                            onClick={() => handleSelectMaster(med)}
                                        >
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors">
                                                        {med.name}
                                                    </div>
                                                    {med.isLocal && <Badge className="text-[6px] h-3 px-1 bg-amber-50 text-amber-600 border-none">In Inventory</Badge>}
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-medium truncate italic">
                                                    {med.genericName || "Formula not listed"}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-none bg-indigo-50 text-indigo-600 uppercase">
                                                {med.category}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isSearchingMaster && (
                                <div className="absolute right-3 top-8">
                                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <Select value={newMedicine.category} onValueChange={(val) => setNewMedicine({ ...newMedicine, category: val })}>
                                <SelectTrigger className="h-8 text-xs rounded-lg border-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    {["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Sachet", "Inhaler"].map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-xl font-bold">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                            <Input
                                placeholder="e.g. Paracetamol"
                                className="h-8 text-xs rounded-lg border-slate-200"
                                value={newMedicine.genericName}
                                onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manufacturer</label>
                            <Input
                                placeholder="e.g. GSK"
                                className="h-8 text-xs rounded-lg border-slate-200"
                                value={newMedicine.manufacturer}
                                onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rack No (Storage)</label>
                            <Input
                                placeholder="e.g. A-1"
                                className="h-8 text-xs rounded-lg border-slate-200"
                                value={newMedicine.rackNo}
                                onChange={(e) => setNewMedicine({ ...newMedicine, rackNo: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Retail Price (MRP)</label>
                                <Input
                                    type="number"
                                    placeholder="MRP"
                                    className="h-8 text-xs rounded-md border-slate-200 bg-white"
                                    value={newMedicine.salePrice}
                                    onChange={(e) => calculateTradePrice(e.target.value, newMedicine.margin)}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Margin %</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-8 text-xs rounded-md border-slate-200 bg-white pr-5"
                                        value={newMedicine.margin}
                                        onChange={(e) => {
                                            setNewMedicine({ ...newMedicine, margin: e.target.value });
                                            calculateTradePrice(newMedicine.salePrice, e.target.value);
                                        }}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price (Cost)</label>
                                <Input
                                    type="number"
                                    placeholder="Cost Price"
                                    className="h-8 text-xs rounded-md border-slate-200 bg-white"
                                    value={newMedicine.price}
                                    onChange={(e) => calculateMargin(e.target.value, newMedicine.salePrice)}
                                />
                            </div>
                            <div className="space-y-0.5 col-span-3">
                                <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">GST / Tax Rate</label>
                                <Select
                                    value={newMedicine.taxRate}
                                    onValueChange={(val) => setNewMedicine({ ...newMedicine, taxRate: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-md border-amber-200 bg-amber-50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="0">0% — Exempt (Medicines)</SelectItem>
                                        <SelectItem value="5">5% — Reduced Rate</SelectItem>
                                        <SelectItem value="12">12% — Standard</SelectItem>
                                        <SelectItem value="18">18% — Full GST (Supplements/Cosmetics)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-0.5 col-span-3">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                <Select
                                    value={newMedicine.unitType}
                                    onValueChange={(val) => setNewMedicine({ ...newMedicine, unitType: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-md border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Capsule">Capsule</SelectItem>
                                        <SelectItem value="Bottle">Bottle (Syrup/Drops)</SelectItem>
                                        <SelectItem value="Sachet">Sachet</SelectItem>
                                        <SelectItem value="Injection">Injection (Vial/Ampule)</SelectItem>
                                        <SelectItem value="Tube">Tube (Cream/Gel)</SelectItem>
                                        <SelectItem value="Inhaler">Inhaler</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 py-0.5 px-0.5">
                        <div className="flex items-center gap-2">
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Initial Stock Entry (Optional)</span>
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch No</label>
                                <Input
                                    placeholder="e.g. B-101"
                                    className="h-7 text-xs rounded-md border-slate-200"
                                    value={newMedicine.initialBatchNo}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, initialBatchNo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-7 text-xs rounded-md border-slate-200"
                                    value={newMedicine.initialQuantity}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, initialQuantity: e.target.value })}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                <Input
                                    type="date"
                                    className="h-7 text-xs rounded-md border-slate-200"
                                    value={newMedicine.initialExpiryDate}
                                    onChange={(e) => setNewMedicine({ ...newMedicine, initialExpiryDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2 flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-8 rounded-lg border-slate-200 font-bold uppercase text-[10px] tracking-widest"
                            onClick={() => {
                                setIsAddMedicineOpen(false);
                                setNewMedicine({
                                    name: "",
                                    category: "Tablet",
                                    genericName: "",
                                    manufacturer: "",
                                    price: "0",
                                    salePrice: "0",
                                    taxRate: "0",
                                    unitPerPack: "1",
                                    unitType: "Tablet",
                                    reorderLevel: "10",
                                    rackNo: "",
                                    margin: "14.5",
                                    initialBatchNo: "",
                                    initialQuantity: "",
                                    initialExpiryDate: ""
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 transition-all"
                            onClick={handleQuickAddMedicine}
                        >
                            <Save className="h-3.5 w-3.5 mr-1.5" /> Register Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
