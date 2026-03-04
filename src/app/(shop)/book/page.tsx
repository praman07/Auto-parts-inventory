"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Bike, CheckCircle, CalendarDays, ChevronUp, ChevronDown,
    Search, Plus, Minus, Package, X, Wrench, ArrowRight, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

// ─── Calendar ────────────────────────────────────────────────────────────────
function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function MiniCalendar({ selectedDate, onSelect, minDate }: { selectedDate: string; onSelect: (d: string) => void; minDate: string }) {
    const today = new Date();
    const [vm, setVm] = useState(today.getMonth());
    const [vy, setVy] = useState(today.getFullYear());
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const firstDay = new Date(vy, vm, 1).getDay();
    const dim = new Date(vy, vm + 1, 0).getDate();
    const minD = new Date(minDate + "T00:00:00");
    const goNext = () => vm === 11 ? (setVm(0), setVy(vy + 1)) : setVm(vm + 1);
    const goPrev = () => { if (!(vy === minD.getFullYear() && vm <= minD.getMonth())) vm === 0 ? (setVm(11), setVy(vy - 1)) : setVm(vm - 1); };
    return (
        <div className="bg-white rounded-2xl border-2 border-zinc-100 shadow-2xl p-4 w-full max-w-xs">
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={goPrev} className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"><ChevronUp className="w-3.5 h-3.5 -rotate-90" /></button>
                <span className="font-black text-xs text-zinc-900">{months[vm]} {vy}</span>
                <button type="button" onClick={goNext} className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"><ChevronDown className="w-3.5 h-3.5 -rotate-90" /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">{days.map(d => <div key={d} className="text-center text-[9px] font-bold text-zinc-400 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
                {Array.from({ length: dim }).map((_, i) => {
                    const day = i + 1;
                    const ds = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const disabled = new Date(ds + "T00:00:00") < minD;
                    const sel = ds === selectedDate;
                    return (
                        <button key={day} type="button" disabled={disabled} onClick={() => onSelect(ds)}
                            className={`w-full aspect-square rounded-lg text-xs font-bold transition-all flex items-center justify-center
                            ${sel ? "bg-orange-600 text-white shadow-md" : ""}
                            ${!sel && !disabled ? "text-zinc-800 hover:bg-orange-50 hover:text-orange-600" : ""}
                            ${disabled ? "text-zinc-200 cursor-not-allowed" : "cursor-pointer"}`}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Booking Form ────────────────────────────────────────────────────────────
import { useCart } from "@/context/cart-context";

function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const partId = searchParams.get("part");
    const fromAppointments = searchParams.get("from") === "appointments";

    const { items: cartItems, removeItem, totalPrice, clearCart } = useCart();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const minDate = getTomorrow();
    const [form, setForm] = useState({
        vehicleModel: "",
        problemType: "",
        preferredDate: "",
        preferredTime: "",
        notes: "",
    });

    // Auto-set service type when parts are in cart
    useEffect(() => {
        if (cartItems.length > 0 && !form.problemType) {
            setForm(f => ({ ...f, problemType: "Part Installation" }));
        }
    }, [cartItems]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push(`/auth/login?redirect=/book`); return; }
            setUser(user);
            setLoading(false);
        };
        init();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.vehicleModel || !form.problemType || !form.preferredDate || !form.preferredTime) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const customerName = user.user_metadata?.full_name || user.email || "Customer";
            const customerPhone = user.user_metadata?.phone || user.phone || "";

            const partsNote = cartItems.length > 0
                ? `Selected Parts:\n${cartItems.map(p => `• ${p.name} x${p.quantity} — ₹${(p.price * p.quantity).toLocaleString("en-IN")}`).join("\n")}`
                : "";
            const fullNotes = [form.notes, partsNote].filter(Boolean).join("\n\n");

            const apptPayload = {
                user_id: user.id,
                user_email: user.email,
                user_name: customerName,
                user_phone: customerPhone,
                vehicle_model: form.vehicleModel,
                problem_type: form.problemType,
                preferred_date: form.preferredDate,
                preferred_time: form.preferredTime,
                admin_notes: fullNotes.trim() || null,
                status: "pending",
            };

            // If parts selected, go via API to create sale + appointment together
            if (cartItems.length > 0) {
                const { data: shop } = await supabase.from("shops").select("id").limit(1).single();
                const res = await fetch("/api/sales", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        shop_id: shop?.id,
                        user_id: user.id,
                        total_amount: totalPrice,
                        items: cartItems.map(p => ({ product_id: p.id, quantity: p.quantity, unit_price: p.price })),
                        appointment: apptPayload,
                    }),
                });
                const result = await res.json();
                if (!res.ok || result.error) throw new Error(result.error || "Booking failed");
            } else {
                const { error } = await supabase.from("appointments").insert(apptPayload);
                if (error) throw error;
            }

            clearCart();
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to book appointment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <p className="text-sm font-black text-zinc-400">Loading...</p>
            </div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl border-2 border-green-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 mb-2">Appointment Booked!</h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-6">
                    We've received your booking. Our team will confirm your slot shortly via the appointments page.
                </p>
                {cartItems.length > 0 && (
                    <div className="mb-6 bg-orange-50 rounded-2xl p-4 text-left">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Parts Included</p>
                        {cartItems.map(p => (
                            <div key={p.id} className="flex items-center gap-2 py-1 text-xs font-bold text-zinc-700">
                                <span className="text-orange-500">{p.quantity}×</span> {p.name}
                                <span className="ml-auto text-zinc-400">₹{(p.price * p.quantity).toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="space-y-2">
                    <Link href="/appointments" className="block">
                        <button className="w-full h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm transition-colors flex items-center justify-center gap-2">
                            Track My Appointment <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                    <Link href="/shop" className="block">
                        <button className="w-full h-12 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-black text-sm transition-colors">
                            Browse More Parts
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-24">
            <div className="container mx-auto px-4 max-w-xl">
                {/* Header */}
                <div className="text-center pt-8 mb-8">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                        <Wrench className="w-3 h-3" /> Workshop Booking
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                        Book a <span className="text-orange-600">Service</span>
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium mt-2">Fill in details. We'll confirm your slot.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Redirected from appointments banner */}
                    {fromAppointments && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                <CalendarDays className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-blue-900">No appointments yet!</p>
                                <p className="text-xs font-medium text-blue-600 mt-0.5 leading-relaxed">
                                    Looks like you haven't booked any service yet. Fill out the form below and we'll get you sorted — it only takes a minute!
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Concise Cart Items Display */}
                    <div className="bg-white rounded-2xl border-2 border-zinc-100 overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-zinc-900">Parts to Install</p>
                                    <p className="text-[10px] font-bold text-zinc-400">
                                        {cartItems.length > 0
                                            ? `${cartItems.length} parts selected · ₹${totalPrice.toLocaleString("en-IN")}`
                                            : "Optional — add parts if needed"}
                                    </p>
                                </div>
                            </div>
                            {cartItems.length === 0 ? (
                                <Link href="/shop">
                                    <button type="button" className="h-8 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-lg transition-colors flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> Browse Parts
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/shop">
                                    <button type="button" className="h-8 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-black rounded-lg transition-colors flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> Add More
                                    </button>
                                </Link>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="px-4 pb-4 space-y-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-black text-zinc-900 truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-500 mt-0.5">
                                                    Qty: {item.quantity} · <span className="text-orange-600">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="h-8 px-3 flex items-center justify-center gap-1.5 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-lg text-[10px] font-black transition-colors self-end sm:self-auto shrink-0"
                                        >
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vehicle + Service */}
                    <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehicle Model *</Label>
                            <div className="relative">
                                <Bike className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input required placeholder="Honda Shine, Hero Splendor, TVS Jupiter…"
                                    className="pl-10 h-12 rounded-xl border-zinc-200 bg-zinc-50 font-bold"
                                    value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Service Type *</Label>
                            <Select required value={form.problemType} onValueChange={v => setForm({ ...form, problemType: v })}>
                                <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                    <SelectValue placeholder="Select service type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Part Installation", "General Service", "Brake Issue", "Engine Issue", "Electrical", "Oil Change", "Tyre Change", "Other"].map(s => (
                                        <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Date *</Label>
                            <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full h-12 rounded-xl border-2 border-zinc-200 bg-zinc-50 font-bold text-sm flex items-center px-4 justify-between hover:border-orange-300 transition-colors">
                                <span className={form.preferredDate ? "text-zinc-900" : "text-zinc-400"}>{form.preferredDate || "Pick a date"}</span>
                                <CalendarDays className="w-4 h-4 text-zinc-400" />
                            </button>
                            <AnimatePresence>
                                {showCalendar && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex justify-center">
                                        <MiniCalendar selectedDate={form.preferredDate} minDate={minDate}
                                            onSelect={d => { setForm({ ...form, preferredDate: d }); setShowCalendar(false); }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Time *</Label>
                            <Select required onValueChange={v => setForm({ ...form, preferredTime: v })}>
                                <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                    <SelectValue placeholder="Select time window" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning" className="font-bold">Morning (9AM–12PM)</SelectItem>
                                    <SelectItem value="afternoon" className="font-bold">Afternoon (1PM–4PM)</SelectItem>
                                    <SelectItem value="evening" className="font-bold">Evening (4PM–7PM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 block">Notes (Optional)</Label>
                        <Textarea placeholder="Any extra details about your vehicle or the issue…"
                            className="min-h-[80px] rounded-xl border-zinc-200 bg-zinc-50 font-medium text-sm resize-none"
                            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting}
                        className="w-full h-16 rounded-2xl bg-zinc-950 hover:bg-orange-600 disabled:opacity-60 text-white font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                        {submitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
                        ) : cartItems.length > 0 ? (
                            `Book + ${cartItems.length} Part${cartItems.length > 1 ? "s" : ""}`
                        ) : (
                            "Confirm Appointment"
                        )}
                    </button>

                    {/* Already have one? */}
                    <div className="text-center">
                        <Link href="/appointments" className="text-xs font-bold text-zinc-400 hover:text-orange-600 transition-colors">
                            View my existing appointments →
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>}>
            <BookingForm />
        </Suspense>
    );
}
