
"use client";

import { Sparkles, ShieldCheck, Wrench, Package, Star } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Hero */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest italic">Since 1989</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">Bhogal <span className="text-orange-500">Auto</span> Service</h1>
                    <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto italic">Over 35 years of legacy in motorcycle maintenance and genuine spare parts.</p>
                </div>

                {/* About + Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black italic border-b border-zinc-900 pb-4">Our Legacy</h2>
                        <p className="text-zinc-400 leading-relaxed italic">
                            Founded in 1989, Bhogal Auto Service has grown from a small workshop to a premier destination for motorcycle enthusiasts. We specialize in all major brands including Hero, Honda, Bajaj, and TVS.
                        </p>
                        <p className="text-zinc-400 leading-relaxed italic">
                            Our philosophy is simple: Genuine parts, expert mechanics, and honest service. Every bike that enters our workshop is treated as our own.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Wrench, title: "Expert Care", desc: "Certified Mechanics" },
                            { icon: Package, title: "Genuine Parts", desc: "100% Original" },
                            { icon: ShieldCheck, title: "Quality Assured", desc: "Standard Warranty" },
                            { icon: Star, title: "Top Rated", desc: "4.8★ Reliability" },
                        ].map((item, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center">
                                <item.icon className="w-8 h-8 text-orange-500 mb-4" />
                                <h3 className="font-black text-sm uppercase tracking-wider italic mb-1">{item.title}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>



                {/* CTA */}
                <div className="mt-16 bg-orange-600 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center gap-6 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">Ride with Confidence.</h2>
                    <p className="text-orange-100 font-medium max-w-md italic">Trust Bhogal Auto Service for your next maintenance or spare part requirement.</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-xl">
                        Browse Parts →
                    </Link>
                </div>
            </div>
        </div>
    );
}
