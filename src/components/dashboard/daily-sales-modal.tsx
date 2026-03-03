"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Minus, Plus, RefreshCw, X } from "lucide-react";
import { fetchWithRetry } from "@/lib/api-client";
import { toast } from "sonner";

interface SaleItem {
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: { name: string; sku: string; part_number: string };
    sales: { created_at: string };
}

interface DailySalesModalProps {
    date: string | null;
    onClose: () => void;
}

export function DailySalesModal({ date, onClose }: DailySalesModalProps) {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!date) return;
        setLoading(true);
        fetchWithRetry(`/api/dashboard/sales?date=${date}`)
            .then(res => setItems(res.data || []))
            .catch(err => {
                console.error(err);
                toast.error("Failed to load daily sales data.");
            })
            .finally(() => setLoading(false));
    }, [date]);

    const handleUpdateQuantity = async (item: SaleItem, delta: number) => {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity === item.quantity) return;

        setUpdating(item.id);

        try {
            const res = await fetch("/api/dashboard/sales", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: item.id,
                    newQuantity,
                    oldQuantity: item.quantity,
                    productId: item.product_id,
                    saleId: item.sale_id,
                    unitPrice: item.unit_price
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Quantity updated");
                if (newQuantity === 0) {
                    setItems(items.filter(i => i.id !== item.id));
                } else {
                    setItems(items.map(i => i.id === item.id ? { ...i, quantity: newQuantity, subtotal: newQuantity * i.unit_price } : i));
                }
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setUpdating(null);
        }
    };

    if (!date) return null;

    return (
        <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/10 bg-zinc-900/50">
                    <DialogTitle className="text-xl font-black italic text-emerald-500">
                        Sales Activity
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
                        {new Date(date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center text-zinc-500 py-8 font-bold italic">No items found for this date.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white">{item.products?.name || "Unknown Product"}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">SKU: {item.products?.sku} | TIME: {new Date(item.sales?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-500">₹{item.subtotal.toLocaleString("en-IN")}</p>
                                        <p className="text-[10px] text-zinc-500">₹{item.unit_price}/ea</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/50 p-1 rounded-xl border border-white/5">
                                        <button
                                            disabled={updating === item.id}
                                            onClick={() => handleUpdateQuantity(item, -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                                        >
                                            <Minus className="w-4 h-4 text-zinc-400" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-bold text-white relative">
                                            {updating === item.id ? <Loader2 className="w-4 h-4 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> : item.quantity}
                                        </span>
                                        <button
                                            disabled={updating === item.id}
                                            onClick={() => handleUpdateQuantity(item, 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 text-emerald-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
