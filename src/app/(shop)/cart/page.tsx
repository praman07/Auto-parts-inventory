
"use client";

import { useCart } from "@/context/cart-context";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ChevronLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/animated-button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
    const { items: cart, removeItem, updateQuantity, totalPrice: totalAmount, totalItems, clearCart } = useCart();

    const total = totalAmount;

    if (totalItems === 0) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-zinc-900/10 rotate-12 group hover:rotate-0 transition-transform">
                        <ShoppingBag className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 mb-2 italic">No parts selected.</h1>
                        <p className="text-zinc-500 font-medium italic mb-10">Add some genuine spares to get your ride ready.</p>
                        <Link href="/shop" className="inline-block">
                            <Button className="h-16 px-10 rounded-2xl bg-zinc-950 font-black text-xl italic gap-3 shadow-2xl active:scale-95 transition-all">
                                Browse Parts <ArrowRight className="w-6 h-6" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-orange-600 mb-6 transition-colors uppercase tracking-[0.2em]">
                            <ChevronLeft className="h-4 w-4" /> Select More Parts
                        </Link>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter italic">Selected <span className="text-orange-500">Parts.</span></h1>
                    </div>
                    <div className="flex flex-col md:text-right gap-1">
                        <span className="text-xl font-black text-zinc-900 italic">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[2rem] p-4 sm:p-6 border-2 border-zinc-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 group hover:border-orange-500/20 transition-all shadow-sm"
                                >
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-zinc-50 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 overflow-hidden">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} width={128} height={128} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <Package className="w-10 h-10 text-zinc-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2 text-center sm:text-left">
                                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest italic">Genuine Part</p>
                                        <h3 className="text-2xl font-black text-zinc-900 line-clamp-1 italic">{item.name}</h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <span className="text-xl font-bold text-zinc-900 italic">₹{item.price.toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-zinc-100 rounded-2xl p-1 border border-zinc-200">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-950"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="w-12 text-center font-black text-lg italic text-zinc-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-950"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="flex justify-between items-center p-6 pt-10">
                            <button onClick={clearCart} className="text-sm font-black text-zinc-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                                Clear All Items
                            </button>
                            <p className="text-zinc-400 font-medium italic">Items remain selected even if you refresh.</p>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-zinc-900 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h2 className="text-3xl font-black italic tracking-tighter mb-8">Summary</h2>

                            <div className="space-y-6 pb-8 border-b border-white/5">
                                <div className="flex justify-between font-bold italic">
                                    <span className="text-white/40 uppercase text-xs tracking-widest">Selected Parts Subtotal</span>
                                    <span className="text-xl">₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <div className="pt-8 mb-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] italic">Final Amount</span>
                                    <span className="text-4xl font-black italic tracking-tighter">₹{total.toLocaleString("en-IN")}</span>
                                </div>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-right italic">All taxes included in price</p>
                            </div>

                            <Link href="/checkout">
                                <Button className="w-full h-16 sm:h-20 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white font-black text-lg sm:text-xl italic tracking-tight gap-4 transition-all active:scale-95 shadow-2xl shadow-orange-600/20">
                                    Proceed to Booking <ArrowRight className="w-5 h-5 sm:w-6 h-6" />
                                </Button>
                            </Link>

                            <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-orange-500" />
                                </div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                    Genuine <span className="text-white">manufacturer parts</span> only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
