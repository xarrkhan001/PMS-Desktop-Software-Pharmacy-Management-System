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

interface SidebarProps {
    isMobile?: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

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
        <div className={cn("flex flex-col h-full bg-white dark:bg-slate-900 border-r dark:border-slate-800", isMobile ? "w-full" : "w-64")}>
            <div className="h-16 flex items-center px-6 border-b dark:border-slate-800">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Pill className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Pharm<span className="text-blue-600">Pro</span></span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border dark:border-slate-700">
                    <h4 className="text-sm font-semibold mb-1 dark:text-slate-200">Need Help?</h4>
                    <p className="text-xs text-muted-foreground mb-3">Check docs or contact support</p>
                    <button className="text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 shadow-sm px-3 py-1.5 rounded-md w-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Documentation</button>
                </div>
                <Button
                    variant="ghost"
                    className="w-full mt-4 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
