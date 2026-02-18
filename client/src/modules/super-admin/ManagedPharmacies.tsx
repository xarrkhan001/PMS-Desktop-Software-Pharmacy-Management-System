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
    const [isActive, setIsActive] = useState(pharmacy.isActive);
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
                        : 'text-indigo-600 hover:bg-indigo-50 border-indigo-100 shadow-sm'
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

                <div className="p-6 space-y-5 bg-white max-h-[80vh] overflow-y-auto">
                    {generatedKey ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="font-black text-slate-900">New License Key Generated</h3>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Valid until {previewDate.toLocaleDateString()}</p>

                                <div className="mt-4 w-full relative">
                                    <textarea
                                        readOnly
                                        value={generatedKey}
                                        className="w-full h-32 p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] rounded-xl border border-zinc-800 resize-none focus:outline-none"
                                    />
                                    <button
                                        onClick={copyKey}
                                        className="absolute bottom-3 right-3 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Copy Key
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 italic">Copy this key and send it to the pharmacy owner.</p>
                            </div>
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    setGeneratedKey("");
                                    onUpdate();
                                }}
                                className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 font-black rounded-xl"
                            >
                                Close & Update List
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Client Machine ID (Optional for Lock)</Label>
                                    <Input
                                        placeholder="Paste Machine ID from client node..."
                                        value={machineId}
                                        onChange={e => setMachineId(e.target.value)}
                                        className="h-11 rounded-xl border-slate-100 font-mono text-xs focus:ring-indigo-500"
                                    />
                                    <p className="text-[9px] text-slate-400 italic font-medium ml-1">Provide ID to generate a hardware-locked license key.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Renew From</p>
                                        <p className="font-black text-slate-900 text-sm">Now / Expiry</p>
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
                                                className={`flex-1 h-11 rounded-xl font-bold text-xs transition-all border-2 ${months === m && !testMinutes
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'
                                                    }`}
                                                onClick={() => {
                                                    setMonths(m);
                                                    setTestMinutes(null);
                                                }}
                                            >
                                                {m === 12 ? "1 Year" : `${m}M`}
                                            </button>
                                        ))}
                                        {/* Testing Option */}
                                        <button
                                            type="button"
                                            className={`flex-1 h-11 rounded-xl font-bold text-[10px] transition-all border-2 border-dashed ${testMinutes === 3
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100'
                                                : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                                                }`}
                                            onClick={() => {
                                                setTestMinutes(3);
                                                setMonths(0);
                                            }}
                                        >
                                            🧪 3 MIN
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 border-dashed relative">
                                    <p className="text-center text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">New Expiration Date</p>
                                    <p className="text-center text-sm font-black text-indigo-900">
                                        {testMinutes
                                            ? previewDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                            : previewDate.toLocaleDateString('en-PK', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                        }
                                        {testMinutes && <span className="block text-[9px] text-red-500 mt-1 italic uppercase tracking-wider">(Today)</span>}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="w-full h-14 bg-[#0f172a] hover:bg-indigo-600 font-black text-sm rounded-2xl transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95"
                                >
                                    {loading ? "Processing..." : "Generate & Renew"}
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
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const generateSuggestions = (name: string) => {
        if (!name || name.length < 3) {
            setSuggestions([]);
            return;
        }
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const s1 = base;
        const s2 = `${base}${new Date().getFullYear()}`;
        const s3 = `pms-${base}`;
        // Unique suggestions
        setSuggestions(Array.from(new Set([s1, s2, s3])).slice(0, 3));
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
        <div className="p-8 bg-[#f8fafc] min-h-screen space-y-8 pb-12">
            <div className="flex justify-between items-center bg-indigo-950 px-12 py-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        Managed Pharmacies
                    </h1>
                    <p className="text-indigo-200/50 font-medium mt-1 text-xs italic tracking-wide">Monitor license status and technical health of client nodes.</p>
                </div>

                {/* Onboarding Success Modal */}
                <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-emerald-600 p-8 text-white text-center">
                            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                                <ShieldCheck className="h-10 w-10 text-white" />
                            </div>
                            <DialogTitle className="text-2xl font-black mb-1">Registration Successful!</DialogTitle>
                            <p className="text-emerald-100 text-sm font-medium">Pharmacy has been onboarded as restricted.</p>
                        </div>
                        <div className="p-8 space-y-6 bg-white">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Universal Activation Key</Label>
                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 relative group">
                                    <p className="font-mono text-center text-sm font-black text-slate-700 break-all select-all leading-relaxed">
                                        {onboardedKey}
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(onboardedKey);
                                            alert("Key copied to clipboard!");
                                        }}
                                        className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl h-10 border-none shadow-none text-xs"
                                    >
                                        Copy Activation Key
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Clock className="h-3.3 w-3.3" /> Instructions for Owner
                                </p>
                                <p className="text-[11px] text-amber-600 font-medium leading-relaxed">
                                    Provide this key to the pharmacy owner. They must enter it on their system's lock screen to activate and bind the license to their hardware.
                                </p>
                            </div>

                            <Button
                                onClick={() => setShowKeyModal(false)}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 font-black rounded-xl uppercase tracking-widest text-xs text-white"
                            >
                                I Have Saved the Key
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

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
                                    className={`rounded-xl h-12 border-slate-100 focus:ring-indigo-500 ${validationErrors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                                />
                                {validationErrors.name && <p className="text-xs text-red-500 font-medium mt-1">{validationErrors.name}</p>}
                                <p className="text-[9px] text-slate-400 font-medium">{newPharmacy.name.length}/50 characters</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Owner Name</Label>
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
                                        className={`rounded-xl h-12 border-slate-100 ${validationErrors.ownerName ? 'border-red-300 focus:ring-red-500' : ''}`}
                                    />
                                    {validationErrors.ownerName && <p className="text-xs text-red-500 font-medium mt-1">{validationErrors.ownerName}</p>}
                                    <p className="text-[9px] text-slate-400 font-medium">{newPharmacy.ownerName.length}/50 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subscription Details</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex gap-2 items-center">
                                            <div className="relative flex-1">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs text uppercase font-bold">M</div>
                                                <Input
                                                    type="number"
                                                    value={newPharmacy.months}
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        setNewPharmacy({ ...newPharmacy, months: val, minutes: 0 });
                                                        validateField("months", val);
                                                    }}
                                                    className="pl-8 rounded-xl h-12 border-slate-100 font-bold text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const isTest = newPharmacy.minutes > 0;
                                                    setNewPharmacy({ ...newPharmacy, minutes: isTest ? 0 : 3, months: isTest ? 12 : 0 });
                                                    // Clear month error if switching to trial
                                                    if (!isTest) {
                                                        setValidationErrors(prev => ({ ...prev, months: "" }));
                                                    }
                                                }}
                                                className={`h-12 px-3 rounded-xl font-black text-[10px] border-2 transition-all ${newPharmacy.minutes > 0
                                                    ? 'bg-red-600 border-red-600 text-white'
                                                    : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'}`}
                                            >
                                                {newPharmacy.minutes > 0 ? "3 MIN" : "TRIAL"}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rs.</div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="1000000"
                                                placeholder="Payment Amount"
                                                value={newPharmacy.paidAmount}
                                                onChange={e => {
                                                    const value = Number(e.target.value);
                                                    if (value <= 1000000) {
                                                        setNewPharmacy({ ...newPharmacy, paidAmount: value });
                                                        validateField("paidAmount", value);
                                                    }
                                                }}
                                                required
                                                className={`pl-10 rounded-xl h-12 border-slate-100 font-bold text-emerald-600 ${validationErrors.paidAmount ? 'border-red-300' : ''}`}
                                            />
                                            {validationErrors.paidAmount && <p className="text-xs text-red-500 font-medium mt-1 absolute -bottom-5 left-0">{validationErrors.paidAmount}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credentials & Username</Label>
                                    {suggestions.length > 0 && (
                                        <div className="flex gap-2">
                                            {suggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setNewPharmacy({ ...newPharmacy, ownerEmail: s })}
                                                    className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all animate-in fade-in slide-in-from-right-2"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                placeholder="Email User"
                                                value={newPharmacy.ownerEmail}
                                                onChange={e => {
                                                    const value = e.target.value.toLowerCase().replace(/\s/g, "");
                                                    if (value.length <= 30 && /^[a-z0-9]*$/.test(value)) {
                                                        setNewPharmacy({ ...newPharmacy, ownerEmail: value });
                                                        validateField("ownerEmail", value);
                                                    }
                                                }}
                                                required
                                                className={`rounded-xl h-12 border-slate-100 pr-24 ${validationErrors.ownerEmail ? 'border-red-300 focus:ring-red-500' : ''}`}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 pointer-events-none bg-slate-50 px-1.5 py-1 rounded-md border border-slate-100">
                                                @pharmacy.com
                                            </div>
                                        </div>
                                        {validationErrors.ownerEmail && <p className="text-xs text-red-500 font-medium">{validationErrors.ownerEmail}</p>}
                                        <p className="text-[9px] text-slate-400 font-medium">{newPharmacy.ownerEmail.length}/30 characters</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Password (8-20 chars)"
                                            value={newPharmacy.ownerPassword}
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (value.length <= 20) {
                                                    setNewPharmacy({ ...newPharmacy, ownerPassword: value });
                                                    validateField("ownerPassword", value);
                                                }
                                            }}
                                            required
                                            className={`rounded-xl h-12 border-slate-100 ${validationErrors.ownerPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                                        />
                                        {validationErrors.ownerPassword && <p className="text-xs text-red-500 font-medium">{validationErrors.ownerPassword}</p>}
                                        <p className="text-[9px] text-slate-400 font-medium">{newPharmacy.ownerPassword.length}/20 characters</p>
                                    </div>
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
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-indigo-100 text-[8px] font-black text-indigo-500">
                                            {newPharmacy.minutes > 0 ? "3m" : `${newPharmacy.months}M`}
                                        </div>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Expires</p>
                                        <p className="font-black text-indigo-600 text-[10px]">
                                            {(() => {
                                                const d = new Date();
                                                if (newPharmacy.minutes > 0) {
                                                    d.setMinutes(d.getMinutes() + newPharmacy.minutes);
                                                    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                                }
                                                d.setMonth(d.getMonth() + (Number(newPharmacy.months) || 0));
                                                return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!isFormValid()}
                                className={`w-full h-16 font-black text-sm rounded-2xl mt-2 transition-all shadow-xl uppercase tracking-widest active:scale-95 ${isFormValid()
                                    ? 'bg-[#0f172a] hover:bg-indigo-600 shadow-slate-200'
                                    : 'bg-slate-300 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                {isFormValid() ? 'Create Pharmacy & Account' : 'Please Fill All Required Fields'}
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
        </div>
    );
}
