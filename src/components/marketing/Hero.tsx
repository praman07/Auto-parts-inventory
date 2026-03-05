"use client";

import { useState, useEffect, useRef } from "react";
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
    Shield,
    Wrench,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Quote,
    Bike,
    Package,
    Timer,
    ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

const BRANDS = [
    "Minda", "Hero", "Honda", "Bajaj", "TVS",
    "Motul", "Castrol", "HP", "Senior", "Phillips",
    "CEAT", "MRF", "Apollo",
];

const stats = [
    { value: "35+", label: "Years Experience", icon: Timer },
    { value: "5000+", label: "Bikes Serviced", icon: Bike },
    { value: "1000+", label: "Spare Parts", icon: Package },
    { value: "4.8★", label: "Customer Rating", icon: Star },
];

const services = [
    {
        icon: Wrench,
        title: "Full Engine Service",
        desc: "Complete engine overhaul, tuning, and performance optimization by certified mechanics.",
    },
    {
        icon: Shield,
        title: "Genuine Spare Parts",
        desc: "100% original parts from authorized manufacturers. No duplicates, no compromises.",
    },
    {
        icon: Zap,
        title: "Electrical & Wiring",
        desc: "Advanced diagnostics and repair for all electrical systems, batteries, and lighting.",
    },
    {
        icon: BadgeCheck,
        title: "Quality Guarantee",
        desc: "Every service backed by our quality promise. If it's not perfect, we make it right — free.",
    },
];

const processSteps = [
    { step: "01", title: "Book", desc: "Schedule online or walk in anytime" },
    { step: "02", title: "Diagnose", desc: "Free inspection & transparent quote" },
    { step: "03", title: "Repair", desc: "Expert fix with genuine parts only" },
    { step: "04", title: "Ride", desc: "Quality checked & ready to roll" },
];



// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const numericPart = value.replace(/[^0-9.]/g, "");
    const prefix = value.replace(/[0-9.+★]/g, "");

    return (
        <span ref={ref} className="tabular-nums">
            {isInView ? value : "0"}
        </span>
    );
}

