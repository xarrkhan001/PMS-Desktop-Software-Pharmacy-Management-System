import { Button } from "@/components/ui/button";
import {
    UserPlus,
    Database,
    ArrowLeft,
    ShieldCheck,
    Zap,
    ChevronRight,
    TerminalSquare,
    Printer,
    MonitorSmartphone,
    CloudIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Documentation() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Phase 01: The Terminal Protocol",
            steps: [
                {
                    icon: UserPlus,
                    title: "Authorized Onboarding",
                    desc: "Security is our prime directive. To prevent unauthorized medicine ledger access, public signups are disabled. Our engineering team manually vets each pharmacy, creates a military-grade Owner Account, and issues a hardware-linked Terminal Key."
                },
                {
                    icon: ShieldCheck,
                    title: "Terminal Activation",
                    desc: "Upon receiving your Terminal Key, use the unique identifier to authenticate your station. This process localizes the database and establishes a secure, encrypted handshake with our monitoring servers."
                }
            ]
        },
        {
            title: "Phase 02: Station Configuration",
            steps: [
                {
                    icon: Printer,
                    title: "Hardware Integration",
                    desc: "Configure thermal printer protocols (ESC/POS). Navigate to System Settings to define header headers, QR code parameters, and pharmacy registration details (DRAP/FBR) that appear on official medical receipts."
                },
                {
                    icon: TerminalSquare,
                    title: "Role Assignments",
                    desc: "Create dedicated operator accounts for staff. Assign granular permissions (Sales Only, Manager, Auditor) to ensure multi-layered security and prevent unauthorized inventory manipulation."
                }
            ]
        },
        {
            title: "Phase 03: Operational Intelligence",
            steps: [
                {
                    icon: Zap,
                    title: "Smart POS Engine",
                    desc: "Our high-speed billing engine handles complex tax calculations and batch tracking in milliseconds. Scan barcodes or use fuzzy search for lightning-fast checkouts even during high-traffic hours."
                },
                {
                    icon: MonitorSmartphone,
                    title: "Inventory Ledger",
                    desc: "Real-time stock monitoring with built-in predictive warnings. The system alerts you to expiring batches and low-stock items before they impact your service quality or patient safety."
                }
            ]
        },
        {
            title: "Phase 04: Data & Sovereignty",
            steps: [
                {
                    icon: Database,
                    title: "Cold Storage Defense",
                    desc: "All transaction data is stored on your local disk using AES-256 encryption. Your pharmacy's financial history is never sold or shared. You maintain 100% control over your medical records."
                },
                {
                    icon: CloudIcon,
                    title: "MediCore Mirror (Sync)",
                    desc: "Maintain a cloud-based disaster recovery mirror. In case of hardware failure, your synchronized data can be restored to a new terminal in minutes, ensuring zero operational downtime."
                }
            ]
        }
    ];

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

            <main className="max-w-7xl mx-auto py-24 px-6 relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -ml-64 pointer-events-none" />

                <div className="relative z-10 space-y-32">
                    {/* Hero Section */}
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" /> Terminal Protocol Documentation
                        </div>
                        <h1 className="text-6xl lg:text-9xl font-black italic tracking-tighter text-white leading-[0.85] uppercase">
                            Operational <br />
                            <span className="text-indigo-500">Manual.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            The definitive technical guide for deploying and managing the MediCore PMS terminal. Master the system from initial handshake to enterprise scaling.
                        </p>
                    </div>

                    {/* Operational Flow */}
                    <div className="space-y-32">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-12">
                                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-500 italic flex items-center gap-5">
                                    <span className="h-[2px] w-12 bg-indigo-600/30"></span>
                                    {section.title}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {section.steps.map((step, i) => (
                                        <div key={i} className="group p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] transition-all duration-500 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all">
                                                <step.icon size={120} />
                                            </div>
                                            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] group-hover:scale-110 transition-transform">
                                                <step.icon className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight italic text-white mb-4 flex items-center gap-3">
                                                {step.title} <ChevronRight className="h-5 w-5 text-indigo-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                            </h3>
                                            <p className="text-sm text-slate-400 font-bold leading-relaxed opacity-90">
                                                {step.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Support Block */}
                    <section className="p-16 bg-indigo-600 rounded-[4rem] text-white flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)]">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="flex-1 space-y-10 relative z-10">
                            <div className="space-y-4">
                                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none">Ready to Activate <br />Your Terminal?</h2>
                                <p className="text-indigo-100 font-bold leading-relaxed max-w-xl text-lg opacity-90">
                                    Our engineering team is ready to onboard your pharmacy. Secure your license today and transition to military-grade inventory management.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3">Architect Unit</p>
                                    <p className="font-black italic text-2xl tracking-tighter text-white">abuzarktk123@gmail.com</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3">Priority Support</p>
                                    <p className="font-black italic text-2xl tracking-tighter text-white">+92 317 8521144</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            className="h-20 px-12 rounded-[2.5rem] bg-white text-indigo-600 hover:bg-slate-50 font-black uppercase italic text-xl tracking-tighter shadow-3xl active:scale-95 transition-all relative z-10"
                            onClick={() => window.open("mailto:abuzarktk123@gmail.com")}
                        >
                            Request License <Zap className="ml-3 h-5 w-5 fill-current" />
                        </Button>
                    </section>
                </div>
            </main>

            <footer className="py-24 border-t border-white/5 bg-black/30 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck className="h-6 w-6 text-indigo-500" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter uppercase text-white">MEDICORE <span className="text-indigo-500">PMS</span></span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 text-center">
                        © 2026 MediCore Technologies • Professional Grade Pharmaceutical Infrastructure
                    </p>
                </div>
            </footer>
        </div>
    );
}
