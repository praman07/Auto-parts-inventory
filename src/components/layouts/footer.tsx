"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";

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
        <footer className={`w-full py-10 sm:py-14 text-white border-t ${className || "bg-zinc-900 border-zinc-800"}`}>
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">

                    {/* Brand & About */}
                    <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">
                            Bhogal<span className="text-orange-500">Moto</span>
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-xs font-bold">
                            {settings?.about_text || "Your trusted workshop for motorcycle spare parts and professional servicing. Quality parts, expert mechanics."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-black text-lg">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li>
                                <Link href="/shop" className="hover:text-orange-500 transition-colors font-bold">Browse Parts</Link>
                            </li>
                            <li>
                                <Link href="/book" className="hover:text-orange-500 transition-colors font-bold">Book Service</Link>
                            </li>
                            <li>
                                <Link href="/profile" className="hover:text-orange-500 transition-colors font-bold">My Appointments</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-orange-500 transition-colors font-bold">Contact Us</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="font-black text-lg text-white">Get in Touch</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                <span className="font-bold leading-relaxed">{settings?.address || "Bhogal Auto Service, Ludhiana, Punjab"}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                                <a href={`tel:${settings?.contact_phone || "+918727061407"}`} className="hover:text-orange-500 transition-colors font-bold">
                                    {settings?.contact_phone || "+91 87270 61407"}
                                </a>
                            </li>
                            <li>
                                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 transition-colors rounded-xl text-white text-xs font-black uppercase tracking-wider mt-2 shadow-lg shadow-green-900/20">
                                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-zinc-800 mt-8 pt-6 text-center text-xs text-zinc-500 font-medium">
                    © {new Date().getFullYear()} Bhogal Moto Spare. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
