"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/animated-card";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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

const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock3, dot: "bg-yellow-500" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, dot: "bg-green-500" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, dot: "bg-red-500" },
};

const timeLabels: Record<string, string> = {
    morning: "Morning (9AM-12PM)",
    afternoon: "Afternoon (1PM-4PM)",
    evening: "Evening (4PM-7PM)",
};

export default function CustomerProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth/login?redirect=/profile");
            return;
        }
        setUser(user);

        const { data: appts } = await supabase
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
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        setAppointments(appts || []);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) return <div className="min-h-screen pt-32 text-center font-black text-zinc-400">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-600 mb-6 uppercase tracking-widest">
                    <ChevronLeft className="h-4 w-4" /> Home
                </Link>

                {/* ── Read-Only Profile Card ── */}
                <div className="mb-8 bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                    {/* Card Header */}
                    <div className="bg-zinc-900 px-6 py-8 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-black shrink-0">
                            {user?.user_metadata?.full_name
                                ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                                : <User className="w-8 h-8" />
                            }
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-white truncate">{user?.user_metadata?.full_name || "User"}</h1>
                            <p className="text-zinc-400 text-xs font-medium mt-0.5 truncate">{user?.email}</p>
                            <p className="text-[10px] text-orange-400/70 font-bold uppercase tracking-widest mt-1">
                                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
                            </p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl font-bold gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 bg-transparent">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-400 hover:bg-red-500/10 rounded-xl font-bold gap-2 border border-red-500/20">
                                <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Info Fields — read only */}
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Full Name", value: user?.user_metadata?.full_name || "—" },
                            { label: "Email Address", value: user?.email || "—" },
                            { label: "Phone", value: user?.user_metadata?.phone || "Not provided" },
                            { label: "Account ID", value: user?.id?.slice(0, 16) + "..." || "—" },
                        ].map((field) => (
                            <div key={field.label} className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{field.label}</p>
                                <div className="h-11 px-4 flex items-center bg-zinc-50 border border-zinc-100 rounded-xl">
                                    <p className="text-sm font-bold text-zinc-700 truncate">{field.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                    <Link href="/book">
                        <div className="p-4 sm:p-6 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors cursor-pointer">
                            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-80" />
                            <p className="font-black text-sm sm:text-base">Book Service</p>
                            <p className="text-[10px] sm:text-xs font-medium opacity-70">New appointment</p>
                        </div>
                    </Link>
                    <Link href="/shop">
                        <div className="p-4 sm:p-6 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors cursor-pointer">
                            <Wrench className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-80" />
                            <p className="font-black text-sm sm:text-base">Browse Parts</p>
                            <p className="text-[10px] sm:text-xs font-medium opacity-70">Check availability</p>
                        </div>
                    </Link>
                </div>

                {/* Appointments Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-black text-zinc-900">My Appointments</h2>
                        <span className="text-xs font-bold text-zinc-400">{appointments.length} total</span>
                    </div>

                    {appointments.length === 0 ? (
                        <Card className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white">
                            <CardContent className="p-8 sm:p-12 text-center">
                                <Calendar className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <h3 className="font-bold text-zinc-900 mb-1">No appointments yet</h3>
                                <p className="text-sm text-zinc-500 mb-4">Book your first service appointment</p>
                                <Link href="/book">
                                    <Button className="rounded-xl bg-orange-600 font-bold">Book Service</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {appointments.map((appt) => {
                                const sc = statusConfig[appt.status];
                                const StatusIcon = sc.icon;
                                return (
                                    <motion.div
                                        key={appt.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className="rounded-2xl border-2 border-zinc-100 bg-white overflow-hidden hover:border-zinc-200 transition-colors">
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-50 flex items-center justify-center">
                                                            <Bike className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-sm sm:text-base text-zinc-900">{appt.vehicle_model}</h3>
                                                            <p className="text-[10px] sm:text-xs font-bold text-zinc-400">{appt.problem_type}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${sc.color}`}>
                                                        <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                                                        {sc.label}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="font-bold">{new Date(appt.preferred_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="font-bold">{timeLabels[appt.preferred_time] || appt.preferred_time}</span>
                                                    </div>
                                                </div>

                                                {/* Linked Products */}
                                                {appt.sales && appt.sales.sale_items.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-zinc-50 space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Selected Parts for Service:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {appt.sales.sale_items.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-zinc-600 bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">
                                                                    <span className="text-orange-600">{item.quantity}x</span>
                                                                    <span className="truncate">{item.products?.name || "Unknown Part"}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {appt.admin_notes && (
                                                    <div className="mt-3 p-3 bg-zinc-50 rounded-xl text-xs font-bold text-zinc-600">
                                                        <span className="text-zinc-400">Admin: </span>{appt.admin_notes}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
