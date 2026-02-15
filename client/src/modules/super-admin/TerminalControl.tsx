import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Terminal, AlertTriangle, ShieldCheck, Trash2, Lock, Users, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Pharmacy {
    id: number;
    name: string;
    licenseNo?: string;
    contact?: string;
    isActive: boolean;
    createdAt: string;
    users: { email: string }[];
}

export default function TerminalControl() {
    const [command, setCommand] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pharmacy: Pharmacy | null }>({
        open: false,
        pharmacy: null
    });
    const [terminalLog, setTerminalLog] = useState<string[]>([
        "Initializing master purge sequence...",
        "[OK] Connection established to cloud nodes.",
        "[OK] Encryption keys verified.",
        "[OK] Standby for administrative commands.",
        "[HINT] Type 'help' to see available commands."
    ]);

    const handleAuthorize = () => {
        if (passcode === "201171") {
            setIsAuthorized(true);
            fetchPharmacies();
        }
    };

    const fetchPharmacies = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/super/pharmacies", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setPharmacies(data);
            addLog(`[INFO] Loaded ${data.length} pharmacy accounts.`);
        } catch (error) {
            addLog("[ERROR] Failed to fetch pharmacy data.");
        }
    };

    const handleDeletePharmacy = async () => {
        if (!deleteDialog.pharmacy) return;

        try {
            const token = localStorage.getItem("token");
            addLog(`[EXEC] Deleting pharmacy: ${deleteDialog.pharmacy.name}...`);

            const response = await fetch(`http://localhost:5000/api/super/pharmacy/${deleteDialog.pharmacy.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                addLog(`[SUCCESS] Pharmacy "${deleteDialog.pharmacy.name}" deleted successfully.`);
                setPharmacies(prev => prev.filter(p => p.id !== deleteDialog.pharmacy!.id));
                setDeleteDialog({ open: false, pharmacy: null });
            } else {
                addLog(`[ERROR] Failed to delete pharmacy.`);
            }
        } catch (error) {
            addLog(`[ERROR] Network error during deletion.`);
        }
    };

    const handleCommand = async (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        addLog(`$ ${trimmedCmd}`);
        setCommand("");

        // Parse command
        const parts = trimmedCmd.toLowerCase().split(" ");
        const action = parts[0];

        if (action === "help") {
            addLog("[INFO] Available commands:");
            addLog("  delete pharmacy <name>  - Delete pharmacy by name");
            addLog("  delete email <email>    - Delete pharmacy by admin email");
            addLog("  list                    - Show all pharmacies");
            addLog("  clear                   - Clear terminal");
            addLog("  help                    - Show this help");
            return;
        }

        if (action === "clear") {
            setTerminalLog([]);
            return;
        }

        if (action === "list") {
            addLog(`[INFO] Total pharmacies: ${pharmacies.length}`);
            pharmacies.forEach(p => {
                addLog(`  - ${p.name} (ID: ${p.id}, Status: ${p.isActive ? 'Active' : 'Suspended'})`);
            });
            return;
        }

        if (action === "delete") {
            const subAction = parts[1];
            const searchTerm = parts.slice(2).join(" ");

            if (!subAction || !searchTerm) {
                addLog("[ERROR] Usage: delete pharmacy <name> OR delete email <email>");
                return;
            }

            let targetPharmacy: Pharmacy | undefined;

            if (subAction === "pharmacy") {
                targetPharmacy = pharmacies.find(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (subAction === "email") {
                targetPharmacy = pharmacies.find(p =>
                    p.users.some(u => u.email.toLowerCase() === searchTerm.toLowerCase())
                );
            } else {
                addLog("[ERROR] Invalid delete command. Use 'delete pharmacy <name>' or 'delete email <email>'");
                return;
            }

            if (!targetPharmacy) {
                addLog(`[ERROR] No pharmacy found matching: ${searchTerm}`);
                return;
            }

            // Show confirmation dialog
            setDeleteDialog({ open: true, pharmacy: targetPharmacy });
            addLog(`[WARN] Confirmation required for: ${targetPharmacy.name}`);
            return;
        }

        addLog(`[ERROR] Unknown command: ${action}. Type 'help' for available commands.`);
    };

    const addLog = (message: string) => {
        setTerminalLog(prev => [...prev, message]);
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchPharmacies();
        }
    }, [isAuthorized]);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen space-y-8 pb-12">
            {/* Header: High Security Area */}
            <div className="bg-red-950 px-12 py-12 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full -mr-40 -mt-20 blur-[80px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-300/60">Restricted Access</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            Terminal <span className="text-red-400">Purge Control</span>
                        </h1>
                        <p className="text-red-200/50 font-medium text-xs italic tracking-wide">
                            Critical maintenance tools for the global PharmaCloud ecosystem.
                        </p>
                    </div>

                    <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 border border-red-500/20">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                </div>
            </div>

            {!isAuthorized ? (
                <div className="flex justify-center pt-12">
                    <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl p-8 text-center space-y-6">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Lock className="h-10 w-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Authorization Required</h2>
                            <p className="text-slate-500 text-sm mt-2">Enter master passcode to unlock terminal controls.</p>
                        </div>
                        <div className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Master Passcode"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAuthorize()}
                                className="h-14 rounded-2xl border-slate-200 text-center text-lg tracking-[1em]"
                            />
                            <Button
                                onClick={handleAuthorize}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-widest text-sm"
                            >
                                Unlock Terminal
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Terminal */}
                        <Card className="border-none shadow-xl rounded-3xl bg-slate-900 p-6 text-emerald-400 font-mono">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <Terminal className="h-4 w-4" />
                                <span className="text-xs">pharmpro-master@system:~$</span>
                            </div>
                            <div className="h-[300px] overflow-y-auto space-y-2 text-sm">
                                {terminalLog.map((log, i) => (
                                    <p key={i} className={
                                        log.includes("[ERROR]") ? "text-red-400" :
                                            log.includes("[SUCCESS]") ? "text-emerald-400" :
                                                log.includes("[EXEC]") ? "text-yellow-400" :
                                                    "text-slate-500"
                                    }>{log}</p>
                                ))}
                                <div className="flex gap-2 items-center text-white">
                                    <span>$</span>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCommand(command)}
                                        className="bg-transparent border-none outline-none flex-1"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Pharmacy Accounts List */}
                        <Card className="border-none shadow-xl rounded-3xl bg-white p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-black text-lg text-slate-900">Registered Pharmacy Accounts</h3>
                                <span className="ml-auto text-xs font-bold text-slate-400">{pharmacies.length} Total</span>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {pharmacies.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">No pharmacy accounts found.</p>
                                ) : (
                                    pharmacies.map(pharmacy => (
                                        <div key={pharmacy.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-slate-900">{pharmacy.name}</h4>
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${pharmacy.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {pharmacy.isActive ? "Active" : "Suspended"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                                    <span>License: <strong>{pharmacy.licenseNo || "N/A"}</strong></span>
                                                    <span>Users: <strong>{pharmacy.users.length}</strong></span>
                                                    <span>ID: <strong>#{pharmacy.id}</strong></span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteDialog({ open: true, pharmacy })}
                                                className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-xl rounded-3xl bg-white p-6 space-y-4">
                            <div className="flex items-center gap-3 text-red-600 mb-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-black uppercase tracking-wider text-sm">Danger Zone</h3>
                            </div>

                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start gap-3 h-14 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl">
                                    <Trash2 className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="text-xs font-black">Flush Cloud Cache</p>
                                        <p className="text-[10px] text-red-400 font-medium">Clear all edge nodes</p>
                                    </div>
                                </Button>

                                <Button variant="outline" className="w-full justify-start gap-3 h-14 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl">
                                    <ShieldAlert className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="text-xs font-black">Force Global Logout</p>
                                        <p className="text-[10px] text-red-400 font-medium">Invalidate all sessions</p>
                                    </div>
                                </Button>

                                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase tracking-widest text-xs gap-2">
                                    <Trash2 className="h-4 w-4" /> Execute System Purge
                                </Button>
                            </div>
                        </Card>

                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-emerald-900 uppercase">System Integrity</p>
                                <p className="text-[10px] text-emerald-600 font-medium">All protocols healthy</p>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <p className="text-xs font-black text-indigo-900 uppercase">Quick Stats</p>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total Accounts:</span>
                                    <strong className="text-slate-900">{pharmacies.length}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Active:</span>
                                    <strong className="text-emerald-600">{pharmacies.filter(p => p.isActive).length}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Suspended:</span>
                                    <strong className="text-red-600">{pharmacies.filter(p => !p.isActive).length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, pharmacy: null })}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 mt-2">
                            This action is <strong>irreversible</strong>. All data associated with this pharmacy will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteDialog.pharmacy && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-4">
                            <p className="text-sm font-bold text-slate-900 mb-2">Pharmacy to be deleted:</p>
                            <p className="text-lg font-black text-red-600">{deleteDialog.pharmacy.name}</p>
                            <p className="text-xs text-slate-500 mt-1">ID: #{deleteDialog.pharmacy.id}</p>
                            <p className="text-xs text-slate-500">Users: {deleteDialog.pharmacy.users.length}</p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, pharmacy: null })}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeletePharmacy}
                            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Permanently
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
