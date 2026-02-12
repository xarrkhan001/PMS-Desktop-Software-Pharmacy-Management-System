import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Loader2, Pill, ShieldCheck, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export default function LoginModal({ open, onOpenChange, trigger }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Mock Login Logic
        setTimeout(() => {
            if (email === "test@PharmPro.com" && password === "Ntl@0099") {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userRole", "admin");
                navigate("/");
            } else {
                setError("Invalid credentials.");
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white dark:bg-slate-950 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] sm:rounded-[2.5rem] gap-0 [&>button]:hidden">
                <div className="grid md:grid-cols-2 min-h-[660px]">

                    {/* Left Side: Professional Pharmacist Hero */}
                    <div className="hidden md:flex flex-col justify-between relative bg-black text-white p-10 overflow-hidden">
                        {/* Background Pharmacist Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=2070&auto=format&fit=crop"
                                alt="Professional Pharmacist"
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            {/* Rich Overlays for Professional Look */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-blue-600/20 z-10"></div>
                            <div className="absolute inset-0 backdrop-grayscale-[0.2] z-0"></div>
                        </div>

                        <div className="relative z-20 space-y-16">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600/20 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20 shadow-2xl">
                                    <Pill className="h-6 w-6 text-blue-400" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white drop-shadow-lg">Pharm<span className="text-blue-400">Pro</span></span>
                            </div>

                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 backdrop-blur-md border border-blue-400/30 text-[10px] font-bold uppercase tracking-widest text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                    <ShieldCheck className="h-3 w-3" />
                                    Secured by AES-256
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                                        Empowering <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-white">Pharmacists.</span>
                                    </h2>
                                    <p className="text-slate-300 text-base leading-relaxed max-w-[320px] font-medium opacity-90">
                                        Industry standard local pharmacy management. Fast, secure, and offline.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Bottom: Stats Overlay */}
                        <div className="relative z-20 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                    <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider mb-0.5">Response</p>
                                    <p className="text-xl font-black">0.2ms</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                    <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider mb-0.5">Uptime</p>
                                    <p className="text-xl font-black">100%</p>
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                                <Zap className="h-3 w-3 text-blue-400" />
                                Enterprise Grade
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Elegant Login Form */}
                    <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-950 relative">
                        {/* Custom Stylish Close Button */}
                        <div className="absolute right-6 top-6 z-50">
                            <DialogClose className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md active:scale-90 group">
                                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="sr-only">Close Modal</span>
                            </DialogClose>
                        </div>
                        {/* Background Subtle Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] z-0 pointer-events-none opacity-50"></div>

                        <div className="max-w-sm mx-auto w-full space-y-8 relative z-10 uppercase-titles">
                            <DialogHeader className="text-center md:text-left space-y-2">
                                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Login to <span className="text-blue-600">Pro</span> Portal</DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                    Access pharmacy inventory & tools.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="test@PharmPro.com"
                                                className="pl-12 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl font-medium"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Key</Label>
                                            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-bold">Lost Access?</a>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-12 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all rounded-xl font-medium"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <input type="checkbox" id="remember" className="h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer" />
                                        <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer">
                                            Stay Synchronized
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-3 animate-shake">
                                        <ShieldCheck className="h-4 w-4 text-red-600" />
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/20 transition-all rounded-2xl font-black text-lg group" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">Initialize Session <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                                    )}
                                </Button>
                            </form>

                            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Secure Access Point</p>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                                        <span className="text-xs font-mono font-bold text-blue-600">test@PharmPro.com</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-slate-100"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Pass</span>
                                        <span className="text-xs font-mono font-bold text-blue-600">Ntl@0099</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
