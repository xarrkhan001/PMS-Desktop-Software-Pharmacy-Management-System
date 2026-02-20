import { Button } from "@/components/ui/button";
import { Pill, BookOpen, ArrowLeft, Terminal, Layout, UserPlus, FileText, Database, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Documentation() {
    const navigate = useNavigate();

    const flowSteps = [
        {
            icon: UserPlus,
            title: "1. Account Onboarding",
            desc: "Pharmacies cannot sign up directly for security. Contact our developer team with your pharmacy credentials. We will issue a unique Terminal License and create your Owner Account with encrypted credentials."
        },
        {
            icon: FileText,
            title: "2. Initial Setup",
            desc: "Once you receive your terminal key, log in to the portal. Navigate to Settings to configure your Thermal Printer headers, Receipt footers, and Pharmacy branding details that will appear on your medical bills."
        },
        {
            icon: Terminal,
            title: "3. Smart Billing (POS)",
            desc: "Use the Billing module to scan medicine barcodes. The system automatically fetches prices and checks stock. Generate professional, tax-compliant receipts with one click. Supports cash and digital payment records."
        },
        {
            icon: Layout,
            title: "4. Inventory Vault",
            desc: "Manage your medical stock with precision. Add new medicine batches, set expiry alerts, and categorize products. The system provides real-time warnings for low stock to ensure you never run out of critical life-saving meds."
        },
        {
            icon: Database,
            title: "5. Local Data Sovereignty",
            desc: "All your sales and patient records are stored locally on your machine using AES-256 encryption. You own your data. Our cloud mirror only syncs for disaster recovery, ensuring 100% privacy and zero downtime."
        },
        {
            icon: PhoneCall,
            title: "6. Dedicated Support",
            desc: "Every pharmacy partner gets a direct line to technical support. Whether it's a printer driver issue or a database question, our engineers are available to assist you remotely via secure terminal access."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
            {/* Professional Header */}
            <nav className="h-20 border-b border-slate-100 px-6 lg:px-20 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <Button variant="ghost" className="gap-2 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl px-6" onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter uppercase">MediCore <span className="text-blue-600">PMS</span></span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-20 px-6">
                <div className="space-y-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <BookOpen className="h-3.5 w-3.5" /> Pharmacy Operational Flow
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black italic tracking-tighter text-slate-900 leading-none uppercase">System <span className="text-blue-600">Manual.</span></h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            A comprehensive guide for pharmacy owners and staff. Learn the complete operational protocol from account creation to daily sales management.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {flowSteps.map((step, i) => (
                            <div key={i} className="group p-10 bg-slate-50 rounded-[3rem] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200 mb-8 group-hover:scale-110 transition-transform">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight italic text-slate-900 mb-4">{step.title}</h3>
                                <p className="text-sm text-slate-500 font-bold leading-relaxed opacity-80">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <section className="p-12 bg-slate-900 rounded-[4rem] text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="flex-1 space-y-6 relative z-10">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ready to digitize your Pharmacy?</h2>
                            <p className="text-slate-400 font-medium leading-relaxed max-w-xl text-lg">
                                Stop using manual registers. Get your professional terminal license today and start managing your inventory with military-grade precision.
                            </p>
                            <div className="flex flex-wrap gap-8 pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 font-mono">Developer Line</p>
                                    <p className="font-black italic text-xl tracking-tighter">abuzarktk123@gmail.com</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 font-mono">WhatsApp Support</p>
                                    <p className="font-black italic text-xl tracking-tighter">+92 317 8521144</p>
                                </div>
                            </div>
                        </div>
                        <Button className="h-20 px-12 rounded-[2rem] bg-white text-slate-900 hover:bg-slate-100 font-black uppercase italic text-lg tracking-tighter shadow-2xl relative z-10" onClick={() => navigate("/")}>
                            Apply for Access
                        </Button>
                    </section>
                </div>
            </main>

            <footer className="py-20 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">© 2026 MediCore Technologies • Professional Grade Software</p>
            </footer>
        </div>
    );
}