export function Hero() {
    const [settings, setSettings] = useState<any>(null);
    const { scrollYProgress } = useScroll();
    const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const fastRotatePositive = useTransform(springScroll, [0, 1], [0, 3600]);
    const fastRotateNegative = useTransform(springScroll, [0, 1], [0, -3600]);
    const gearY = useTransform(springScroll, [0, 1], [0, -400]);

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

    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        }),
    };

    return (
        <div className="relative text-white font-sans overflow-visible">

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: HERO — Full viewport cinematic landing
            ═══════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden h-screen">
                {/* Cinematic Background */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-black">
                    {bgImages.map((src, idx) => (
                        <div
                            key={src}
                            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2500ms] ease-in-out ${idx === currentImageIndex ? 'opacity-60' : 'opacity-0'}`}
                            style={{ backgroundImage: `url('${src}')` }}
                        />
                    ))}

                    {/* Gears */}
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

                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center justify-center pt-16">
                    <section className="container mx-auto px-4">
                        <div className="w-full max-w-4xl mx-auto bg-white/[0.015] border border-white/[0.05] p-8 sm:p-12 md:p-14 rounded-[4rem] sm:rounded-[5rem] shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),inset_0_-5px_20px_rgba(0,0,0,0.4),0_60px_100px_-30px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center text-center group">
                            <div className="absolute inset-0 backdrop-blur-[160px] [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_85%)] pointer-events-none" />
                            <div className="absolute -top-[15%] left-[20%] w-[60%] h-[40%] bg-gradient-to-b from-white/[0.18] to-transparent rounded-[100%] blur-[30px] pointer-events-none" />
                            <div className="absolute -bottom-[10%] right-[30%] w-[40%] h-[25%] bg-gradient-to-t from-white/[0.08] to-transparent rounded-[100%] blur-[40px] pointer-events-none" />
                            <div className="absolute inset-0 rounded-[4rem] sm:rounded-[5rem] border border-white/[0.03] ring-1 ring-white/5 pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center justify-center mb-6 sm:mb-8"
                                >
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                                        <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">Trusted Since 1989</span>
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    className="text-4xl sm:text-6xl md:text-[5rem] font-black tracking-tight leading-[0.95] mb-6 sm:mb-8 text-white drop-shadow-lg"
                                >
                                    Your Bike.
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 pb-2">
                                        Running Like New.
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-base sm:text-lg md:text-xl text-white/90 font-medium max-w-xl mb-8 sm:mb-10 leading-relaxed drop-shadow-md"
                                >
                                    We fix bikes, sell genuine spare parts, and get you back on the road safely. No confusing terms, just honest and reliable service you can trust.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center w-full"
                                >
                                    <Link href="/shop" className="w-full sm:w-auto">
                                        <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-sm sm:text-base font-black rounded-2xl bg-white/90 text-zinc-950 hover:bg-white transition-all w-full sm:w-auto shadow-lg gap-3">
                                            Buy Spare Parts <Search className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/book" className="w-full sm:w-auto">
                                        <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-12 text-sm sm:text-base font-black rounded-2xl bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/50 shadow-[0_10px_20px_-10px_rgba(234,88,12,0.6)] w-full sm:w-auto gap-3">
                                            Book a Service <Calendar className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </div>


            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: STATS — Animated number showcase
            ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-10 bg-[#09090b]">
                <div className="container mx-auto px-4 py-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-[#09090b] p-8 sm:p-10 text-center group"
                            >
                                <s.icon className="h-5 w-5 text-orange-500 mx-auto mb-4" />
                                <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                                    <AnimatedCounter value={s.value} />
                                </div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 3: SERVICES — What we do best
                ═══════════════════════════════════════════════════════════════ */}
                <section className="py-20 sm:py-28">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block">What We Do</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-5">
                                Built for Performance
                            </h2>
                            <p className="text-zinc-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                From a simple oil change to a full engine rebuild — we handle everything your bike needs.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                            {services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="group bg-zinc-900/60 border border-white/[0.04] rounded-2xl p-7 sm:p-8 hover:border-orange-500/20 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5">
                                        <service.icon className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">{service.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{service.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 4: PROCESS — How it works
                ═══════════════════════════════════════════════════════════════ */}
                <section className="py-20 sm:py-28">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block">Simple Process</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                                Four Steps. <span className="text-zinc-600">That's It.</span>
                            </h2>
                        </motion.div>

                        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                            {/* Connector line */}
                            <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-zinc-800" />

                            {processSteps.map((ps, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center relative"
                                >
                                    <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5 relative z-10">
                                        <span className="text-lg font-black text-orange-500">{ps.step}</span>
                                    </div>
                                    <h3 className="text-base font-black text-white mb-1">{ps.title}</h3>
                                    <p className="text-zinc-600 text-xs font-medium">{ps.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 5: BRANDS — Manufacturer network
                ═══════════════════════════════════════════════════════════════ */}
                <section className="py-20 sm:py-28">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block">Genuine Parts</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">Brands We Trust</h2>
                            <p className="text-zinc-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                Every part is original, verified, and comes with manufacturer warranty.
                            </p>
                        </motion.div>

                        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                            {BRANDS.map((brand, i) => (
                                <Link key={brand} href={`/shop?q=${encodeURIComponent(brand)}`}>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.03 }}
                                        className="px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-orange-500 hover:border-orange-500 hover:text-black text-zinc-500 hover:text-zinc-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer"
                                    >
                                        {brand}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>



                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 7: CTA — Final conversion
                ═══════════════════════════════════════════════════════════════ */}
                <section className="py-20 sm:py-28">
                    <div className="container mx-auto px-4">
                        <div className="relative overflow-hidden bg-orange-600 rounded-3xl p-10 sm:p-16 md:p-20 text-center">
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-5">
                                    Ready to Ride?
                                </h2>
                                <p className="text-base sm:text-lg text-white/80 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                                    Book your service today. No hidden charges, no surprises.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/book">
                                        <Button size="lg" className="h-14 px-10 text-sm font-black rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 w-full sm:w-auto gap-2">
                                            <Calendar className="h-4 w-4" /> Book Now — It's Free
                                        </Button>
                                    </Link>
                                    {settings && (
                                        <a href={`tel:${settings.contact_phone}`} className="w-full sm:w-auto">
                                            <Button size="lg" className="h-14 px-10 text-sm font-black rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto gap-2">
                                                <Phone className="h-4 w-4" /> Call Us
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION 8: VISIT US — Workshop info
                ═══════════════════════════════════════════════════════════════ */}
                {settings && (
                    <section className="pb-20 sm:pb-28">
                        <div className="container mx-auto px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-12"
                            >
                                <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block">Find Us</span>
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Visit Our Workshop</h2>
                            </motion.div>

                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: MapPin, title: "Location", content: settings.address },
                                    { icon: Clock, title: "Working Hours", content: settings.working_hours },
                                    { icon: Phone, title: "Call Us", content: settings.contact_phone },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-zinc-900/60 border border-white/[0.04] rounded-2xl p-7 sm:p-8 hover:border-orange-500/20 transition-all duration-300 group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5">
                                            <item.icon className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                                        <p className="text-zinc-500 font-medium leading-relaxed text-sm whitespace-pre-line">{item.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
