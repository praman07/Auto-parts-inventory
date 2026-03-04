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
    Settings as GearIcon,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

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
    const { scrollYProgress } = useScroll();
    const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // FAST ROTATION: 10 full circles over scroll (3600 degrees)
    const fastRotatePositive = useTransform(springScroll, [0, 1], [0, 3600]);
    const fastRotateNegative = useTransform(springScroll, [0, 1], [0, -3600]);
    const gearY = useTransform(springScroll, [0, 1], [0, -400]);

    // Initial default images
    const defaultImages = [
        "/hero_non_human_1.png",
        "/hero_non_human_2.png",
        "/hero_non_human_3.png"
    ];

    const [bgImages, setBgImages] = useState<string[]>(defaultImages);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % bgImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [bgImages.length]);

    useEffect(() => {
        supabase.from("settings").select("*").single().then(({ data }) => {
            if (data) {
                setSettings(data);
                if (data.hero_images) {
                    const customImages = data.hero_images.split(",").map((s: string) => s.trim()).filter(Boolean);
                    if (customImages.length > 0) {
                        setBgImages(customImages);
                    }
                }
            }
        });
    }, []);

    return (
        <div className="relative text-white font-sans overflow-visible pb-20">
            {/* ========== INSANE IMMERSIVE GARAGE BACKGROUND ========== */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
                {/* Images behind everything - BRIGHT & CLEAR */}
                {bgImages.map((src, idx) => (
                    <div
                        key={src}
                        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2500ms] ease-in-out ${idx === currentImageIndex ? 'opacity-60' : 'opacity-0'}`}
                        style={{ backgroundImage: `url('${src}')` }}
                    />
                ))}

                {/* Pure Bright Environment */}
                <div className="absolute inset-0 bg-transparent" />

                {/* 3-4 COIN-SIZED GEARS - VERY FAST ROTATION */}
                <motion.div style={{ rotate: fastRotatePositive, y: gearY }} className="absolute top-[20%] left-[10%] opacity-20">
                    <GearIcon size={64} strokeWidth={1.5} className="text-white" />
                </motion.div>

                <motion.div style={{ rotate: fastRotateNegative, y: gearY }} className="absolute top-[60%] left-[25%] opacity-15">
                    <GearIcon size={48} strokeWidth={1} className="text-white" />
                </motion.div>

                <motion.div style={{ rotate: fastRotatePositive, y: gearY }} className="absolute top-[40%] right-[15%] opacity-20">
                    <GearIcon size={72} strokeWidth={1.2} className="text-white" />
                </motion.div>

                <motion.div style={{ rotate: fastRotateNegative, y: gearY }} className="absolute bottom-[20%] right-[30%] opacity-15">
                    <GearIcon size={56} strokeWidth={1.5} className="text-white" />
                </motion.div>

                {/* Industrial Grid */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* ========== CONTENT WRAPPER ========== */}
            <div className="relative z-10 flex flex-col gap-16 lg:gap-24 mt-10 pt-10 sm:mt-20 sm:pt-14">

                {/* ========== HERO PANEL ========== */}
                <section className="container mx-auto px-4 flex items-center justify-center min-h-[85vh]">
                    <div className="w-full max-w-4xl bg-white/[0.015] border border-white/[0.05] p-10 sm:p-16 rounded-[5rem] shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),inset_0_-5px_20px_rgba(0,0,0,0.4),0_60px_100px_-30px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center text-center group">
                        {/* THE LIQUID CORE: Extreme Refraction Mask */}
                        <div className="absolute inset-0 backdrop-blur-[160px] [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_85%)] pointer-events-none" />

                        {/* VOLUMETRIC GLOSS: Natural Light hits curved surface */}
                        <div className="absolute -top-[15%] left-[20%] w-[60%] h-[40%] bg-gradient-to-b from-white/[0.18] to-transparent rounded-[100%] blur-[30px] pointer-events-none" />
                        <div className="absolute -bottom-[10%] right-[30%] w-[40%] h-[25%] bg-gradient-to-t from-white/[0.08] to-transparent rounded-[100%] blur-[40px] pointer-events-none" />

                        {/* CHROMATIC RIM: Subtle color shifts at highest angle */}
                        <div className="absolute inset-0 rounded-[5rem] border border-white/[0.03] ring-1 ring-white/5 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                                    <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">Trusted Since 1989</span>
                                </div>
                            </div>

                            <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tight leading-[0.95] mb-8 text-white drop-shadow-lg">
                                Your Bike.
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 pb-2">
                                    Running Like New.
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-white/90 font-medium max-w-xl mb-12 leading-relaxed drop-shadow-md">
                                We fix bikes, sell genuine spare parts, and get you back on the road safely. No confusing terms, just honest and reliable service you can trust.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                                <Link href="/shop" className="w-full sm:w-auto">
                                    <Button size="lg" className="h-16 px-10 text-base font-black rounded-2xl bg-white/90 text-zinc-950 hover:bg-white transition-all w-full sm:w-auto shadow-lg gap-3">
                                        Buy Spare Parts <Search className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/book" className="w-full sm:w-auto">
                                    <Button size="lg" className="h-16 px-10 text-base font-black rounded-2xl bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/50 shadow-[0_10px_20px_-10px_rgba(234,88,12,0.6)] w-full sm:w-auto gap-3">
                                        Book a Service <Calendar className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== STATS GLASS PANEL ========== */}
                <section>
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.02] border border-white/[0.1] p-8 sm:p-10 rounded-[3.5rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
                            {/* Advanced Liquid Refraction Layer */}
                            <div className="absolute inset-0 backdrop-blur-[100px] [mask-image:radial-gradient(ellipse_at_center,transparent_45%,black_95%)] pointer-events-none opacity-85" />

                            {/* Rim Glow */}
                            <div className="absolute inset-0 border border-white/5 rounded-[3.5rem] pointer-events-none" />

                            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" />
                            {stats.map((s, i) => (
                                <div
                                    key={i}
                                    className="relative z-10 flex flex-col items-center justify-center p-4 text-center group"
                                >
                                    <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight group-hover:scale-105 transition-transform drop-shadow-lg">{s.value}</div>
                                    <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== BRANDS GLASS PANEL ========== */}
                <section>
                    <div className="container mx-auto px-4">
                        <div className="bg-white/[0.02] border border-white/[0.1] p-10 sm:p-20 rounded-[5rem] shadow-[inset_0_0_150px_rgba(255,255,255,0.03),0_40px_100px_-20px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
                            {/* Advanced Liquid Refraction Layer */}
                            <div className="absolute inset-0 backdrop-blur-[140px] [mask-image:radial-gradient(ellipse_at_center,transparent_35%,black_95%)] pointer-events-none opacity-95" />

                            {/* Specular Glow */}
                            <div className="absolute -top-[10%] left-[20%] w-[60%] h-[40%] bg-white/[0.1] rounded-full blur-[80px] pointer-events-none" />

                            <div className="absolute inset-x-0 top-0 h-px pointer-events-none" />

                            <span className="relative z-10 text-[11px] font-black text-orange-400 uppercase tracking-[0.25em] mb-4 block">Genuine Parts</span>
                            <h2 className="relative z-10 text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-md">Top Quality Brands</h2>
                            <p className="relative z-10 text-white/80 text-lg font-medium mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">We use only original and trusted parts to make sure your bike lasts longer and runs perfectly without any issues.</p>

                            <div className="relative z-10 flex flex-wrap gap-4 justify-center max-w-5xl mx-auto">
                                {BRANDS.map((brand) => (
                                    <Link key={brand} href={`/shop?q=${encodeURIComponent(brand)}`}>
                                        <div className="px-6 py-4 rounded-2xl border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.15] text-white/80 hover:text-white font-black text-sm uppercase tracking-widest transition-all cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                                            {brand}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== CTA GLASS BANNER ========== */}
                <section>
                    <div className="container mx-auto px-4">
                        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.1] rounded-[5rem] shadow-[inset_0_0_150px_rgba(255,255,255,0.05),0_40px_100px_-20px_rgba(0,0,0,1)] p-12 sm:p-28 text-center min-h-[400px] flex flex-col justify-center group">
                            {/* Advanced Liquid Refraction Layer */}
                            <div className="absolute inset-0 backdrop-blur-[140px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)] pointer-events-none opacity-98" />

                            {/* Liquid Surface Shine */}
                            <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-white/20 blur-[1px] rounded-full opacity-40 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[500px] h-[300px] bg-orange-600/30 rounded-full blur-[120px]" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-md">
                                    Ready to get started?
                                </h2>
                                <p className="text-lg sm:text-xl text-white/90 font-medium mb-14 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                                    Don't wait until something breaks! Book an appointment today and let our friendly mechanics take care of your bike.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                                    <Link href="/book">
                                        <Button size="lg" className="h-16 px-12 text-base font-black rounded-2xl bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/50 shadow-[0_10px_20px_-10px_rgba(234,88,12,0.6)] w-full sm:w-auto gap-3">
                                            <Calendar className="h-5 w-5" /> Book Now
                                        </Button>
                                    </Link>
                                    {settings && (
                                        <a href={`tel:${settings.contact_phone}`}>
                                            <Button size="lg" className="h-16 px-12 text-base font-black rounded-2xl border border-white/[0.2] bg-white/[0.1] text-white hover:bg-white/[0.2] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] w-full sm:w-auto gap-3">
                                                <Phone className="h-5 w-5" /> Call Us
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== VISIT US GLASS PANELS ========== */}
                {settings && (
                    <section>
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <span className="text-[11px] font-black text-orange-400 uppercase tracking-[0.25em] mb-4 block">Find Us</span>
                                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">Visit Our Workshop</h2>
                            </div>
                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: MapPin, title: "Location", content: settings.address },
                                    { icon: Clock, title: "Working Hours", content: settings.working_hours },
                                    { icon: Phone, title: "Call Us", content: settings.contact_phone, sub: "Always ready to help!" },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/[0.03] border border-white/[0.1] rounded-[3rem] p-10 hover:bg-white/[0.06] transition-all group shadow-[inset_0_0_40px_rgba(255,255,255,0.02),0_20px_40px_-10px_rgba(0,0,0,0.8)] relative overflow-hidden"
                                    >
                                        {/* Liquid Edge Refraction */}
                                        <div className="absolute inset-0 backdrop-blur-[80px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)] pointer-events-none opacity-60" />

                                        {/* Subtle Specular Highlight */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                                        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/[0.15] border border-white/30 shadow-inner flex items-center justify-center mb-8 group-hover:bg-orange-500/40 group-hover:border-orange-500/60 transition-all">
                                            <item.icon className="h-7 w-7 text-white group-hover:text-white transition-colors drop-shadow-md" />
                                        </div>
                                        <h3 className="relative z-10 text-xl font-black text-white mb-4 tracking-tight drop-shadow-md">{item.title}</h3>
                                        <p className="relative z-10 text-white/80 font-medium leading-relaxed whitespace-pre-line text-sm drop-shadow-sm">{item.content}</p>
                                        {item.sub && <p className="relative z-10 text-orange-300 font-bold text-[10px] mt-6 uppercase tracking-widest bg-orange-500/30 inline-block px-3 py-1.5 rounded-full border border-orange-500/40">{item.sub}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
