import { Button } from "@/components/ui/button";
import { Pill, Scale, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
            {/* Minimal Header */}
            <nav className="h-20 border-b border-slate-100 px-6 lg:px-20 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <Button variant="ghost" className="gap-2 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter uppercase">MediCore <span className="text-blue-600">PMS</span></span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-20 px-6">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <Scale className="h-3.5 w-3.5" /> Legal Framework Compliance
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 leading-none uppercase">Service <span className="text-blue-600">Terms</span></h1>
                        <p className="text-slate-500 font-medium italic">Protocol v2.1.0 • Implementation Date: Feb 20, 2026</p>
                    </div>

                    <div className="space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-900">1. Software License</h2>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                MediCore PMS grants the license holder a non-exclusive, non-transferable terminal license to operate the pharmacy management system. This license is tied to a specific pharmacy entity and cannot be shared across multiple unregistered businesses.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight italic">Allowed Actions</h3>
                                <ul className="space-y-2 text-xs font-bold text-slate-400 list-none p-0">
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <span>Unlimited local inventory processing</span>
                                    </li>
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <span>Generation of 100% legal medicine bills</span>
                                    </li>
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        <span>Backup and restore of private database files</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] space-y-4">
                                <AlertCircle className="h-8 w-8 text-rose-600" />
                                <h3 className="text-lg font-black uppercase tracking-tight italic text-slate-900">Prohibited Use</h3>
                                <ul className="space-y-2 text-xs font-bold text-rose-700/70 list-none p-0">
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                                        <span>Manipulation of system audit logs</span>
                                    </li>
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                                        <span>Unauthorized reverse engineering of source modules</span>
                                    </li>
                                    <li className="flex gap-2 leading-relaxed">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                                        <span>Using the system for non-registered pharmacies</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-900">2. Subscription & Payments</h2>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                Access to the "Enterprise Shield" and synchronization features requires an active subscription. Failure to renew the subscription will result in a "License Lock," preventing access to the software until service fees are cleared.
                            </p>
                        </section>

                        <section className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Accepting the Protocol</h3>
                                <p className="text-xs font-bold text-blue-100 opacity-80 leading-relaxed uppercase tracking-widest">By logging into MediCore PMS, you automatically agree to the latest system terms and security conditions.</p>
                            </div>
                            <Button className="h-14 px-8 rounded-2xl bg-white text-blue-600 hover:bg-slate-100 font-black uppercase text-[10px] tracking-[0.2em]" onClick={() => navigate("/")}>
                                I Acknowledge
                            </Button>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-10 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 MediCore Technologies • Legal & Framework Compliance</p>
            </footer>
        </div>
    );
}
