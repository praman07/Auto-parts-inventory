"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Calendar, Clock, ChevronRight, Bike, CheckCircle2,
    XCircle, Clock3, Plus, HeartCrack, PartyPopper, AlertCircle,
    ArrowRight, RefreshCw,
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
};

const timeLabels: Record<string, string> = {
    morning: "Morning (9AM–12PM)",
    afternoon: "Afternoon (1PM–4PM)",
    evening: "Evening (4PM–7PM)",
};

export default function AppointmentsPage() {
    const [user, setUser] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { init(); }, []);

    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth/login?redirect=/appointments");
            return;
        }
        setUser(user);
        await fetchAppointments(user.id);
    };

    const fetchAppointments = async (uid: string) => {
        setLoading(true);
        const { data } = await supabase
            .from("appointments")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });
        const list = data || [];
        // Redirect BEFORE setting state — spinner stays, page never shows
        if (list.length === 0) {
            router.replace("/book?from=appointments");
            return; // stay in loading state, component will unmount
        }
        setAppointments(list);
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-24">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <p className="text-sm font-black text-zinc-400">Loading appointments...</p>
            </div>
        </div>
    );

    const pending = appointments.filter(a => a.status === "pending");
    const approved = appointments.filter(a => a.status === "approved");
    const rejected = appointments.filter(a => a.status === "rejected");

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-24">
            <div className="container mx-auto px-4 max-w-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-6">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">My <span className="text-orange-600">Appointments</span></h1>
                        <p className="text-xs font-bold text-zinc-400 mt-0.5">{appointments.length} total · {approved.length} confirmed</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => user && fetchAppointments(user.id)}
                            className="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm">
                            <RefreshCw className="w-4 h-4 text-zinc-400" />
                        </button>
                        <Link href="/book">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition-colors shadow-lg shadow-orange-600/20">
                                <Plus className="w-4 h-4" /> Book New
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                        { label: "Pending", count: pending.length, color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-400" },
                        { label: "Confirmed", count: approved.length, color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
                        { label: "Rejected", count: rejected.length, color: "bg-red-50 border-red-200 text-red-600", dot: "bg-red-500" },
                    ].map(s => (
                        <div key={s.label} className={`rounded-2xl border-2 p-3 ${s.color}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                            </div>
                            <p className="text-2xl font-black">{s.count}</p>
                        </div>
                    ))}
                </div>

                {/* Appointment Cards */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {appointments.map((appt, i) => (
                            <AppCard key={appt.id} appt={appt} index={i} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 p-5 bg-zinc-900 rounded-3xl text-center">
                    <p className="text-white font-black text-sm mb-1">Need another service?</p>
                    <p className="text-zinc-400 text-xs font-medium mb-4">Book a new appointment in seconds</p>
                    <Link href="/book">
                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-black transition-colors">
                            Book Another <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AppCard({ appt, index }: { appt: Appointment; index: number }) {
    const cfg = {
        pending: { banner: "bg-amber-500", icon: AlertCircle, title: "Awaiting Confirmation", sub: "Our team will review and confirm shortly.", card: "border-zinc-100", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" },
        approved: { banner: "bg-green-600", icon: PartyPopper, title: "Appointment Confirmed!", sub: "Please arrive on time. We're ready for you.", card: "border-green-100", badge: "bg-green-50 text-green-700 border-green-200", label: "Confirmed ✓" },
        rejected: { banner: "bg-red-600", icon: HeartCrack, title: "We're sorry — slot not available", sub: "Please rebook for a different date or time.", card: "border-red-100", badge: "bg-red-50 text-red-600 border-red-200", label: "Not Available" },
    }[appt.status];
    const Icon = cfg.icon;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <div className={`rounded-2xl border-2 overflow-hidden bg-white ${cfg.card}`}>
                {/* Status banner */}
                <div className={`${cfg.banner} px-4 py-2.5 flex items-center gap-2.5`}>
                    <Icon className="w-4 h-4 text-white shrink-0" />
                    <div>
                        <p className="text-white text-xs font-black">{cfg.title}</p>
                        <p className="text-white/70 text-[10px] font-medium">{cfg.sub}</p>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                                <Bike className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-zinc-900">{appt.vehicle_model}</p>
                                <p className="text-[10px] font-bold text-zinc-400">{appt.problem_type}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider border px-2.5 py-1 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mb-3">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-bold">
                                {new Date(appt.preferred_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-bold">{timeLabels[appt.preferred_time] || appt.preferred_time}</span>
                        </div>
                    </div>

                    {appt.admin_notes && (
                        <div className={`p-2.5 rounded-xl text-xs font-medium ${appt.status === "rejected" ? "bg-red-50 text-red-700" : "bg-zinc-50 text-zinc-600"}`}>
                            <span className="font-black">{appt.status === "rejected" ? "Reason: " : "Note: "}</span>
                            {appt.admin_notes.split('\n')[0]}
                        </div>
                    )}

                    {appt.status === "rejected" && (
                        <Link href="/book" className="mt-3 flex">
                            <button className="w-full h-9 rounded-xl bg-zinc-900 hover:bg-orange-600 text-white text-xs font-black transition-colors flex items-center justify-center gap-2">
                                Book a Different Slot <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
