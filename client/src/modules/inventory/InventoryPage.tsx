import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Package,
    AlertTriangle,
    Clock,
    TrendingDown,
    Plus,
    Search,
    BarChart3,
    RefreshCw,
    LayoutGrid,
    Truck,
    Layers,
    Database,
    ChevronLeft,
    ChevronRight,
    X,
    Edit2,
    Trash2,
    Download,
    CheckSquare,
    Square,
    Pill,
    Syringe,
    Milk,
    Pipette,
    Box,
    Wind,
    Droplets,
    FlaskConical
} from "lucide-react";

interface Medicine {
    id: number;
    name: string;
    category: string;
    genericName?: string;
    manufacturer?: string;
    stock: number;
    reorderLevel: number;
    price: number;
    salePrice: number;
    unitPerPack: number;
    unitType: string;
    rackNo?: string;
    margin?: number;
    initialBatchNo?: string;
    initialQuantity?: string;
    initialExpiryDate?: string;
    alerts: {
        lowStock: boolean;
        nearExpiry: boolean;
        expired: boolean;
    };
}

interface Analytics {
    totalItems: number;
    totalStockValue: number;
    lowStockCount: number;
    nearExpiryCount: number;
    expiredCount: number;
}

const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('tablet') || cat.includes('capsule')) return Pill;
    if (cat.includes('syrup') || cat.includes('bottle') || cat.includes('suspension')) return Milk;
    if (cat.includes('injection') || cat.includes('insulin') || cat.includes('vaccine')) return Syringe;
    if (cat.includes('cream') || cat.includes('tube') || cat.includes('ointment')) return Pipette;
    if (cat.includes('sachet')) return Box;
    if (cat.includes('inhaler')) return Wind;
    if (cat.includes('drops')) return Droplets;
    if (cat.includes('spray')) return FlaskConical;
    if (cat.includes('lotion')) return FlaskConical;
    return LayoutGrid;
};

