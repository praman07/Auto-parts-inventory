"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    Plus,
    Import,
    Edit,
    Package,
    History,
    ShoppingCart,
    Search,
    X,
    Loader2,
    ChevronDown,
    Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { fetchWithRetry } from "@/lib/api-client"
import { ProductSheet } from "./product-sheet"
import { StockArrivalSheet } from "./stock-arrival-sheet"
import { RestockSheet } from "./restock-sheet"

interface ProductRow {
    id: string
    name: string
    sku: string | null
    part_number: string | null
    cost_price: number
    selling_price: number
    stock_quantity: number
    low_stock_threshold: number
    description: string | null
    category_name: string
    category_id: string | null
    subcategory_name: string
    subcategory_id: string | null
    supplier_id: string | null
    supplier_name: string
    is_universal: boolean
    compatibility: { brand: string, model: string, id: string }[]
    image_url: string | null
}

export function InventoryContent() {
    const [products, setProducts] = useState<ProductRow[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<string>("all")
    const [sheetOpen, setSheetOpen] = useState(false)
    const [arrivalSheetOpen, setArrivalSheetOpen] = useState(false)
    const [restockSheetOpen, setRestockSheetOpen] = useState(false)
    const [activeDetailTab, setActiveDetailTab] = useState<"specs" | "bikes" | "prices">("specs")

    // UI States
    const [showFilters, setShowFilters] = useState(false)

    // Filter States
    const [selCat, setSelCat] = useState<string | null>(null)
    const [selSub, setSelSub] = useState<string | null>(null)
    const [selBrand, setSelBrand] = useState<string | null>(null)
    const [selModel, setSelModel] = useState<string | null>(null)

    // Handle URL actions
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get("action")
        if (action === "update-stock") {
            setArrivalSheetOpen(true)
            // Clear the param without refreshing
            const newUrl = window.location.pathname
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl)
        }
    }, [searchParams])

    const fetchData = useCallback(async () => {
        try {
            const response = await fetchWithRetry("/api/inventory/products");

            if (response.error) {
                if (response.error.includes("fetch failed") || response.status === 502) {
                    toast.error("Database Connection Failed. Please check if your Supabase project is paused in the dashboard.")
                } else {
                    toast.error(`Error fetching products: ${response.error}`)
                }
                setLoading(false)
                return
            }

            const prods = response.data || [];

            const mapped: ProductRow[] = prods.map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                part_number: p.part_number,
                cost_price: Number(p.cost_price),
                selling_price: Number(p.selling_price),
                stock_quantity: Number(p.stock_quantity),
                low_stock_threshold: Number(p.low_stock_threshold),
                description: p.description,
                category_id: p.category_id,
                category_name: p.categories?.name || "Uncategorized",
                subcategory_id: p.subcategory_id,
                subcategory_name: p.subcategories?.name || "None",
                supplier_id: p.supplier_id,
                supplier_name: p.suppliers?.name || "None",
                is_universal: !!p.is_universal,
                compatibility: (p.product_bikes || []).map((pb: any) => ({
                    id: pb.bikes?.id,
                    model: pb.bikes?.model_name,
                    brand: pb.bikes?.companies?.name,
                })),
                image_url: p.image_url,
            })).sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

            setProducts(mapped)
        } catch (error: any) {
            console.error("Detailed Fetch Error:", error)
            if (error.message.includes("fetch failed") || error.message.includes("502")) {
                toast.error("Database Connection Failed. Please check if your Supabase project is paused in the dashboard.")
            } else {
                toast.error(`Error fetching products: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const selectedProduct = products.find((p) => p.id === selectedId)

    const filteredProducts = products.filter((p: any) => {
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            (p.sku || "").toLowerCase().includes(q) ||
            (p.part_number || "").toLowerCase().includes(q) ||
            (p.category_name || "").toLowerCase().includes(q)

        const matchesCat = !selCat || p.category_name === selCat
        const matchesSub = !selSub || p.subcategory_name === selSub
        const matchesBrand = !selBrand || (p.compatibility as any[]).some(c => c.brand === selBrand)
        const matchesModel = !selModel || (p.compatibility as any[]).some(c => c.model === selModel)

        let baseMatch = matchesSearch && matchesCat && matchesSub && matchesBrand && matchesModel

        if (activeFilter === "low_stock") return baseMatch && p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
        if (activeFilter === "out_of_stock") return baseMatch && p.stock_quantity === 0
        return baseMatch
    })

    // Derive Filter Options
    const allCats = Array.from(new Set(products.map(p => p.category_name))).sort()
    const allSubs = Array.from(new Set(products
        .filter(p => !selCat || p.category_name === selCat)
        .map(p => p.subcategory_name)
    )).filter(s => s !== "None").sort()

    const allBrands = Array.from(new Set(products.flatMap(p => p.compatibility.map(c => c.brand)))).sort()
    const allModels = Array.from(new Set(products
        .flatMap(p => p.compatibility
            .filter(c => !selBrand || c.brand === selBrand)
            .map(c => c.model)
        )
    )).sort()

    const lowStockCount = products.filter((p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length
    const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length

    const markup = (p: ProductRow) => {
        if (p.cost_price === 0) return "—"
        return Math.round(((p.selling_price - p.cost_price) / p.cost_price) * 100) + "%"
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] -m-4 md:-m-5">
            {/* Control Bar */}
            <div className="flex flex-col border-b border-white/[0.06] bg-zinc-900/80 z-10">
                <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between md:px-4 md:py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setSheetOpen(true)}
                            className="flex items-center gap-1.5 h-8 md:h-7 px-3 md:px-2.5 text-xs md:text-[11px] font-semibold bg-white text-zinc-900 rounded-md hover:bg-white/90 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Product
                        </button>
                        <button
                            onClick={() => setArrivalSheetOpen(true)}
                            className="flex items-center gap-1.5 h-8 md:h-7 px-3 md:px-2.5 text-xs md:text-[11px] font-semibold border border-white/15 text-white/70 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Stock Arrival
                        </button>
                        <button
                            onClick={() => setRestockSheetOpen(true)}
                            className="flex items-center gap-1.5 h-8 md:h-7 px-3 md:px-2.5 text-xs md:text-[11px] font-semibold border border-white/15 text-white/70 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                            <Package className="w-3.5 h-3.5" />
                            Restock
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 h-8 md:h-7 px-3 md:px-2.5 text-xs md:text-[11px] font-semibold rounded-md transition-all ${showFilters
                                ? "bg-violet-500/10 text-violet-400 border border-violet-500/30"
                                : "border border-white/15 text-white/70 hover:bg-white/[0.06] hover:text-white"
                                }`}
                        >
                            <Filter className={`w-3.5 h-3.5 ${showFilters ? "fill-current" : ""}`} />
                            {showFilters ? "Hide" : "Filter"}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-48 pl-8 pr-4 py-2 md:py-1.5 text-xs md:text-[12px] bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Extended One-Click Filter Bar */}
                {showFilters && (
                    <div className="border-t border-white/[0.04] py-2.5 px-4 space-y-3 bg-zinc-900/40 animate-in slide-in-from-top-2 duration-300">
                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest min-w-[70px]">Categories</span>
                            <div className="flex items-center gap-1.5">
                                {allCats.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelCat(selCat === cat ? null : cat)
                                            setSelSub(null) // Reset sub on cat change
                                        }}
                                        className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${selCat === cat
                                            ? "bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/20"
                                            : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subcategories (Cascading) */}
                        {allSubs.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest min-w-[70px]">Sub-Type</span>
                                <div className="flex items-center gap-1.5">
                                    {allSubs.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setSelSub(selSub === sub ? null : sub)}
                                            className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${selSub === sub
                                                ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                                                : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Brands (Companies) */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-white/[0.04] pt-2.5">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest min-w-[70px]">Brands</span>
                            <div className="flex items-center gap-1.5">
                                {allBrands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => {
                                            setSelBrand(selBrand === brand ? null : brand)
                                            setSelModel(null) // Reset model on brand change
                                        }}
                                        className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${selBrand === brand
                                            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Models (Cascading) */}
                        {allModels.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest min-w-[70px]">Models</span>
                                <div className="flex items-center gap-1.5">
                                    {allModels.map(model => (
                                        <button
                                            key={model}
                                            onClick={() => setSelModel(selModel === model ? null : model)}
                                            className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${selModel === model
                                                ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20"
                                                : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            {model}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reset Actions */}
                        {(selCat || selSub || selBrand || selModel) && (
                            <button
                                onClick={() => {
                                    setSelCat(null)
                                    setSelSub(null)
                                    setSelBrand(null)
                                    setSelModel(null)
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors pt-1 border-t border-red-500/10"
                            >
                                <X className="w-3 h-3" />
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Data Grid */}
                <div className="flex-1 overflow-auto bg-zinc-950">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                            <Package className="h-10 w-10" strokeWidth={1} />
                            <p className="text-xs text-white/30">
                                {products.length === 0 ? "No products yet — add your first product" : "No products match your filter"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10 bg-zinc-900 shadow-sm shadow-black">
                                <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
                                    <th className="border-b border-white/[0.08] py-4 px-4">SKU / Code</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4">Product Identity</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4 text-center">Shelf Category</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4">In Stock</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4 text-right">Unit Cost</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4 text-center">Gain</th>
                                    <th className="border-b border-white/[0.08] py-4 px-4 text-right">Retail Rate</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {filteredProducts.map((p) => {
                                    const isSelected = p.id === selectedId
                                    const isLow = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
                                    const isOut = p.stock_quantity === 0
                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedId(p.id)
                                                setActiveDetailTab("specs")
                                                setDialogOpen(true)
                                            }}
                                            className={`group cursor-pointer transition-all ${isSelected
                                                ? "bg-white/[0.05] shadow-[inset_4px_0_0_0_#f97316]"
                                                : "hover:bg-white/[0.02]"
                                                } border-b border-white/[0.04]`}
                                        >
                                            <td className={`font-mono text-xs font-bold py-5 px-4 ${isSelected ? "text-orange-500" : "text-white/30"}`}>
                                                {p.sku || "—"}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-black text-[14px] text-white tracking-tight">{p.name}</span>
                                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{p.part_number || "NO PART NUMBER"}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <span className="inline-flex rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-[10px] font-black uppercase text-white/40 tracking-wider">
                                                    {p.category_name}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`font-mono text-[13px] font-bold tabular-nums ${isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"}`}>
                                                        {p.stock_quantity.toString().padStart(2, '0')}
                                                    </span>
                                                    {isLow && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-tight border border-amber-500/20">
                                                            Restock
                                                        </span>
                                                    )}
                                                    {isOut && (
                                                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-tight border border-red-500/20">
                                                            Depleted
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-white/40 py-5 px-4 tabular-nums text-right text-[13px] font-medium">₹{p.cost_price.toLocaleString("en-IN")}</td>
                                            <td className="text-white/30 py-5 px-4 text-center">
                                                <span className="text-[10px] font-black bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.08]">{markup(p)}</span>
                                            </td>
                                            <td className="font-black text-white py-5 px-4 tabular-nums text-right text-[15px]">₹{p.selling_price.toLocaleString("en-IN")}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Side Detail Panel — only on very wide screens */}
                <div className="w-96 border-l border-white/[0.08] bg-zinc-900/50 backdrop-blur-3xl flex-col hidden 2xl:flex">
                    {selectedProduct ? (
                        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                            {/* Product Header (Slimmer) */}
                            <div className="px-5 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-bold text-white/40 border border-white/[0.08] uppercase">
                                        {selectedProduct.category_name}
                                    </span>
                                    <button onClick={() => setSelectedId(null)} className="text-white/20 hover:text-white/50 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="text-base font-bold text-white leading-tight truncate" title={selectedProduct.name}>
                                    {selectedProduct.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[10px] font-mono text-white/25 tracking-tight">SKU: {selectedProduct.sku || "N/A"}</p>
                                    <span className="text-white/10 text-[8px]">•</span>
                                    <p className="text-[10px] font-mono text-white/50 tracking-tight font-bold">P/N: {selectedProduct.part_number || "N/A"}</p>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex px-5 border-b border-white/[0.06] bg-white/[0.02]">
                                {[
                                    { id: "specs", label: "Specs" },
                                    { id: "bikes", label: "Bikes" },
                                    { id: "prices", label: "Prices" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDetailTab(tab.id as any)}
                                        className={`flex-1 py-3 text-[11px] font-bold transition-all border-b-2 ${activeDetailTab === tab.id
                                            ? "text-white border-white"
                                            : "text-white/20 border-transparent hover:text-white/40"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                {activeDetailTab === "specs" && (
                                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                                        {/* Status Row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                                <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Stock</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-lg font-bold tabular-nums ${selectedProduct.stock_quantity <= selectedProduct.low_stock_threshold ? "text-amber-400" : "text-emerald-400"}`}>
                                                        {selectedProduct.stock_quantity}
                                                    </span>
                                                    <span className="text-[10px] text-white/20 font-medium">units</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                                <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Limit</p>
                                                <span className="text-lg font-bold tabular-nums text-white/50">
                                                    {selectedProduct.low_stock_threshold}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Logistics Grid */}
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-white/20 uppercase mb-2">Primary Supplier</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-white/70 bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-xl">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                                                    {selectedProduct.supplier_name}
                                                </div>
                                            </div>
                                            {selectedProduct.description && (
                                                <div>
                                                    <p className="text-[9px] font-bold text-white/20 uppercase mb-2">Notes & Context</p>
                                                    <div className="text-[11px] text-white/50 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl italic">
                                                        "{selectedProduct.description}"
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeDetailTab === "bikes" && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        {selectedProduct.is_universal ? (
                                            <div className="flex flex-col items-center text-center py-6 gap-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white/80">Universal Part</p>
                                                    <p className="text-[10px] text-white/30 mt-1 max-w-[160px]">This component is designed to fit all vehicle models.</p>
                                                </div>
                                            </div>
                                        ) : selectedProduct.compatibility.length > 0 ? (
                                            <div className="space-y-4">
                                                {/* Group by Company */}
                                                {Object.entries(
                                                    selectedProduct.compatibility.reduce((acc: any, curr) => {
                                                        if (!acc[curr.brand]) acc[curr.brand] = []
                                                        acc[curr.brand].push(curr.model)
                                                        return acc
                                                    }, {})
                                                ).map(([brand, models]: [string, any]) => (
                                                    <div key={brand} className="space-y-2">
                                                        <h4 className="text-[10px] font-bold text-violet-400/60 uppercase tracking-widest pl-1">{brand}</h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {models.map((m: string) => (
                                                                <span key={m} className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/60">
                                                                    {m}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-[11px] text-white/20 italic">No compatibility mapping found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeDetailTab === "prices" && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-white/30">Cost Price</span>
                                                <span className="text-sm font-bold text-white/60 tabular-nums">₹{selectedProduct.cost_price.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-y border-white/[0.04]">
                                                <span className="text-xs text-white/30">Selling Price</span>
                                                <span className="text-xl font-bold text-emerald-400 tabular-nums">₹{selectedProduct.selling_price.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-white/30">Profit Margin</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-emerald-400/60 block">₹{(selectedProduct.selling_price - selectedProduct.cost_price).toLocaleString("en-IN")}</span>
                                                    <span className="text-[10px] font-bold text-white/20">{markup(selectedProduct)} markup</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions (Slimmer) */}
                            <div className="p-4 border-t border-white/[0.06] bg-white/[0.02] flex gap-2">
                                <button
                                    onClick={() => setSheetOpen(true)}
                                    className="flex-1 h-10 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    Edit Part
                                </button>
                                <button className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                    <History className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 p-10 text-center gap-4">
                            <Package className="w-10 h-10" strokeWidth={1} />
                            <div>
                                <h3 className="text-[13px] font-bold text-white/20 mb-1">No Part Selected</h3>
                                <p className="text-[10px] max-w-[140px] mx-auto opacity-50">Select a part from the list to view specifications.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Product Detail Dialog (all screen sizes) ── */}
            {dialogOpen && selectedProduct && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setDialogOpen(false) }}
                >
                    <div className="w-full max-w-lg bg-zinc-900 border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-white/[0.06] text-[9px] font-bold text-white/40 border border-white/[0.08] uppercase mb-2">
                                    {selectedProduct.category_name}
                                </span>
                                <h2 className="text-base font-bold text-white leading-tight">{selectedProduct.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] font-mono text-white/25">SKU: {selectedProduct.sku || "N/A"}</p>
                                    <span className="text-white/10 text-[8px]">•</span>
                                    <p className="text-[10px] font-mono text-white/50 font-bold">P/N: {selectedProduct.part_number || "N/A"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/[0.06] bg-white/[0.02]">
                            {(["specs", "bikes", "prices"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveDetailTab(tab)}
                                    className={`flex-1 py-3 text-[11px] font-bold capitalize transition-all border-b-2 ${activeDetailTab === tab
                                        ? "text-white border-orange-500"
                                        : "text-white/20 border-transparent hover:text-white/40"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeDetailTab === "specs" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                            <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Stock</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-lg font-bold tabular-nums ${selectedProduct.stock_quantity === 0 ? "text-red-400"
                                                    : selectedProduct.stock_quantity <= selectedProduct.low_stock_threshold ? "text-amber-400"
                                                        : "text-emerald-400"
                                                    }`}>
                                                    {selectedProduct.stock_quantity}
                                                </span>
                                                <span className="text-[10px] text-white/20 font-medium">units</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                            <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Restock At</p>
                                            <span className="text-lg font-bold tabular-nums text-white/50">{selectedProduct.low_stock_threshold}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1">Supplier</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                                            {selectedProduct.supplier_name}
                                        </div>
                                    </div>
                                    {selectedProduct.description && (
                                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                                            <p className="text-[9px] font-bold text-white/20 uppercase mb-2">Description</p>
                                            <p className="text-[11px] text-white/50 leading-relaxed italic">"{selectedProduct.description}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeDetailTab === "bikes" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    {selectedProduct.is_universal ? (
                                        <div className="flex flex-col items-center text-center py-8 gap-3">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/80">Universal Part</p>
                                                <p className="text-[10px] text-white/30 mt-1">Fits all vehicle models.</p>
                                            </div>
                                        </div>
                                    ) : selectedProduct.compatibility.length > 0 ? (
                                        Object.entries(
                                            selectedProduct.compatibility.reduce((acc: any, curr) => {
                                                if (!acc[curr.brand]) acc[curr.brand] = []
                                                acc[curr.brand].push(curr.model)
                                                return acc
                                            }, {})
                                        ).map(([brand, models]: [string, any]) => (
                                            <div key={brand} className="space-y-2">
                                                <h4 className="text-[10px] font-bold text-violet-400/60 uppercase tracking-widest">{brand}</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {models.map((m: string) => (
                                                        <span key={m} className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/60">{m}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[11px] text-white/20 italic text-center py-8">No compatibility mapping found.</p>
                                    )}
                                </div>
                            )}
                            {activeDetailTab === "prices" && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-white/30">Cost Price</span>
                                            <span className="text-sm font-bold text-white/60 tabular-nums">₹{selectedProduct.cost_price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-y border-white/[0.04]">
                                            <span className="text-xs text-white/30">Selling Price</span>
                                            <span className="text-xl font-bold text-emerald-400 tabular-nums">₹{selectedProduct.selling_price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-white/30">Profit Margin</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-emerald-400/60 block">₹{(selectedProduct.selling_price - selectedProduct.cost_price).toLocaleString("en-IN")}</span>
                                                <span className="text-[10px] font-bold text-white/20">{markup(selectedProduct)} markup</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/[0.06] bg-white/[0.02] flex gap-2">
                            <button
                                onClick={() => { setDialogOpen(false); setSheetOpen(true) }}
                                className="flex-1 h-10 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors"
                            >
                                Edit Part
                            </button>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white rounded-xl flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProductSheet
                open={sheetOpen}
                onOpenChange={(val) => {
                    setSheetOpen(val)
                    if (!val) setSelectedId(null)
                }}
                onSaved={fetchData}
                initialData={selectedProduct}
            />

            <StockArrivalSheet
                open={arrivalSheetOpen}
                onOpenChange={setArrivalSheetOpen}
                onSaved={fetchData}
                products={products}
            />

            <RestockSheet
                open={restockSheetOpen}
                onOpenChange={setRestockSheetOpen}
                products={products}
                onOrderGenerated={fetchData}
            />
        </div >
    )
}

export default function InventoryPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <InventoryContent />
        </Suspense>
    )
}
