
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/animated-card";
import {
    Bike,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    Send,
    ClipboardList,
    Search,
    Package,
    X,
    ChevronDown,
    ChevronUp,
    CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import { useCart } from "@/context/cart-context";

type PartOption = { id: string; name: string; selling_price: number; category_name: string };

function getTomorrow(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function MiniCalendar({ selectedDate, onSelect, minDate }: { selectedDate: string; onSelect: (d: string) => void; minDate: string }) {
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const minD = new Date(minDate + "T00:00:00");
    const goNext = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };
    const goPrev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
    const canGoPrev = !(viewYear === minD.getFullYear() && viewMonth <= minD.getMonth());
    return (
        <div className="bg-white rounded-2xl border-2 border-zinc-100 shadow-2xl p-5 w-full max-w-[340px]">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={goPrev} disabled={!canGoPrev} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center disabled:opacity-20 transition-colors"><ChevronUp className="w-4 h-4 rotate-[-90deg]" /></button>
                <span className="font-black text-sm text-zinc-900">{monthNames[viewMonth]} {viewYear}</span>
                <button type="button" onClick={goNext} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"><ChevronDown className="w-4 h-4 rotate-[-90deg]" /></button>
            </div>
            <div className="grid grid-cols-7 mb-2">{dayNames.map(d => (<div key={d} className="text-center text-[10px] font-bold text-zinc-400 uppercase py-1">{d}</div>))}</div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dateObj = new Date(dateStr + "T00:00:00");
                    const disabled = dateObj < minD;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === today.toISOString().split("T")[0];
                    return (
                        <button type="button" key={day} disabled={disabled} onClick={() => onSelect(dateStr)}
                            className={`w-full aspect-square rounded-lg text-sm font-bold transition-all flex items-center justify-center ${isSelected ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : ""} ${!isSelected && isToday ? "bg-zinc-100 text-zinc-400" : ""} ${!isSelected && !isToday && !disabled ? "text-zinc-900 hover:bg-orange-50 hover:text-orange-600" : ""} ${disabled ? "text-zinc-200 cursor-not-allowed" : "cursor-pointer"}`}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const partId = searchParams.get('part');
    const { addItem, items: cartItems } = useCart();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [allParts, setAllParts] = useState<PartOption[]>([]);
    const [partSearch, setPartSearch] = useState("");
    const [selectedPart, setSelectedPart] = useState<PartOption | null>(null);
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const minDate = getTomorrow();
    const [formData, setFormData] = useState({ vehicleModel: "", problemType: "", preferredDate: "", preferredTime: "", notes: "", });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push(`/auth/login?redirect=/book${partId ? `?part=${partId}` : ""}`); return; }
            setUser(user);
            const { data: parts } = await supabase.from("products").select("id, name, selling_price, categories(name)").order("name");
            const mapped = (parts || []).map((p: any) => ({
                id: p.id, name: p.name, selling_price: Number(p.selling_price), category_name: p.categories?.name || "Part",
            }));
            setAllParts(mapped);

            if (partId) {
                const found = mapped.find((p: PartOption) => p.id === partId);
                if (found) {
                    setSelectedPart(found);
                    setPartSearch(found.name);
                    // Automatically add to cart if coming from a specific product page
                    addItem({ id: found.id, name: found.name, price: found.selling_price }, 1);
                }
            }
            setLoading(false);
        };
        init();
    }, [partId, router]);

    const filteredParts = partSearch.trim() ? allParts.filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase())).slice(0, 8) : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.vehicleModel || !formData.problemType || !formData.preferredDate || !formData.preferredTime) {
            toast.error("Please fill all required fields");
            return;
        }

        // If user has items in cart, we prefer the Checkout flow to handle Sale + Appointment
        if (cartItems.length > 0) {
            router.push(`/checkout?vehicle=${encodeURIComponent(formData.vehicleModel)}&service=${encodeURIComponent(formData.problemType)}&date=${formData.preferredDate}&time=${formData.preferredTime}`);
            return;
        }

        setSubmitting(true);
        try {
            const customerName = user.user_metadata?.full_name || user.email || "Customer";
            const customerPhone = user.user_metadata?.phone || user.phone || "";
            const { error } = await supabase.from('appointments').insert({
                user_id: user.id, user_email: user.email, user_name: customerName, user_phone: customerPhone,
                vehicle_model: formData.vehicleModel, problem_type: formData.problemType,
                preferred_date: formData.preferredDate, preferred_time: formData.preferredTime,
                status: 'pending'
            });
            if (error) throw error;
            setSuccess(true);
            toast.success("Appointment booked successfully!");
        } catch (error: any) { toast.error(error.message || "Failed to book appointment"); } finally { setSubmitting(false); }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center font-black">Checking account status...</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center shadow-2xl border-2 border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-green-600" /></div>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-4">Appointment Booked!</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed mb-6">Your appointment has been submitted. Our workshop team will review and confirm your slot shortly.</p>
                    <Link href="/" className="block"><Button className="w-full h-14 rounded-2xl bg-zinc-900 font-bold text-lg gap-2">Return Home</Button></Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 sm:pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-center pt-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight italic">Book <span className="text-orange-600">Service</span></h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] opacity-60">Workshop Appointment Desk</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="rounded-[2.5rem] border-2 border-zinc-100 shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehicle Model *</Label>
                                <Input required placeholder="Honda Shine, Hero Splendor, etc." className="h-14 rounded-2xl border-zinc-200 bg-zinc-50 font-bold" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
                            </div>

                            {/* Part Selection */}
                            <div className="space-y-2 relative">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    Part for Installation (Optional)
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <Input
                                        placeholder="Search for a part..."
                                        className="h-14 pl-12 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"
                                        value={partSearch}
                                        onChange={(e) => {
                                            setPartSearch(e.target.value);
                                            setShowPartDropdown(true);
                                            if (!e.target.value) setSelectedPart(null);
                                        }}
                                        onFocus={() => setShowPartDropdown(true)}
                                    />
                                    {selectedPart && (
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedPart(null); setPartSearch(""); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                                        >
                                            <X className="h-3 w-3 text-zinc-600" />
                                        </button>
                                    )}
                                </div>

                                {showPartDropdown && partSearch && !selectedPart && (
                                    <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl border border-zinc-100 shadow-2xl max-h-60 overflow-y-auto">
                                        {filteredParts.length > 0 ? (
                                            filteredParts.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPart(p);
                                                        setPartSearch(p.name);
                                                        setShowPartDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-zinc-50 last:border-0 transition-colors flex items-center justify-between group"
                                                >
                                                    <span className="font-bold text-sm text-zinc-900 group-hover:text-orange-600">{p.name}</span>
                                                    <span className="text-xs font-black text-zinc-400">₹{p.selling_price}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-zinc-500 italic">No parts found matching "{partSearch}"</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Service Type *</Label>
                                <Select required onValueChange={(val) => setFormData({ ...formData, problemType: val })}>
                                    <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"><SelectValue placeholder="Select service type" /></SelectTrigger>
                                    <SelectContent>{["General Service", "Brake Issue", "Engine Issue", "Electrical", "Other"].map(s => (<SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date & Time *</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setShowCalendar(!showCalendar)} className="h-14 rounded-2xl border-2 border-zinc-100 bg-zinc-50 font-bold text-xs flex items-center px-4 justify-between">{formData.preferredDate || "Select Date"}<CalendarDays className="w-4 h-4 text-zinc-400" /></button>
                                    <Select required onValueChange={(val) => setFormData({ ...formData, preferredTime: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-zinc-50 font-bold"><SelectValue placeholder="Time" /></SelectTrigger>
                                        <SelectContent><SelectItem value="morning">Morning</SelectItem><SelectItem value="afternoon">Afternoon</SelectItem><SelectItem value="evening">Evening</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                {showCalendar && <div className="flex justify-center mt-2"><MiniCalendar selectedDate={formData.preferredDate} minDate={minDate} onSelect={(d) => { setFormData({ ...formData, preferredDate: d }); setShowCalendar(false); }} /></div>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Notes (Optional)</Label>
                                <Textarea placeholder="Details..." className="min-h-[100px] rounded-2xl border-zinc-200 bg-zinc-50 font-bold" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                    <Button type="submit" disabled={submitting} className="w-full h-20 rounded-[2.5rem] bg-zinc-950 hover:bg-orange-600 text-white font-black text-xl shadow-2xl active:scale-95 transition-all">{submitting ? "Booking..." : "Confirm Appointment"}</Button>
                </form>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (<Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">Loading...</div>}><BookingForm /></Suspense>);
}
