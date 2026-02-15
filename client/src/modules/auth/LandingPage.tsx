import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Pill,
    CheckCircle2,
    ShieldCheck,
    Zap,
    ArrowRight,
    LayoutDashboard,
    Lock
} from "lucide-react";
import LoginModal from "./LoginModal";

import { useLocation } from "react-router-dom";

export default function LandingPage() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const location = useLocation();
    const [loginMessage, setLoginMessage] = useState("");

    useEffect(() => {
        if (location.state?.message) {
            setLoginMessage(location.state.message);
            setIsLoginOpen(true);
            // Clear state so it doesn't persist on refresh? 
            // Better to keep it until they login or verify.
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} message={loginMessage} />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg px-6 lg:px-20 h-16 flex items-center justify-between transition-all duration-300">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm border border-primary/20">
                        <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pharm<span className="text-blue-600 dark:text-blue-500">Pro</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#security" className="hover:text-primary transition-colors">Security</a>
                    <a href="#enterprise" className="hover:text-primary transition-colors">Enterprise</a>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full"
                        onClick={() => window.location.href = '#features'}
                    >
                        Learn More
                    </Button>
                    <Button
                        className="rounded-full px-8 h-11 shadow-2xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 font-bold border-none"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Login to Portal
                    </Button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-28 pb-24 lg:pt-36 lg:pb-40 px-6 lg:px-20 overflow-hidden min-h-[90vh] flex items-center">
                    {/* Background Hero Image with Deep Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=2079&auto=format&fit=crop"
                            alt="Professional Pharmacy Environment"
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Multi-layered Light Premium Overlays */}
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-blue-50/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    </div>

                    {/* Animated Particles/Orbs for Light Theme */}
                    <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/5 backdrop-blur-md text-blue-600 border border-blue-200 text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <span>#1 Professional Pharmacy Software in Pakistan</span>
                            </div>
                            <h1 className="text-5xl lg:text-[5.5rem] font-black tracking-tight text-slate-900 leading-[0.95]">
                                Manage Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-800 italic">Pharmacy.</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-90">
                                The ultimate desktop management system for modern healthcare.
                                Secure local storage, high-speed billing, and zero internet dependency.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Button size="lg" className="h-16 px-10 rounded-2xl text-lg shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] bg-blue-600 hover:bg-blue-500 text-white transition-all hover:-translate-y-1 active:scale-95 font-black flex items-center gap-3 group border-none" onClick={() => setIsLoginOpen(true)}>
                                    Launch Software <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg border-2 border-slate-200 hover:border-blue-600 hover:bg-white hover:text-blue-600 bg-white/50 backdrop-blur-md font-bold text-slate-900 transition-all">
                                    Product Demo
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-2">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <span className="uppercase tracking-widest">Offline Ready</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <span className="uppercase tracking-widest">AES-256 Auth</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    <span className="uppercase tracking-widest">Enterprise Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Dashboard Preview */}
                        <div className="w-full flex-1 relative animate-slide-up-fade lg:block hidden">
                            <div className="relative z-10 bg-blue-600/5 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(30,58,138,0.2)] border border-blue-100 p-4 transform lg:rotate-3 hover:rotate-0 transition-all duration-1000 ease-out group">
                                <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-blue-900/10 min-h-[460px] flex flex-col shadow-inner">
                                    {/* Mock Header */}
                                    <div className="h-16 border-b border-white/5 bg-slate-900/50 flex items-center px-8 gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                            <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        </div>
                                        <div className="ml-6 h-4 w-48 bg-white/10 rounded-full animate-pulse"></div>
                                    </div>
                                    {/* Mock Content */}
                                    <div className="p-10 grid grid-cols-2 gap-8">
                                        <div className="col-span-2 h-44 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                                            <div className="absolute -top-10 -right-10 opacity-10">
                                                <LayoutDashboard className="h-48 w-48" />
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Revenue Metrics</div>
                                            <div className="text-5xl font-black tracking-tighter">Rs. 2.48M</div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-[10px] bg-white/20 w-fit px-3 py-1 rounded-full font-black uppercase">+18.2% Growth</div>
                                                <span className="text-xs font-bold text-blue-100 opacity-60 italic">Real-time stats</span>
                                            </div>
                                        </div>
                                        <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
                                                <Pill className="h-7 w-7" />
                                            </div>
                                            <div className="h-3 w-24 bg-white/10 rounded-full"></div>
                                        </div>
                                        <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                                                <Zap className="h-7 w-7" />
                                            </div>
                                            <div className="h-3 w-24 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Check Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 flex items-center gap-4 animate-bounce-slow z-20">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="h-7 w-7 text-emerald-600" />
                                </div>
                                <div className="pr-4">
                                    <p className="font-bold text-slate-900 dark:text-white">PCR Verified</p>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">License Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Highlights */}
                <section id="features" className="py-24 px-6 lg:px-20 bg-slate-50 dark:bg-slate-900/50 border-y dark:border-slate-800 scroll-mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white">Everything you need to <span className="text-primary italic">Scale.</span></h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">Our platform is built by pharmacists, for pharmacists. We understand the complexity of modern healthcare retail.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-3">Offline Operations</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    Full functionality without internet. Your data stays on your machine, ensuring zero downtime and maximum speed.
                                </p>
                            </div>
                            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-3">Inventory Ledger</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    Auto-tracking of batch numbers, expiry dates, and low-stock alerts. Never run out of life-saving medicines.
                                </p>
                            </div>
                            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-3">Fast-Track POS</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    Process orders in seconds with barcode scanning and thermal printer integration. Designed for high volume.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section id="security" className="py-24 px-6 lg:px-20 relative overflow-hidden scroll-mt-16">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">Bank-Grade <br /><span className="text-primary">Medical Security.</span></h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                Your pharmacy data is sensitive. We use military-grade AES-256 encryption to ensure that patient records and financial data remain private.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Encrypted Database Backups",
                                    "Two-Factor Authentication (2FA)",
                                    "Audit Logs for every action",
                                    "Biometric Login Support"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
                                        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-video bg-slate-900 rounded-[2rem] border-8 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center group">
                                <ShieldCheck className="h-32 w-32 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Encrypted</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">TLS 1.3 Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enterprise Section */}
                <section id="enterprise" className="py-24 px-6 lg:px-20 bg-slate-900 text-white scroll-mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <h2 className="text-4xl lg:text-5xl font-bold uppercase tracking-tighter">Enterprise <span className="text-primary italic">Solutions.</span></h2>
                                <p className="text-slate-400 max-w-xl">Built for large-scale pharmacy chains and multi-location medical groups across Pakistan.</p>
                            </div>
                            <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100">
                                Schedule Demo
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "Chain Management", desc: "Manage 100+ branches from a single unified master dashboard." },
                                { title: "Advanced BI", "desc": "Business intelligence tools for deep financial and stock analysis." },
                                { title: "API Integration", "desc": "Seamlessly connect with local hospitals and insurance providers." },
                                { title: "24/7 Support", "desc": "Dedicated account manager and technical team at your service." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-primary transition-colors">
                                    <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 lg:px-20 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <Pill className="h-5 w-5" />
                        <span className="text-sm font-semibold">PharmPro © 2026</span>
                    </div>
                    <div className="flex gap-8 text-xs text-slate-500 font-medium">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
