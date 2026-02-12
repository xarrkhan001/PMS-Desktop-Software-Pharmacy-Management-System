import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            <div className="md:pl-64 flex flex-col flex-1 w-full h-full transition-all duration-300 ease-in-out">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/20">
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
