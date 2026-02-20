import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileDown, Calendar, TrendingUp, DollarSign, Pill, Users,
    CheckCircle2, MapPin, Phone, ShieldCheck
} from "lucide-react";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";

const API_BASE = "http://localhost:5000/api/reports";

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("this-month");
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchReportData();
    }, [period]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analytics?period=${period}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        console.log("Generating Official Document...");

        try {
            const doc = new jsPDF("p", "mm", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;

            // 1. Digital Branded Header
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 40, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold"); doc.setFontSize(22);
            doc.text("MEDICORE PMS CORE", margin, 18);
            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text("OFFICIAL PHARMACY FINANCIAL LEDGER & PERFORMANCE RECORDS", margin, 25);
            doc.text(`GENERATED: ${format(new Date(), 'dd MMM yyyy').toUpperCase()}`, margin, 31);

            // 2. Pharmacy Info
            doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
            doc.text(pharmacy?.name || "AL-ASMAT PHARMACY", margin, 55);
            doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
            doc.text(`Location: ${pharmacy?.location || "Not Specified"}`, margin, 62);
            doc.text(`Contact: ${pharmacy?.contact || "N/A"}`, margin, 67);
            doc.text(`Period: ${periodLabel}`, margin, 72);

            doc.setDrawColor(226, 232, 240);
            doc.line(margin, 78, pageWidth - margin, 78);

            // 3. Compact Financial Summary (Clean List)
            doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
            doc.text("FINANCIAL SUMMARY & KPIS", margin, 88);

            const gridY = 98;
            const items = [
                { label: "Total Revenue Generated", value: `Rs. ${summary.totalRevenue.toLocaleString()}` },
                { label: "Net Operating Profit", value: `Rs. ${summary.netProfit.toLocaleString()}` },
                { label: "Customer Acquisition", value: `${summary.newCustomers} New Clients` },
                { label: "Total Inventory Units Moved", value: `${summary.medicinesSold.toLocaleString()} Units` }
            ];

            items.forEach((item, i) => {
                const y = gridY + (i * 15);
                doc.setDrawColor(241, 245, 249); doc.setFillColor(248, 250, 252);
                doc.roundedRect(margin, y - 6, pageWidth - (margin * 2), 12, 1, 1, "FD");

                doc.setFontSize(8.5); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "bold");
                doc.text(item.label, margin + 5, y + 2);

                doc.setFontSize(10); doc.setTextColor(79, 70, 229);
                doc.text(item.value, pageWidth - margin - 5, y + 2, { align: "right" });
            });

            // 4. Compact Dynamic Verification Stamp (Official Mohar) - Positioned Top Right
            const stampX = pageWidth - 40;
            const stampY = 62;
            const r = 16; // Compact Radius

            doc.setDrawColor(225, 29, 72);
            doc.setLineWidth(0.8); doc.circle(stampX, stampY, r, "S"); // Outer
            doc.setLineWidth(0.3); doc.circle(stampX, stampY, r - 2, "S"); // Inner

            doc.setTextColor(225, 29, 72); doc.setFont("helvetica", "bold");

            // Pharmacy Name in Stamp
            doc.setFontSize(4.5);
            const pName = (pharmacy?.name || "PHARMPRO CORE").toUpperCase();
            doc.text(pName, stampX, stampY - 6, { align: "center" });

            doc.setFontSize(11);
            doc.text("VERIFIED", stampX, stampY + 1, { align: "center" });

            doc.setFontSize(4.5);
            doc.text("OFFICIAL SEAL", stampX, stampY + 6, { align: "center" });
            doc.text(format(new Date(), 'yyyy'), stampX, stampY + 9, { align: "center" });

            // Pharmacist Signature Area (Bottom of document)
            const signY = pageHeight - 35;
            doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text("Lead Pharmacist Authorized Signatory", margin, signY + 5);
            doc.line(margin, signY, margin + 50, signY);

            // 5. Professional Footer
            doc.setDrawColor(241, 245, 249); doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
            doc.setTextColor(148, 163, 184); doc.setFontSize(6.5);
            doc.text(`Official System Generated Document • ID-REF: ${Math.random().toString(36).substring(7).toUpperCase()}`, margin, pageHeight - 12);

            doc.save(`PharmPro_Report_${format(new Date(), 'dd_MM_yy')}.pdf`);
            console.log("PDF Generation Success!");

        } catch (error) {
            console.error("Critical PDF Export Error:", error);
            alert("Error: PDF processing failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };


    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em] text-[10px]">Generating Insights...</p>
                </div>
            </div>
        );
    }

    const { summary, salesTrend, categoryData, pharmacy, period: periodLabel } = data || {
        summary: { totalRevenue: 0, netProfit: 0, newCustomers: 0, medicinesSold: 0 },
        salesTrend: [],
        categoryData: [],
        pharmacy: { name: "Your Pharmacy", location: "City", contact: "N/A" },
        period: "Selected Period"
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Financial Hub Reports</h1>
                    <p className="text-slate-500 font-medium mt-1">Export official documents and gallery snapshots.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center bg-white border-2 rounded-xl px-4 h-11 shadow-sm">
                        <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[140px] border-none font-bold shadow-none focus:ring-0">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-2xl">
                                <SelectItem value="this-month" className="font-bold">Current Month</SelectItem>
                                <SelectItem value="last-month" className="font-bold">Last Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        disabled={isExporting}
                        onClick={handleExportPDF}
                        className="rounded-xl bg-indigo-600 font-bold h-11 px-8 hover:bg-indigo-500 transition-all text-sm shadow-lg shadow-indigo-600/20"
                    >
                        {isExporting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Process Document
                    </Button>
                </div>
            </div>

            {/* Main Report Container */}
            <div ref={reportRef} id="printable-area" className="p-12 space-y-8 bg-white border border-slate-200 rounded-[3.5rem] shadow-2xl relative overflow-hidden max-w-[1200px] mx-auto min-h-[1000px]">

                {/* PDF Header */}
                <div className="flex items-start justify-between border-b-4 border-slate-900 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">PHARMPRO</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-1">Intelligence Report</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-800 uppercase">{pharmacy?.name || "Official Ledger"}</h3>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <MapPin className="h-3 w-3" /> {pharmacy?.location}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Phone className="h-3 w-3" /> {pharmacy?.contact}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group p-4">
                        <div className="w-32 h-32 border-4 border-rose-600/20 rounded-full flex items-center justify-center p-2 rotate-[-12deg] relative shadow-md">
                            <div className="absolute inset-0 border border-dashed border-rose-600/30 rounded-full animate-[spin_30s_linear_infinite]"></div>
                            <div className="w-full h-full border-2 border-rose-600/40 rounded-full flex flex-col items-center justify-center text-center bg-rose-50/20 backdrop-blur-[1px]">
                                <p className="text-[6px] px-2 font-black text-rose-600/80 uppercase leading-tight mb-0.5 break-words max-w-[70px]">{pharmacy?.name || "Pharmacy"}</p>
                                <p className="text-lg font-black text-rose-600 uppercase tracking-tighter leading-none italic">VERIFIED</p>
                                <div className="h-[1px] w-10 bg-rose-600/40 my-1.5"></div>
                                <p className="text-[7px] font-bold text-rose-600/60 uppercase tracking-widest leading-none">OFFICIAL SEAL</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center py-4 px-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Reporting Period</p>
                        <p className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-600" /> {periodLabel}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document Status</p>
                        <p className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> FINALIZED RECORD
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card style={{ background: 'linear-gradient(to bottom right, #4f46e5, #4338ca)', color: 'white', border: 'none', borderRadius: '2.5rem' }} className="shadow-xl overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full blur-2xl transition-all duration-700"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80 flex justify-between items-center">
                                Total Revenue <DollarSign className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">Rs. {summary.totalRevenue.toLocaleString()}</div>
                            <p className="text-[10px] mt-1 font-bold uppercase tracking-tighter opacity-70">
                                Period sales volume
                            </p>
                        </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: 'white', borderRadius: '2.5rem' }} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
                                Net Profit <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">Rs. {summary.netProfit.toLocaleString()}</div>
                            <p className="text-[10px] mt-1 text-emerald-600 font-bold uppercase tracking-tighter">
                                After operational costs
                            </p>
                        </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: 'white', borderRadius: '2.5rem' }} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
                                New Customers <Users className="h-4 w-4 text-amber-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">+{summary.newCustomers}</div>
                            <p className="text-[10px] mt-1 text-amber-600 font-bold uppercase tracking-tighter">
                                Registered in period
                            </p>
                        </CardContent>
                    </Card>

                    <Card style={{ backgroundColor: 'white', borderRadius: '2.5rem' }} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
                                Medicines Sold <Pill className="h-4 w-4 text-indigo-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{summary.medicinesSold.toLocaleString()}</div>
                            <p className="text-[10px] mt-1 text-indigo-600 font-bold uppercase tracking-tighter">
                                Units sold in period
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-sm rounded-[2.5rem] border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight">Daily Sales Revenue</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Trend for the {periodLabel}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div id="chart-sales-trend" className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrend}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm rounded-[2.5rem] border-none bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight">Revenue by Category</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Class wise sales distribution.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-between p-8">
                            {categoryData.length > 0 ? (
                                <>
                                    <div id="chart-category-pie" className="h-[250px] w-[250px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Period</p>
                                            <p className="text-2xl font-black text-slate-900">{categoryData.reduce((acc: any, curr: any) => acc + curr.value, 0)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 w-full max-w-[150px] mt-6 md:mt-0">
                                        {categoryData.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between group cursor-default">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tighter">{item.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-[250px] flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No Sales Data for Period</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="p-8 border-t-2 border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span>Generated on {format(new Date(), 'PPPP')}</span>
                    <span>System ID: PRO-{pharmacy.name.substring(0, 3).toUpperCase()}-{(Math.random() * 1000).toFixed(0)}</span>
                </div>
            </div>
        </div>
    );
}
