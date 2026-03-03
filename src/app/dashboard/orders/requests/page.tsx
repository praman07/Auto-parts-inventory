"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ClipboardList,
    Search,
    Package,
    ArrowRight,
    Loader2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { Card } from "@/components/ui/animated-card";
import { motion, AnimatePresence } from "framer-motion";

type ProductRequest = {
    id: string;
    product_name: string;
    customer_name: string;
    customer_contact: string;
    status: "pending" | "ordered" | "fulfilled" | "cancelled";
    notes: string | null;
    created_at: string;
};

const statusConfig = {
    pending: { label: "New Request", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    ordered: { label: "Procuring", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Package },
    fulfilled: { label: "Arrived", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    cancelled: { label: "Unavailable", bg: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", icon: XCircle },
};

export default function OrderRequestsPage() {
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { fetchRequests(); }, []);

    async function fetchRequests() {
        setLoading(true);
        // Using real database table `product_requests`
        const { data, error } = await supabase
            .from("product_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching product requests:", error.message || error);
            setRequests([]);
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    }

    const filtered = requests.filter(r =>
        (r.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl pb-20 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Product Requests</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Special orders for out-of-stock components</p>
                </div>
                <Button onClick={fetchRequests} variant="outline" className="gap-2 bg-white/5 border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 h-10 px-6">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Incoming", count: requests.filter(r => r.status === 'pending').length, icon: Clock, color: "amber" },
                    { label: "Supplier", count: requests.filter(r => r.status === 'ordered').length, icon: Package, color: "blue" },
                    { label: "Fulfilled", count: requests.filter(r => r.status === 'fulfilled').length, icon: CheckCircle2, color: "emerald" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-3xl font-black text-white">{stat.count}</p>
                    </Card>
                ))}
                <div className="bg-orange-500/5 rounded-2xl border border-orange-500/10 p-6 flex flex-col justify-center items-center text-center">
                    <ShoppingCart className="w-8 h-8 text-orange-500 mb-2 opacity-20" />
                    <p className="text-[10px] font-black text-orange-500/40 uppercase tracking-widest">Global Sourcing</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-black/40 border border-white/[0.08] rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-white/[0.06]">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 transition-colors group-focus-within:text-white" />
                        <input
                            placeholder="Find character by item name or requester..."
                            className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder:text-zinc-800 focus:outline-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/[0.04]">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="p-8 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-zinc-900/50 animate-pulse rounded-2xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-48 bg-zinc-900/50 animate-pulse rounded" />
                                        <div className="h-3 w-32 bg-zinc-900/50 animate-pulse rounded" />
                                    </div>
                                    <div className="h-10 w-24 bg-zinc-900/50 animate-pulse rounded-xl" />
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                                <ClipboardList className="w-12 h-12 text-zinc-800" />
                                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Queue is currently empty</p>
                            </div>
                        ) : (
                            filtered.map((req) => {
                                const sc = statusConfig[req.status];
                                return (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 hover:bg-white/[0.01] transition-all group flex items-center justify-between gap-8"
                                    >
                                        <div className="flex gap-6 items-center flex-1 min-w-0">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white/30 shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                <sc.icon className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <h3 className="font-black text-xl text-white tracking-tight truncate">{req.product_name}</h3>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0 ${sc.bg}`}>
                                                        {sc.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-500">
                                                    <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 text-orange-500/40" /> {req.customer_name}</span>
                                                    <span className="opacity-30">• {req.customer_contact}</span>
                                                    <span className="opacity-30">• {new Date(req.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button size="sm" variant="ghost" className="h-10 rounded-xl text-zinc-600 hover:text-white font-bold text-[10px] uppercase">Review</Button>
                                            <Button size="sm" className="h-10 rounded-xl bg-white text-zinc-950 px-6 font-black text-[10px] uppercase tracking-widest">Update</Button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
