import { Bell, Menu, ShieldCheck, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, Link } from "react-router-dom";

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const userRole = localStorage.getItem("userRole")?.toUpperCase();
    const userName = localStorage.getItem("userName") || "Admin";
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-8 shadow-sm">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex-1 flex items-center gap-6">
                {userRole !== "SUPER_ADMIN" && (
                    <div className="hidden lg:flex items-center gap-3 px-5 py-2 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100/50 shadow-sm animate-pulse-slow">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Enterprise Shield Active</span>
                    </div>
                )}

                <div className="hidden md:flex items-center gap-2 group cursor-help">
                    <Zap className="h-4 w-4 text-amber-500 animate-bounce-slow" />
                    <span className="text-[12px] font-black text-slate-400 group-hover:text-amber-600 transition-colors uppercase tracking-widest">Global Terminal 01</span>
                </div>
            </div>

            <div className="flex items-center gap-5 ml-auto">
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl h-12 w-12 transition-all">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                </Button>

                <div className="h-8 w-[1px] bg-slate-100 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-2xl h-14 pl-2 pr-4 gap-3 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                            <Avatar className="h-10 w-10 rounded-xl border border-white shadow-md group-hover:scale-110 transition-transform">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black rounded-xl">
                                    {userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start gap-0">
                                <span className="text-xs font-black text-slate-900 leading-none">{userName}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{userRole}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] border-none shadow-2xl mt-1">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                                <User className="h-4 w-4" />
                                <span className="font-bold">Access Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/logs" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                                <Zap className="h-4 w-4" />
                                <span className="font-bold">System Logs</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            onClick={handleLogout}
                        >
                            <span className="font-black uppercase text-[11px] tracking-wider">Logout Terminal</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
