"use client";

import { useCart } from "@/context/cart-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Pages where the banner should NOT show
const EXCLUDED_PATHS = ["/cart", "/checkout", "/book", "/auth", "/appointments"];

export function CartBanner() {
    const { items, totalItems, totalPrice } = useCart();
    const pathname = usePathname();
    const [dismissed, setDismissed] = useState(false);
    const [prevCount, setPrevCount] = useState(0);

    // Re-show banner when item count increases (new item added)
    useEffect(() => {
        if (totalItems > prevCount && prevCount >= 0) {
            setDismissed(false); // pop back up when new item added
        }
        setPrevCount(totalItems);
    }, [totalItems]);

    // Don't show on excluded pages
    const isExcluded = EXCLUDED_PATHS.some(p => pathname.startsWith(p));
    const shouldShow = totalItems > 0 && !isExcluded && !dismissed;

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
                >
                    <div className="max-w-2xl mx-auto bg-zinc-950 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
                        {/* Orange top accent */}
                        <div className="h-0.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

                        <div className="p-3 sm:p-4 flex items-center gap-3">
                            {/* Icon + item info */}
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-black truncate">
                                    {totalItems} {totalItems === 1 ? "part" : "parts"} in cart
                                    <span className="text-orange-400 ml-2">·</span>
                                    <span className="text-orange-400 font-black ml-2">₹{totalPrice.toLocaleString("en-IN")}</span>
                                </p>
                                <p className="text-white/40 text-[10px] font-medium truncate">
                                    {items.slice(0, 2).map(i => i.name).join(", ")}{items.length > 2 ? ` +${items.length - 2} more` : ""}
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Link href="/book">
                                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black transition-colors">
                                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                                        <span className="hidden sm:inline">Book Service</span>
                                        <span className="sm:hidden">Book</span>
                                    </button>
                                </Link>
                                <Link href="/cart">
                                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition-colors shadow-lg shadow-orange-600/20">
                                        View Cart
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setDismissed(true)}
                                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
