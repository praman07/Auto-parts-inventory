"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/animated-button";
import { Card, CardContent } from "@/components/ui/animated-card";
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Wrench,
    ShieldCheck,
    Calendar,
    ChevronLeft,
    HelpCircle,
    Check,
    Minus,
    Plus,
    ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import NextImage from "next/image";

type Product = {
    id: string;
    name: string;
    description: string | null;
    selling_price: number;
    image_url: string | null;
    category_id: string | null;
};

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetchWithRetry(`/api/shop/products/${id}`);
                if (response?.data) setProduct(response.data);
            } catch (error) {
                console.error("Failed to fetch product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getStockStatus = (pid: string) => {
        const hash = pid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        if (hash % 3 === 0) return { label: "In Stock", color: "text-green-600", light: "bg-green-50", border: "border-green-100", dot: "bg-green-500" };
        if (hash % 3 === 1) return { label: "Limited Stock", color: "text-yellow-600", light: "bg-yellow-50", border: "border-yellow-100", dot: "bg-yellow-500" };
        return { label: "Out of Stock", color: "text-red-600", light: "bg-red-50", border: "border-red-100", dot: "bg-red-500" };
    };

    const getDifficulty = (pid: string) => {
        const hash = pid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        if (hash % 2 === 0) return { label: "Easy", icon: "🟢", desc: "No special tools needed." };
        return { label: "Medium", icon: "🟡", desc: "Mechanic recommended." };
    };

    if (loading) return <div className="min-h-screen pt-32 text-center font-black">Scanning database...</div>;
    if (!product) return <div className="min-h-screen pt-32 text-center">Part not found.</div>;

    const stock = getStockStatus(product.id);
    const level = getDifficulty(product.id);

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="container mx-auto px-4">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-orange-600 mb-8 transition-colors uppercase tracking-widest">
                    <ChevronLeft className="h-4 w-4" /> Back to Parts
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Huge Images */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-zinc-50 rounded-[3rem] border-2 border-zinc-100 flex items-center justify-center p-12 relative group overflow-hidden">
                            {product.image_url ? (
                                <NextImage
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-contain group-hover:scale-110 transition-transform duration-700 p-12"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : <div className="text-9xl">⚙️</div>}

                            <div className={`absolute bottom-8 left-8 ${stock.light} ${stock.color} ${stock.border} border px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm`}>
                                <div className={`w-2 h-2 rounded-full ${stock.dot}`} />
                                {stock.label}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter leading-none">{product.name}</h1>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-zinc-900">₹{product.selling_price.toLocaleString("en-IN")}</span>
                                <span className="text-zinc-400 font-bold text-sm">Incl. taxes</span>
                            </div>
                        </div>

                        {/* Fit Check Card */}
                        <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="font-black text-zinc-900">Compatibility Check</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-white p-4 rounded-xl border border-zinc-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Exact Model Match</span>
                                    <span className="font-bold text-zinc-900">{product.description?.split(',')[0] || "Fits All Models"}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-zinc-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Year Range</span>
                                    <span className="font-bold text-zinc-900">2018—2024</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Box */}
                        <Card className="rounded-[2.5rem] border-2 border-orange-100 shadow-2xl shadow-orange-600/10 overflow-hidden bg-orange-50/30">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{level.icon}</span>
                                    <div>
                                        <p className="font-black text-xl leading-none">Installation: {level.label}</p>
                                        <p className="text-sm font-medium text-orange-800/70">{level.desc}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex gap-3">
                                        <div className="flex items-center justify-between border-2 border-zinc-200/50 rounded-2xl p-1 bg-white/50 w-32 shrink-0 shadow-inner">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-orange-50 text-zinc-600 transition-colors shadow-sm border border-zinc-100"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-black text-lg w-8 text-center text-zinc-900">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-orange-50 text-orange-600 transition-colors shadow-sm border border-zinc-100"
                                            >
                                                <Plus className="w-4 h-4 text-orange-600" />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                addItem({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.selling_price,
                                                    image: product.image_url || undefined
                                                }, quantity);
                                            }}
                                            className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 font-black text-lg shadow-xl shadow-orange-600/20 text-white flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                                        </Button>
                                    </div>
                                    <Link href={`/book?part=${id}`} className="block">
                                        <Button className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 font-black text-lg shadow-xl shadow-zinc-900/10 text-white">
                                            Book Installation Only
                                        </Button>
                                    </Link>
                                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-4 px-6 leading-relaxed">
                                        Select parts and book an appointment for installation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>
        </div>
    );
}
