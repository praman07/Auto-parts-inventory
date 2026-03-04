"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/animated-card";
import {
    Calendar,
    Clock,
    User,
    Bike,
    CheckCircle2,
    XCircle,
    Search,
    MessageCircle,
    RefreshCw,
    Trash2,
    AlertTriangle,
    Check,
    Phone,
    Mail,
    Filter,
    Package,
} from "lucide-react";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Appointment = {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    user_phone: string | null;
    vehicle_model: string;
    problem_type: string;
    preferred_date: string;
    preferred_time: string;
    status: "pending" | "approved" | "rejected";
    admin_notes: string | null;
    created_at: string;
    sale_id: string | null;
    sales?: {
        total_amount: number;
        sale_items: Array<{
            products: { name: string };
            quantity: number;
        }>;
    };
};

const statusConfig = {
    pending: { label: "Awaiting Review", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
    approved: { label: "Confirmed", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", dot: "bg-emerald-500" },
    rejected: { label: "Declined", bg: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500" },
};

const timeLabels: Record<string, string> = {
    morning: "9AM - 12PM",
    afternoon: "1PM - 4PM",
    evening: "4PM - 7PM",
};

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

    useEffect(() => { fetchAppointments(); }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        // Using a join to get sales and items
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                *,
                sales (
                    total_amount,
                    sale_items (
                        quantity,
                        products (
                            name
                        )
                    )
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to load appointments");
            console.error(error.message);
        }
        setAppointments(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: "approved" | "rejected") => {
        const notes = adminNotes[id] || null;
        const { error } = await supabase
            .from("appointments")
            .update({ status, admin_notes: notes, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) { toast.error("Failed to update"); return; }
        toast.success(`Appointment ${status}`);
        fetchAppointments();
    };

    const deleteOne = async (id: string) => {
        const { error } = await supabase.from("appointments").delete().eq("id", id);
        if (error) { toast.error("Failed to delete"); return; }
        toast.success("Appointment deleted");
        fetchAppointments();
    };

    const bulkCleanup = async () => {
        const rejectedCount = appointments.filter(a => a.status === "rejected").length;
        if (rejectedCount === 0) {
            toast.info("No rejected appointments to clean up");
            return;
        }

        if (!confirm(`Are you sure you want to delete all ${rejectedCount} declined appointments?`)) return;

        setLoading(true);
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("status", "rejected");

        if (error) {
            toast.error("Cleanup failed: " + error.message);
        } else {
            toast.success(`Cleaned up ${rejectedCount} records`);
            fetchAppointments();
        }
        setLoading(false);
    }

    const filtered = appointments.filter(a => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
            (a.user_name || "").toLowerCase().includes(q) ||
            (a.user_email || "").toLowerCase().includes(q) ||
            (a.vehicle_model || "").toLowerCase().includes(q) ||
            (a.user_phone || "").includes(q);
        const matchesStatus = filterStatus === "all" || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const counts = {
        all: appointments.length,
        pending: appointments.filter(a => a.status === "pending").length,
        approved: appointments.filter(a => a.status === "approved").length,
        rejected: appointments.filter(a => a.status === "rejected").length,
    };

    return (
        <div className="space-y-6 md:space-y-8 max-w-6xl pb-20">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Workshop Schedule</h1>
                        <p className="text-zinc-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-1">Manage service bookings and appointments</p>
                    </div>
                    <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 gap-2 bg-black/40 p-1 md:p-1.5 rounded-2xl border border-white/5 no-scrollbar">
                        {["all", "pending", "approved"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterStatus(f)}
                                className={`px-4 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterStatus === f ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                            >
                                {f} ({counts[f as keyof typeof counts]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
                    <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-5 md:p-6 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-all" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                                <Calendar className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase">Bookings</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{counts.all}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Total Received</p>
                        </div>
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-5 md:p-6 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-all" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 uppercase animate-pulse">Pending</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{counts.pending}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Awaiting Review</p>
                        </div>
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-5 md:p-6 flex flex-col justify-between hover:bg-zinc-900/60 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-all" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Jobs</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{counts.approved}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Confirmed</p>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={fetchAppointments}
                            className="flex-1 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center gap-3 text-white/40 hover:text-white hover:bg-white/[0.08] transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} /> Sync
                        </button>
                        <button
                            onClick={bulkCleanup}
                            className="flex-1 rounded-[1.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center gap-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Cleanup
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <input
                    placeholder="Search by client, vehicle, or contact..."
                    className="w-full h-14 md:h-16 pl-14 pr-6 bg-black/40 border border-white/[0.08] rounded-[1.5rem] text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all font-bold text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Appointments Grid/List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((appt) => {
                        const sc = statusConfig[appt.status];
                        return (
                            <motion.div
                                key={appt.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-zinc-900/40 rounded-[2.5rem] border border-white/[0.06] p-5 md:p-8 hover:border-orange-500/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col xl:flex-row gap-8 relative z-10">
                                    {/* User Section */}
                                    <div className="flex gap-6 items-center flex-1">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-2xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                                            {appt.user_name?.charAt(0) || <User className="w-8 h-8 opacity-20" />}
                                        </div>
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sc.bg}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                    {sc.label}
                                                </div>
                                            </div>
                                            <h3 className="font-black text-xl md:text-2xl text-white group-hover:text-orange-400 transition-colors truncate">{appt.user_name}</h3>
                                            <div className="flex flex-wrap gap-4 pt-1">
                                                <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-tighter">
                                                    <Mail className="w-3 h-3 text-orange-500/50" /> {appt.user_email}
                                                </div>
                                                {appt.user_phone && (
                                                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-tighter">
                                                        <Phone className="w-3 h-3 text-orange-500/50" /> {appt.user_phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 flex-[2]">
                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                                            <div className="text-zinc-600 font-black text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Bike className="w-3.5 h-3.5 text-orange-500/40" /> Vehicle
                                            </div>
                                            <div className="text-white font-black text-xs md:text-sm tracking-tight truncate">{appt.vehicle_model}</div>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                                            <div className="text-zinc-600 font-black text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <MessageCircle className="w-3.5 h-3.5 text-orange-500/40" /> Issue
                                            </div>
                                            <div className="text-white font-black text-xs md:text-sm tracking-tight truncate">{appt.problem_type}</div>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                                            <div className="text-zinc-600 font-black text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-orange-500/40" /> Schedule
                                            </div>
                                            <div className="text-white font-black text-xs md:text-sm tracking-tight">
                                                {new Date(appt.preferred_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                                            <div className="text-zinc-600 font-black text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-orange-500/40" /> Window
                                            </div>
                                            <div className="text-white font-black text-xs md:text-sm tracking-tight truncate">{timeLabels[appt.preferred_time] || appt.preferred_time}</div>
                                        </div>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="flex flex-row xl:flex-col gap-2 shrink-0">
                                        {appt.status === "pending" ? (
                                            <>
                                                <Button
                                                    onClick={() => updateStatus(appt.id, "approved")}
                                                    className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl h-12 md:h-14 px-8 shadow-xl shadow-emerald-900/10 text-[11px] uppercase tracking-widest"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => updateStatus(appt.id, "rejected")}
                                                    className="flex-1 lg:flex-none text-zinc-500 hover:text-red-500 hover:bg-red-500/10 font-bold rounded-xl h-12 md:h-14 px-8 text-[11px] uppercase tracking-widest border border-white/5"
                                                >
                                                    Decline
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex flex-row xl:flex-col items-center gap-4 w-full xl:w-32 bg-black/20 p-2 rounded-2xl border border-white/5">
                                                <div className={`p-3 rounded-xl border ${sc.bg} flex items-center justify-center shrink-0`}>
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <button
                                                    onClick={() => deleteOne(appt.id)}
                                                    className="flex-1 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors py-2"
                                                >
                                                    Remove record
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Linked Parts Section */}
                                {appt.sales && appt.sales.sale_items.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Package className="w-4 h-4 text-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Linked Parts for Installation</span>
                                            <div className="ml-auto px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                                                PRE-PAID VIA BOOKING
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {appt.sales.sale_items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-500/5 flex items-center justify-center text-[10px] font-black text-orange-500 border border-orange-500/10">
                                                        {item.quantity}x
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-300 truncate">{item.products?.name || "Unknown Part"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Internal Notes Toggle Area */}
                                {appt.status === "pending" && (
                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center">
                                        <div className="flex-1 w-full relative">
                                            <Input
                                                placeholder="Service technician notes..."
                                                className="bg-black/20 border-white/5 text-xs text-white placeholder:text-zinc-800 h-12 rounded-xl pl-5"
                                                value={adminNotes[appt.id] || ""}
                                                onChange={(e) => setAdminNotes({ ...adminNotes, [appt.id]: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-600 font-bold italic px-4 text-center md:text-left">Notes are saved when you Approve or Decline</p>
                                    </div>
                                )}

                                {appt.admin_notes && (
                                    <div className="mt-8 pt-4 border-t border-white/5 bg-black/10 -mx-8 -mb-8 px-8 py-4">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] mb-1 flex items-center gap-2">
                                            <MessageCircle className="w-3.5 h-3.5" /> Booking Notes & Parts
                                        </p>
                                        <p className="text-[11px] text-white/50 whitespace-pre-wrap leading-relaxed">{appt.admin_notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && !loading && (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-black/20 rounded-[3rem] border border-dashed border-white/10">
                        <div className="w-24 h-24 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5">
                            <Calendar className="w-10 h-10 text-zinc-800" />
                        </div>
                        <div>
                            <p className="text-white font-black text-xl tracking-tight">Zero Matches Found</p>
                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[.2em] mt-1">Refine your search parameters</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
