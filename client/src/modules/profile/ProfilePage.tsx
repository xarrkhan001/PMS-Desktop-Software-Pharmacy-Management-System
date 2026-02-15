import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Mail,
    ShieldCheck,
    Calendar,
    CreditCard,
    Users,
    FileText,
    Info,
    Lock
} from "lucide-react";

interface PharmacyProfile {
    id: number;
    name: string;
    licenseStartedAt: string;
    licenseExpiresAt: string;
    isActive: boolean;
    subscriptionFee: number;
    totalPaid: number;
    users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<PharmacyProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/pharmacy/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!profile) return <div className="p-8 text-center text-slate-500 font-bold">Failed to load profile details.</div>;

    const daysLeft = Math.floor((new Date(profile.licenseExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Admin Notice */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Lock className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-black text-sm uppercase tracking-tight">Enterprise Lock Enabled</p>
                    <p className="text-xs font-bold opacity-80">Profile details are read-only for security. To update your info, please contact Super Admin support.</p>
                </div>
            </div>

            {/* Header Identity */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-32 w-32 bg-indigo-600 rounded-[2.5rem] shadow-xl flex items-center justify-center text-white shrink-0 shadow-indigo-100">
                    <Building2 className="h-16 w-16" />
                </div>
                <div className="space-y-4 pt-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                        <Badge className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase ${profile.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700'}`}>
                            {profile.isActive ? 'Enterprise Active' : 'Suspended'}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-6 text-slate-500 font-bold text-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-500" />
                            License: #{profile.id.toString().padStart(5, '0')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            Joined {new Date(profile.licenseStartedAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Subscription Card */}
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden lg:col-span-1">
                    <div className={`p-8 ${daysLeft < 30 ? 'bg-red-600' : 'bg-indigo-600'} text-white`}>
                        <div className="flex justify-between items-center mb-6">
                            <CreditCard className="h-8 w-8 opacity-40" />
                            <Badge className="bg-white/20 hover:bg-white/30 border-none text-white font-black text-[10px] uppercase">Plan: Platinum</Badge>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Subscription Status</p>
                        <h3 className="text-3xl font-black mt-1">
                            {daysLeft > 0 ? `${daysLeft} Days Left` : 'Expired'}
                        </h3>
                        <p className="text-sm font-bold mt-4 bg-black/10 p-3 rounded-xl border border-white/10 italic">
                            Next renewal on {new Date(profile.licenseExpiresAt).toLocaleDateString()}
                        </p>
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Subscription Fee</span>
                            <span className="text-slate-900 font-black">Rs. {profile.subscriptionFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                            <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Paid</span>
                            <span className="text-emerald-600 font-black">Rs. {profile.totalPaid.toLocaleString()}</span>
                        </div>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black gap-2 hover:bg-slate-50 opacity-50 cursor-not-allowed">
                            <FileText className="h-5 w-5" />
                            Download Ledger
                        </Button>
                    </CardContent>
                </Card>

                {/* Team / Users Card */}
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white lg:col-span-2">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Users className="h-7 w-7 text-indigo-500" />
                            Authenticated Personnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {profile.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 group hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 tracking-tight">{user.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Mail className="h-3 w-3 text-slate-400" />
                                                <p className="text-xs font-bold text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={`${user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'} rounded-lg px-3 py-1 font-black text-[10px] uppercase border-none`}>
                                        {user.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                            <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-indigo-900/70 leading-relaxed">
                                Personnel access is managed by the Super Admin. If you need to add or remove staff members, please initiate a request through the terminal support channel.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
