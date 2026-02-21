import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Database, Zap } from "lucide-react";

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Initializing System...");

    useEffect(() => {
        const duration = 10000; // 10 seconds
        const intervalTime = 100;
        const totalSteps = duration / intervalTime;
        const increment = 100 / totalSteps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Small delay after 100%
                    return 100;
                }
                return prev + increment;
            });
        }, intervalTime);

        // Dynamic Status Text
        const textInterval = setInterval(() => {
            const texts = [
                "Establishing Secure Connection...",
                "Loading AES-256 Ledger...",
                "Optimizing Database Engines...",
                "Syncing Pharmacy Terminal...",
                "Activating Enterprise Shield...",
                "Ready to Launch..."
            ];
            setStatusText(texts[Math.floor(Math.random() * texts.length)]);
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(textInterval);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0a0a0c] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-purple-600/10 blur-[120px]" />

            {/* Top Status Header */}
            <div className="absolute top-0 w-full px-12 py-8 flex justify-between items-center z-10 opacity-40">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black font-mono tracking-[0.3em] text-slate-400 uppercase">System_Core: Online</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black font-mono tracking-[0.2em] text-slate-500 uppercase hidden md:block">Region: Terminal_Global</span>
                    <span className="text-[10px] font-black font-mono tracking-[0.3em] text-indigo-400 uppercase">Encryption: AES_256_Stable</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center space-y-12 w-full max-w-md px-6">
                {/* Logo Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative h-40 w-40 flex items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/10">
                        <ShieldCheck size={80} className="text-white drop-shadow-2xl" />
                    </div>
                </div>

                {/* App Name Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
                        MEDICORE <span className="text-purple-500">PMS</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
                        Advanced Pharmacy Terminal v1.0
                    </p>
                </div>

                {/* Progress Section */}
                <div className="w-full space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Zap size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{statusText}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white/50">{Math.round(progress)}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_100%] animate-shimmer transition-all duration-300 ease-out rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between pt-2">
                        <div className="flex items-center gap-1.5 grayscale opacity-30">
                            <Database size={12} className="text-slate-400" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">SQLite Engine Ready</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale opacity-30">
                            <Cpu size={12} className="text-slate-400" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Local Execution Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Credit */}
            <div className="absolute bottom-12 text-center opacity-40 group transition-all duration-500">
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-1">Developed By</p>
                    <div className="h-[1px] w-8 bg-indigo-500/30 mb-1 group-hover:w-16 transition-all duration-500" />
                    <p className="text-xs font-black italic tracking-tighter text-white uppercase">
                        Abuzar <span className="text-indigo-500">Software Engineer</span>
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}} />
        </div>
    );
};

export default SplashScreen;
