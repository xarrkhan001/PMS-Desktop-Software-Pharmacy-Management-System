import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Cpu, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LicenseLockPageProps {
    reason: string;
    code: string;
    onActivated: () => void;
}

const LicenseLockPage: React.FC<LicenseLockPageProps> = ({ reason, onActivated }) => {
    const [machineId, setMachineId] = useState<string>("");
    const [licenseKey, setLicenseKey] = useState("");
    const [isActivating, setIsActivating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/api/pharmacy/machine-id")
            .then((res) => res.json())
            .then((data) => setMachineId(data.machineId))
            .catch((err) => console.error("Failed to fetch machine ID:", err));
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(machineId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Machine ID copied to clipboard. Send this to Super Admin.",
        });
    };

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a license key.",
            });
            return;
        }

        setIsActivating(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/pharmacy/license/activate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ licenseKey }),
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Update localStorage so LicenseGuard unlocks immediately
                const updatedLicenseStatus = {
                    isActive: true,
                    isExpired: false,
                    expiresAt: data.expiresAt || null,
                    licenseNo: licenseKey,
                };
                localStorage.setItem("licenseStatus", JSON.stringify(updatedLicenseStatus));

                toast({
                    title: "✅ System Activated!",
                    description: "License activated successfully. Welcome back!",
                });

                // Small delay so toast is visible, then unlock
                setTimeout(() => {
                    onActivated();
                }, 1000);
            } else {
                toast({
                    variant: "destructive",
                    title: "Activation Failed",
                    description: data.error || "Invalid license key. Please check and try again.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not connect to the activation server.",
            });
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950 p-4">
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-red-500/20 blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-blue-500/20 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-lg space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            System Locked
                        </h1>
                        <p className="text-zinc-400">
                            {reason || "Your subscription has ended or license is invalid."}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Your Hardware Identity (Machine ID)
                        </label>
                        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/40 p-3">
                            <Cpu className="text-zinc-500" size={18} />
                            <code className="flex-1 font-mono text-sm font-semibold text-blue-400">
                                {machineId || "Generating..."}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                title="Copy ID"
                            >
                                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 italic">
                            Share this ID with the system administrator to get your activation key.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            License Activation Key
                        </label>
                        <input
                            type="text"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            placeholder="Enter your 256-bit license key..."
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-zinc-100 placeholder:text-zinc-700 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-xs"
                        />
                    </div>

                    <button
                        onClick={handleActivate}
                        disabled={isActivating || !licenseKey}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-white p-3 font-semibold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                            <div className="relative h-full w-8 bg-white/30" />
                        </div>
                        {isActivating ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        ) : (
                            <>
                                <ShieldCheck size={18} />
                                <span>Activate System</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="border-t border-zinc-800 pt-6 text-center space-y-4">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "#/login";
                            window.location.reload();
                        }}
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        ← Back to Landing Page
                    </button>
                    <p className="text-sm text-zinc-500">
                        Need help? Contact support at <span className="text-blue-400 font-medium">+92 342 9752032</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LicenseLockPage;
