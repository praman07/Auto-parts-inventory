"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Loader2, CheckCircle, Filter, Tag } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"

type Product = {
    id: string
    name: string
    category: string
    price: number
    image?: never // Removed
    sku: string
    part_number: string
    stock: number
    is_universal: boolean
    compatibility: { brand: string, model: string }[]
    supplier_name: string
}

type CartItem = Product & { quantity: number }

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function SalePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")
    const [cart, setCart] = useState<CartItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Fetch products + categories from Supabase
    useEffect(() => {
        async function fetchProducts() {
            const { data: prods, error } = await supabase
                .from("products")
                .select(`
                    id, name, sku, part_number, selling_price, stock_quantity, category_id, is_universal,
                    categories(name),
                    suppliers(name),
                    product_bikes(
                        bikes(
                            model_name,
                            companies(name)
                        )
                    )
                `)
                .order("name")

            if (error) {
                console.error("Error fetching products:", error)
                setLoading(false)
                return
            }

            const mapped: Product[] = (prods || []).map((p: any, i: number) => ({
                id: p.id,
                name: p.name,
                category: p.categories?.name || "Uncategorized",
                price: Number(p.selling_price),
                sku: p.sku || `SKU-${i + 1}`,
                part_number: p.part_number,
                // image: removed
                stock: Number(p.stock_quantity),
                is_universal: !!p.is_universal,
                supplier_name: p.suppliers?.name || "None",
                compatibility: (p.product_bikes || []).map((pb: any) => ({
                    model: pb.bikes?.model_name,
                    brand: pb.bikes?.companies?.name,
                })),
            }))

            setProducts(mapped)
            setLoading(false)
        }
        fetchProducts()
    }, [])

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const q = searchQuery.toLowerCase().trim()
            if (!q) return activeCategory === "All" || product.category === activeCategory

            const matchesSearch =
                product.name.toLowerCase().includes(q) ||
                product.sku.toLowerCase().includes(q) ||
                (product.part_number && product.part_number.toLowerCase().includes(q))
            const matchesCategory = activeCategory === "All" || product.category === activeCategory
            return matchesSearch && matchesCategory
        })
    }, [searchQuery, activeCategory, products])

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const gst = Math.round(subtotal * 0.18)
    const total = subtotal + gst
    const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0)

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error("This item is out of stock")
            return
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                // Check if adding 1 more would exceed stock
                if (existing.quantity >= product.stock) {
                    toast.error(`Only ${product.stock} items available in stock`)
                    return prev
                }
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id))
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta
                        return newQty > 0 ? { ...item, quantity: newQty } : null
                    }
                    return item
                })
                .filter(Boolean) as CartItem[]
        )
    }

    const handleCheckout = async () => {
        setIsProcessing(true)
        try {
            // 1. Get a shop_id (use first shop)
            const { data: shops } = await supabase.from("shops").select("id").limit(1)
            const shopId = shops?.[0]?.id
            if (!shopId) {
                toast.error("No shop configured. Please add a shop first.")
                setIsProcessing(false)
                return
            }

            // 2. Create sale record
            const { data: sale, error: saleError } = await supabase
                .from("sales")
                .insert({ shop_id: shopId, total_amount: total })
                .select("id")
                .single()

            if (saleError || !sale) {
                toast.error("Failed to record sale: " + (saleError?.message || "Unknown error"))
                setIsProcessing(false)
                return
            }

            // 3. Insert sale items
            const saleItems = cart.map((item) => ({
                sale_id: sale.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                subtotal: item.price * item.quantity,
            }))

            const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)
            if (itemsError) console.error("Sale items error:", itemsError)

            // 4. Create stock movements and decrement product quantities
            const movements = cart.map((item) => ({
                shop_id: shopId,
                product_id: item.id,
                type: "sale" as const,
                quantity: -item.quantity,
                reference_id: sale.id,
                notes: `Sale #${sale.id.slice(0, 8)}`,
            }))

            const { error: movError } = await supabase.from("stock_movements").insert(movements)
            if (movError) console.error("Stock movement error:", movError)

            // 5. Decrement stock_quantity on each product
            for (const item of cart) {
                await supabase.rpc("decrement_stock" as never, {
                    p_id: item.id,
                    qty: item.quantity,
                } as never).then(() => {
                    // Fallback: update directly
                })

                // Direct update fallback
                const { data: current } = await supabase
                    .from("products")
                    .select("stock_quantity")
                    .eq("id", item.id)
                    .single()

                if (current) {
                    await supabase
                        .from("products")
                        .update({ stock_quantity: Math.max(0, Number(current.stock_quantity) - item.quantity) })
                        .eq("id", item.id)
                }
            }

            toast.success(`Sale of ₹${total.toLocaleString("en-IN")} recorded!`)
            setCart([])

            // Refresh products to show updated stock
            const { data: refreshed } = await supabase
                .from("products")
                .select("id, stock_quantity")

            if (refreshed) {
                setProducts((prev) =>
                    prev.map((p) => {
                        const updated = refreshed.find((r) => r.id === p.id)
                        return updated ? { ...p, stock: Number(updated.stock_quantity) } : p
                    })
                )
            }
        } catch (err) {
            console.error("Checkout error:", err)
            toast.error("An unexpected error occurred")
        } finally {
            setIsProcessing(false)
        }
    }

    // Shared Cart List Component
    const CartList = () => (
        <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/10 gap-2">
                    <ShoppingCart className="h-8 w-8" strokeWidth={1} />
                    <p className="text-[11px] text-white/20">Tap a product to add</p>
                </div>
            ) : isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                        Sale Recorded
                    </p>
                </div>
            ) : (
                <div className="p-2 space-y-1">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 rounded-lg border border-white/[0.05] bg-white/[0.03] group"
                        >
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-white/80 leading-tight truncate mb-0.5">
                                    {item.name}
                                </p>
                                <p className="text-[10px] text-white/40 tabular-nums">
                                    ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                                </p>
                            </div>

                            {/* Link Total for item */}
                            <div className="text-[11px] font-bold text-white/60 tabular-nums w-14 text-right">
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </div>

                            {/* Qty Controls */}
                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    // Shared Cart Footer Component
    const CartSummaryFooter = () => (
        <div className="px-3 py-2.5 space-y-2">
            <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-white/25">
                    <span>Subtotal</span>
                    <span className="tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/25">
                    <span>GST (18%)</span>
                    <span className="tabular-nums">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[12px] font-bold text-white/70 pt-1.5 border-t border-white/[0.06]">
                    <span>Total</span>
                    <span className="tabular-nums">₹{total.toLocaleString("en-IN")}</span>
                </div>
            </div>
            <button
                onClick={() => {
                    handleCheckout();
                    setIsCartOpen(false);
                }}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/[0.9] text-zinc-900 py-2.5 text-[12px] font-semibold hover:bg-white transition-colors active:scale-[0.99] disabled:opacity-50"
            >
                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    `Record Sale — ₹${total.toLocaleString("en-IN")}`
                )}
            </button>
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100dvh-4rem)]">
                <Loader2 className="h-6 w-6 text-stone-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-4rem)] overflow-hidden relative">
            {/* ═══════ LEFT: Product Catalog ═══════ */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Search + Categories */}
                <div className="px-3 pt-3 pb-2 space-y-2 border-b border-white/[0.06] flex-none">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full pl-8 pr-4 py-2 md:py-1.5 text-sm md:text-[12px] bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-2.5 py-1.5 md:py-1 rounded-md text-xs md:text-[10px] font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? "bg-white/[0.1] text-white/80"
                                    : "text-white/25 hover:text-white/40 hover:bg-white/[0.04]"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-3 pb-24 lg:pb-3 min-h-0">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 gap-2">
                            <ShoppingCart className="h-8 w-8" strokeWidth={1} />
                            <p className="text-[11px] text-white/20">
                                {products.length === 0 ? "No products in database" : "No products match your search"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className={`group text-left rounded-lg border transition-all flex flex-col p-3 h-auto min-h-[100px] relative
                                        ${product.stock <= 0
                                            ? "bg-white/[0.02] border-white/[0.02] opacity-40 cursor-not-allowed"
                                            : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.98]"
                                        }`}
                                >
                                    {/* Stock Badge - Absolute Top Right */}
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/20">
                                            {product.stock} left
                                        </div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/20">
                                            Out of Stock
                                        </div>
                                    )}

                                    <div className="flex flex-col h-full">
                                        <p className="text-[13px] md:text-[12px] font-medium text-white/90 leading-snug line-clamp-2 mb-1 pr-12">
                                            {product.name}
                                        </p>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-mono text-white/30">{product.sku}</span>
                                            {product.part_number && (
                                                <span className="text-[10px] font-mono text-white/30 font-bold">{product.part_number}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            {product.is_universal ? (
                                                <div className="text-[9px] font-bold text-emerald-400/60 bg-emerald-400/5 px-1.5 py-0.5 rounded inline-block">
                                                    Universal
                                                </div>
                                            ) : product.compatibility.length > 0 ? (
                                                <div className="text-[9px] text-white/30 truncate">
                                                    Fits: {product.compatibility.map(c => `${c.brand} ${c.model}`).join(", ")}
                                                </div>
                                            ) : (
                                                <div className="text-[9px] text-white/10 italic">No compatibility set</div>
                                            )}

                                            <div className="flex items-center justify-between border-t border-white/[0.04] pt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-white/20">Price</span>
                                                    <span className="text-[13px] font-bold text-white/90 tabular-nums">
                                                        ₹{product.price.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                                <div className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════ RIGHT: Cart (Desktop Sidebar) ═══════ */}
            <div className="hidden lg:flex w-72 xl:w-80 border-l border-white/[0.06] flex-col bg-zinc-950 flex-none h-full">
                {/* Cart Header */}
                <div className="px-3 py-2.5 border-b border-white/[0.06] flex-none">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                        <span className="text-[12px] font-semibold text-white/60">
                            Current Order
                        </span>
                        {itemCount > 0 && (
                            <span className="ml-auto text-[9px] font-bold bg-white/[0.1] text-white/60 rounded-full px-1.5 py-0.5 tabular-nums">
                                {itemCount} Items
                            </span>
                        )}
                    </div>
                </div>

                {/* Cart Items (Desktop) */}
                <CartList />

                {/* Cart Footer (Desktop) */}
                {cart.length > 0 && !isProcessing && (
                    <div className="bg-zinc-900/50 flex-none">
                        <CartSummaryFooter />
                    </div>
                )}
            </div>

            {/* ═══════ MOBILE: Floating Bottom Cart Bar ═══════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-white/[0.1] z-50">
                {cart.length > 0 ? (
                    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                        <div className="flex items-center gap-3">
                            <div className="flex-1" onClick={() => setIsCartOpen(true)}>
                                <p className="text-xs text-white/40">{itemCount} items</p>
                                <p className="text-lg font-bold text-white">₹{total.toLocaleString("en-IN")}</p>
                            </div>
                            <SheetTrigger asChild>
                                <button
                                    className="bg-white text-zinc-950 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-white/10 active:scale-95 transition-transform"
                                >
                                    View Cart
                                </button>
                            </SheetTrigger>
                        </div>
                        <SheetContent side="bottom" className="h-[85vh] bg-zinc-950 border-white/10 p-0 flex flex-col">
                            <SheetHeader className="px-4 py-3 border-b border-white/10 flex flex-row items-center justify-between">
                                <SheetTitle className="text-white text-base">Current Order</SheetTitle>
                                <SheetClose asChild>
                                    <button className="p-2 mb-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </SheetClose>
                            </SheetHeader>
                            <CartList />
                            {cart.length > 0 && !isProcessing && (
                                <div className="border-t border-white/10 bg-zinc-900/50 pb-6 pt-2">
                                    <CartSummaryFooter />
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                ) : (
                    <div className="text-center text-xs text-white/30 py-2">
                        Cart is empty
                    </div>
                )}
            </div>
        </div>
    )
}
