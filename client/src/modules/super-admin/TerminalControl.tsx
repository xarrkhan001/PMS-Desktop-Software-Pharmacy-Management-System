import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Terminal, AlertTriangle, ShieldCheck, Trash2, Lock } from "lucide-react";

export default function TerminalControl() {
    const [command, setCommand] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [passcode, setPasscode] = useState("");

    const handleAuthorize = () => {
        if (passcode === "MASTER-PURGE-2026") {
            setIsAuthorized(true);
        }
    };

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
                        <Card className="border-none shadow-xl rounded-3xl bg-slate-900 p-6 text-emerald-400 font-mono">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <Terminal className="h-4 w-4" />
                                <span className="text-xs">pharmpro-master@system:~$</span>
                            </div>
                            <div className="h-[400px] overflow-y-auto space-y-2 text-sm">
                                <p>Initializing master purge sequence...</p>
                                <p className="text-slate-500">[OK] Connection established to cloud nodes.</p>
                                <p className="text-slate-500">[OK] Encryption keys verified.</p>
                                <p className="text-slate-500">[OK] Standby for administrative commands.</p>
                                <div className="flex gap-2 items-center text-white">
                                    <span>$</span>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                        className="bg-transparent border-none outline-none flex-1"
                                    />
                                </div>
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
                    </div>
                </div>
            )}
        </div>
    );
}
