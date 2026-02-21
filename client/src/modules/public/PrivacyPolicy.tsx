import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, Lock, Globe, EyeOff, Server, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <nav className="h-20 border-b border-white/5 px-6 lg:px-20 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-2xl z-50">
                <Button
                    variant="ghost"
                    className="gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-xl px-6 text-slate-400 hover:text-white transition-all"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-4 w-4" /> System Hub
                </Button>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter uppercase whitespace-nowrap">MediCore <span className="text-indigo-500">PMS</span></span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-24 px-6 relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" /> Latest Security Protocol Active
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black italic tracking-tighter text-white leading-none uppercase">Privacy <span className="text-indigo-500">Protocol</span></h1>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Registry Update: February 21, 2026</p>
                    </div>

                    <div className="space-y-12">
                        <section className="space-y-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={100} />
                            </div>
                            <div className="flex items-center gap-4 text-indigo-400">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight italic m-0 text-white leading-none">Data Sovereignty</h2>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400 font-bold opacity-90">
                                MediCore PMS is designed with a "Local-First" architectural mandate. 100% of your pharmacy's sales data, patient sensitive information, and financial records are stored directly on your station's encrypted physical drive. We do not transmit core business data to any central authority without your explicit administrative sync trigger.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="space-y-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white italic flex items-center gap-3">
                                    <EyeOff className="h-5 w-5 text-indigo-500" /> Collection Scope
                                </h3>
                                <ul className="space-y-4 text-xs text-slate-400 font-bold list-none p-0">
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <span>Authentication nodes (Hashed & Salted SHA-256)</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <span>Hardware-level Terminal ID for license pairing</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                        <span>System runtime telemetry (Anonymized)</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white italic flex items-center gap-3">
                                    <Server className="h-5 w-5 text-emerald-500" /> Defense Standards
                                </h3>
                                <ul className="space-y-4 text-xs text-slate-400 font-bold list-none p-0">
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>AES-256 Bit Cold Storage Encryption</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>TLS 1.3 Asymmetric Sync Encryption</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>Hardware-Linked Access Verification Control</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <section className="p-10 border border-indigo-500/20 bg-indigo-500/5 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10 group">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white italic flex items-center gap-3">
                                    <Database className="h-5 w-5 text-indigo-400" /> Data Protection Unit
                                </h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Compliance & System Core Defense Department</p>
                            </div>
                            <Button
                                className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                                onClick={() => window.open("mailto:abuzarktk123@gmail.com")}
                            >
                                <Globe className="h-4 w-4 mr-2" /> Technical Inquiry
                            </Button>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 bg-black/30 backdrop-blur-xl text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter uppercase text-white">MEDICORE <span className="text-indigo-500">PMS</span></span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 leading-none">
                    © 2026 MediCore Technologies • Secured by MediCore Shield Protocol
                </p>
            </footer>
        </div>
    );
}
