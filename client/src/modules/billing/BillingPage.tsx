import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Plus, Trash, Search, DollarSign, Printer,
    CreditCard, History, Receipt, XCircle, HandCoins
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
    id: number;
    name: string;
    price: number;
    qty: number;
}

const recentSales = [
    { id: "INV-001", customer: "Asad Rahim", total: 1250, time: "5 mins ago" },
    { id: "INV-002", customer: "Walking Customer", total: 450, time: "12 mins ago" },
    { id: "INV-003", customer: "Mrs. Fatima", total: 3200, time: "1 hour ago" },
];

export default function BillingPage() {
    const [items, setItems] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [discount, setDiscount] = useState(0);
    const { toast } = useToast();

    const handleCheckout = () => {
        if (items.length === 0) {
            toast({
                title: "Empty Bill",
                description: "Add some items before checkout.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Success",
            description: `Checkout completed for PKR ${total.toFixed(2)}. Receipt printing...`,
        });
        setItems([]);
        setDiscount(0);
    };

    const addItem = () => {
        const newItem = {
            id: Date.now(),
            name: "Paracetamol 500mg " + (items.length + 1),
            price: 15.00,
            qty: 1
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateQty = (id: number, delta: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        ));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = subtotal - discount;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            {/* Left Panel: Product Search & List */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Scan Barcode or Search Medicine (CTRL + F)..."
                            className="pl-12 h-14 text-lg rounded-2xl border-2 focus-visible:ring-primary shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="h-14 px-8 rounded-2xl shadow-lg shadow-primary/20" onClick={addItem}>
                        <Plus className="mr-2 h-5 w-5 font-bold" /> Add Item
                    </Button>
                </div>

                <Card className="flex-1 overflow-hidden flex flex-col rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-bold">New Transaction</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-9">
                                <HandCoins className="mr-2 h-4 w-4" /> Hold Bill
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-lg h-9 text-destructive hover:bg-red-50" onClick={() => setItems([])}>
                                <XCircle className="mr-2 h-4 w-4" /> Clear All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold py-4">Item Description</TableHead>
                                    <TableHead className="w-[120px] text-right font-bold py-4">Unit Price</TableHead>
                                    <TableHead className="w-[140px] text-center font-bold py-4">Quantity</TableHead>
                                    <TableHead className="w-[120px] text-right font-bold py-4">Discount</TableHead>
                                    <TableHead className="w-[120px] text-right font-bold py-4">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-[200px] text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <ShoppingBagIcon className="h-16 w-16" />
                                                <p className="text-lg font-medium">Cart is empty</p>
                                                <p className="text-sm">Scan items or search to start billing</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-slate-50/50">
                                            <TableCell className="font-semibold py-4 text-slate-900 dark:text-white">{item.name}</TableCell>
                                            <TableCell className="text-right">PKR {item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQty(item.id, -1)}>-</Button>
                                                    <span className="w-8 text-center font-bold">{item.qty}</span>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQty(item.id, 1)}>+</Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">-0.00</TableCell>
                                            <TableCell className="text-right font-bold text-primary">PKR {(item.price * item.qty).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel: Payment Summary */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
                <Card className="flex flex-col rounded-3xl border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="bg-slate-800/50 pb-6 pt-8">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-2">
                                <DollarSign className="h-7 w-7 text-primary" /> Bill Summary
                            </CardTitle>
                            <Badge className="bg-primary/20 text-primary border-primary/20">PKR Currency</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 flex-1">
                        <div className="space-y-4">
                            <div className="flex justify-between text-base opacity-70">
                                <span>Subtotal</span>
                                <span>PKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <div className="flex items-center gap-2 opacity-70">
                                    <span>Discount</span>
                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded uppercase">Adjust</span>
                                </div>
                                <Input
                                    type="number"
                                    className="w-24 h-9 text-right bg-white/10 border-none text-white font-bold"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-between text-base opacity-70">
                                <span>Tax (0% GST)</span>
                                <span>PKR 0.00</span>
                            </div>
                            <div className="border-t border-white/10 pt-6 mt-4 flex justify-between items-end">
                                <span className="text-xl font-bold uppercase tracking-tight opacity-50">Grand Total</span>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-primary leading-none tracking-tighter italic">PKR {total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button variant="outline" className="h-20 flex flex-col gap-1 border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-all rounded-2xl group">
                                <DollarSign className="h-7 w-7 group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Cash Payment</span>
                            </Button>
                            <Button variant="outline" className="h-20 flex flex-col gap-1 border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-all rounded-2xl group">
                                <CreditCard className="h-7 w-7 group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Card / Digital</span>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 p-8 bg-slate-800/80">
                        <Button size="lg" className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tighter" onClick={handleCheckout}>
                            Checkout & Print
                        </Button>
                        <div className="flex w-full gap-2">
                            <Button variant="ghost" className="flex-1 text-white/50 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl">
                                <Printer className="mr-2 h-4 w-4" /> Print Last
                            </Button>
                            <Button variant="ghost" className="flex-1 text-white/50 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl">
                                <History className="mr-2 h-4 w-4" /> History
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Quick Shortcuts / Recent Card */}
                <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 h-full">
                    <CardHeader className="py-4 border-b">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <History className="h-4 w-4" /> Recent Invoices
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{sale.customer}</span>
                                        <span className="text-[10px] text-muted-foreground">{sale.id} • {sale.time}</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">PKR {sale.total}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${className}`}>
            {children}
        </span>
    );
}
