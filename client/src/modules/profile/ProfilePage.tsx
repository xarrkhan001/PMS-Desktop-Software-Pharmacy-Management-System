import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Mail,
    ShieldCheck,
    MapPin,
    Phone,
    CreditCard,
    Users,
    FileText
} from "lucide-react";

interface PharmacyProfile {
    id: number;
    name: string;
    location: string | null;
    contact: string | null;
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
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        location: "",
        contact: ""
    });

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/pharmacy/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setProfile(data);
            setEditForm({
                name: data.name,
                location: data.location || "",
                contact: data.contact || ""
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/pharmacy/profile", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                await fetchProfile();
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!profile) return <div className="p-8 text-center text-slate-500 font-bold">Failed to load profile details.</div>;

    const daysLeft = Math.floor((new Date(profile.licenseExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm no-print">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Profile</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enterprise Configuration</p>
                    </div>
                </div>

                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-8 shadow-lg shadow-indigo-100" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                ) : (
                    <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl font-bold px-8" onClick={() => setIsEditing(true)}>
                        Update Info
                    </Button>
                )}
            </div>

            {/* Header Identity */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-32 w-32 bg-indigo-600 rounded-[2.5rem] shadow-xl flex items-center justify-center text-white shrink-0 shadow-indigo-100">
                    <Building2 className="h-16 w-16" />
                </div>
                <div className="space-y-4 pt-2 flex-1 w-full">
                    {isEditing ? (
                        <div className="grid gap-4 max-w-xl">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Pharmacy Name</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-black text-xl text-slate-900 focus:border-indigo-500 outline-none transition-all"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Location</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-bold text-sm text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        placeholder="e.g. Saddar, Karachi"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Contact</label>
                                    <input
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl font-bold text-sm text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                        value={editForm.contact}
                                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                                        placeholder="e.g. 0300-1234567"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">{profile.name}</h1>
                                <Badge className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase ${profile.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700'}`}>
                                    {profile.isActive ? 'Enterprise Active' : 'Suspended'}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-6 text-slate-500 font-bold text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-indigo-500" />
                                    {profile.location || "Location Not Specified"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-indigo-500" />
                                    {profile.contact || "Contact Not Specified"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                    License: #{profile.id.toString().padStart(5, '0')}
                                </div>
                            </div>
                        </>
                    )}
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
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black gap-2 hover:bg-slate-50">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Download Statement
                        </Button>
                    </CardContent>
                </Card>

                {/* Team / Users Card */}
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white lg:col-span-2">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Users className="h-7 w-7 text-indigo-500" />
                            Staff Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {profile.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 group hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-lg">
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
                                    <Badge className={`${user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'} rounded-xl px-4 py-1.5 font-black text-[10px] uppercase`}>
                                        {user.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
