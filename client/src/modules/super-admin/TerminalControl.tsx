import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Trash2,
    Search,
    AlertOctagon,
    ArrowRight,
    RefreshCw,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Pharmacy {
    id: number;
    name: string;
    users: { email: string }[];
}

export default function TerminalControl() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [confirmName, setConfirmName] = useState("");
    const { toast } = useToast();

    const fetchPharmacies = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/super/pharmacies", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) setPharmacies(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const handleDelete = async () => {
        if (!selectedPharmacy || confirmName !== selectedPharmacy.name) return;

        try {
            const response = await fetch(`http://localhost:5000/api/super/pharmacy/${selectedPharmacy.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.ok) {
                toast({
                    title: "System Purge Complete",
                    description: `${selectedPharmacy.name} has been permanently erased.`,
                    variant: "destructive"
                });
                setSelectedPharmacy(null);
                setConfirmName("");
                fetchPharmacies();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = pharmacies.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.users[0]?.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Warning Header */}
            <div className="bg-red-950 p-10 rounded-[3rem] text-white shadow-2xl shadow-red-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-red-600/20 transition-all duration-500"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 text-red-100">
                        <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/50 animate-pulse">
                            <ShieldAlert className="h-8 w-8 text-white" />
                        </div>
                        Terminal <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">Purge</span>
                    </h1>
                    <p className="text-red-200/60 font-medium mt-4 text-lg max-w-2xl">
                        WARNING: This is the system terminal. Actions performed here are permanent.
                        Deleting a pharmacy will erase all medicines, sales, and user accounts associated with it.
                        There is no undo.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search & List */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 italic">Select Endpoint</CardTitle>
                                <CardDescription className="font-medium">Choose a pharmacy node to finalize.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={fetchPharmacies} className="rounded-full hover:bg-slate-100">
                                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Locate pharmacy by name or ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-lg focus:ring-red-500"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-[500px] overflow-y-auto">
                        <div className="space-y-3">
                            {filtered.map(p => (
                                <div
                                    key={p.id}
                                    className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center ${selectedPharmacy?.id === p.id
                                        ? 'bg-red-50 border-red-500 shadow-lg shadow-red-100'
                                        : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setSelectedPharmacy(p)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl ${selectedPharmacy?.id === p.id ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {p.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg">{p.name}</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{p.users[0]?.email}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className={`h-6 w-6 transition-transform ${selectedPharmacy?.id === p.id ? 'translate-x-2 text-red-500' : 'text-slate-200'}`} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Finalize Action */}
                <div className="space-y-8">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden h-full">
                        <div className="absolute bottom-0 right-0 p-8 opacity-10 rotate-12">
                            <AlertOctagon className="h-48 w-48" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic text-red-500">Execution Panel</h3>
                                <p className="text-slate-400 font-medium">Final confirmation for system purge.</p>
                            </div>

                            {selectedPharmacy ? (
                                <div className="space-y-8">
                                    <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-[2rem] space-y-4">
                                        <div className="flex items-center gap-3 text-red-400">
                                            <Info className="h-5 w-5" />
                                            <p className="text-xs font-black uppercase tracking-widest">Selected Target</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black">{selectedPharmacy.name}</p>
                                            <p className="text-slate-500 text-sm italic font-medium">Node #{selectedPharmacy.id}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-300">To confirm, type the pharmacy name exactly as shown above:</p>
                                        <Input
                                            value={confirmName}
                                            onChange={e => setConfirmName(e.target.value)}
                                            placeholder="Enter name to confirm..."
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-center text-red-500 focus:ring-red-500 text-lg"
                                        />
                                    </div>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                disabled={confirmName !== selectedPharmacy.name}
                                                className="w-full h-20 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-red-500/20 gap-3 group"
                                            >
                                                <Trash2 className="h-6 w-6 group-hover:animate-bounce" />
                                                PURGE SYSTEM NODE
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[400px] rounded-[3rem] p-10 border-none shadow-2xl">
                                            <div className="text-center space-y-6">
                                                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <AlertOctagon className="h-10 w-10 text-red-600 animate-pulse" />
                                                </div>
                                                <DialogHeader>
                                                    <DialogTitle className="text-3xl font-black text-slate-900">ARE YOU SURE?</DialogTitle>
                                                    <DialogDescription className="text-slate-500 font-medium pt-2">
                                                        This will permanently delete <span className="text-red-600 font-black">{selectedPharmacy.name}</span> and all its data. This action is irreversible.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="flex flex-col gap-3 sm:flex-col pt-4">
                                                    <Button
                                                        onClick={handleDelete}
                                                        className="w-full h-14 bg-red-600 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100"
                                                    >
                                                        YES, DELETE FOREVER
                                                    </Button>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-400 hover:text-slate-900">
                                                            CANCEL
                                                        </Button>
                                                    </DialogTrigger>
                                                </DialogFooter>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ) : (
                                <div className="h-64 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <ShieldAlert className="h-12 w-12 opacity-20" />
                                    <p className="font-black text-sm uppercase tracking-widest text-center px-8">Select a node from the list to initialize purge</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
