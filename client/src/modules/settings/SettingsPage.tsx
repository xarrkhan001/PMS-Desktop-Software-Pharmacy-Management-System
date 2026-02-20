import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
    Settings,
    FileText,
    Bell,
    CreditCard,
    Save,
    RefreshCcw,
    Database,
    Download,
    ShieldCheck,
    Pill
} from "lucide-react";

export default function SettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        billHeader: "",
        billFooter: "",
        showPharmacyLogo: true,
        showTaxId: true,
        defaultTaxRate: 0,
        nearExpiryDays: 30,
        lowStockThreshold: 10
    });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/settings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            toast({ title: "Fetch Failed", description: "Could not load system settings.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/settings", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                toast({ title: "Success", description: "System settings updated successfully." });
                fetchSettings();
            } else {
                toast({ title: "Update Failed", description: "Server returned an error.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Network connection failed.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[2.2rem] bg-indigo-600 shadow-2xl shadow-indigo-200 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 rotate-3">
                        <Settings className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">System <span className="text-indigo-600">Settings</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Configure your pharmacy's core operations</p>
                    </div>
                </div>
                <Button
                    className="h-14 px-10 rounded-[1.8rem] bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase italic tracking-tighter gap-3 transition-all shadow-xl shadow-slate-200"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {saving ? "Saving..." : "Apply Changes"}
                </Button>
            </div>

            <Tabs defaultValue="billing" className="space-y-6">
                <TabsList className="bg-white p-2 rounded-2xl border shadow-sm w-fit gap-2 h-16">
                    <TabsTrigger value="billing" className="rounded-xl h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <FileText className="h-4 w-4" /> Billing / POS
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="rounded-xl h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <Bell className="h-4 w-4" /> Alerts & Stock
                    </TabsTrigger>
                    <TabsTrigger value="financials" className="rounded-xl h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <CreditCard className="h-4 w-4" /> Financials
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="rounded-xl h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        <Database className="h-4 w-4" /> Maintenance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="billing">
                    <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white p-8">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">POS & Receipt Customization</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">How your bills appear to customers</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Receipt Header Message</Label>
                                        <Input
                                            className="h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                                            placeholder="e.g. Welcome to MediCore PMS"
                                            value={settings.billHeader}
                                            onChange={(e) => setSettings({ ...settings, billHeader: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Receipt Footer / Note</Label>
                                        <textarea
                                            className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Items sold can be returned within 3 days."
                                            value={settings.billFooter}
                                            onChange={(e) => setSettings({ ...settings, billFooter: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6 bg-slate-50 rounded-[2.5rem] p-8">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Display Options</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">Show Pharmacy Logo</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Include branding on printed bills</p>
                                            </div>
                                            <Switch
                                                checked={settings.showPharmacyLogo}
                                                onCheckedChange={(val) => setSettings({ ...settings, showPharmacyLogo: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                                            <div>
                                                <p className="font-black text-slate-900 text-sm">Print Tax ID / NTN</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Legal compliance for bills</p>
                                            </div>
                                            <Switch
                                                checked={settings.showTaxId}
                                                onCheckedChange={(val) => setSettings({ ...settings, showTaxId: val })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white p-8">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">Alerts & Notifications</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configure when system triggers warnings</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col justify-center gap-6 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                                        <Pill className="h-7 w-7 text-amber-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-700 ml-1">Near Expiry Alert (Days)</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="number"
                                                    className="h-14 w-32 bg-white border-none rounded-2xl text-lg font-black text-slate-900"
                                                    value={settings.nearExpiryDays}
                                                    onChange={(e) => setSettings({ ...settings, nearExpiryDays: parseInt(e.target.value) || 0 })}
                                                />
                                                <p className="text-xs font-bold text-amber-600/70">Warn me [X] days before a medicine reaches its expiry date.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center gap-6 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                                        <ShieldCheck className="h-7 w-7 text-rose-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-rose-700 ml-1">Low Stock Threshold (Units)</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="number"
                                                    className="h-14 w-32 bg-white border-none rounded-2xl text-lg font-black text-slate-900"
                                                    value={settings.lowStockThreshold}
                                                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                                />
                                                <p className="text-xs font-bold text-rose-600/70">Show warning when medicine stock falls below this quantity.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials">
                    <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white p-8">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">Currency & Taxes</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global financial configurations</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="max-w-md space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Default VAT / Tax Rate (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-14 bg-slate-50 border-none rounded-2xl text-lg font-black pl-10"
                                            value={settings.defaultTaxRate}
                                            onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider italic">This tax will be automatically applied to every new sale bill.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backup">
                    <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">System Maintenance</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data safety and backup operations</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <h5 className="font-black text-lg italic tracking-tighter mb-2 uppercase">Local Database Backup</h5>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6 italic uppercase tracking-widest opacity-80">
                                        Export your entire system data (medicines, sales, customers) into a single encrypted file for safety.
                                    </p>
                                    <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-white hover:text-indigo-600 font-bold uppercase text-xs tracking-widest gap-2">
                                        <Download className="h-4 w-4" /> Export All Data (.SQL)
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-6 flex flex-col justify-center">
                                <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                                    <RefreshCcw className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                    <h5 className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">Restore Data</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Upload a previous backup to restore</p>
                                    <Button variant="outline" className="h-12 border-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                        Choose Backup File
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
