import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Plus,
    ShieldCheck,
    Clock,
    Power,
    Search,
    RefreshCw,
    FilePenLine,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Pharmacy {
    id: number;
    name: string;
    licenseStartedAt: string;
    licenseExpiresAt: string;
    isActive: boolean;
    subscriptionFee?: number;
    totalPaid?: number;
    users: { id: number; name: string; email: string }[];
}

interface EditPharmacyModalProps {
    pharmacy: Pharmacy;
    onUpdate: () => void;
}

function EditPharmacyModal({ pharmacy, onUpdate }: EditPharmacyModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(pharmacy.name);
    // Assuming the first user is the ADMIN/Owner
    const [ownerName, setOwnerName] = useState(pharmacy.users[0]?.name || "");
    const [email, setEmail] = useState(pharmacy.users[0]?.email || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/super/update-pharmacy-credentials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    pharmacyId: pharmacy.id,
                    pharmacyName: name,
                    ownerName: ownerName,
                    ownerEmail: email,
                    ownerPassword: password
                })
            });

            if (res.ok) {
                setIsOpen(false);
                onUpdate();
            } else {
                console.error("Failed to update");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg">
                    <FilePenLine className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-slate-900 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <FilePenLine className="h-5 w-5 text-indigo-400" />
                            Update Credentials
                        </DialogTitle>
                        <CardDescription className="text-slate-400 font-medium text-xs">
                            Modify account details for {pharmacy.name}
                        </CardDescription>
                    </DialogHeader>
                </div>
                <form onSubmit={handleUpdate} className="p-8 space-y-5 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pharmacy Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-12 border-slate-100 font-bold text-slate-700" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
                            <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="rounded-xl h-12 border-slate-100" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Login Email</Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-12 border-slate-100" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">New Password (Optional)</Label>
                            <Input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="rounded-xl h-12 border-slate-100 placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ManageLicenseModalProps {
    pharmacy: Pharmacy;
    onUpdate: () => void;
}

