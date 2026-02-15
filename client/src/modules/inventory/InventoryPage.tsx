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
    Trash2
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
    categoryBreakdown: Array<{
        category: string;
        count: number;
        value: number;
    }>;
}

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
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);

    // Form States
    const [newMedicine, setNewMedicine] = useState({
        name: "",
        category: "Tablet",
        genericName: "",
        manufacturer: "",
        price: "",
        salePrice: "",
        unitPerPack: "1",
        unitType: "Tablet",
        reorderLevel: "10",
        rackNo: ""
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

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchInventory(newPage, search, activeFilter);
        }
    };

    const handleAddMedicine = async () => {
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
                    rackNo: ""
                });
                fetchInventory(currentPage, search, activeFilter);
            }
        } catch (error) {
            console.error("Failed to add medicine", error);
        }
    };

    const handleEditMedicine = async () => {
        if (!selectedMedicine) return;
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

                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-2xl shadow-lg shadow-indigo-200 gap-2 font-black transition-all">
                                <Plus className="h-5 w-5" />
                                New Medicine
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    Product Registration
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6 py-6 font-medium">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                    <Input
                                        placeholder="e.g. Panadol CF"
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.name}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <Select
                                        defaultValue="Tablet"
                                        onValueChange={(val) => setNewMedicine({ ...newMedicine, category: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="Tablet">Tablet</SelectItem>
                                            <SelectItem value="Syrup">Syrup</SelectItem>
                                            <SelectItem value="Injection">Injection</SelectItem>
                                            <SelectItem value="Handy-Plast">Emergency/First Aid</SelectItem>
                                            <SelectItem value="Cream">Cream / Ointment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                                    <Input
                                        placeholder="Paracetamol..."
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.genericName}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                    <Input
                                        placeholder="Manufacturer Name"
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.manufacturer}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, manufacturer: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price</label>
                                    <Input
                                        type="number"
                                        placeholder="Cost Price"
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.price}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Retail Price</label>
                                    <Input
                                        type="number"
                                        placeholder="MRP"
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.salePrice}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, salePrice: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                    <Select
                                        value={newMedicine.unitType}
                                        onValueChange={(val) => setNewMedicine({ ...newMedicine, unitType: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="Tablet">Tablet</SelectItem>
                                            <SelectItem value="Capsule">Capsule</SelectItem>
                                            <SelectItem value="Syrup">Syrup (Bottle)</SelectItem>
                                            <SelectItem value="Sachet">Sachet</SelectItem>
                                            <SelectItem value="Injection">Injection</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Units Per Pack</label>
                                    <Input
                                        type="number"
                                        className="h-12 rounded-xl border-slate-200"
                                        value={newMedicine.unitPerPack}
                                        onChange={(e) => setNewMedicine({ ...newMedicine, unitPerPack: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleAddMedicine}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100"
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

            {/* Smart Search & Content Area */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Universal Search (Brand, Formula, Company)..."
                            className="h-16 pl-16 pr-6 rounded-[2rem] border-none shadow-xl text-lg font-medium bg-white outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b border-slate-100">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Stock</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
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
                                        <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">No results found matching your criteria.</td>
                                    </tr>
                                ) : medicines.map(med => (
                                    <tr key={med.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                    <LayoutGrid className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-base font-black text-slate-900 tracking-tight">{med.name}</h4>
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg border-slate-200">{med.category}</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-bold mt-0.5 opacity-60 tracking-tight">{med.genericName} • {med.manufacturer}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`text-2xl font-black ${med.stock <= med.reorderLevel ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>{med.stock}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Units in-hand</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-base font-black text-slate-900">Rs. {med.salePrice}</div>
                                            <div className="text-[10px] text-slate-400 font-black italic opacity-50">Cost: Rs. {med.price}</div>
                                        </td>
                                        <td className="p-6">
                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none rounded-xl px-4 py-1.5 font-black gap-2 text-[11px]">
                                                <Truck className="h-3 w-3" />
                                                SHELF {med.rackNo || "N/A"}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10 w-10 rounded-xl p-0 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90"
                                                    onClick={() => {
                                                        setSelectedMedicineId(med.id);
                                                        setIsAddBatchModalOpen(true);
                                                    }}
                                                    title="Add Batch"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10 w-10 rounded-xl p-0 border-slate-100 hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-90"
                                                    onClick={() => {
                                                        setSelectedMedicine(med);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    title="Edit Product"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10 w-10 rounded-xl p-0 border-slate-100 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                                                    onClick={() => {
                                                        setSelectedMedicineId(med.id);
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                PAGE <span className="text-indigo-600 font-black px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-100">{currentPage}</span> OF {totalPages}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="h-12 w-12 rounded-2xl border-none shadow-md bg-white hover:bg-indigo-50 hover:text-indigo-600 p-0"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>

                            <div className="flex gap-2 mx-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`h-12 w-12 rounded-2xl font-black text-lg transition-all ${currentPage === i + 1
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'bg-white text-slate-400 border-none shadow-md hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </Button>
                                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                            </div>

                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="h-12 w-12 rounded-2xl border-none shadow-md bg-white hover:bg-indigo-50 hover:text-indigo-600 p-0"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Edit Medicine Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                <Edit2 className="h-6 w-6" />
                            </div>
                            Update Product
                        </DialogTitle>
                    </DialogHeader>
                    {selectedMedicine && (
                        <div className="grid grid-cols-2 gap-6 py-6 font-medium">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.name}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <Select
                                    value={selectedMedicine.category}
                                    onValueChange={(val) => setSelectedMedicine({ ...selectedMedicine, category: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Syrup">Syrup</SelectItem>
                                        <SelectItem value="Injection">Injection</SelectItem>
                                        <SelectItem value="Handy-Plast">Emergency/First Aid</SelectItem>
                                        <SelectItem value="Cream">Cream / Ointment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Formula (Generic)</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.genericName}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, genericName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.manufacturer}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, manufacturer: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Trade Price</label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.price}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Retail Price</label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.salePrice}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, salePrice: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rack No</label>
                                <Input
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.rackNo || ""}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, rackNo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Level</label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.reorderLevel}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, reorderLevel: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                                <Select
                                    value={selectedMedicine.unitType}
                                    onValueChange={(val) => setSelectedMedicine({ ...selectedMedicine, unitType: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Capsule">Capsule</SelectItem>
                                        <SelectItem value="Syrup">Syrup</SelectItem>
                                        <SelectItem value="Sachet">Sachet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Units Per Pack</label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-xl border-slate-200"
                                    value={selectedMedicine.unitPerPack}
                                    onChange={(e) => setSelectedMedicine({ ...selectedMedicine, unitPerPack: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={handleEditMedicine}
                            className="w-full h-14 bg-amber-500 hover:bg-amber-600 rounded-2xl font-black text-lg shadow-xl shadow-amber-100"
                        >
                            Update Product Details
                        </Button>
                    </DialogFooter>
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
        </div>
    );
}
