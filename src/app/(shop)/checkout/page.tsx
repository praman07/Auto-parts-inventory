"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/animated-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, CalendarDays, Bike, Wrench, ChevronUp, ChevronDown } from "lucide-react";

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
        <div className="bg-white rounded-2xl border-2 border-zinc-100 shadow-xl p-5 w-full max-w-[340px]">
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



export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [processing, setProcessing] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [formData, setFormData] = useState({
        vehicleModel: "",
        problemType: "General Service",
        preferredDate: "",
        preferredTime: "morning",
        notes: "",
    });
    const minDate = getTomorrow();
    const router = useRouter();


    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to proceed with booking");
                router.push("/auth/login");
                return;
            }
        };
        checkAuth();
    }, []);

    const handleCheckout = async () => {

        if (!formData.vehicleModel || !formData.preferredDate) {
            toast.error("Please fill appointment details");
            return;
        }

        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // Get shop_id dynamically
            const { data: shop } = await supabase.from('shops').select('id').limit(1).single();
            if (!shop) throw new Error("Shop not found");

            // 1. Create Sale Record
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert({
                    shop_id: shop.id,
                    user_id: user.id,
                    total_amount: totalPrice,
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create Sale Items
            if (sale) {
                const saleItems = items.map(item => ({
                    sale_id: sale.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.price * item.quantity
                }));

                const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
                if (itemsError) throw itemsError;

                // 3. Create Appointment linked to Sale
                const customerName = user.user_metadata?.full_name || user.email || "Customer";
                const customerPhone = user.user_metadata?.phone || user.phone || "";
                const { error: apptError } = await supabase.from('appointments').insert({
                    user_id: user.id,
                    user_email: user.email,
                    user_name: customerName,
                    user_phone: customerPhone,
                    vehicle_model: formData.vehicleModel,
                    problem_type: formData.problemType,
                    preferred_date: formData.preferredDate,
                    preferred_time: formData.preferredTime,
                    admin_notes: formData.notes,
                    sale_id: sale.id, // Linked!
                    status: 'pending'
                });
                if (apptError) throw apptError;
            }

            toast.success("Booking confirmed successfully!");
            clearCart();
            router.push("/profile");

        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error(error.message || "Failed to confirm booking");
        } finally {
            setProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">No parts selected</h2>
                <Button onClick={() => router.push("/shop")} variant="daylight">Browse Parts</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary/20 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter italic mb-8">Booking <span className="text-orange-600">Details.</span></h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Appointment Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Service Appointment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 transition-all"><Wrench className="h-5 w-5" /> Appointment Booking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Vehicle Model *</Label>
                                        <div className="relative">
                                            <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                required
                                                placeholder="e.g. Honda Shine"
                                                className="pl-10"
                                                value={formData.vehicleModel}
                                                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Service Type *</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                                            value={formData.problemType}
                                            onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                                        >
                                            <option value="General Service">General Service</option>
                                            <option value="Part Installation">Part Installation</option>
                                            <option value="Brake Issue">Brake Issue</option>
                                            <option value="Engine Issue">Engine Issue</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Select Date & Window *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between h-10 font-medium"
                                                onClick={() => setShowCalendar(!showCalendar)}
                                            >
                                                {formData.preferredDate || "Pick a date"}
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            {showCalendar && (
                                                <div className="absolute z-50 top-full mt-2 left-0 shadow-2xl">
                                                    <MiniCalendar
                                                        selectedDate={formData.preferredDate}
                                                        minDate={minDate}
                                                        onSelect={(d) => {
                                                            setFormData({ ...formData, preferredDate: d });
                                                            setShowCalendar(false);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                                            value={formData.preferredTime}
                                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                        >
                                            <option value="morning">Morning (9AM-12PM)</option>
                                            <option value="afternoon">Afternoon (1PM-4PM)</option>
                                            <option value="evening">Evening (4PM-7PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-1">
                        <Card className="bg-zinc-950 text-white border-zinc-900 shadow-2xl rounded-[2rem]">
                            <CardHeader>
                                <CardTitle className="text-xl font-black italic tracking-tighter">Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm items-center">
                                            <span className="text-zinc-400 font-medium">{item.name} <span className="text-[10px] text-zinc-600 ml-1">x{item.quantity}</span></span>
                                            <span className="font-bold text-zinc-200">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-zinc-900 pt-6 flex justify-between items-end font-black italic">
                                    <span className="text-zinc-500 uppercase text-[10px] tracking-[0.2em]">Booking Amount</span>
                                    <span className="text-2xl text-orange-500">₹{totalPrice.toLocaleString("en-IN")}</span>
                                </div>
                                <Button
                                    className="w-full mt-4 h-14 bg-orange-500 text-white hover:bg-orange-400 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/10 border-0"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
