import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Pill,
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
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} message={loginMessage} />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 lg:px-20 ${scrolled
                ? "h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]"
                : "h-24 bg-transparent border-transparent"
                } flex items-center justify-between`}>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 dark:shadow-blue-900/20 group-hover:rotate-12 transition-transform duration-500">
                        <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">MediCore <span className="text-blue-600">PMS</span></span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Terminal</span>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-10">
                    {['Features', 'Security', 'Enterprise'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/docs" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Documentation
                    </Link>
                    <Button
                        className="rounded-2xl px-8 h-12 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 font-black uppercase italic tracking-widest text-[10px] border-none flex items-center gap-3 group"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Login to Portal <div className="h-1.5 w-1.5 rounded-full bg-blue-200 animate-pulse group-hover:bg-white" />
                    </Button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 px-6 lg:px-20 overflow-hidden bg-white dark:bg-slate-950">
                    {/* Background Visual Elements */}
                    <div className="absolute inset-0 z-0">
                        {/* Soft Mesh Gradients */}
                        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[150px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[150px]"></div>

                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-0 invert dark:invert-0"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                        {/* Left Side: Copy & Actions */}
                        <div className="flex-1 space-y-10 text-center lg:text-left">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl animate-fade-in-down">
                                    <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                                    <span>Terminal V1.0 Stable Build</span>
                                </div>
                                <h1 className="text-6xl lg:text-[7.5rem] font-black italic tracking-tighter text-slate-900 dark:text-white leading-[0.85] uppercase">
                                    Pharma <br />
                                    <span className="text-blue-600 dark:text-blue-500">Command.</span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-tight max-w-xl mx-auto lg:mx-0">
                                    The definitive <span className="text-blue-600 font-black">PMS System</span> for modern pharmacies.
                                    <span className="text-slate-900 dark:text-white"> Zero latency. Total security.</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                                <Button
                                    size="lg"
                                    className="h-20 px-12 rounded-[2rem] text-xl shadow-[0_25px_60px_-15px_rgba(37,99,235,0.4)] bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:-translate-y-1 active:scale-95 font-black uppercase italic tracking-tighter gap-4"
                                    onClick={() => setIsLoginOpen(true)}
                                >
                                    Launch Terminal <ArrowRight className="h-6 w-6" />
                                </Button>
                                <Link to="/docs" className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-20 px-12 rounded-[2rem] text-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-all w-full"
                                    >
                                        System Guide
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-4 opacity-80 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <Database className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">AES-256 Ledger</span>
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Zero Latency</span>
                                    </div>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">PCS & FBR Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Advanced Application Mock */}
                        <div className="flex-1 relative w-full lg:max-w-[700px]">
                            {/* Main App Window */}
                            <div className="relative z-10 bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-slate-800 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-all duration-1000 group">
                                <div className="bg-slate-900 rounded-[2rem] flex flex-col h-[500px]">
                                    {/* App Header */}
                                    <div className="h-14 border-b border-white/5 flex items-center px-10 gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                                        </div>
                                        <div className="ml-6 h-3 w-40 bg-white/5 rounded-full"></div>
                                    </div>

                                    {/* Dashboard Body */}
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2 h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                                    <Zap className="h-32 w-32" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-200">Total Net Liquidity</p>
                                                    <p className="text-4xl font-black tracking-tighter">Rs. 842,500.00</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">+ 12.5% Today</span>
                                                </div>
                                            </div>
                                            <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6">
                                                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                            </div>
                                            <div className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6">
                                                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                                                    <Pill className="h-6 w-6" />
                                                </div>
                                                <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Integration Cards */}
                            <div className="absolute top-4 -right-4 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow flex items-center gap-3 group hover:scale-105 transition-transform">
                                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Auth Level</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">Military Grade</p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 -left-4 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-right flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Sync Status</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">Optimal (0ms)</p>
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
            <footer className="py-16 px-6 lg:px-20 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                                    <Pill className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-xl font-black italic tracking-tighter">MEDICORE <span className="text-blue-600">PMS</span></span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-xs leading-relaxed font-medium">
                                The next generation of pharmacy management. Built for speed, security, and absolute reliability.
                            </p>
                        </div>

                        {/* Developer Info */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Architect & Developer</h4>
                            <div className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-slate-200">
                                    A
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Abuzar</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Software Engineer</p>
                                    <div className="mt-3 space-y-1">
                                        <a href="mailto:abuzarktk123@gmail.com" className="text-[10px] text-blue-500 hover:underline font-bold block">abuzarktk123@gmail.com</a>
                                        <p className="text-[10px] text-slate-400 font-bold">+92 317 8521144</p>
                                        <p className="text-[10px] text-slate-400 font-bold">+92 342 9752032</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-12 flex-wrap">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Resources</h4>
                                <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <li><Link to="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                                    <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Protocol</Link></li>
                                    <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Service Terms</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            © 2026 MediCore Technologies. All Rights Reserved.
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter italic">V 1.0.4 Stable Build</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
}
