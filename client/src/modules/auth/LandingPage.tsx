import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    ShieldCheck,
    Zap,
    ArrowRight,
    Lock,
    Database
} from "lucide-react";
import LoginModal from "./LoginModal";

import { useLocation, Link } from "react-router-dom";

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

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-indigo-500/30">
            <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} message={loginMessage} />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 lg:px-20 ${scrolled
                ? "h-20 bg-[#0a0a0c]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]"
                : "h-24 bg-transparent border-transparent"
                } flex items-center justify-between`}>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/40 group-hover:rotate-12 transition-transform duration-500">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-black italic tracking-tighter text-white uppercase">MediCore <span className="text-indigo-500">PMS</span></span>
                        <span className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Terminal</span>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-10">
                    {['Features', 'Security', 'Enterprise'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 transition-all group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/docs" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                        Documentation
                    </Link>
                    <Button
                        className="rounded-2xl px-8 h-12 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 font-black uppercase italic tracking-widest text-[10px] border-none flex items-center gap-3 group"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Login to Portal <div className="h-1.5 w-1.5 rounded-full bg-indigo-200 animate-pulse group-hover:bg-white" />
                    </Button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6 lg:px-20 overflow-hidden bg-[#0a0a0c]">
                    {/* Background Visual Elements */}
                    <div className="absolute inset-0 z-0">
                        {/* Soft Mesh Gradients */}
                        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[150px]"></div>

                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-0 invert"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                        {/* Left Side: Copy & Actions */}
                        <div className="flex-1 space-y-10 text-center lg:text-left">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl animate-fade-in-down">
                                    <div className="h-4 w-4 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <span>Terminal V1.0 Stable Build</span>
                                </div>
                                <h1 className="text-6xl lg:text-[7.5rem] font-black italic tracking-tighter text-white leading-[0.85] uppercase">
                                    Pharma <br />
                                    <span className="text-indigo-500">Command.</span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-slate-400 font-medium leading-tight max-w-xl mx-auto lg:mx-0">
                                    The definitive <span className="text-indigo-400 font-black">PMS System</span> for modern pharmacies.
                                    <span className="text-white"> Zero latency. Total security.</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                                <Button
                                    size="lg"
                                    className="h-20 px-12 rounded-[2rem] text-xl shadow-[0_25px_60px_-15px_rgba(79,70,229,0.5)] bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:-translate-y-1 active:scale-95 font-black uppercase italic tracking-tighter gap-4"
                                    onClick={() => setIsLoginOpen(true)}
                                >
                                    Launch Terminal <ArrowRight className="h-6 w-6" />
                                </Button>
                                <Link to="/docs" className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-20 px-12 rounded-[2rem] text-xl border-2 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase italic tracking-tighter text-white transition-all w-full"
                                    >
                                        System Guide
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-4 opacity-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Database className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Database</span>
                                        <span className="text-sm font-black text-white">AES-256 Ledger</span>
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Performance</span>
                                        <span className="text-sm font-black text-white">Zero Latency</span>
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Compliance</span>
                                        <span className="text-sm font-black text-white">PCS & FBR Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Advanced Application Mock */}
                        <div className="flex-1 relative w-full lg:max-w-[700px]">
                            <div className="relative z-10 bg-[#0d0d11] rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-[12px] border-white/5 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-all duration-1000 group">
                                <div className="bg-[#0a0a0c] rounded-[2rem] flex flex-col h-[500px]">
                                    <div className="h-14 border-b border-white/5 flex items-center px-10 gap-3">
                                        <div className="flex gap-2 text-white/20">
                                            <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                                            <div className="h-2 w-2 rounded-full bg-amber-500/50"></div>
                                            <div className="h-2 w-2 rounded-full bg-emerald-500/50"></div>
                                        </div>
                                        <div className="ml-6 h-3 w-40 bg-white/5 rounded-full"></div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2 h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                    <Zap size={100} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-200">Total Net Liquidity</p>
                                                    <p className="text-4xl font-black tracking-tighter">Rs. 842,500.00</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full font-black uppercase tracking-widest">+ 12.5% Today</span>
                                                </div>
                                            </div>
                                            <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                                                <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                                                    <ShieldCheck className="h-6 w-6" />
                                                </div>
                                                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                            </div>
                                            <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center">
                                                <div className="h-10 w-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                                                    <Zap className="h-6 w-6" />
                                                </div>
                                                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 -right-4 z-20 bg-[#16161a] p-4 rounded-2xl shadow-xl border border-white/10 animate-bounce-slow flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Auth Level</p>
                                    <p className="text-xs font-black text-white">Military Grade</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Highlights */}
                <section id="features" className="py-24 px-6 lg:px-20 bg-[#0c0c0e] border-y border-white/5 scroll-mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white uppercase tracking-tighter">Essential <span className="text-indigo-500 italic">Modules.</span></h2>
                            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Built for precision. Optimized for scale. Trusted by experts.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-500">
                                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 transition-transform">
                                    <Zap className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Offline Operations</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Full functionality without internet. Your data stays on your machine, ensuring zero downtime and maximum speed.
                                </p>
                            </div>
                            <div className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-500">
                                <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Inventory Ledger</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Auto-tracking of batch numbers, expiry dates, and low-stock alerts. Never run out of life-saving medicines.
                                </p>
                            </div>
                            <div className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all duration-500">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                                    <Zap className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">Fast-Track POS</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Process orders in seconds with barcode scanning and thermal printer integration. Designed for high volume.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section id="security" className="py-24 px-6 lg:px-20 relative overflow-hidden scroll-mt-16 bg-[#0a0a0c]">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-black italic tracking-tight text-white uppercase leading-[0.9]">Bank-Grade <br /><span className="text-indigo-500">Secure Protocol.</span></h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-medium">
                                We utilize military-grade AES-256 standards and RSA asymmetric encryption to ensure pharmacy data is inaccessible to unauthorized actors.
                            </p>
                            <ul className="space-y-5">
                                {[
                                    "End-to-End Database Encryption",
                                    "Physical Storage Guard (Local First)",
                                    "Comprehensive Audit Trace Logs",
                                    "Hardware-Based Multi-Factor Keys"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 font-bold text-slate-300">
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1">
                            <div className="aspect-video bg-[#0d0d11] rounded-[3rem] border-8 border-white/5 shadow-3xl overflow-hidden flex items-center justify-center group relative">
                                <ShieldCheck size={140} className="text-indigo-500/10 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl animate-bounce-slow">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">TLS 1.3 Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enterprise Section */}
                <section id="enterprise" className="py-24 px-6 lg:px-20 bg-indigo-600 text-white scroll-mt-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">Enterprise <span className="text-indigo-200">Scale.</span></h2>
                                <p className="text-indigo-100 max-w-xl font-bold">Engineered for large-scale medical operations and multi-regional pharmacy networks.</p>
                            </div>
                            <Button size="lg" className="h-16 rounded-full px-10 text-lg font-black uppercase italic bg-white text-indigo-600 hover:bg-slate-100 shadow-2xl">
                                System Inquiry
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "Chain Management", desc: "Unified command center for 100+ branches." },
                                { title: "Custom Analytics", desc: "Advanced business intelligence engine." },
                                { title: "API Protocols", desc: "Seamless interoperability with hospital HIS." },
                                { title: "Elite Support", desc: "24/7 dedicated engineering task force." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-10 rounded-[2.5rem] bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
                                    <h4 className="text-xl font-black mb-4 uppercase tracking-tighter italic text-white">{item.title}</h4>
                                    <p className="text-indigo-100 text-sm leading-relaxed font-bold opacity-80">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 px-6 lg:px-20 border-t border-white/5 bg-[#0a0a0c]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                                    <ShieldCheck className="h-6 w-6 text-indigo-500" />
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">MEDICORE <span className="text-indigo-500">PMS</span></span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-xs leading-relaxed font-bold">
                                Next-gen pharmacy terminal. Engineered for extreme reliability and state-of-the-art security protocols.
                            </p>
                        </div>

                        {/* Developer Info */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Architect & Developer</h4>
                            <div className="flex items-center gap-5 group">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-indigo-900/40 transform hover:-rotate-12 transition-transform">
                                    A
                                </div>
                                <div>
                                    <p className="text-md font-black text-white group-hover:text-indigo-500 transition-colors uppercase italic tracking-tighter">Abuzar</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Lead Software Engineer</p>
                                    <div className="mt-4 space-y-1.5">
                                        <a href="mailto:abuzarktk123@gmail.com" className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-black block tracking-widest">abuzarktk123@gmail.com</a>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">+92 317 8521144</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">+92 342 9752032</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-20">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Resources</h4>
                                <ul className="space-y-3 text-xs font-black text-slate-500 uppercase tracking-widest italic">
                                    <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                                    <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                            © 2026 MediCore Technologies. All Rights Reserved.
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">V 1.0.4 Stable Build Active</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
}
