
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, MessageSquare, Send, Zap, Mail } from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const json = await res.json();
                if (json.data) setSettings(json.data);
            } catch (e) {
                console.error(e);
            }
        };
        loadSettings();
    }, []);

    const phoneSrc = settings?.contact_phone || "+91 91151-51000";
    const emailSrc = settings?.contact_email || "info@bhogalauto.com";
    const addressSrc = settings?.address || "Model Town Ext., Ludhiana";

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-4 relative z-10 flex justify-center">
                <div className="max-w-3xl w-full">
                    <div className="space-y-12">
                        <div className="space-y-6 text-center">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] italic">Reach Out Anytime</span>
                            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none">Get in <span className="text-orange-500">Touch.</span></h1>
                            <p className="text-zinc-500 text-lg font-medium max-w-lg mx-auto italic">Need help with a spare part or want to check workshop availability? We&apos;re here for you.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            {[
                                { icon: Phone, title: "Phone Support", info: phoneSrc, sub: settings?.working_hours || "10am - 8pm IST" },
                                { icon: Mail, title: "General Inquiries", info: emailSrc, sub: "Replies in 24h" },
                                { icon: MapPin, title: "Our Workshop", info: addressSrc },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-4 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50 hover:border-orange-500/30 transition-all">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                        <item.icon className="h-7 w-7 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{item.title}</h3>
                                        <p className="text-lg font-black text-white italic">{item.info}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 mt-12 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] flex items-center justify-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-green-500 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-zinc-400">Live Workshop Status: <span className="text-green-500 font-black uppercase tracking-widest text-xs">Accepting Bookings</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
