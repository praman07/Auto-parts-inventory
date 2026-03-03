"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Calendar,
    Phone,
    MapPin,
    Clock,
    Star,
    BadgeCheck,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const BRANDS = [
    "Minda", "Hero", "Honda", "Bajaj", "TVS",
    "Motul", "Castrol", "HP", "Senior", "Phillips",
    "CEAT", "MRF", "Apollo",
];

const stats = [
    { value: "35+", label: "Years Experience" },
    { value: "5000+", label: "Bikes Serviced" },
    { value: "1000+", label: "Spare Parts" },
    { value: "4.8★", label: "Customer Rating" },
];

export function Hero() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        supabase.from("settings").select("*").single().then(({ data }) => {
            if (data) setSettings(data);
        });
    }, []);

    return (
        <div className="bg-zinc-950 text-white overflow-hidden font-sans">

            {/* ========== HERO SECTION ========== */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('/images/hero_spares.png')` }}
                    />
                    <div className="absolute inset-0 bg-zinc-950/75" />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950" />
                </div>

                <div className="relative container mx-auto px-4 py-20 sm:py-36">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
                                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Premier Workshop Since 1989</span>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
                            Genuine Parts.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
                                Expert Care.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-lg mb-12 leading-relaxed">
                            Bhogal&apos;s #1 destination for motorcycle spare parts and professional servicing — book a slot in seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/shop" className="w-full sm:w-auto">
                                <Button size="lg" className="h-14 sm:h-16 px-8 text-base sm:text-lg font-black rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 transition-all w-full shadow-2xl gap-2">
                                    Browse Parts <Search className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/book" className="w-full sm:w-auto">
                                <Button size="lg" className="h-14 sm:h-16 px-8 text-base sm:text-lg font-black rounded-2xl bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-600/30 w-full gap-2">
                                    Book Service <Calendar className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== STATS BAR ========== */}
            <section className="bg-zinc-950 border-b border-zinc-900">
                <div className="container mx-auto px-4 py-12 sm:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((s, i) => (
                            <div
                                key={i}
                                className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center hover:border-orange-500/20 transition-colors"
                            >
                                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{s.value}</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== BRANDS (Static) ========== */}
            <section className="py-16 sm:py-24 bg-zinc-950 border-b border-zinc-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-3 block">Spare Parts Brands</span>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">Brands We Carry</h2>
                        <p className="text-zinc-600 text-sm font-medium">Genuine parts from all the brands you trust.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                        {BRANDS.map((brand) => (
                            <Link key={brand} href={`/shop?q=${encodeURIComponent(brand)}`}>
                                <div className="px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-orange-500/40 hover:bg-zinc-900 text-zinc-400 hover:text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer">
                                    {brand}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>



            {/* ========== CTA BANNER ========== */}
            <section className="py-24 sm:py-32 relative overflow-hidden border-b border-zinc-900">
                <div className="absolute inset-0 bg-zinc-950" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative text-center">
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
                        Ready to service your ride?
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-500 font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                        Book an appointment now and get your motorcycle serviced by our expert mechanics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/book">
                            <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-orange-600 text-white hover:bg-orange-700 gap-3 shadow-2xl shadow-orange-600/20 w-full sm:w-auto">
                                <Calendar className="h-5 w-5" /> Book Now
                            </Button>
                        </Link>
                        {settings && (
                            <a href={`tel:${settings.contact_phone}`}>
                                <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl border border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 gap-3 w-full sm:w-auto">
                                    <Phone className="h-5 w-5" /> Call Us
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            </section>

            {/* ========== VISIT US (Dynamic) ========== */}
            {settings && (
                <section className="py-20 sm:py-28 bg-zinc-950">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-14">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-3 block">Find Us</span>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Where to Find Us</h2>
                        </div>
                        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: MapPin, title: "Visit Us", content: settings.address },
                                { icon: Clock, title: "Working Hours", content: settings.working_hours },
                                { icon: Phone, title: "Contact", content: settings.contact_phone, sub: "Walk-ins welcome!" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-zinc-900/40 border border-zinc-800/70 rounded-2xl p-8 hover:border-orange-500/20 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:bg-orange-500/15 transition-colors">
                                        <item.icon className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-4">{item.title}</h3>
                                    <p className="text-zinc-400 font-medium leading-relaxed whitespace-pre-line text-sm">{item.content}</p>
                                    {item.sub && <p className="text-orange-500/70 font-bold text-xs mt-3 uppercase tracking-widest">{item.sub}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
