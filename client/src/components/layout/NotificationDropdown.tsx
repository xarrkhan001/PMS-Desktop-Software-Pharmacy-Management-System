import { useState, useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, Info, CheckCircle2, XCircle, Trash2, Clock, ShieldAlert, Wallet, ShoppingCart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
    id: string;
    section: string;
    title: string;
    description: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    time: string;
    isRead: boolean;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const STORAGE_KEY = "medicore_system_notifications";
    const LAST_CLEAR_KEY = "medicore_sys_notif_last_clear";
    const LAST_TOAST_KEY = "medicore_sys_notif_last_toast";

    useEffect(() => {
        const fetchSystemAlerts = async () => {
            try {
                const lastClear = localStorage.getItem(LAST_CLEAR_KEY);
                const today = new Date().toDateString();

                if (lastClear === today) {
                    setNotifications([]);
                    return;
                }

                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/dashboard/system-alerts", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Failed to fetch alerts");
                const serverAlerts = await response.json();

                const formatted = serverAlerts.map((a: any) => ({
                    ...a,
                    time: "Live",
                    isRead: false
                }));

                setNotifications(formatted);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));

                const lastToastDate = localStorage.getItem(LAST_TOAST_KEY);
                const unreadCount = formatted.length;

                if (lastToastDate !== today && unreadCount > 0) {
                    setTimeout(() => {
                        toast({
                            title: "Multi-Section Pulse Check",
                            description: `You have ${unreadCount} critical alerts across Finance, Inventory, and Security.`,
                            duration: 7000,
                        });
                        localStorage.setItem(LAST_TOAST_KEY, today);
                    }, 3000);
                }
            } catch (err) {
                console.error("Pulse Error:", err);
            }
        };

        fetchSystemAlerts();
    }, [toast]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const clearAll = () => {
        setNotifications([]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(LAST_CLEAR_KEY, new Date().toDateString());
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        setNotifications(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const getSectionIcon = (section: string) => {
        switch (section) {
            case 'Finance': return Wallet;
            case 'Purchases': return ShoppingCart;
            case 'System': return ShieldAlert;
            case 'Compliance': return Activity;
            default: return Info;
        }
    };

    const getTypeStyles = (type: Notification['type']) => {
        switch (type) {
            case 'danger': return { statusIcon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' };
            case 'warning': return { statusIcon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' };
            case 'success': return { statusIcon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' };
            default: return { statusIcon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' };
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl h-12 w-12 transition-all">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0 rounded-[2rem] border-none shadow-2xl mt-2 overflow-hidden bg-white">
                {/* Header */}
                <div className="bg-slate-900 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <DropdownMenuLabel className="p-0 text-md font-black uppercase italic tracking-tighter leading-none">
                                SYSTEM <span className="text-indigo-400">PULSE</span>
                            </DropdownMenuLabel>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mt-1">
                                {unreadCount} Multi-Section Alerts
                            </p>
                        </div>
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-7 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 hover:bg-white/5 px-3 rounded-full border border-slate-800"
                            >
                                <Trash2 className="h-3 w-3 mr-1.5" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 rotate-12">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Shield Active</p>
                                <p className="text-[9px] text-slate-400 font-medium">System is running within normal parameters.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notif) => {
                                const styles = getTypeStyles(notif.type);
                                const SectionIcon = getSectionIcon(notif.section);
                                return (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        className="p-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors focus:bg-slate-50 border border-slate-50 mb-1 block"
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105", styles.bg, styles.color)}>
                                                <SectionIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-0.5 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter", styles.bg, styles.color)}>
                                                        {notif.section}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 whitespace-nowrap">
                                                        <Clock className="h-2 w-2" />
                                                        {notif.time}
                                                    </div>
                                                </div>
                                                <p className={cn("text-[11px] font-black uppercase tracking-tight truncate mt-1", notif.isRead ? "text-slate-400" : "text-slate-900")}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                    {notif.description}
                                                </p>
                                                {!notif.isRead && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 px-5 bg-slate-50/50 border-t border-slate-100">
                        <Button variant="ghost" className="h-9 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:bg-indigo-50 w-full rounded-2xl border border-indigo-100">
                            Access Activity Logs
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
