import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const userRole = localStorage.getItem("userRole")?.toUpperCase();
    const isSuperDashboard = userRole === "SUPER_ADMIN";

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col transition-all duration-300 ease-in-out">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1 w-full h-full transition-all duration-300 ease-in-out overflow-hidden">
                {!isSuperDashboard && <Navbar onMenuClick={() => setSidebarOpen(true)} />}
                <main className={`flex-1 overflow-y-auto bg-muted/20 ${isSuperDashboard ? 'p-0' : 'p-4 md:p-6'}`}>
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Sheet */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64 border-r-0">
                    <Sidebar isMobile />
                </SheetContent>
            </Sheet>
        </div>
    );
}
