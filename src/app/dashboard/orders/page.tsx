"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ShoppingBag,
    Search,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Package,
    Loader2,
    RefreshCw,
    Filter,
    User,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { Card } from "@/components/ui/animated-card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Sale = {
    id: string;
    created_at: string;
    total_amount: number;
    user_id: string;
    users: {
        full_name: string | null;
        email: string | null;
    } | null;
    customers: {
        full_name: string | null;
        phone: string | null;
    } | null;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        // Try with advanced join first
        const { data, error } = await supabase
            .from("sales")
            .select(`
                *,
                users (
                    full_name
                ),
                customers (
                    full_name,
                    phone
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders with join:", error.message || error);
            // Fallback to simple query if joins fail (e.g. table not existing yet)
            const { data: fallbackData, error: fallbackError } = await supabase
                .from("sales")
                .select(`
                    *,
                    users (
                        full_name
                    )
                `)
                .order("created_at", { ascending: false });

            if (fallbackError) {
                console.error("Fallback fetch orders failed:", fallbackError.message || fallbackError);
            } else {
                setOrders(fallbackData || []);
            }
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const filtered = orders.filter(o => {
        const q = searchTerm.toLowerCase();
        return (o.users?.full_name?.toLowerCase().includes(q) ||
            o.id.includes(q));
    });

    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0);

    return (
        <div className="space-y-8 max-w-6xl animate-in fade-in duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Sales History</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Audit trail of all system transactions</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchOrders} variant="outline" className="gap-2 bg-white/5 border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 h-12 px-6">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gross Revenue</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white">₹{totalRevenue.toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Platform Total</p>
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Volume</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white">{orders.length}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Successful Orders</p>
                    </div>
                </Card>
                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tickets</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white">₹{(totalRevenue / (orders.length || 1)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Average Order Value</p>
                    </div>
                </Card>
            </div>

            {/* Table Area */}
            <div className="bg-black/40 border border-white/[0.08] rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-white/[0.06] flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                        <input
                            placeholder="Find sale by ID or customer name..."
                            className="w-full h-12 pl-12 pr-4 bg-transparent text-white placeholder:text-zinc-800 focus:outline-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Transaction ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date/Time</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Amount</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b border-white/[0.04]">
                                            <td className="px-8 py-6"><div className="h-4 w-24 bg-zinc-900/50 animate-pulse rounded" /></td>
                                            <td className="px-8 py-6"><div className="h-4 w-32 bg-zinc-900/50 animate-pulse rounded" /></td>
                                            <td className="px-8 py-6"><div className="h-4 w-28 bg-zinc-900/50 animate-pulse rounded" /></td>
                                            <td className="px-8 py-6"><div className="h-4 w-20 bg-zinc-900/50 animate-pulse rounded ml-auto" /></td>
                                            <td className="px-8 py-6"><div className="h-10 w-10 bg-zinc-900/50 animate-pulse rounded-xl ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                            <p className="text-white font-black">No transactions found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((sale) => (
                                        <motion.tr
                                            key={sale.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs text-zinc-500 uppercase">{sale.id.slice(0, 8)}...</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white">{sale.customers?.full_name || sale.users?.full_name || "Guest Customer"}</span>
                                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">{sale.customers?.phone || sale.users?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs">
                                                    <Calendar className="w-3 h-3 opacity-30" />
                                                    {format(new Date(sale.created_at), "MMM d, yyyy • HH:mm")}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-white">₹{Number(sale.total_amount).toLocaleString("en-IN")}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => router.push(`/dashboard/orders/${sale.id}`)}
                                                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
