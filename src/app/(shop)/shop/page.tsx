
"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, Filter, ArrowRight, Loader2, Package } from "lucide-react";
import { fetchWithRetry } from "@/lib/api-client";
import { Button } from "@/components/ui/animated-button";
import { useCart } from "@/context/cart-context";
import Link from "next/link";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
    id: string;
    name: string;
    selling_price: number;
    image_url: string | null;
    category_name: string;
    sku: string;
};

export default function ShopListingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const { items: cartItems, addItem } = useCart();

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await fetchWithRetry("/api/shop/products");
                if (response?.data) {
                    setProducts(response.data.map((p: any) => ({
                        ...p,
                        category_name: p.categories?.name || "Part"
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch products via API", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category_name)))];

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category_name === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2 text-center md:text-left">
                        <span className="text-xs font-black text-orange-600 uppercase tracking-[0.2em]">Genuine Inventory</span>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter italic">Browse <span className="text-orange-500">Spares.</span></h1>
                        <p className="text-zinc-500 font-medium text-base sm:text-lg">Find the exact part your motorcycle needs.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Find by name or SKU..."
                            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border-2 border-zinc-100 text-zinc-900 font-bold placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/30 focus:bg-white transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border-2 ${activeCategory === cat
                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/10"
                                : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center text-zinc-300 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="font-black uppercase tracking-widest text-xs">Scanning Inventory...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="h-96 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-100 p-12">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-zinc-200" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-2">No Parts Found</h3>
                        <p className="text-zinc-500 font-medium mb-8">Try adjusting your search or category filters.</p>
                        <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>Reset All Filters</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filtered.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group bg-white rounded-[2.5rem] border-2 border-zinc-100 p-6 hover:border-orange-500/20 hover:shadow-2xl hover:shadow-orange-600/5 transition-all flex flex-col h-[400px]"
                                >
                                    <div className="aspect-square bg-zinc-50 rounded-3xl overflow-hidden mb-6 relative">
                                        {product.image_url ? (
                                            <NextImage
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">⚙️</div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-100 shadow-sm">
                                                {product.category_name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-black text-xl text-zinc-900 tracking-tight line-clamp-2 leading-none mb-2">{product.name}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SKU: {product.sku}</p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rate</span>
                                            <span className="text-xl font-black text-zinc-900 tracking-tight">₹{product.selling_price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addItem({ id: product.id, name: product.name, price: product.selling_price, image: product.image_url || "" });
                                                }}
                                                className="h-12 px-4 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-950 transition-all shadow-xl shadow-orange-600/20 whitespace-nowrap"
                                            >
                                                {cartItems.find(i => i.id === product.id)
                                                    ? `Added (${cartItems.find(i => i.id === product.id)?.quantity})`
                                                    : "Select Part"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
