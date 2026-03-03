"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Search,
    Phone,
    Calendar,
    Loader2,
    RefreshCw,
    Mail,
    Bike,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { Card } from "@/components/ui/animated-card";
import { motion, AnimatePresence } from "framer-motion";

type CustomerData = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    bookings: number;
    lastBooking: string | null;
    vehicles: string[];
    totalSpent: number;
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { fetchCustomers(); }, []);

    async function fetchCustomers() {
        setLoading(true);
        try {
            const res = await fetch('/api/customers');
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const { customers: data, error } = await res.json();
            if (error) throw new Error(error);
            setCustomers(data || []);
        } catch (err: any) {
            console.error('fetchCustomers error:', err.message || err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = customers.filter(c => {
        const q = searchTerm.toLowerCase().trim();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });

    const activeRate = customers.length ? Math.round((customers.filter(c => c.bookings > 0).length / customers.length) * 100) : 0;

    return (
        <div className="space-y-8 max-w-7xl pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Customer Intelligence</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">LTV analysis & Behavioral mapping</p>
                </div>
                <Button onClick={fetchCustomers} variant="outline" className="gap-2 bg-white/5 border-white/10 rounded-2xl text-zinc-400 hover:text-white h-12 px-6">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Profiles
                </Button>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-black/40 border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <Users className="w-6 h-6 text-violet-500" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase">User Base</span>
                    </div>
                    <p className="text-4xl font-black text-white">{customers.length}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Identified Profiles</p>
                </Card>
                <Card className="bg-black/40 border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase">Cumulative Value</span>
                    </div>
                    <p className="text-4xl font-black text-white">₹{customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Lifetime Revenue</p>
                </Card>
                <Card className="bg-black/40 border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <ShieldCheck className="w-6 h-6 text-orange-500" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase">Retention</span>
                    </div>
                    <p className="text-4xl font-black text-white">{activeRate}%</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Booking Conversion</p>
                </Card>
            </div>

            {/* Directory */}
            <div className="bg-black/40 border border-white/[0.08] rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-white/[0.06]">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 transition-colors group-focus-within:text-white" />
                        <input
                            placeholder="Find character by name or email signature..."
                            className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder:text-zinc-800 focus:outline-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Customer Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Recent Assets</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">LTV Score</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b border-white/[0.04]">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-zinc-900/50 animate-pulse rounded-2xl" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-zinc-900/50 animate-pulse rounded" />
                                                        <div className="h-3 w-40 bg-zinc-900/50 animate-pulse rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6"><div className="h-4 w-40 bg-zinc-900/50 animate-pulse rounded" /></td>
                                            <td className="px-8 py-6"><div className="h-4 w-24 bg-zinc-900/50 animate-pulse rounded" /></td>
                                            <td className="px-8 py-6"><div className="h-4 w-16 bg-zinc-900/50 animate-pulse rounded ml-auto" /></td>
                                            <td className="px-8 py-6"><div className="h-10 w-10 bg-zinc-900/50 animate-pulse rounded-xl" /></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                            <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">No matching identities found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-white/40 text-lg shrink-0 group-hover:scale-105 transition-all">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[14px] font-black text-white tracking-tight truncate max-w-[160px]">{user.name}</p>
                                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter truncate max-w-[120px]">{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs">
                                                    <Mail className="w-3.5 h-3.5 opacity-20" /> {user.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.vehicles.slice(0, 2).map((v, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[9px] font-black text-zinc-500 uppercase">{v}</span>
                                                    ))}
                                                    {user.vehicles.length > 2 && <span className="text-[9px] text-zinc-700 font-black">+{user.vehicles.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-sm font-black text-white tracking-tight">₹{user.totalSpent.toLocaleString("en-IN")}</p>
                                                <p className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{user.bookings} Bookings</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
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
