"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import {
    Calendar,
    Clock,
    ChevronLeft,
    LogOut,
    User,
    Bike,
    Wrench,
    CheckCircle2,
    XCircle,
    Clock3,
    RefreshCw,
    ShoppingBag,
    HeartCrack,
    PartyPopper,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Appointment = {
    id: string;
    vehicle_model: string;
    problem_type: string;
    preferred_date: string;
    preferred_time: string;
    status: "pending" | "approved" | "rejected";
    admin_notes: string | null;
    created_at: string;
    sales: {
        total_amount: number;
        sale_items: Array<{
            quantity: number;
            products: { name: string } | null;
        }>;
    } | null;
};

const timeLabels: Record<string, string> = {
    morning: "Morning (9AM–12PM)",
    afternoon: "Afternoon (1PM–4PM)",
    evening: "Evening (4PM–7PM)",
};

export default function CustomerProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth/login?redirect=/profile");
            return;
        }
        setUser(user);

        const { data: appts } = await supabase
            .from("appointments")
            .select(`*, sales(total_amount, sale_items(quantity, products(name)))`)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        setAppointments(appts || []);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
        : null;

    const pending = appointments.filter(a => a.status === "pending");
    const approved = appointments.filter(a => a.status === "approved");
    const rejected = appointments.filter(a => a.status === "rejected");

    if (loading) return (
        <div className="min-h-screen pt-32 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <p className="text-sm font-black text-zinc-400">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-orange-600 mb-6 sm:mb-8 uppercase tracking-widest transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Home
                </Link>

                {/* ── Profile Card ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-zinc-900 px-6 py-7 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xl font-black shrink-0">
                            {initials || <User className="w-7 h-7" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg font-black text-white truncate">{user?.user_metadata?.full_name || "User"}</h1>
                            <p className="text-zinc-400 text-xs font-medium mt-0.5 truncate">{user?.email}</p>
                            <p className="text-[10px] text-orange-400/70 font-bold uppercase tracking-widest mt-1">
                                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
                                <RefreshCw className="w-3.5 h-3.5 text-white/50" />
                            </button>
                            <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors">
                                <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                        </div>
                    </div>
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Full Name", value: user?.user_metadata?.full_name || "—" },
                            { label: "Email", value: user?.email || "—" },
                            { label: "Phone", value: user?.user_metadata?.phone || "Not provided" },
                            { label: "Total Appointments", value: String(appointments.length) },
                        ].map(f => (
                            <div key={f.label} className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{f.label}</p>
                                <div className="h-11 px-4 flex items-center bg-zinc-50 border border-zinc-100 rounded-xl">
                                    <p className="text-sm font-bold text-zinc-700 truncate">{f.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <Link href="/book" className="p-4 sm:p-5 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors">
                        <Calendar className="h-6 w-6 mb-2 opacity-80" />
                        <p className="font-black text-sm">Book Service</p>
                        <p className="text-[10px] font-medium opacity-60">New appointment</p>
                    </Link>
                    <Link href="/shop" className="p-4 sm:p-5 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors">
                        <Wrench className="h-6 w-6 mb-2 opacity-80" />
                        <p className="font-black text-sm">Browse Parts</p>
                        <p className="text-[10px] font-medium opacity-60">Genuine spares</p>
                    </Link>
                </div>

                {/* ── Appointments ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-black text-zinc-900">My Appointments</h2>
                        <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">{appointments.length} total</span>
                    </div>

                    {appointments.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center bg-white">
                            <Calendar className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <h3 className="font-black text-zinc-800 mb-1">No appointments yet</h3>
                            <p className="text-sm text-zinc-400 mb-5">Book your first service and we'll take care of the rest.</p>
                            <Link href="/book">
                                <Button className="rounded-xl bg-orange-600 font-bold text-sm px-6">Book a Service</Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {appointments.map((appt, i) => (
                                <AppointmentCard key={appt.id} appt={appt} index={i} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

function AppointmentCard({ appt, index }: { appt: Appointment; index: number }) {
    const isRejected = appt.status === "rejected";
    const isApproved = appt.status === "approved";
    const isPending = appt.status === "pending";

    const statusStyles = {
        pending: {
            card: "border-zinc-100 bg-white",
            badge: "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-400",
            icon: Clock3,
            label: "Pending Review",
        },
        approved: {
            card: "border-green-100 bg-green-50/30",
            badge: "bg-green-50 text-green-700 border-green-200",
            dot: "bg-green-500",
            icon: CheckCircle2,
            label: "Confirmed ✓",
        },
        rejected: {
            card: "border-red-100 bg-red-50/20",
            badge: "bg-red-50 text-red-600 border-red-200",
            dot: "bg-red-500",
            icon: XCircle,
            label: "Not Available",
        },
    }[appt.status];

    const StatusIcon = statusStyles.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className={`rounded-2xl border-2 overflow-hidden transition-all ${statusStyles.card}`}>

                {/* Rejected banner */}
                {isRejected && (
                    <div className="bg-red-600 px-5 py-3 flex items-center gap-3">
                        <HeartCrack className="w-5 h-5 text-white shrink-0" />
                        <div>
                            <p className="text-white text-xs font-black">We're sorry — this slot isn't available</p>
                            <p className="text-red-200 text-[10px] font-medium">Please book a new appointment for a different date or time.</p>
                        </div>
                    </div>
                )}

                {/* Approved banner */}
                {isApproved && (
                    <div className="bg-green-600 px-5 py-3 flex items-center gap-3">
                        <PartyPopper className="w-5 h-5 text-white shrink-0" />
                        <div>
                            <p className="text-white text-xs font-black">Your appointment is confirmed!</p>
                            <p className="text-green-200 text-[10px] font-medium">Please arrive on time. Our team is ready for you.</p>
                        </div>
                    </div>
                )}

                {/* Pending banner */}
                {isPending && (
                    <div className="bg-amber-500 px-5 py-3 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-white shrink-0" />
                        <div>
                            <p className="text-white text-xs font-black">Awaiting confirmation</p>
                            <p className="text-amber-100 text-[10px] font-medium">Our team will review and confirm shortly.</p>
                        </div>
                    </div>
                )}

                <div className="p-4 sm:p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isApproved ? 'bg-green-100' : isRejected ? 'bg-red-100' : 'bg-zinc-100'}`}>
                                <Bike className={`w-5 h-5 ${isApproved ? 'text-green-600' : isRejected ? 'text-red-400' : 'text-zinc-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-zinc-900">{appt.vehicle_model}</h3>
                                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{appt.problem_type}</p>
                            </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${statusStyles.badge}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                            {statusStyles.label}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mb-4">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-bold">{new Date(appt.preferred_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-bold">{timeLabels[appt.preferred_time] || appt.preferred_time}</span>
                        </div>
                    </div>

                    {/* Parts */}
                    {appt.sales && appt.sales.sale_items.length > 0 && (
                        <div className="mb-4 pt-3 border-t border-zinc-100">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Parts for Service</p>
                            <div className="flex flex-wrap gap-2">
                                {appt.sales.sale_items.map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg">
                                        <span className="text-orange-500">{item.quantity}×</span>
                                        {item.products?.name || "Part"}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 mt-2">
                                Parts Total: <span className="text-zinc-700">₹{appt.sales.total_amount?.toLocaleString("en-IN")}</span>
                            </p>
                        </div>
                    )}

                    {/* Admin note */}
                    {appt.admin_notes && (
                        <div className={`p-3 rounded-xl text-xs font-medium ${isRejected ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-zinc-50 text-zinc-600'}`}>
                            <span className="font-black text-[10px] uppercase tracking-wider mr-1">{isRejected ? 'Reason: ' : 'Note: '}</span>
                            {appt.admin_notes}
                        </div>
                    )}

                    {/* Rejected CTA */}
                    {isRejected && (
                        <Link href="/book" className="mt-4 flex">
                            <Button className="w-full h-10 bg-zinc-900 hover:bg-orange-600 text-white text-xs font-black rounded-xl transition-colors">
                                Book a Different Slot
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
