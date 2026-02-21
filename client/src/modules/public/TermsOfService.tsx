import { Button } from "@/components/ui/button";
import { ShieldCheck, Scale, ArrowLeft, CheckCircle2, AlertCircle, Zap, Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
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
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-16">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                            <Scale className="h-3.5 w-3.5" /> Legal Framework Compliance
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black italic tracking-tighter text-white leading-none uppercase">Service <span className="text-indigo-500">Terms</span></h1>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Protocol v2.1.0 • Stable Build</p>
                    </div>

                    <div className="space-y-12">
                        <section className="space-y-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <Gavel size={100} />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-white flex items-center gap-4">
                                <span className="text-indigo-500">01.</span> Software License
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-400 font-bold opacity-90">
                                MediCore PMS grants the license holder a non-exclusive, non-transferable terminal license to operate the pharmacy management system. This license is tied to a specific hardware node and pharmacy entity and cannot be redistributed across unregistered branches or businesses.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-10 bg-indigo-600 rounded-[3rem] text-white space-y-6 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.3)] group">
                                <CheckCircle2 className="h-10 w-10 text-indigo-200 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black uppercase tracking-tight italic">White-List Ops</h3>
                                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.1em] text-indigo-100 list-none p-0">
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                                        <span>Unlimited local ledger processing</span>
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                                        <span>Official DRAP-Compliant Receipts</span>
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                                        <span>Cold-Storage database backups</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6 group">
                                <AlertCircle className="h-10 w-10 text-rose-500 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black uppercase tracking-tight italic text-white">Restricted Ops</h3>
                                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 list-none p-0">
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500/50 shrink-0" />
                                        <span>Manipulation of system audit traces</span>
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500/50 shrink-0" />
                                        <span>Module reverse engineering</span>
                                    </li>
                                    <li className="flex gap-4 items-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500/50 shrink-0" />
                                        <span>Multi-tenant license sharing</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <section className="space-y-6 p-10 bg-white/5 rounded-[3rem] border border-white/5 relative group overflow-hidden">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-white flex items-center gap-4">
                                <span className="text-indigo-500">02.</span> Subscription Protocols
                            </h2>
                            <p className="text-sm leading-relaxed text-slate-400 font-bold opacity-90">
                                Access to Enterprise synchronization and Shield features requires a verified active subscription. In the event of subscription expiration, the system will trigger a "Terminal Lock" protocol, preventing further data input until the license is renewed via our architect unit.
                            </p>
                        </section>

                        <section className="p-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                            <div className="flex-1 space-y-3 relative z-10">
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Protocol Acknowledgement</h3>
                                <p className="text-[10px] font-black text-indigo-100 opacity-80 uppercase tracking-widest leading-relaxed">By authenticating with MediCore PMS, you verify compliance with all listed protocols and security conditions.</p>
                            </div>
                            <Button
                                className="h-16 px-10 rounded-[1.5rem] bg-white text-indigo-600 hover:bg-slate-50 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl relative z-10"
                                onClick={() => navigate("/")}
                            >
                                Confirm & Handshake <Zap className="ml-2 h-4 w-4 fill-current" />
                            </Button>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 bg-black/30 backdrop-blur-xl text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter uppercase text-white">MEDICORE <span className="text-indigo-500">PMS</span></span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 leading-none">
                    © 2026 MediCore Technologies • Legal & Framework Compliance Active
                </p>
            </footer>
        </div>
    );
}
