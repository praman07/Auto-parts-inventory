"use client";

import { motion } from "framer-motion";
import { PenTool as Tool, Truck, ShieldCheck, Zap, Users, Headphones } from "lucide-react";

export function Services() {
    const services = [
        {
            title: "Genuine Spares",
            desc: "100% original manufacturer parts from world-class brands.",
            icon: ShieldCheck,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Instant Availability",
            desc: "Most common parts available ready in-stock for immediate fitment.",
            icon: Zap,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Expert Support",
            desc: "Expert guidance to find the exact part match for your bike.",
            icon: Headphones,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "Wholesale Deals",
            desc: "Special pricing and priority support for mechanics and garages.",
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            title: "Installation Guide",
            desc: "Access digital manuals and video guides for all categories.",
            icon: Tool,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            title: "Quality Warranty",
            desc: "Full replacements and standard warranties on all items.",
            icon: Zap,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
        },
    ];

    return (
        <section className="py-16 md:py-20 bg-zinc-100/50">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900"
                    >
                        Premium Service Quality
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-base text-zinc-500 font-medium mt-2"
                    >
                        We provide the speed, reliability, and support you need to keep your bikes running.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 mb-2 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
