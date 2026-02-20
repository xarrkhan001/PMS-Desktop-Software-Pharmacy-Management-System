import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="bg-rose-500 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <LogOut className="h-24 w-24" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            Secure Logout
                        </DialogTitle>
                        <DialogDescription className="text-rose-100 font-medium opacity-90 italic">
                            Authentication Termination Request
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900 leading-tight">Are you sure you want to log out?</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                You are about to terminate your current active session. Any unsaved changes may be lost.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Stay Logged In
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-100 transition-all active:scale-95"
                        >
                            Logout Now
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
