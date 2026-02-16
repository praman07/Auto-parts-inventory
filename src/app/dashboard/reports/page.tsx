"use client"

import { useState, useEffect, useMemo } from "react"
import {
    BarChart3,
    DollarSign,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Loader2,
    Calendar,
    Truck,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

type ReportData = {
    // Sales
    totalSales: number
    salesCount: number
    avgOrderValue: number
    topProducts: { name: string; qty: number; revenue: number }[]
    recentSales: { id: string; total: number; date: string; items: number }[]
    // Inventory
    totalProducts: number
    totalStockValue: number
    lowStockItems: { id: string; name: string; qty: number; threshold: number }[]
    outOfStockCount: number
    categoryBreakdown: { name: string; count: number; value: number }[]
    // Purchase Orders
    pendingPOs: number
    receivedPOs: number
    totalPOSpend: number
}

const DATE_FILTERS = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
] as const

type DateFilter = (typeof DATE_FILTERS)[number]["key"]

function getDateThreshold(filter: DateFilter): Date | null {
    const now = new Date()
    if (filter === "today") {
        now.setHours(0, 0, 0, 0)
        return now
    }
    if (filter === "week") {
        now.setDate(now.getDate() - 7)
        return now
    }
    if (filter === "month") {
        now.setMonth(now.getMonth() - 1)
        return now
    }
    return null
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState<DateFilter>("month")

    async function fetchReportData(filter: DateFilter) {
        setLoading(true)
        try {
            const threshold = getDateThreshold(filter)
            const thresholdISO = threshold?.toISOString()

            // --- Sales ---
            let salesQuery = supabase
                .from("sales")
                .select("id, total_amount, created_at")
                .order("created_at", { ascending: false })

            if (thresholdISO) salesQuery = salesQuery.gte("created_at", thresholdISO)

            const { data: salesData } = await salesQuery

            const totalSales = (salesData || []).reduce((a, s) => a + Number(s.total_amount), 0)
            const salesCount = (salesData || []).length
            const avgOrderValue = salesCount > 0 ? totalSales / salesCount : 0

            // Top products (from sale_items)
            let saleItemsQuery = supabase
                .from("sale_items")
                .select("quantity, subtotal, products(name)")

            if (thresholdISO) saleItemsQuery = saleItemsQuery.gte("created_at", thresholdISO)

            const { data: saleItems } = await saleItemsQuery

            const productMap = new Map<string, { qty: number; revenue: number }>()
                ; (saleItems || []).forEach((si: any) => {
                    const name = si.products?.name || "Unknown"
                    const existing = productMap.get(name) || { qty: 0, revenue: 0 }
                    existing.qty += si.quantity
                    existing.revenue += Number(si.subtotal || 0)
                    productMap.set(name, existing)
                })

            const topProducts = Array.from(productMap.entries())
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 8)

            const recentSales = (salesData || []).slice(0, 5).map((s: any) => ({
                id: s.id,
                total: Number(s.total_amount),
                date: s.created_at,
                items: 0,
            }))

            // --- Inventory ---
            const { data: products } = await supabase
                .from("products")
                .select("id, name, stock_quantity, low_stock_threshold, cost_price, selling_price, categories(name)")

            const totalProducts = (products || []).length
            const totalStockValue = (products || []).reduce(
                (a, p) => a + Number(p.stock_quantity) * Number(p.selling_price),
                0
            )
            const outOfStockCount = (products || []).filter((p) => Number(p.stock_quantity) <= 0).length

            const lowStockItems = (products || [])
                .filter((p: any) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= Number(p.low_stock_threshold || 5))
                .map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    qty: Number(p.stock_quantity),
                    threshold: Number(p.low_stock_threshold || 5),
                }))
                .sort((a, b) => a.qty - b.qty)
                .slice(0, 8)

            // Category breakdown
            const catMap = new Map<string, { count: number; value: number }>()
                ; (products || []).forEach((p: any) => {
                    const cat = p.categories?.name || "Uncategorized"
                    const existing = catMap.get(cat) || { count: 0, value: 0 }
                    existing.count += 1
                    existing.value += Number(p.stock_quantity) * Number(p.selling_price)
                    catMap.set(cat, existing)
                })
            const categoryBreakdown = Array.from(catMap.entries())
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.value - a.value)

            // --- Purchase Orders ---
            const { data: pos } = await supabase
                .from("purchase_orders")
                .select("id, status, purchase_order_items(quantity_ordered, unit_cost)")

            const pendingPOs = (pos || []).filter((po: any) => po.status === "pending").length
            const receivedPOs = (pos || []).filter((po: any) => po.status === "received").length
            const totalPOSpend = (pos || []).reduce((acc, po: any) => {
                const poTotal = (po.purchase_order_items || []).reduce(
                    (sum: number, item: any) => sum + item.quantity_ordered * Number(item.unit_cost || 0),
                    0
                )
                return acc + poTotal
            }, 0)

            setData({
                totalSales,
                salesCount,
                avgOrderValue,
                topProducts,
                recentSales,
                totalProducts,
                totalStockValue,
                lowStockItems,
                outOfStockCount,
                categoryBreakdown,
                pendingPOs,
                receivedPOs,
                totalPOSpend,
            })
        } catch (err) {
            console.error("Failed to fetch report data:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReportData(dateFilter)
    }, [dateFilter])

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Reports</h1>
                    <p className="text-[13px] text-white/40">
                        Business analytics and performance overview
                    </p>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    {DATE_FILTERS.map((df) => (
                        <button
                            key={df.key}
                            onClick={() => setDateFilter(df.key)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${dateFilter === df.key
                                ? "bg-white/[0.1] text-white/80"
                                : "text-white/30 hover:text-white/50"
                                }`}
                        >
                            {df.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════ Top KPI Cards ═══════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Revenue */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border border-emerald-500/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">₹{data.totalSales.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-white/30 mt-1">{data.salesCount} sales</p>
                </div>

                {/* Avg Order */}
                <div className="bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border border-blue-500/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Avg Order</span>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">₹{Math.round(data.avgOrderValue).toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-white/30 mt-1">per sale</p>
                </div>

                {/* Stock Value */}
                <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-transparent border border-violet-500/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                            <Package className="w-4 h-4 text-violet-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Stock Value</span>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">₹{data.totalStockValue.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-white/30 mt-1">{data.totalProducts} products</p>
                </div>

                {/* Alerts */}
                <div className="bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-amber-500/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Alerts</span>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">{data.lowStockItems.length + data.outOfStockCount}</p>
                    <p className="text-[11px] text-white/30 mt-1">{data.outOfStockCount} out of stock</p>
                </div>
            </div>

            {/* ═══════ Main Content Grid ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Selling Products — Takes 2 cols */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-[13px] font-bold text-white/80">Top Selling Products</h2>
                    </div>
                    {data.topProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/20">
                            <BarChart3 className="w-8 h-8 mb-2" />
                            <p className="text-[12px]">No sales data yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {data.topProducts.map((p, i) => (
                                <div key={p.name} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                    <span className="text-[11px] font-black text-white/20 w-5 text-right tabular-nums">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-white/80 truncate">{p.name}</p>
                                        <p className="text-[10px] text-white/30">{p.qty} units sold</p>
                                    </div>
                                    <span className="text-[13px] font-bold text-emerald-400 tabular-nums">₹{p.revenue.toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Purchase Orders Summary */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-400" />
                        <h2 className="text-[13px] font-bold text-white/80">Purchase Orders</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <span className="text-[12px] text-white/60">Pending</span>
                            </div>
                            <span className="text-[14px] font-bold text-amber-400 tabular-nums">{data.pendingPOs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-[12px] text-white/60">Received</span>
                            </div>
                            <span className="text-[14px] font-bold text-emerald-400 tabular-nums">{data.receivedPOs}</span>
                        </div>
                        <div className="h-px bg-white/[0.06]" />
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-white/40">Total Spend</span>
                            <span className="text-[14px] font-bold text-white/80 tabular-nums">₹{data.totalPOSpend.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="px-5 pt-2 pb-4 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-3.5 h-3.5 text-violet-400" />
                            <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-wider">By Category</h3>
                        </div>
                        <div className="space-y-2">
                            {data.categoryBreakdown.slice(0, 5).map((cat) => {
                                const maxVal = data.categoryBreakdown[0]?.value || 1
                                const pct = Math.round((cat.value / maxVal) * 100)
                                return (
                                    <div key={cat.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] text-white/60 truncate max-w-[120px]">{cat.name}</span>
                                            <span className="text-[10px] text-white/30 tabular-nums">{cat.count} items</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ Low Stock Alerts ═══════ */}
            {data.lowStockItems.length > 0 && (
                <div className="bg-white/[0.02] border border-amber-500/10 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h2 className="text-[13px] font-bold text-white/80">Low Stock Alert</h2>
                        <span className="ml-auto text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {data.lowStockItems.length} items
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
                        {data.lowStockItems.map((item) => (
                            <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Package className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-white/80 truncate">{item.name}</p>
                                    <p className="text-[10px] text-amber-400/80 font-bold">
                                        {item.qty} left / {item.threshold} threshold
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════ Recent Sales ═══════ */}
            {data.recentSales.length > 0 && (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                        <h2 className="text-[13px] font-bold text-white/80">Recent Sales</h2>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {data.recentSales.map((sale) => {
                            const date = new Date(sale.date)
                            return (
                                <div key={sale.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-mono text-white/50">#{sale.id.slice(0, 8)}</p>
                                        <p className="text-[10px] text-white/30 tabular-nums">
                                            {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    <span className="text-[14px] font-bold text-emerald-400 tabular-nums">₹{sale.total.toLocaleString("en-IN")}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
