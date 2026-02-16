import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
    isMobile?: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/login");
    };

    const userRole = localStorage.getItem("userRole")?.toUpperCase();

    const allNavItems = [
        { name: "Super Admin Control", icon: ShieldCheck, path: "/super-admin", roles: ["SUPER_ADMIN"] },
        { name: "Managed Pharmacies", icon: Users, path: "/super-pharmacies", roles: ["SUPER_ADMIN"] },
        { name: "Terminal Purge", icon: ShieldAlert, path: "/super-terminal", roles: ["SUPER_ADMIN"] },
        { name: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Inventory", icon: Pill, path: "/inventory", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Billing", icon: ShoppingCart, path: "/billing", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Invoice Archive", icon: FileText, path: "/sales-history", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Suppliers", icon: Truck, path: "/suppliers", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Stock Inward", icon: PackagePlus, path: "/purchases", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Customers", icon: Users, path: "/customers", roles: ["ADMIN", "PHARMACIST", "STAFF"] },
        { name: "Finance & Accounts", icon: Wallet, path: "/finance", roles: ["ADMIN"] },
        { name: "Reports", icon: FileBarChart, path: "/reports", roles: ["ADMIN", "PHARMACIST"] },
        { name: "Admin", icon: Settings, path: "/admin", roles: ["ADMIN"] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(userRole || ""));

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all duration-300 ease-in-out",
                isMobile ? "w-full" : isExpanded ? "w-64" : "w-20"
            )}
            onMouseEnter={() => !isMobile && setIsExpanded(true)}
            onMouseLeave={() => !isMobile && setIsExpanded(false)}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-4 border-b dark:border-slate-800">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill className="h-5 w-5 text-primary" />
                </div>
                {(isExpanded || isMobile) && (
                    <span className="ml-3 text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden">
                        Pharm<span className="text-blue-600">Pro</span>
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
                                        "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                    title={!isExpanded && !isMobile ? item.name : undefined}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {(isExpanded || isMobile) && (
                                        <span className="ml-3 whitespace-nowrap">{item.name}</span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!isExpanded && !isMobile && (
                                        <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-1 border-4 border-transparent border-r-slate-900"></div>
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
                        "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl",
                        !isExpanded && !isMobile && "justify-center px-2"
                    )}
                    onClick={handleLogout}
                    title={!isExpanded && !isMobile ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {(isExpanded || isMobile) && <span className="ml-3">Logout</span>}
                </Button>
            </div>
        </div>
    );
}