export default function InventoryPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
    const [masterSuggestions, setMasterSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingMaster, setIsSearchingMaster] = useState(false);
    // Import from master states
    const [masterList, setMasterList] = useState<any[]>([]);
    const [masterSearch, setMasterSearch] = useState("");
    const [masterCategory, setMasterCategory] = useState("all");
    const [selectedImportIds, setSelectedImportIds] = useState<number[]>([]);
    const [isLoadingMaster, setIsLoadingMaster] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<string | null>(null);

    // Form States
    const [newMedicine, setNewMedicine] = useState({
        name: "",
        category: "Tablet",
        genericName: "",
        manufacturer: "",
        price: "", // Trade Price
        salePrice: "", // Retail Price (MRP)
        unitPerPack: "1",
        unitType: "Tablet",
        reorderLevel: "10",
        rackNo: "",
        margin: "14.5",
        initialBatchNo: "",
        initialQuantity: "",
        initialExpiryDate: ""
    });

    const [newBatch, setNewBatch] = useState({
        batchNo: "",
        quantity: "",
        purchasePrice: "",
        expiryDate: ""
    });

    const fetchInventory = async (page = 1, searchQuery = "", filter = "all") => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const filterQuery = filter !== "all" ? `&filter=${filter}` : "";
            const [medicinesRes, analyticsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/inventory/medicines?page=${page}&limit=12&search=${encodeURIComponent(searchQuery)}${filterQuery}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("http://localhost:5000/api/inventory/analytics", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const medicinesData = await medicinesRes.json();
            const analyticsData = await analyticsRes.json();

            setMedicines(medicinesData.data);
            setTotalPages(medicinesData.pagination.pages);
            setCurrentPage(medicinesData.pagination.currentPage);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory(1, search, activeFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    const fetchMasterList = async (searchQuery = "", category = "all") => {
        setIsLoadingMaster(true);
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (category && category !== "all") params.append("category", category);
            const response = await fetch(`http://localhost:5000/api/inventory/master-list?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setMasterList(data);
        } catch (error) {
            console.error("Failed to fetch master list", error);
        } finally {
            setIsLoadingMaster(false);
        }
    };

    useEffect(() => {
        if (!isImportModalOpen) return;
        const timer = setTimeout(() => {
            fetchMasterList(masterSearch, masterCategory);
        }, 400);
        return () => clearTimeout(timer);
    }, [masterSearch, masterCategory, isImportModalOpen]);

    const handleImportFromMaster = async () => {
        if (selectedImportIds.length === 0) return;
        setIsImporting(true);
        setImportResult(null);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/inventory/import-from-master", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ medicineIds: selectedImportIds })
            });
            const data = await response.json();
            setImportResult(data.message);
            setSelectedImportIds([]);
            fetchInventory(currentPage, search, activeFilter);
            // Refresh master list to show newly imported items
            fetchMasterList(masterSearch, masterCategory);
        } catch (error) {
            console.error("Import failed", error);
            setImportResult("Import failed. Please try again.");
        } finally {
            setIsImporting(false);
        }
    };

    const toggleSelectImport = (id: number) => {
        setSelectedImportIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAllNotImported = () => {
        const notImported = masterList.filter(m => !m.alreadyImported).map(m => m.id);
        setSelectedImportIds(notImported);
    };

    const clearSelection = () => setSelectedImportIds([]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchInventory(newPage, search, activeFilter);
        }
    };

    const handleAddMedicine = async () => {
        // Validation
        if (!newMedicine.name) {
            alert("Please enter a Brand Name.");
            return;
        }
        if (!newMedicine.category) {
            alert("Please select a Category.");
            return;
        }
        if (!newMedicine.genericName) {
            alert("Please enter the Formula (Generic Name).");
            return;
        }
        if (!newMedicine.manufacturer) {
            alert("Please enter the Manufacturer/Company.");
            return;
        }
        if (!newMedicine.price) {
            alert("Please enter the Trade Price.");
            return;
        }
        if (!newMedicine.salePrice) {
            alert("Please enter the Retail Price.");
            return;
        }
        if (!newMedicine.unitPerPack) {
            alert("Please enter Units Per Pack (e.g. 10 or 30).");
            return;
        }

        // Partial Initial Stock Validation
        if (newMedicine.initialBatchNo || newMedicine.initialQuantity || newMedicine.initialExpiryDate) {
            if (!newMedicine.initialBatchNo || !newMedicine.initialQuantity || !newMedicine.initialExpiryDate) {
                alert("Please fill all initial stock fields (Batch, Quantity, Expiry) or leave them all empty.");
                return;
            }
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
                    salePrice: parseFloat(newMedicine.salePrice),
                    reorderLevel: parseInt(newMedicine.reorderLevel),
                    initialQuantity: newMedicine.initialQuantity ? parseInt(newMedicine.initialQuantity) : 0
                })
            });

            if (response.ok) {
                setIsAddModalOpen(false);
                setNewMedicine({
                    name: "",
                    category: "Tablet",
                    genericName: "",
                    manufacturer: "",
                    price: "",
                    salePrice: "",
                    unitPerPack: "1",
                    unitType: "Tablet",
                    reorderLevel: "10",
                    rackNo: "",
                    margin: "14.5",
                    initialBatchNo: "",
                    initialQuantity: "",
                    initialExpiryDate: ""
                });
                fetchInventory(currentPage, search, activeFilter);
            }
        } catch (error) {
            console.error("Failed to add medicine", error);
        }
    };

    const handleEditMedicine = async () => {
        if (!selectedMedicine) return;

        // Partial Initial Stock Validation
        if (selectedMedicine.initialBatchNo || selectedMedicine.initialQuantity || selectedMedicine.initialExpiryDate) {
            if (!selectedMedicine.initialBatchNo || !selectedMedicine.initialQuantity || !selectedMedicine.initialExpiryDate) {
                alert("Please fill all stock fields (Batch, Quantity, Expiry) or leave them all empty.");
                return;
            }
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/inventory/medicines/${selectedMedicine.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(selectedMedicine)
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                setSelectedMedicine(null); // Clear form
                fetchInventory(currentPage, search, activeFilter);
            }
        } catch (error) {
            console.error("Failed to update medicine", error);
        }
    };

    const handleDeleteMedicine = async () => {
        if (!selectedMedicineId) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/inventory/medicines/${selectedMedicineId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setIsDeleteConfirmOpen(false);
                fetchInventory(currentPage, search, activeFilter);
            }
        } catch (error) {
            console.error("Failed to delete medicine", error);
        }
    };

    const handleAddBatch = async () => {
        if (!selectedMedicineId) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/inventory/batches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newBatch,
                    medicineId: selectedMedicineId,
                    quantity: parseInt(newBatch.quantity),
                    purchasePrice: parseFloat(newBatch.purchasePrice),
                    expiryDate: new Date(newBatch.expiryDate).toISOString()
                })
            });

            if (response.ok) {
                setIsAddBatchModalOpen(false);
                setNewBatch({
                    batchNo: "",
                    quantity: "",
                    purchasePrice: "",
                    expiryDate: ""
                });
                fetchInventory(currentPage, search, activeFilter);
            }
        } catch (error) {
            console.error("Failed to add batch", error);
        }
    };

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

            // Map data to include 'alreadyOwned' check
            const enrichedData = data.map((med: any) => ({
                ...med,
                isLocal: medicines.some(m => m.name.toLowerCase() === med.name.toLowerCase())
            }));

            setMasterSuggestions(enrichedData);
            setShowSuggestions(enrichedData.length > 0);
        } catch (error) {
            console.error("Master lookup failed", error);
        } finally {
            setIsSearchingMaster(false);
        }
    };

    const handleSelectMaster = (med: any) => {
        setNewMedicine({
            ...newMedicine,
            name: med.name,
            genericName: med.genericName || "",
            manufacturer: med.manufacturer || "",
            category: med.category || "Tablet",
            unitType: med.unitType || "Tablet"
        });
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

    // Calculation functions for Edit Modal
    const calculateEditTradePrice = (mrp: string, margin: string) => {
        const mrpValue = parseFloat(mrp);
        const marginValue = parseFloat(margin);
        if (!isNaN(mrpValue) && !isNaN(marginValue)) {
            const tp = mrpValue * (1 - marginValue / 100);
            setSelectedMedicine(prev => prev ? { ...prev, price: parseFloat(tp.toFixed(2)), salePrice: mrpValue, margin: parseFloat(marginValue.toFixed(2)) } : null);
        } else {
            setSelectedMedicine(prev => prev ? { ...prev, salePrice: parseFloat(mrp) } : null);
        }
    };

    const calculateEditMargin = (tp: string, mrp: string) => {
        const tpValue = parseFloat(tp);
        const mrpValue = parseFloat(mrp);
        if (!isNaN(tpValue) && !isNaN(mrpValue) && mrpValue > 0) {
            const margin = ((mrpValue - tpValue) / mrpValue) * 100;
            setSelectedMedicine(prev => prev ? { ...prev, price: tpValue, margin: parseFloat(margin.toFixed(2)) } : null);
        } else {
            setSelectedMedicine(prev => prev ? { ...prev, price: tpValue } : null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Vault</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500 text-sm flex items-center gap-2 font-bold">
                            <Database className="h-4 w-4 text-indigo-500" />
                            {analytics?.totalItems || 0} Products
                        </p>
                        {activeFilter !== "all" && (
                            <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 cursor-pointer gap-2 py-1 rounded-xl font-black transition-all"
                                onClick={() => setActiveFilter("all")}
                            >
                                Showing: {activeFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                <X className="h-3 w-3" />
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-2xl h-12 px-6 gap-2 border-slate-200 hover:bg-slate-50 transition-all font-bold"
                        onClick={() => fetchInventory(currentPage, search, activeFilter)}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>

                    {/* Import from Master Button */}
                    <Button
                        variant="outline"
                        className="rounded-2xl h-12 px-6 gap-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all font-bold"
                        onClick={() => {
                            setIsImportModalOpen(true);
                            setImportResult(null);
                            setSelectedImportIds([]);
                        }}
                    >
                        <Download className="h-4 w-4" />
                        Import Master DB
                    </Button>

                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-2xl shadow-lg shadow-indigo-200 gap-2 font-black transition-all">
                                <Plus className="h-5 w-5" />
                                New Medicine
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-5 border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    Product Registration
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-1 font-medium">
                                <div className="space-y-1.5 col-span-2 md:col-span-1 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                    <Input
                                        placeholder="e.g. Panadol CF"
                                        className="h-10 rounded-xl border-slate-200"
                                        value={newMedicine.name}
                                        onChange={(e) => lookupMasterMedicine(e.target.value)}
                                        onFocus={() => { if (masterSuggestions.length > 0) setShowSuggestions(true); }}
                                    />
                                    {showSuggestions && (
                                        <div className="absolute z-50 w-full bg-white mt-1.5 rounded-[1.2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Master Database Results</span>
                                                <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] h-3.5">Quick Find</Badge>
                                            </div>
                                            {masterSuggestions.map((med, index) => (
                                                <div
                                                    key={index}
                                                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer transition-all border-b border-slate-50 last:border-none group flex justify-between items-center"
                                                    onClick={() => handleSelectMaster(med)}
                                                >
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold text-slate-800 text-xs truncate group-hover:text-indigo-600 transition-colors">
                                                                {med.name}
                                                            </div>
                                                            {med.isLocal && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] h-3.5 px-1 font-bold">In Inventory</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-medium truncate italic">
                                                            {med.genericName || "Formula not listed"}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <Badge variant="outline" className={`text-[7px] h-3.5 px-1 border-none shadow-sm ${med.category === 'Tablet' ? 'bg-blue-50 text-blue-600' :
                                                            med.category === 'Syrup' ? 'bg-purple-50 text-purple-600' :
                                                                med.category === 'Injection' ? 'bg-red-50 text-red-600' :
                                                                    'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {med.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {isSearchingMaster && (
                                        <div className="absolute right-3 top-10">
                                            <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <Select
                                        value={newMedicine.category}
                                        onValueChange={(val) => setNewMedicine({ ...newMedicine, category: val })}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-2 ring-indigo-500/10">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="Tablet">Tablet</SelectItem>
                                            <SelectItem value="Syrup">Syrup</SelectItem>
                                            <SelectItem value="Injection">Injection / Vaccine</SelectItem>
                                            <SelectItem value="Insulin">Insulin</SelectItem>
                                            <SelectItem value="Cream">Cream / Ointment</SelectItem>
                                            <SelectItem value="Sachet">Sachet</SelectItem>
                                            <SelectItem value="Drops">Drops (Eye/Ear/Oral)</SelectItem>
                                            <SelectItem value="Inhaler">Inhaler / Respules</SelectItem>
                                            <SelectItem value="Spray">Spray / Spray Gel</SelectItem>
                                            <SelectItem value="Lotion">Lotion / Solution</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                                    <Input
                                        placeholder="Paracetamol..."
                                        className="h-10 rounded-xl border-slate-200 focus:ring-2 ring-indigo-500/10"
                                        value={newMedicine.genericName}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                    <Input
                                        placeholder="Manufacturer Name"
                                        className="h-10 rounded-xl border-slate-200 focus:ring-2 ring-indigo-500/10"
                                        value={newMedicine.manufacturer}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rack No (Storage)</label>
                                    <Input
                                        placeholder="e.g. A-1"
                                        className="h-10 rounded-xl border-slate-200 focus:ring-2 ring-indigo-500/10"
                                        value={newMedicine.rackNo}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, rackNo: e.target.value })}
                                    />
                                </div>

                                {/* Pricing Section with Logic */}
                                <div className="col-span-2 grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Retail Price (MRP)</label>
                                        <Input
                                            type="number"
                                            placeholder="MRP"
                                            className="h-10 rounded-lg border-slate-200 bg-white"
                                            value={newMedicine.salePrice}
                                            onChange={(e) => calculateTradePrice(e.target.value, newMedicine.margin)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Margin %</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                className="h-10 rounded-lg border-slate-200 bg-white pr-6"
                                                value={newMedicine.margin}
                                                onChange={(e) => {
                                                    setNewMedicine({ ...newMedicine, margin: e.target.value });
                                                    calculateTradePrice(newMedicine.salePrice, e.target.value);
                                                }}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price (Cost)</label>
                                        <Input
                                            type="number"
                                            placeholder="Cost Price"
                                            className="h-10 rounded-lg border-slate-200 bg-white"
                                            value={newMedicine.price}
                                            onChange={(e) => calculateMargin(e.target.value, newMedicine.salePrice)}
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-3">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                        <Select
                                            value={newMedicine.unitType}
                                            onValueChange={(val) => setNewMedicine({ ...newMedicine, unitType: val })}
                                        >
                                            <SelectTrigger className="h-10 rounded-lg border-slate-200 focus:ring-2 ring-indigo-500/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-none shadow-xl">
                                                <SelectItem value="Tablet">Tablet</SelectItem>
                                                <SelectItem value="Capsule">Capsule</SelectItem>
                                                <SelectItem value="Syrup">Syrup / Suspension (Bottle)</SelectItem>
                                                <SelectItem value="Drops">Drops (Bottle)</SelectItem>
                                                <SelectItem value="Sachet">Sachet</SelectItem>
                                                <SelectItem value="Injection">Injection (Vial/Ampule)</SelectItem>
                                                <SelectItem value="Insulin Pen">Insulin Pen / Cartridge</SelectItem>
                                                <SelectItem value="Tube">Tube (Cream/Gel)</SelectItem>
                                                <SelectItem value="Inhaler">Inhaler</SelectItem>
                                                <SelectItem value="Spray">Spray Can</SelectItem>
                                                <SelectItem value="Lotion">Lotion Bottle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            {/* Initial Stock Section */}
                            <div className="space-y-2 py-0.5 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Initial Stock Entry (Optional)</span>
                                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-0.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch No</label>
                                        <Input
                                            placeholder="e.g. B-101"
                                            className="h-9 rounded-lg border-slate-200"
                                            value={newMedicine.initialBatchNo}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, initialBatchNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-9 rounded-lg border-slate-200"
                                            value={newMedicine.initialQuantity}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, initialQuantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <Input
                                            type="date"
                                            className="h-9 rounded-lg border-slate-200 text-xs"
                                            value={newMedicine.initialExpiryDate}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, initialExpiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="mt-1.5">
                                <Button
                                    onClick={handleAddMedicine}
                                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black text-base shadow-xl shadow-indigo-100"
                                >
                                    Register Product
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Global Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {[
                    { id: "all", label: "Assets", value: analytics?.totalItems || 0, icon: Package, color: "indigo" },
                    { id: "value", label: "Inventory Value", value: `Rs. ${(analytics?.totalStockValue || 0).toLocaleString()}`, icon: BarChart3, color: "emerald" },
                    { id: "lowStock", label: "Low Stock", value: analytics?.lowStockCount || 0, icon: TrendingDown, color: "amber" },
                    { id: "nearExpiry", label: "Near Expiry", value: analytics?.nearExpiryCount || 0, icon: Clock, color: "orange" },
                    { id: "expired", label: "Expired", value: analytics?.expiredCount || 0, icon: AlertTriangle, color: "red" }
                ].map((stat) => {
                    const isActive = activeFilter === stat.id;
                    const colorMap: Record<string, string> = {
                        indigo: "bg-indigo-600 shadow-indigo-100",
                        emerald: "bg-emerald-600 shadow-emerald-100",
                        amber: "bg-amber-500 shadow-amber-100",
                        orange: "bg-orange-500 shadow-orange-100",
                        red: "bg-red-600 shadow-red-100"
                    };

                    return (
                        <Card
                            key={stat.id}
                            onClick={() => setActiveFilter(stat.id)}
                            className={`border-none shadow-md rounded-[2.2rem] transition-all duration-300 cursor-pointer relative overflow-hidden group ${isActive ? `${colorMap[stat.color]} shadow-xl translate-y-[-2px]` : 'bg-white hover:shadow-xl'
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                                        ? 'bg-white/20 text-white shadow-none'
                                        : `bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110`
                                        }`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none transition-colors ${isActive ? 'text-white/80' : 'text-slate-400'
                                            }`}>{stat.label}</p>
                                        <p className={`text-xl font-black mt-1 transition-colors ${isActive ? 'text-white' : 'text-slate-900'
                                            }`}>{stat.value}</p>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Compact Inventory List Area */}
            <Card className="border-none shadow-xl rounded-xl bg-white overflow-hidden">
                <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search Inventory..."
                            className="h-9 pl-10 pr-4 rounded-lg border-slate-200 shadow-sm text-xs font-bold bg-white outline-none focus:ring-2 ring-indigo-500/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 text-[10px] h-7 px-3 font-bold rounded-lg shadow-sm">
                            Showing {medicines.length} of {analytics?.totalItems || 0} Products
                        </Badge>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80">
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">In-Hand</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price (Profit)</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Storage</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && medicines.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <RefreshCw className="h-10 w-10 animate-spin mx-auto text-indigo-400 opacity-20" />
                                    </td>
                                </tr>
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                                <Search className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold text-lg">No results in your pharmacy inventory.</p>
                                            {search.length > 2 && (
                                                <Button
                                                    onClick={() => {
                                                        setIsAddModalOpen(true);
                                                        lookupMasterMedicine(search);
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-12 px-8 font-black shadow-lg shadow-indigo-100 animate-bounce"
                                                >
                                                    Search Master Database for "{search}"
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : medicines.map(med => (
                                <tr key={med.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all overflow-hidden relative border border-slate-100">
                                                {(() => {
                                                    const Icon = getCategoryIcon(med.category);
                                                    return <Icon className="h-4 w-4 relative z-10" />;
                                                })()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">{med.name}</h4>
                                                    <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-bold uppercase rounded border-slate-200 bg-slate-50 text-slate-500">{med.category}</Badge>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-tight">{med.genericName} • {med.manufacturer}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className={`text-sm font-black ${med.stock <= med.reorderLevel ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>{med.stock}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Units</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="text-xs font-bold text-slate-900">Rs. {med.salePrice}</div>
                                        <div className="text-[9px] text-slate-400 font-medium leading-none">Cost: {med.price}</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge className={`border-none rounded-lg px-2 py-0.5 font-bold gap-1 text-[9px] ${med.rackNo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                            <Truck className="h-2.5 w-2.5" />
                                            {med.rackNo ? `RACK ${med.rackNo}` : 'NO RACK'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 rounded-lg p-0 border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
                                                onClick={() => {
                                                    setSelectedMedicineId(med.id);
                                                    setNewBatch(prev => ({ ...prev, purchasePrice: med.price.toString() }));
                                                    setIsAddBatchModalOpen(true);
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 rounded-lg p-0 border-slate-100 hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-95"
                                                onClick={() => {
                                                    const margin = med.salePrice > 0 ? ((med.salePrice - med.price) / med.salePrice) * 100 : 14.5;
                                                    setSelectedMedicine({ ...med, margin: parseFloat(margin.toFixed(2)) });
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 rounded-lg p-0 border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                                onClick={() => {
                                                    setSelectedMedicineId(med.id);
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Compact Pagination */}
                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            PAGE {currentPage} OF {totalPages}
                        </p>
                    </div>
                    <div className="flex gap-1.5">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="h-8 w-8 rounded-lg border-slate-200 shadow-sm bg-white hover:bg-indigo-50 hover:text-indigo-600 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="h-8 w-8 rounded-lg border-slate-200 shadow-sm bg-white hover:bg-indigo-50 hover:text-indigo-600 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Edit Medicine Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <DialogTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                    <Edit2 className="h-6 w-6" />
                                </div>
                                Update Product
                            </DialogTitle>
                            {selectedMedicine && (
                                <div className="flex flex-col items-end">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-xs px-3 py-1.5 rounded-xl gap-2 shadow-sm">
                                        <Layers className="h-3 w-3" />
                                        Current Stock: {selectedMedicine.stock}
                                    </Badge>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mr-1">Units In-Hand</span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                    {selectedMedicine && (
                        <div className="space-y-6 py-4 scroll-smooth overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar">
                            {/* Basic Info Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                    <Input
                                        className="h-11 rounded-xl border-slate-200 font-bold bg-white"
                                        value={selectedMedicine.name}
                                        onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                                    <Input
                                        className="h-11 rounded-xl border-slate-200 bg-white"
                                        value={selectedMedicine.genericName}
                                        onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, genericName: e.target.value } : null)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <Select
                                        value={selectedMedicine.category}
                                        onValueChange={(val) => setSelectedMedicine(prev => prev ? { ...prev, category: val } : null)}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Tablet">Tablet</SelectItem>
                                            <SelectItem value="Syrup">Syrup</SelectItem>
                                            <SelectItem value="Injection">Injection / Vaccine</SelectItem>
                                            <SelectItem value="Insulin">Insulin</SelectItem>
                                            <SelectItem value="Cream">Cream / Ointment</SelectItem>
                                            <SelectItem value="Sachet">Sachet</SelectItem>
                                            <SelectItem value="Drops">Drops (Eye/Ear/Oral)</SelectItem>
                                            <SelectItem value="Inhaler">Inhaler / Respules</SelectItem>
                                            <SelectItem value="Spray">Spray / Spray Gel</SelectItem>
                                            <SelectItem value="Lotion">Lotion / Solution</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                    <Input
                                        className="h-11 rounded-xl border-slate-200 bg-white"
                                        value={selectedMedicine.manufacturer}
                                        onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, manufacturer: e.target.value } : null)}
                                    />
                                </div>
                            </div>

                            {/* Pricing Section (Screenshot Style) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-1 w-8 bg-amber-500 rounded-full"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pricing & Profit Margin</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-1">Retail Price (MRP)</label>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl border-slate-200 bg-white font-bold text-sm"
                                            placeholder="MRP"
                                            value={selectedMedicine.salePrice}
                                            onChange={(e) => calculateEditTradePrice(e.target.value, (selectedMedicine.margin || "14.5").toString())}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Margin %</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                className="h-11 rounded-xl border-slate-200 bg-white font-bold text-sm"
                                                value={selectedMedicine.margin || 14.5}
                                                onChange={(e) => calculateEditTradePrice(selectedMedicine.salePrice.toString(), e.target.value)}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price (Cost)</label>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl border-slate-200 bg-white font-bold text-sm"
                                            placeholder="Cost Price"
                                            value={selectedMedicine.price}
                                            onChange={(e) => calculateEditMargin(e.target.value, selectedMedicine.salePrice.toString())}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stock & Storage Section (Screenshot Style) */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock & Storage Info</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock (Manual Edit)</label>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl border-slate-200 bg-white font-bold text-blue-600"
                                            value={selectedMedicine.stock}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                        <Select
                                            value={selectedMedicine.unitType}
                                            onValueChange={(val) => setSelectedMedicine(prev => prev ? { ...prev, unitType: val } : null)}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Tablet">Tablet</SelectItem>
                                                <SelectItem value="Capsule">Capsule</SelectItem>
                                                <SelectItem value="Syrup">Syrup / Suspension (Bottle)</SelectItem>
                                                <SelectItem value="Drops">Drops (Bottle)</SelectItem>
                                                <SelectItem value="Sachet">Sachet</SelectItem>
                                                <SelectItem value="Injection">Injection (Vial/Ampule)</SelectItem>
                                                <SelectItem value="Insulin Pen">Insulin Pen / Cartridge</SelectItem>
                                                <SelectItem value="Tube">Tube (Cream/Gel)</SelectItem>
                                                <SelectItem value="Inhaler">Inhaler</SelectItem>
                                                <SelectItem value="Spray">Spray Can</SelectItem>
                                                <SelectItem value="Lotion">Lotion Bottle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Units Per Pack</label>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            value={selectedMedicine.unitPerPack}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, unitPerPack: parseInt(e.target.value) } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Level</label>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            value={selectedMedicine.reorderLevel}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, reorderLevel: parseInt(e.target.value) } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rack Location</label>
                                        <Input
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            placeholder="e.g. A-1"
                                            value={selectedMedicine.rackNo || ""}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, rackNo: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Initial Stock Section (New for Edit Modal) */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Initial Stock Entry (Optional)</span>
                                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch No</label>
                                        <Input
                                            placeholder="e.g. B-101"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            value={selectedMedicine.initialBatchNo || ""}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, initialBatchNo: e.target.value } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            value={selectedMedicine.initialQuantity || ""}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, initialQuantity: e.target.value } : null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <Input
                                            type="date"
                                            className="h-11 rounded-xl border-slate-200 bg-white"
                                            value={selectedMedicine.initialExpiryDate || ""}
                                            onChange={(e) => setSelectedMedicine(prev => prev ? { ...prev, initialExpiryDate: e.target.value } : null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4 border-t border-slate-100">
                        <Button
                            onClick={handleEditMedicine}
                            className="w-full h-12 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-sm shadow-lg shadow-amber-100 gap-2 transition-all active:scale-95"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Update Product & Add Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import from Master Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={(open) => { setIsImportModalOpen(open); if (!open) { setImportResult(null); setSelectedImportIds([]); setMasterSearch(""); setMasterCategory("all"); } }}>
                <DialogContent className="sm:max-w-[720px] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8">
                        <DialogTitle className="text-3xl font-black text-white flex items-center gap-4">
                            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Database className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div>Import from Master DB</div>
                                <div className="text-sm text-emerald-200 font-medium mt-1">Select medicines to add to your pharmacy inventory</div>
                            </div>
                        </DialogTitle>
                        {/* Search & Filter */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="col-span-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                                <input
                                    type="text"
                                    placeholder="Search by name, formula, company..."
                                    className="w-full pl-10 pr-4 h-11 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/20 outline-none focus:bg-white/30 font-medium text-sm"
                                    value={masterSearch}
                                    onChange={e => setMasterSearch(e.target.value)}
                                />
                            </div>
                            <Select value={masterCategory} onValueChange={setMasterCategory}>
                                <SelectTrigger className="h-11 rounded-xl bg-white/20 border-white/20 text-white font-medium">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="Tablet">Tablet</SelectItem>
                                    <SelectItem value="Syrup">Syrup</SelectItem>
                                    <SelectItem value="Injection">Injection</SelectItem>
                                    <SelectItem value="Cream">Cream</SelectItem>
                                    <SelectItem value="Sachet">Sachet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Medicines List */}
                    <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                        <div className="text-sm font-black text-slate-500">
                            {isLoadingMaster ? "Loading..." : `${masterList.length} medicines found`}
                            {selectedImportIds.length > 0 && (
                                <span className="ml-2 text-emerald-600">(• {selectedImportIds.length} selected)</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAllNotImported}
                                className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all"
                            >
                                <CheckSquare className="h-3.5 w-3.5" /> Select All New
                            </button>
                            <button
                                onClick={clearSelection}
                                className="text-xs font-black text-slate-400 hover:text-slate-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
                            >
                                <Square className="h-3.5 w-3.5" /> Clear
                            </button>
                        </div>
                    </div>

                    <div className="mx-6 mb-4 rounded-2xl border border-slate-100 overflow-hidden" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {isLoadingMaster ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
                            </div>
                        ) : masterList.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 font-bold">No medicines found</div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 w-10"></th>
                                        <th className="p-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Medicine</th>
                                        <th className="p-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Formula</th>
                                        <th className="p-3 font-black text-slate-400 text-[10px] uppercase tracking-widest">Company</th>
                                        <th className="p-3 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {masterList.map((med) => {
                                        const isSelected = selectedImportIds.includes(med.id);
                                        return (
                                            <tr
                                                key={med.id}
                                                onClick={() => !med.alreadyImported && toggleSelectImport(med.id)}
                                                className={`transition-all ${med.alreadyImported
                                                    ? 'opacity-40 cursor-not-allowed bg-slate-50/50'
                                                    : isSelected
                                                        ? 'bg-emerald-50 cursor-pointer'
                                                        : 'hover:bg-slate-50 cursor-pointer'
                                                    }`}
                                            >
                                                <td className="p-3 text-center">
                                                    {med.alreadyImported ? (
                                                        <div className="h-5 w-5 rounded-md bg-emerald-500 flex items-center justify-center mx-auto">
                                                            <CheckSquare className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    ) : isSelected ? (
                                                        <div className="h-5 w-5 rounded-md border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center mx-auto">
                                                            <CheckSquare className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-md border-2 border-slate-200 mx-auto"></div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-bold text-slate-800">{med.name}</div>
                                                    <div className="text-[10px] text-slate-400">{med.category}</div>
                                                </td>
                                                <td className="p-3 text-xs text-slate-500 font-medium italic">{med.genericName || '-'}</td>
                                                <td className="p-3 text-xs text-slate-500 font-medium">{med.manufacturer || '-'}</td>
                                                <td className="p-3 text-center">
                                                    {med.alreadyImported ? (
                                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">✓ In Inventory</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Not Added</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        {importResult && (
                            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm text-center">
                                ✓ {importResult}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                                onClick={() => { setIsImportModalOpen(false); setImportResult(null); setSelectedImportIds([]); setMasterSearch(""); setMasterCategory("all"); }}
                            >
                                Close
                            </Button>
                            <Button
                                className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black shadow-lg shadow-emerald-100 gap-2 disabled:opacity-50"
                                onClick={handleImportFromMaster}
                                disabled={selectedImportIds.length === 0 || isImporting}
                            >
                                {isImporting ? (
                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Importing...</>
                                ) : (
                                    <><Download className="h-4 w-4" /> Import {selectedImportIds.length > 0 ? `${selectedImportIds.length} Medicines` : 'Selected'}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            Are you sure?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-500 font-medium">
                        This action cannot be undone. This will permanently delete the product and all associated batches from the system.
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="rounded-xl h-12 flex-1 font-bold"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 rounded-xl h-12 flex-1 font-black shadow-lg shadow-red-100"
                            onClick={handleDeleteMedicine}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Batch Modal */}
            <Dialog open={isAddBatchModalOpen} onOpenChange={setIsAddBatchModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-10 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black text-slate-900 flex items-center gap-4">
                            <div className="h-14 w-14 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center text-emerald-600">
                                <Layers className="h-8 w-8" />
                            </div>
                            New Batch
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Number</label>
                            <Input
                                placeholder="X-0012-PK..."
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white text-lg font-bold"
                                value={newBatch.batchNo}
                                onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white text-lg font-bold"
                                    value={newBatch.quantity}
                                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost / Unit</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white text-lg font-bold"
                                    value={newBatch.purchasePrice}
                                    onChange={(e) => setNewBatch({ ...newBatch, purchasePrice: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                            <Input
                                type="date"
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white text-lg font-bold"
                                value={newBatch.expiryDate}
                                onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAddBatch}
                            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 tracking-tight"
                        >
                            Confirm Stock Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
