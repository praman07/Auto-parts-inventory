"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Phone, MapPin, MessageCircle, ArrowUpRight, Bike } from "lucide-react";

export function Footer({ className }: { className?: string }) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase.from("settings").select("*").single();
            if (data) setSettings(data);
        }
        fetchSettings();
    }, []);

    const WHATSAPP_LINK = settings ? `https://wa.me/${settings.contact_whatsapp}` : "https://wa.me/918727061407";

    return (
        <footer className={`w-full py-16 sm:py-20 text-white bg-[#09090b] border-t border-white/[0.04] ${className || ""}`}>
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12">

                    {/* Brand & About */}
                    <div className="space-y-5 md:col-span-1">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">
                            Bhogal<span className="text-orange-500">Moto</span>
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs font-medium">
                            {settings?.about_text || "Your trusted workshop for motorcycle spare parts and professional servicing since 1989."}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-zinc-500">Open now</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-5">
                        <h4 className="font-black text-sm uppercase tracking-[0.2em] text-zinc-400">Navigate</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { label: "Browse Parts", href: "/shop" },
                                { label: "Book Service", href: "/book" },
                                { label: "My Appointments", href: "/profile" },
                                { label: "Contact Us", href: "/contact" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-zinc-500 hover:text-orange-500 transition-colors font-medium flex items-center gap-1 group">
                                        {link.label}
                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-5">
                        <h4 className="font-black text-sm uppercase tracking-[0.2em] text-zinc-400">Services</h4>
                        <ul className="space-y-3 text-sm">
                            {["Engine Service", "Spare Parts", "Electrical Repair", "Oil Change", "Brake Service"].map((service) => (
                                <li key={service}>
                                    <span className="text-zinc-500 font-medium">{service}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-5">
                        <h4 className="font-black text-sm uppercase tracking-[0.2em] text-zinc-400">Get in Touch</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                <span className="text-zinc-500 font-medium leading-relaxed">{settings?.address || "Bhogal Auto Service, Ludhiana, Punjab"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                                <a href={`tel:${settings?.contact_phone || "+918727061407"}`} className="text-zinc-500 hover:text-orange-500 transition-colors font-medium">
                                    {settings?.contact_phone || "+91 87270 61407"}
                                </a>
                            </li>
                            <li className="mt-4">
                                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 transition-all rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-green-900/30 hover:-translate-y-0.5">
                                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/[0.04] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-zinc-600 font-medium">
                        © {new Date().getFullYear()} Bhogal Moto Spare. All rights reserved.
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-600 font-medium">
                        <Bike className="h-3 w-3" /> Built with passion in Ludhiana
                    </div>
                </div>
            </div>
        </footer>
    );
}
