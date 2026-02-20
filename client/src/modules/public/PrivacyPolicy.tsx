import { Button } from "@/components/ui/button";
import { Pill, ShieldCheck, ArrowLeft, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
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
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <ShieldCheck className="h-3.5 w-3.5" /> Latest Security Protocol Active
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 leading-none uppercase">Privacy <span className="text-blue-600">Protocol</span></h1>
                        <p className="text-slate-500 font-medium">Last Updated: February 20, 2026</p>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-12">
                        <section className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-3 text-blue-600">
                                <Lock className="h-6 w-6" />
                                <h2 className="text-xl font-black uppercase tracking-tight italic m-0 text-slate-900">Data Sovereignty</h2>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium">
                                MediCore PMS is designed with "Local-First" architecture. This means 100% of your pharmacy's sales data, patient information, and inventory records are stored directly on your computer's hard drive. We do not upload your core business data to any central server without your explicit synchronization triggers.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">What We Collect</h3>
                                <ul className="space-y-3 text-sm text-slate-600 font-medium list-none p-0">
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                        <span>Authentication credentials (hashed & salted)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                        <span>Terminal license verification data</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                        <span>Software usage analytics (anonymous)</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Security Standards</h3>
                                <ul className="space-y-3 text-sm text-slate-600 font-medium list-none p-0">
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span>AES-256 Bit Database Encryption</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span>TLS 1.3 Secure Synchronization</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                        <span>Automatic Audit Trail Generation</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <section className="py-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 italic">Data Protection Officer</h3>
                                <p className="text-sm text-slate-500 font-medium">Compliance & Security Department</p>
                            </div>
                            <Button className="h-14 px-8 rounded-2xl bg-slate-900 font-bold uppercase text-xs tracking-widest gap-2">
                                <Globe className="h-4 w-4" /> Download Full PDF Policy
                            </Button>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-10 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 MediCore Technologies • Secured by MediCore Shield</p>
            </footer>
        </div>
    );
}