function ManageLicenseModal({ pharmacy, onUpdate }: ManageLicenseModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [months, setMonths] = useState(12);
    const [isActive, setIsActive] = useState(pharmacy.isActive);
    const [paidAmount, setPaidAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    const now = new Date();
    const previewDate = new Date(now);
    previewDate.setMonth(previewDate.getMonth() + Number(months));

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/super/renew-license", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    pharmacyId: pharmacy.id,
                    extraMonths: Number(months),
                    isActive: isActive,
                    paidAmount: Number(paidAmount)
                }),
            });

            if (response.ok) {
                setIsOpen(false);
                onUpdate();
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg font-bold text-indigo-600 hover:bg-indigo-50 border-indigo-100 shadow-sm transition-all active:scale-95"
                >
                    Renew / Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#0f172a] p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="h-24 w-24" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            License Control
                        </DialogTitle>
                        <CardDescription className="text-slate-400 font-medium text-xs">
                            Subscription Management for {pharmacy.name}
                        </CardDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-5 bg-white">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group/status transition-colors hover:bg-white hover:shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 tracking-tight uppercase">System Access</span>
                            <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isActive ? "Live & Running" : "Access Suspended"}
                            </span>
                        </div>

                        <div
                            onClick={() => setIsActive(!isActive)}
                            className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 ring-4 ${isActive
                                ? 'bg-emerald-500 ring-emerald-50'
                                : 'bg-slate-300 ring-slate-100'
                                }`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${isActive ? 'translate-x-7' : 'translate-x-0'
                                }`}>
                                {isActive ? (
                                    <Power className="h-3 w-3 text-emerald-600" />
                                ) : (
                                    <ShieldCheck className="h-3 w-3 text-slate-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Start Date</p>
                            <p className="font-black text-slate-900 text-sm">{now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <Label className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Payment (Rs.)</Label>
                            <input
                                type="number"
                                value={paidAmount}
                                onChange={e => setPaidAmount(Number(e.target.value))}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-black text-indigo-700 text-sm placeholder:text-indigo-200"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Extension Plan</Label>
                        <div className="flex gap-2">
                            {[1, 6, 12].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`flex-1 h-11 rounded-xl font-bold text-xs transition-all border-2 ${months === m
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'
                                        }`}
                                    onClick={() => setMonths(m)}
                                >
                                    {m === 12 ? "1 Year" : `${m}M`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-50 rounded-3xl border-2 border-indigo-100 border-dashed relative group">
                        <p className="text-center text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">New Expiration Date</p>
                        <p className="text-center text-lg font-black text-indigo-900 group-hover:scale-105 transition-transform">
                            {previewDate.toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </p>
                        <p className="text-center text-[10px] font-medium text-indigo-400 mt-1 italic">
                            {previewDate.toLocaleDateString('en-PK', { weekday: 'long' })}
                        </p>
                    </div>

                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full h-14 bg-[#0f172a] hover:bg-indigo-600 font-black text-sm rounded-2xl transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95"
                    >
                        {loading ? "Processing..." : "Apply Subscription"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function ManagedPharmacies() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [newPharmacy, setNewPharmacy] = useState({
        name: "",
        ownerEmail: "",
        ownerPassword: "",
        ownerName: "",
        months: 12,
        paidAmount: 0
    });

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

    const handleCreatePharmacy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/super/create-pharmacy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    pharmacyName: newPharmacy.name,
                    ownerEmail: newPharmacy.ownerEmail,
                    ownerPassword: newPharmacy.ownerPassword,
                    ownerName: newPharmacy.ownerName,
                    licenseMonths: Number(newPharmacy.months),
                    paidAmount: Number(newPharmacy.paidAmount)
                }),
            });

            if (response.ok) {
                setIsAddModalOpen(false);
                fetchPharmacies();
                setNewPharmacy({ name: "", ownerEmail: "", ownerPassword: "", ownerName: "", months: 12, paidAmount: 0 });
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.users[0]?.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen space-y-8 pb-12">
            <div className="flex justify-between items-center bg-indigo-950 px-12 py-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        Managed Pharmacies
                    </h1>
                    <p className="text-indigo-200/50 font-medium mt-1 text-xs italic tracking-wide">Monitor license status and technical health of client nodes.</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-500 hover:bg-white hover:text-indigo-900 h-16 px-8 rounded-2xl font-black shadow-xl shadow-indigo-500/20 gap-3 text-lg transition-all active:scale-95 border-none">
                            <Plus className="h-6 w-6" /> Onboard New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black flex items-center gap-2 text-white">
                                    <Plus className="h-8 w-8" /> Register Pharmacy
                                </DialogTitle>
                                <CardDescription className="text-indigo-100 font-medium opacity-80 italic">
                                    Initialize a new pharmacy instance and owner account.
                                </CardDescription>
                            </DialogHeader>
                        </div>

                        <form onSubmit={handleCreatePharmacy} className="p-8 space-y-5 bg-white">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Pharmacy Information</Label>
                                <Input placeholder="e.g. Al-Shifa Pharmacy" value={newPharmacy.name} onChange={e => setNewPharmacy({ ...newPharmacy, name: e.target.value })} required className="rounded-xl h-12 border-slate-100 focus:ring-indigo-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
                                    <Input placeholder="Full Name" value={newPharmacy.ownerName} onChange={e => setNewPharmacy({ ...newPharmacy, ownerName: e.target.value })} required className="rounded-xl h-12 border-slate-100" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subscription Details</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">M</div>
                                            <Input type="number" min="1" placeholder="Months" value={newPharmacy.months} onChange={e => setNewPharmacy({ ...newPharmacy, months: Number(e.target.value) })} required className="pl-8 rounded-xl h-12 border-slate-100 font-bold text-indigo-600" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rs.</div>
                                            <Input type="number" placeholder="Payment Amount" value={newPharmacy.paidAmount} onChange={e => setNewPharmacy({ ...newPharmacy, paidAmount: Number(e.target.value) })} required className="pl-10 rounded-xl h-12 border-slate-100 font-bold text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Credentials</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input type="email" placeholder="Email" value={newPharmacy.ownerEmail} onChange={e => setNewPharmacy({ ...newPharmacy, ownerEmail: e.target.value })} required className="rounded-xl h-12 border-slate-100" />
                                    <Input type="password" placeholder="Password" value={newPharmacy.ownerPassword} onChange={e => setNewPharmacy({ ...newPharmacy, ownerPassword: e.target.value })} required className="rounded-xl h-12 border-slate-100" />
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 rounded-3xl border-2 border-indigo-100 border-dashed relative">
                                <p className="text-center text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Live Subscription Preview</p>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="text-center flex-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Starts</p>
                                        <p className="font-bold text-slate-700 text-xs">{new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <div className="h-px bg-indigo-200 flex-1 mx-2 relative">
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-indigo-100 text-[8px] font-black text-indigo-500">{newPharmacy.months}M</div>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Expires</p>
                                        <p className="font-black text-indigo-600 text-xs">
                                            {(() => {
                                                const d = new Date();
                                                d.setMonth(d.getMonth() + (Number(newPharmacy.months) || 0));
                                                return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-16 bg-[#0f172a] hover:bg-indigo-600 font-black text-sm rounded-2xl mt-2 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95">
                                Create Pharmacy & Account
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black">All Pharmacy Nodes</CardTitle>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search client..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 h-11 w-64 bg-slate-50 border-none rounded-xl font-medium"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={fetchPharmacies}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest pl-8">Pharmacy Details</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Payment History</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">Duration</TableHead>
                                <TableHead className="pr-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPharmacies.map((p) => {
                                const isExpired = new Date(p.licenseExpiresAt) < new Date();
                                const startDate = p.licenseStartedAt ? new Date(p.licenseStartedAt).toLocaleDateString('en-PK', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                }) : 'N/A';
                                const expiryDate = new Date(p.licenseExpiresAt).toLocaleDateString('en-PK', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                });

                                return (
                                    <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
                                                    {p.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg">{p.name}</p>
                                                    <p className="text-sm text-slate-500 font-medium">Owner ID: {p.users[0]?.email || "N/A"}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Latest Fees</p>
                                                <p className="text-sm font-black text-emerald-600">Rs. {(p.subscriptionFee || 0).toLocaleString()}</p>
                                                <p className="text-[9px] font-bold text-slate-500">Total: Rs. {(p.totalPaid || 0).toLocaleString()}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${p.isActive && !isExpired
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${p.isActive && !isExpired ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'}`}></div>
                                                {p.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Blocked'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    Started: {startDate}
                                                </div>
                                                <div className={`flex items-center gap-2 font-black ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                                                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                                                    Expires: {expiryDate}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2 text-right items-center">
                                                <EditPharmacyModal pharmacy={p} onUpdate={fetchPharmacies} />
                                                <ManageLicenseModal pharmacy={p} onUpdate={fetchPharmacies} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredPharmacies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium pl-8">
                                        No pharmacies found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
