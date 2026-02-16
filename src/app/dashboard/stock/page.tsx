"use client"

import { useState, useEffect, useMemo } from "react"
import {
    ArrowDownRight,
    ArrowUpRight,
    Box,
    Calendar,
    Filter,
    Loader2,
    Package,
    Search,
    TrendingDown,
    TrendingUp,
    X,
    RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

type StockMovement = {
    id: string
    product_name: string
    product_sku: string | null
    type: string
    quantity: number
    notes: string | null
    created_at: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sale: { label: "Sale", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    restock: { label: "Restock", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    purchase: { label: "Purchase", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    adjustment: { label: "Adjustment", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    return: { label: "Return", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    initial: { label: "Initial", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
}

const DATE_FILTERS = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
] as const

type DateFilter = (typeof DATE_FILTERS)[number]["key"]

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<DateFilter>("all")

    async function fetchMovements() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("stock_movements")
                .select(`
                    id, type, quantity, notes, created_at,
                    products(name, sku)
                `)
                .order("created_at", { ascending: false })
                .limit(500)

            if (error) throw error

            const mapped: StockMovement[] = (data || []).map((m: any) => ({
                id: m.id,
                product_name: m.products?.name || "Unknown Product",
                product_sku: m.products?.sku || null,
                type: m.type,
                quantity: m.quantity,
                notes: m.notes,
                created_at: m.created_at,
            }))

            setMovements(mapped)
        } catch (err) {
            console.error("Failed to fetch stock movements:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMovements()
    }, [])

    const filtered = useMemo(() => {
        return movements.filter((m) => {
            // Type filter
            if (typeFilter !== "all" && m.type !== typeFilter) return false

            // Date filter
            if (dateFilter !== "all") {
                const now = new Date()
                const movDate = new Date(m.created_at)
                if (dateFilter === "today") {
                    if (movDate.toDateString() !== now.toDateString()) return false
                } else if (dateFilter === "week") {
                    const weekAgo = new Date(now)
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    if (movDate < weekAgo) return false
                } else if (dateFilter === "month") {
                    const monthAgo = new Date(now)
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    if (movDate < monthAgo) return false
                }
            }

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                return (
                    m.product_name.toLowerCase().includes(q) ||
                    (m.product_sku || "").toLowerCase().includes(q) ||
                    (m.notes || "").toLowerCase().includes(q)
                )
            }

            return true
        })
    }, [movements, typeFilter, dateFilter, searchQuery])

    // Summary stats
    const stats = useMemo(() => {
        let totalIn = 0
        let totalOut = 0
        filtered.forEach((m) => {
            if (m.quantity > 0) totalIn += m.quantity
            else totalOut += Math.abs(m.quantity)
        })
        return { totalIn, totalOut, net: totalIn - totalOut, count: filtered.length }
    }, [filtered])

    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(movements.map((m) => m.type)))
    }, [movements])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Stock Movements</h1>
                    <p className="text-[13px] text-white/40">
                        Track every inventory change — restocks, sales, returns, and adjustments
                    </p>
                </div>
                <button
                    onClick={fetchMovements}
                    className="flex items-center justify-center gap-2 h-9 px-4 text-[13px] font-bold bg-white/[0.06] text-white/70 rounded-xl hover:bg-white/[0.1] transition-colors shrink-0"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Stock In</span>
                    </div>
                    <p className="text-lg font-black text-emerald-400 tabular-nums">+{stats.totalIn.toLocaleString()}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Stock Out</span>
                    </div>
                    <p className="text-lg font-black text-red-400 tabular-nums">-{stats.totalOut.toLocaleString()}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Box className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Net Change</span>
                    </div>
                    <p className={`text-lg font-black tabular-nums ${stats.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stats.net >= 0 ? "+" : ""}{stats.net.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Movements</span>
                    </div>
                    <p className="text-lg font-black text-white/80 tabular-nums">{stats.count.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search by product name, SKU, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-1">
                    <Filter className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <button
                        onClick={() => setTypeFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${typeFilter === "all" ? "bg-white/[0.1] text-white/80" : "text-white/30 hover:text-white/50"}`}
                    >
                        All
                    </button>
                    {uniqueTypes.map((type) => {
                        const config = TYPE_CONFIG[type] || { label: type, color: "text-white/50", bg: "bg-white/5", border: "border-white/10" }
                        return (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${typeFilter === type ? `${config.bg} ${config.color}` : "text-white/30 hover:text-white/50"}`}
                            >
                                {config.label}
                            </button>
                        )
                    })}
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-1">
                    <Calendar className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    {DATE_FILTERS.map((df) => (
                        <button
                            key={df.key}
                            onClick={() => setDateFilter(df.key)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${dateFilter === df.key ? "bg-white/[0.1] text-white/80" : "text-white/30 hover:text-white/50"}`}
                        >
                            {df.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-3xl text-center">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.04] flex items-center justify-center mb-4">
                        <Box className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-white font-bold mb-1">No movements found</h3>
                    <p className="text-[13px] text-white/30 max-w-[240px]">
                        {searchQuery || typeFilter !== "all" || dateFilter !== "all"
                            ? "Try adjusting your filters."
                            : "Stock movements will appear here as you make sales and restocks."}
                    </p>
                </div>
            ) : (
                <div className="bg-zinc-900/30 border border-white/[0.06] rounded-2xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Product</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider text-right">Quantity</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filtered.map((m) => {
                                    const config = TYPE_CONFIG[m.type] || { label: m.type, color: "text-white/50", bg: "bg-white/5", border: "border-white/10" }
                                    const date = new Date(m.created_at)
                                    const isPositive = m.quantity > 0

                                    return (
                                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] text-white/70 tabular-nums">
                                                        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span className="text-[11px] text-white/30 tabular-nums">
                                                        {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium text-white/80 truncate max-w-[200px]">{m.product_name}</span>
                                                    {m.product_sku && (
                                                        <span className="text-[10px] font-mono text-white/25">{m.product_sku}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.color} ${config.border}`}>
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isPositive ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                                    )}
                                                    <span className={`text-[14px] font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                                        {isPositive ? "+" : ""}{m.quantity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-[12px] text-white/30 truncate max-w-[180px] block">
                                                    {m.notes || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-white/[0.04]">
                        {filtered.map((m) => {
                            const config = TYPE_CONFIG[m.type] || { label: m.type, color: "text-white/50", bg: "bg-white/5", border: "border-white/10" }
                            const date = new Date(m.created_at)
                            const isPositive = m.quantity > 0

                            return (
                                <div key={m.id} className="p-4 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                        {isPositive ? (
                                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-white/80 truncate">{m.product_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] text-white/25 tabular-nums">
                                                {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-[14px] font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                        {isPositive ? "+" : ""}{m.quantity}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
