import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Database,
    Pill,
    ShoppingCart,
    Truck,
    Users,
    FileBarChart,
    Settings,
    Wallet,
    LogOut,
    ShieldCheck,
    ShieldAlert,
    FileText,
    PackagePlus,
    Activity,
    History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";

interface SidebarProps {
    isMobile?: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const userRole = localStorage.getItem("userRole")?.toUpperCase();
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const [isExpanded, setIsExpanded] = useState(isSuperAdmin);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const allNavItems = [
        { name: "Super Admin Control", icon: ShieldCheck, path: "/super-admin", roles: ["SUPER_ADMIN"] },
        { name: "Managed Pharmacies", icon: Users, path: "/super-pharmacies", roles: ["SUPER_ADMIN"] },
        { name: "Activity Monitor", icon: Activity, path: "/super-activity", roles: ["SUPER_ADMIN"] },
        { name: "Terminal Purge", icon: ShieldAlert, path: "/super-terminal", roles: ["SUPER_ADMIN"] },
        { name: "Master Database", icon: Database, path: "/super-database", roles: ["SUPER_ADMIN"] },
        { name: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Inventory", icon: Pill, path: "/inventory", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Billing", icon: ShoppingCart, path: "/billing", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Invoice Archive", icon: FileText, path: "/sales-history", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Suppliers", icon: Truck, path: "/suppliers", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Stock Inward", icon: PackagePlus, path: "/purchases", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Customers", icon: Users, path: "/customers", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Financial Hub", icon: Wallet, path: "/finance", roles: ["ADMIN"] },
        { name: "Reports", icon: FileBarChart, path: "/reports", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Activity Logs", icon: History, path: "/logs", roles: ["ADMIN"] },
        { name: "General Settings", icon: Settings, path: "/settings", roles: ["ADMIN"] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(userRole || ""));

    return (
        <div
            className={cn(
                "flex flex-col h-full transition-all duration-300 ease-in-out",
                isSuperAdmin
                    ? "bg-zinc-950 border-r border-white/5"
                    : "bg-white dark:bg-slate-900 border-r dark:border-slate-800",
                isMobile ? "w-full" : isExpanded ? "w-64" : "w-20"
            )}
            onMouseEnter={() => !isMobile && !isSuperAdmin && setIsExpanded(true)}
            onMouseLeave={() => !isMobile && !isSuperAdmin && setIsExpanded(false)}
        >
            {/* Logo Section */}
            <div className={cn(
                "h-16 flex items-center px-4 border-b",
                isSuperAdmin ? "border-white/5" : "dark:border-slate-800"
            )}>
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                    isSuperAdmin
                        ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                )}>
                    <ShieldCheck className="h-6 w-6 drop-shadow-md" />
                </div>
                {(isExpanded || isMobile) && (
                    <span className={cn(
                        "ml-3 text-xl font-black uppercase italic tracking-tighter whitespace-nowrap overflow-hidden transition-all duration-500",
                        isSuperAdmin ? "text-white" : "text-slate-900 dark:text-white"
                    )}>
                        MediCore<span className="text-purple-500"> PMS</span>
                    </span>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 group relative",
                                        isActive
                                            ? isSuperAdmin
                                                ? "bg-white/10 text-white"
                                                : "bg-primary/10 text-primary dark:bg-primary/20"
                                            : isSuperAdmin
                                                ? "text-zinc-500 hover:bg-white/5 hover:text-white"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                    title={!isExpanded && !isMobile ? item.name : undefined}
                                >
                                    <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && isSuperAdmin && "text-emerald-500")} />
                                    {(isExpanded || isMobile) && (
                                        <span className="ml-3 whitespace-nowrap">{item.name}</span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!isExpanded && !isMobile && (
                                        <div className={cn(
                                            "absolute left-full ml-6 px-3 py-2 text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl",
                                            isSuperAdmin ? "bg-white text-zinc-950" : "bg-slate-900 text-white"
                                        )}>
                                            {item.name}
                                            <div className={cn(
                                                "absolute right-full top-1/2 -translate-y-1/2 mr-1 border-4 border-transparent",
                                                isSuperAdmin ? "border-r-white" : "border-r-slate-900"
                                            )}></div>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t dark:border-slate-800">

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start rounded-xl group",
                        isSuperAdmin
                            ? "text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500"
                            : "text-destructive hover:bg-destructive/10 hover:text-destructive",
                        !isExpanded && !isMobile && "justify-center px-2"
                    )}
                    onClick={() => setShowLogoutModal(true)}
                    title={!isExpanded && !isMobile ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {(isExpanded || isMobile) && <span className="ml-3 font-black uppercase text-[10px] tracking-widest">Terminate Session</span>}
                </Button>
            </div>

            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
