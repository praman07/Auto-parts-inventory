"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star, Clock, Globe } from "lucide-react";

export function Features() {
    const features = [
        {
            title: "Price Match Guaranteed",
            desc: "Found it cheaper? We will match any authorized dealer price.",
            icon: CheckCircle2,
        },
        {
            title: "5-Star Rated Spares",
            desc: "Join thousands of satisfied premium motorcycle owners.",
            icon: Star,
        },
        {
            title: "Live Stock Updates",
            desc: "What you see is what we have. Real-time inventory sync.",
            icon: Clock,
        },
        {
            title: "Pan-India Reach",
            desc: "Shipping to over 20,000 pincodes with tracking.",
            icon: Globe,
        },
    ];

    return (
        <section className="py-24 overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Engineered for <br />
                            <span className="text-orange-600">Reliability.</span> Built for Speed.
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {features.map((f, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <f.icon className="h-6 w-6 text-orange-500" />
                                        <h4 className="font-bold text-lg">{f.title}</h4>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <div className="p-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                                <span className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <h3 className="text-2xl font-bold mb-2">Need a Bulk Order?</h3>
                                <p className="opacity-90 mb-6 text-sm">Get exclusive garage pricing and a dedicated account manager for wholesale orders.</p>
                                <button className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-black/10">
                                    Contact Wholesale Team
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 p-4 bg-secondary/50 rounded-[3rem] border border-white/20">
                            <img
                                src="https://images.unsplash.com/photo-1611634701235-95079a4055f7?q=80&w=2000&auto=format&fit=crop"
                                alt="High-Performance Motorcycle Parts"
                                className="rounded-[2.5rem] w-full aspect-square object-cover shadow-2xl transition-transform group-hover:scale-105"
                            />
                        </div>
                        {/* Decorative background blobs */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
