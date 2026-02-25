import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ShieldCheck,
    Clock,
    Search,
    RefreshCw,
    FilePenLine,
    Key,
    Copy,
    Check
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Pharmacy {
    id: number;
    name: string;
    licenseStartedAt: string;
    licenseExpiresAt: string;
    isActive: boolean;
    licenseNo?: string;
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
    const [email, setEmail] = useState(pharmacy.users[0]?.email?.split('@')[0] || "");
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
                    ownerEmail: `${email}@pharmacy.com`,
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-purple-600 rounded-lg">
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
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={email}
                                    onChange={e => setEmail(e.target.value.toLowerCase().replace(/\s/g, ""))}
                                    className="rounded-xl h-12 border-slate-100 pr-32"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 pointer-events-none bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    @pharmacy.com
                                </div>
                            </div>
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
    disabled?: boolean;
}

function ManageLicenseModal({ pharmacy, onUpdate, disabled }: ManageLicenseModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [months, setMonths] = useState(12);
    const [isActive] = useState(pharmacy.isActive);
    const [paidAmount, setPaidAmount] = useState(0);
    const [machineId, setMachineId] = useState("");
    const [generatedKey, setGeneratedKey] = useState("");
    const [loading, setLoading] = useState(false);

    const [testMinutes, setTestMinutes] = useState<number | null>(null);

    const now = new Date();
    const previewDate = new Date(pharmacy.licenseExpiresAt || now);
    if (testMinutes) {
        previewDate.setMinutes(previewDate.getMinutes() + testMinutes);
    } else {
        previewDate.setMonth(previewDate.getMonth() + Number(months));
    }

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
                    extraMonths: testMinutes ? undefined : Number(months),
                    extraMinutes: testMinutes || undefined,
                    isActive: isActive,
                    paidAmount: Number(paidAmount),
                    machineId: machineId.trim() || undefined
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.newKey) {
                    setGeneratedKey(data.newKey);
                } else {
                    setIsOpen(false);
                    onUpdate();
                }
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyKey = () => {
        navigator.clipboard.writeText(generatedKey);
        // Toast can be added here if available
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={`rounded-lg font-bold transition-all active:scale-95 ${disabled
                        ? 'opacity-40 grayscale cursor-not-allowed bg-slate-50 text-slate-400 border-slate-100'
                        : 'text-purple-600 hover:bg-purple-50 border-purple-100 shadow-sm'
                        }`}
                >
                    Renew / Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
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

                <div className="p-5 space-y-4 bg-white max-h-[85vh] overflow-y-auto">
                    {generatedKey ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 text-sm italic uppercase tracking-tighter">License Key Ready</h3>
                                <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest">Valid until: {previewDate.toLocaleDateString()}</p>

                                <div className="mt-3 w-full relative group">
                                    <textarea
                                        readOnly
                                        value={generatedKey}
                                        className="w-full h-24 p-2.5 bg-zinc-950 text-emerald-400 font-mono text-[9px] rounded-xl border border-zinc-800 resize-none focus:outline-none"
                                    />
                                    <button
                                        onClick={copyKey}
                                        className="absolute bottom-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    setGeneratedKey("");
                                    onUpdate();
                                }}
                                className="w-full h-11 bg-slate-900 hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition-all uppercase tracking-widest"
                            >
                                Done
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {/* Machine ID */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Machine Identifier</Label>
                                    <Input
                                        placeholder="Paste ID here..."
                                        value={machineId}
                                        onChange={e => setMachineId(e.target.value)}
                                        className="h-10 rounded-xl border-slate-100 font-mono text-[10px] focus:ring-purple-500 font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    {/* Status */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Status</Label>
                                        <div className="h-11 flex flex-col justify-center px-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-900 leading-none">Standard / Active</p>
                                        </div>
                                    </div>

                                    {/* Extension Toggle */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Extension Protocol</Label>
                                        <div className="flex bg-slate-100 p-0.5 rounded-xl h-11 border border-slate-200/50">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMonths(12);
                                                    setTestMinutes(null);
                                                }}
                                                className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${!testMinutes ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Standard
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMonths(0);
                                                    setTestMinutes(3);
                                                }}
                                                className={`flex-1 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${testMinutes ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Trial
                                            </button>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Span ({testMinutes !== null ? "Min" : "Months"})</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                value={testMinutes !== null ? testMinutes : (months || "")}
                                                onChange={e => {
                                                    const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                                    if (testMinutes !== null) setTestMinutes(val);
                                                    else setMonths(val);
                                                }}
                                                className={`rounded-xl h-11 border-slate-100 font-black text-slate-700 text-sm transition-all focus:ring-4 ${testMinutes ? 'focus:ring-red-500/10' : 'focus:ring-purple-500/10'}`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-[8px] text-slate-300 uppercase tracking-widest pointer-events-none">
                                                {testMinutes ? "Min" : "Months"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment (PKR)</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={paidAmount || ""}
                                                onChange={e => {
                                                    const value = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                                    setPaidAmount(value);
                                                }}
                                                className="rounded-xl h-11 border-slate-100 font-black text-emerald-600 text-sm transition-all focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-[8px] text-slate-300 uppercase tracking-widest pointer-events-none">Rs.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Presets */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quick Extension</Label>
                                    <div className="flex gap-2">
                                        {!testMinutes ? [1, 6, 12].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                className={`flex-1 h-9 rounded-xl font-black text-[9px] uppercase transition-all border ${months === m
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-purple-100'
                                                    }`}
                                                onClick={() => setMonths(m)}
                                            >
                                                {m === 12 ? "1 Year" : `${m}M`}
                                            </button>
                                        )) : [3, 15, 60].map((min) => (
                                            <button
                                                key={min}
                                                type="button"
                                                className={`flex-1 h-9 rounded-xl font-black text-[9px] uppercase transition-all border ${testMinutes === min
                                                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                                    : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-200'
                                                    }`}
                                                onClick={() => setTestMinutes(min)}
                                            >
                                                {min}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-purple-100/30 border-dashed text-center">
                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Deployment Expiry</p>
                                    <p className="text-[10px] font-black text-indigo-900 uppercase italic">
                                        {testMinutes
                                            ? previewDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
                                            : previewDate.toLocaleDateString('en-PK', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                        }
                                    </p>
                                </div>

                                <Button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="w-full h-11 bg-slate-900 hover:bg-purple-100/50 text-white font-black text-[10px] rounded-xl transition-all shadow-lg uppercase tracking-widest active:scale-95"
                                >
                                    {loading ? "Renewing..." : "Generate New Key"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function ManagedPharmacies() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [onboardedKey, setOnboardedKey] = useState("");
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [newPharmacy, setNewPharmacy] = useState({
        name: "",
        ownerEmail: "",
        ownerPassword: "",
        ownerName: "",
        months: 12,
        minutes: 0,
        paidAmount: 0
    });

    const [validationErrors, setValidationErrors] = useState({
        name: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        months: "",
        paidAmount: ""
    });

    const validateField = (field: string, value: any) => {
        let error = "";

        switch (field) {
            case "name":
                if (value.length < 3) error = "Pharmacy name must be at least 3 characters";
                else if (value.length > 50) error = "Pharmacy name cannot exceed 50 characters";
                break;
            case "ownerName":
                if (value.length < 3) error = "Owner name must be at least 3 characters";
                else if (value.length > 50) error = "Owner name cannot exceed 50 characters";
                else if (!/^[a-zA-Z\s]+$/.test(value)) error = "Owner name can only contain letters and spaces";
                break;
            case "ownerEmail":
                if (value.length < 3) error = "Email username must be at least 3 characters";
                else if (value.length > 30) error = "Email username cannot exceed 30 characters";
                else if (!/^[a-z0-9]+$/.test(value)) error = "Email can only contain lowercase letters and numbers";
                break;
            case "ownerPassword":
                if (value.length < 8) error = "Password must be at least 8 characters";
                else if (value.length > 20) error = "Password cannot exceed 20 characters";
                break;
            case "months":
                // If it's a trial (minutes > 0), 0 months is fine
                if (newPharmacy.minutes > 0 && value === 0) {
                    error = "";
                } else if (value < 1) {
                    error = "Minimum 1 month required";
                } else if (value > 36) {
                    error = "Maximum 36 months allowed";
                }
                break;
            case "paidAmount":
                if (value < 0) error = "Amount cannot be negative";
                else if (value > 1000000) error = "Amount cannot exceed Rs. 1,000,000";
                break;
        }

        setValidationErrors(prev => ({ ...prev, [field]: error }));
        return error === "";
    };



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

        // Validate all fields
        const isNameValid = validateField("name", newPharmacy.name);
        const isOwnerNameValid = validateField("ownerName", newPharmacy.ownerName);
        const isEmailValid = validateField("ownerEmail", newPharmacy.ownerEmail);
        const isPasswordValid = validateField("ownerPassword", newPharmacy.ownerPassword);
        const isMonthsValid = validateField("months", newPharmacy.months);
        const isPaidAmountValid = validateField("paidAmount", newPharmacy.paidAmount);

        if (!isNameValid || !isOwnerNameValid || !isEmailValid || !isPasswordValid || !isMonthsValid || !isPaidAmountValid) {
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/super/create-pharmacy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    pharmacyName: newPharmacy.name,
                    ownerEmail: `${newPharmacy.ownerEmail}@pharmacy.com`,
                    ownerPassword: newPharmacy.ownerPassword,
                    ownerName: newPharmacy.ownerName,
                    licenseMonths: newPharmacy.minutes > 0 ? undefined : Number(newPharmacy.months),
                    licenseMinutes: newPharmacy.minutes > 0 ? Number(newPharmacy.minutes) : undefined,
                    paidAmount: Number(newPharmacy.paidAmount)
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setIsAddModalOpen(false);
                fetchPharmacies();
                setNewPharmacy({ name: "", ownerEmail: "", ownerPassword: "", ownerName: "", months: 12, minutes: 0, paidAmount: 0 });
                setValidationErrors({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "", months: "", paidAmount: "" });

                // Show the activation key modal
                setOnboardedKey(result.data.activationKey);
                setShowKeyModal(true);
            } else {
                const data = await response.json();
                alert(`❌ Failed: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (err: any) {
            console.error(err);
            alert("❌ Network error. Please check if the server is running.");
        }
    };

    const isFormValid = () => {
        return newPharmacy.name.length >= 3 &&
            newPharmacy.ownerName.length >= 3 &&
            newPharmacy.ownerEmail.length >= 3 &&
            newPharmacy.ownerPassword.length >= 8 &&
            (newPharmacy.months >= 1 || newPharmacy.minutes > 0) &&
            newPharmacy.paidAmount >= 0 &&
            !validationErrors.name &&
            !validationErrors.ownerName &&
            !validationErrors.ownerEmail &&
            !validationErrors.ownerPassword &&
            !validationErrors.months &&
            !validationErrors.paidAmount;
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.users[0]?.email.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPharmacies = filteredPharmacies.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="p-8 bg-[#fafafa] min-h-screen space-y-8 pb-12">
            <div className="flex justify-between items-center bg-zinc-950 px-12 py-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full -ml-32 -mb-32 blur-[80px]"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-3">
                        Managed <span className="text-purple-500 italic drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">Entities</span>
                    </h1>
                    <p className="text-zinc-500 font-bold mt-1 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        Core Node Registry & Subscription Management
                    </p>
                </div>

                {/* Onboarding Success Modal */}
                <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                    <DialogContent className="sm:max-w-[400px] rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-emerald-600 p-5 text-white text-center">
                            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
                                <ShieldCheck className="h-7 w-7 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-black mb-0.5">Registration Successful!</DialogTitle>
                            <p className="text-emerald-100 text-[11px] font-medium">Pharmacy has been onboarded as restricted.</p>
                        </div>
                        <div className="p-5 space-y-4 bg-white">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Universal Activation Key</Label>
                                <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200 relative group">
                                    <p className="font-mono text-center text-[11px] font-black text-slate-700 break-all select-all leading-relaxed">
                                        {onboardedKey}
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(onboardedKey);
                                            alert("Key copied to clipboard!");
                                        }}
                                        className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg h-8 border-none shadow-none text-[10px]"
                                    >
                                        Copy Activation Key
                                    </Button>
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Instructions for Owner
                                </p>
                                <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                                    Provide this key to the pharmacy owner. They must enter it on their system's lock screen to activate and bind the license.
                                </p>
                            </div>

                            <Button
                                onClick={() => setShowKeyModal(false)}
                                className="w-full h-10 bg-slate-900 hover:bg-slate-800 font-black rounded-lg uppercase tracking-widest text-[10px] text-white"
                            >
                                I Have Saved the Key
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white h-14 px-7 rounded-2xl font-black shadow-xl shadow-purple-500/20 gap-3 text-base transition-all active:scale-95 border-none">
                            <ShieldCheck className="h-5 w-5" /> onboard node
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-5 text-white text-center">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-black flex items-center justify-center gap-2 text-white uppercase italic tracking-tighter">
                                    <ShieldCheck className="h-5 w-5" /> onboard node
                                </DialogTitle>
                            </DialogHeader>
                        </div>

                        <form onSubmit={handleCreatePharmacy} className="p-5 space-y-3.5 bg-white">
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Pharmacy Information</Label>
                                <Input
                                    placeholder="e.g. Al-Shifa Pharmacy"
                                    value={newPharmacy.name}
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (value.length <= 50) {
                                            setNewPharmacy({ ...newPharmacy, name: value });
                                            validateField("name", value);
                                        }
                                    }}
                                    required
                                    className={`rounded-xl h-10 border-slate-100 focus:ring-purple-500 font-bold text-xs ${validationErrors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                                />
                                <div className="flex justify-between items-center px-1">
                                    {validationErrors.name ? <p className="text-[8px] text-red-500 font-medium">{validationErrors.name}</p> : <div />}
                                    <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">{newPharmacy.name.length}/50 chars</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                                {/* Owner Name */}
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
                                    <Input
                                        placeholder="Full Name"
                                        value={newPharmacy.ownerName}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (value.length <= 50 && /^[a-zA-Z\s]*$/.test(value)) {
                                                setNewPharmacy({ ...newPharmacy, ownerName: value });
                                                validateField("ownerName", value);
                                            }
                                        }}
                                        required
                                        className={`rounded-xl h-10 border-slate-100 font-bold text-xs ${validationErrors.ownerName ? 'border-red-300 focus:ring-red-500' : ''}`}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        {validationErrors.ownerName ? <p className="text-[8px] text-red-500 font-medium">{validationErrors.ownerName}</p> : <div />}
                                        <p className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">{newPharmacy.ownerName.length}/50 chars</p>
                                    </div>
                                </div>

                                {/* Subscription Toggle */}
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Protocol</Label>
                                    <div className="flex bg-slate-100 p-0.5 rounded-xl h-10 border border-slate-200/50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewPharmacy({ ...newPharmacy, months: 12, minutes: 0 });
                                                setValidationErrors(prev => ({ ...prev, months: "" }));
                                            }}
                                            className={`flex-1 rounded-lg text-[8px] font-black uppercase transition-all duration-300 ${newPharmacy.minutes === 0 ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Standard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewPharmacy({ ...newPharmacy, months: 0, minutes: 3 });
                                                setValidationErrors(prev => ({ ...prev, months: "" }));
                                            }}
                                            className={`flex-1 rounded-lg text-[8px] font-black uppercase transition-all duration-300 ${newPharmacy.minutes > 0 ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Trial
                                        </button>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        Duration ({newPharmacy.minutes > 0 ? "Min" : "Months"})
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={newPharmacy.minutes > 0 ? newPharmacy.minutes : (newPharmacy.months || "")}
                                            onChange={e => {
                                                const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                                if (newPharmacy.minutes > 0) {
                                                    setNewPharmacy({ ...newPharmacy, minutes: val, months: 0 });
                                                } else {
                                                    setNewPharmacy({ ...newPharmacy, months: val, minutes: 0 });
                                                    validateField("months", val);
                                                }
                                            }}
                                            className={`rounded-xl h-10 border-slate-100 font-black text-slate-700 text-xs transition-all focus:ring-4 ${newPharmacy.minutes > 0 ? 'focus:ring-red-500/10' : 'focus:ring-purple-500/10'}`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-[7px] text-slate-300 uppercase tracking-widest pointer-events-none">
                                            {newPharmacy.minutes > 0 ? "Min" : "Months"}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment (PKR)</Label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="1000000"
                                            placeholder="0"
                                            value={newPharmacy.paidAmount || ""}
                                            onChange={e => {
                                                const value = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                                                if (value <= 1000000) {
                                                    setNewPharmacy({ ...newPharmacy, paidAmount: value });
                                                    validateField("paidAmount", value);
                                                }
                                            }}
                                            required
                                            className={`rounded-xl h-10 border-slate-100 font-black text-emerald-600 text-xs transition-all focus:ring-4 focus:ring-emerald-500/10 ${validationErrors.paidAmount ? 'border-red-300' : ''}`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-[7px] text-slate-300 uppercase tracking-widest pointer-events-none">Rs.</div>
                                    </div>
                                    {validationErrors.paidAmount && <p className="text-[8px] text-red-500 font-bold mt-1 ml-1">{validationErrors.paidAmount}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Credentials</Label>
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                placeholder="Username"
                                                value={newPharmacy.ownerEmail}
                                                onChange={e => {
                                                    const value = e.target.value.toLowerCase().replace(/\s/g, "");
                                                    if (value.length <= 30 && /^[a-z0-9]*$/.test(value)) {
                                                        setNewPharmacy({ ...newPharmacy, ownerEmail: value });
                                                        validateField("ownerEmail", value);
                                                    }
                                                }}
                                                required
                                                className={`rounded-xl h-10 border-slate-100 pr-16 text-[10px] font-black ${validationErrors.ownerEmail ? 'border-red-300 focus:ring-purple-500' : ''}`}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] font-black text-slate-400 pointer-events-none bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                                                @pms.com
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={newPharmacy.ownerPassword}
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (value.length <= 20) {
                                                    setNewPharmacy({ ...newPharmacy, ownerPassword: value });
                                                    validateField("ownerPassword", value);
                                                }
                                            }}
                                            required
                                            className={`rounded-xl h-10 border-slate-100 text-[10px] font-black ${validationErrors.ownerPassword ? 'border-red-300 focus:ring-purple-500' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 relative">
                                <div className="flex justify-between items-center px-2">
                                    <div className="text-center">
                                        <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Start</p>
                                        <p className="font-black text-slate-700 text-[9px]">{new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <div className="h-px bg-purple-200 flex-1 mx-4 relative">
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-purple-100 text-[7px] font-black text-purple-500">
                                            {newPharmacy.minutes > 0 ? `${newPharmacy.minutes}m` : `${newPharmacy.months}M`}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Expiry</p>
                                        <p className="font-black text-purple-600 text-[9px]">
                                            {(() => {
                                                const d = new Date();
                                                if (newPharmacy.minutes > 0) {
                                                    d.setMinutes(d.getMinutes() + newPharmacy.minutes);
                                                    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
                                                }
                                                d.setMonth(d.getMonth() + (Number(newPharmacy.months) || 0));
                                                return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!isFormValid()}
                                className={`w-full h-11 font-black text-[10px] rounded-xl transition-all shadow-lg uppercase tracking-widest active:scale-95 ${isFormValid()
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-100'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {isFormValid() ? 'Activate Node Instance' : 'Incomplete Fields'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div >

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Node Directory</CardTitle>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorized instances currently active in the network</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 h-11 w-72 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-xl border-slate-100"
                            onClick={fetchPharmacies}
                        >
                            <RefreshCw className="h-4 w-4 text-slate-400" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] pl-10 text-slate-400">Node Identifier</TableHead>
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financials</TableHead>
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol Status</TableHead>
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">License Span</TableHead>
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Keys / History</TableHead>
                                <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] pr-10 text-right text-slate-400">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPharmacies.map((p) => {
                                const isExpired = new Date(p.licenseExpiresAt) < new Date();
                                const startDate = p.licenseStartedAt ? new Date(p.licenseStartedAt).toLocaleDateString('en-PK', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                }) : 'N/A';
                                const expiryObj = new Date(p.licenseExpiresAt);
                                const isExpiringToday = expiryObj.toDateString() === new Date().toDateString();

                                const expiryDate = expiryObj.toLocaleDateString('en-PK', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    ...(isExpiringToday ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {})
                                });

                                return (
                                    <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl">
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
                                                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                                                    Expires: {expiryDate}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Subscription Key</p>
                                                <div className="flex items-center gap-2 group/key relative">
                                                    <div className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[10px] font-mono text-slate-600 max-w-[120px] truncate">
                                                        {p.licenseNo || "No Key Issued"}
                                                    </div>
                                                    {p.licenseNo && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-md hover:bg-purple-100 text-purple-600"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(p.licenseNo || "");
                                                                toast({
                                                                    title: "Key Copied!",
                                                                    description: "License key copied for " + p.name,
                                                                });
                                                            }}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex justify-end gap-2 text-right items-center">
                                                <EditPharmacyModal pharmacy={p} onUpdate={fetchPharmacies} />
                                                <ManageLicenseModal
                                                    pharmacy={p}
                                                    onUpdate={fetchPharmacies}
                                                    disabled={!isExpired && p.isActive}
                                                />
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

                {/* Pagination Controls */}
                {filteredPharmacies.length > 0 && (
                    <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="text-sm text-slate-600 font-medium">
                            Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{' '}
                            <span className="font-bold text-slate-900">{Math.min(endIndex, filteredPharmacies.length)}</span> of{' '}
                            <span className="font-bold text-slate-900">{filteredPharmacies.length}</span> pharmacies
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 rounded-xl font-bold disabled:opacity-40"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-9 w-9 rounded-xl font-bold ${currentPage === page
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'hover:bg-slate-100'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 rounded-xl font-bold disabled:opacity-40"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div >
    );
}
