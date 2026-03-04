"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
    DollarSign,
    TrendingUp,
    Package,
    AlertTriangle,
    Zap,
    Plus,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Loader2,
    BarChart3,
    Layers,
    Truck,
} from "lucide-react"
import { motion } from "framer-motion"

// ─── Types ──────────────────────────────────────────────────────────────────────
interface DashboardData {
    todaySales: number
    yesterdaySales: number
    monthRevenue: number
    inventoryValue: number
    totalSKUs: number
    lowStockCount: number
    fastMovers: { name: string; detail: string; value: string }[]
    deadStock: { name: string; detail: string; value: string }[]
    lowStockItems: { name: string; qty: number }[]
    dailySales: number[]
    dailySalesMap: { date: string; count: number }[]
    // New Detailed Data
    hourlySales: { hour: string; total: number }[]
    inventoryByCategory: { name: string; count: number; value: number }[]
    monthlyActivity: { month: string; count: number; revenue: number }[]
    allSales: { id: string; total: number; date: string }[]
}

import { DashboardSection } from "@/components/dashboard/dashboard-section"
import { StreakHeatmap } from "@/components/dashboard/streak-heatmap"
import { DailySalesModal } from "@/components/dashboard/daily-sales-modal"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// ─── Executive Metric Card ─────────────────────────────────────────────────────
function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
    trend,
    gradient,
}: {
    label: string
    value: string
    sub: string
    icon: React.ElementType
    trend?: { value: string; up: boolean }
    gradient: string
}) {
    return (
        <div className={`rounded-xl p-3.5 ${gradient} shadow-md shadow-black/20 transition-transform hover:scale-[1.01]`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                    {label}
                </span>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-1.5">
                    <Icon className="h-3.5 w-3.5 text-white/60" strokeWidth={1.5} />
                </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">
                {value}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
                {trend && (
                    <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trend.up ? "text-emerald-300" : "text-red-300"
                            }`}
                    >
                        {trend.up ? (
                            <ArrowUpRight className="h-3 w-3" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3" />
                        )}
                        {trend.value}
                    </span>
                )}
                <span className="text-[11px] text-white/40">{sub}</span>
            </div>
        </div>
    )
}

// ─── Sales Trend Chart ──────────────────────────────────────────────────────────
function SalesTrendChart({ data, total }: { data: number[]; total: number }) {
    const max = Math.max(...data, 1)

    return (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] px-6 py-6 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                        Revenue Velocity
                    </h3>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.1em] mt-1">
                        Last 30 days performance
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        ₹{total.toLocaleString("en-IN")}
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-24 relative z-10">
                {data.map((v, i) => (
                    <div key={i} className="flex-1 group/bar relative">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: v > 0 ? `${Math.max((v / max) * 100, 8)}%` : "6%" }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 18,
                                delay: i * 0.005
                            }}
                            className={`w-full rounded-t-[4px] transition-all relative ${v > 0
                                ? "bg-gradient-to-t from-violet-500 via-fuchsia-400 to-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                                : "bg-white/5 border-t border-x border-white/10 opacity-40 shadow-none"
                                }`}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-xl border border-white/20 px-2 py-2 rounded-xl text-[10px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            <span className="text-white/40 mr-1.5">Day {i + 1}:</span>
                            ₹{v.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-4 px-1 text-[9px] text-white/20 font-black uppercase tracking-widest">
                <span>Start</span>
                <span>Mid Period</span>
                <span>Current</span>
            </div>
        </div>
    )
}

// ─── Detail Views ──────────────────────────────────────────────────────────────

function RevenueDetails({ data }: { data: DashboardData }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Today's Total</p>
                    <p className="text-2xl font-bold text-white">₹{data.todaySales.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-white">{data.allSales.length}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Avg Sale</p>
                    <p className="text-2xl font-bold text-white">₹{data.allSales.length > 0 ? Math.round(data.todaySales / data.allSales.length).toLocaleString() : 0}</p>
                </div>
            </div>

            <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Intraday Dynamic Volume
                </h4>
                <div className="flex items-end gap-1.5 h-32 bg-white/[0.01] rounded-2xl p-6 border border-white/[0.03] relative overflow-hidden">
                    {/* Inner Shadow Bevel */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {data.hourlySales.map((h, i) => {
                        const max = Math.max(...data.hourlySales.map(hs => hs.total), 1)
                        return (
                            <div key={i} className="flex-1 group relative h-full flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: h.total > 0 ? `${Math.max((h.total / max) * 100, 6)}%` : "0%" }}
                                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                                    className="w-full bg-gradient-to-t from-emerald-500 via-cyan-400 to-white rounded-t-sm transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2 py-0.5 rounded border border-emerald-500/20 shadow-xl whitespace-nowrap z-50">
                                    {h.total > 0 ? `₹${h.total.toLocaleString()}` : ""}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between mt-2 px-1 text-[9px] text-white/20">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                </div>
            </div>

            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="hover:bg-transparent border-white/[0.05]">
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold">Transaction ID</TableHead>
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold">Time</TableHead>
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.allSales.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="text-center text-xs text-white/20 py-8">No sales today yet</TableCell></TableRow>
                        ) : (
                            data.allSales.map((sale) => (
                                <TableRow key={sale.id} className="border-white/[0.03] hover:bg-white/[0.01]">
                                    <TableCell className="text-xs font-mono text-white/50">{sale.id.slice(0, 12)}...</TableCell>
                                    <TableCell className="text-xs text-white/60">
                                        {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-white text-right">₹{sale.total.toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function InventoryDetails({ data }: { data: DashboardData }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-sky-400/50">Category Distribution (By Est. Value)</h4>
                    <div className="space-y-3">
                        {data.inventoryByCategory.map((cat) => {
                            const totalValue = data.inventoryByCategory.reduce((acc, c) => acc + c.value, 0)
                            const percentage = (cat.value / (totalValue || 1)) * 100
                            return (
                                <div key={cat.name} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/70">{cat.name}</span>
                                        <span className="text-white/40">₹{cat.value.toLocaleString()} ({cat.count} items)</span>
                                    </div>
                                    <Progress value={percentage} className="h-1 bg-white/5" indicatorClassName="bg-sky-500" />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="bg-sky-500/5 rounded-2xl p-6 border border-sky-500/10 flex flex-col justify-center items-center text-center">
                    <p className="text-[11px] uppercase tracking-widest text-sky-400/40 mb-2">Total Warehouse Value</p>
                    <p className="text-4xl font-black text-white">₹{data.inventoryValue.toLocaleString()}</p>
                    <p className="text-[11px] text-white/30 mt-2">Calculated across {data.totalSKUs} unique products</p>
                </div>
            </div>

            <div className="pt-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-400/50 mb-4">Urgent Low Stock Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.lowStockItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <span className="text-xs text-white/70 font-medium">{item.name}</span>
                            <span className="text-xs font-bold text-amber-500">{item.qty} units left</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ActivityDetails({ data }: { data: DashboardData }) {
    return (
        <div className="space-y-8">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-violet-400/50">Annual Growth & Sales Volume</h4>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow className="hover:bg-transparent border-white/[0.05]">
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold">Month</TableHead>
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold">Transactions</TableHead>
                            <TableHead className="text-[10px] uppercase text-white/30 font-bold text-right">Volume (₹)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.monthlyActivity.map((month) => (
                            <TableRow key={month.month} className="border-white/[0.03] hover:bg-white/[0.01]">
                                <TableCell className="text-xs font-bold text-white/80">{month.month}</TableCell>
                                <TableCell className="text-xs text-white/50">{month.count} Sales</TableCell>
                                <TableCell className="text-xs font-mono font-bold text-violet-400/80 text-right">₹{month.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function RankingDetails({ data }: { data: DashboardData }) {
    return (
        <div className="space-y-12">
            <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/50 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> High Velocity Inventory
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {data.fastMovers.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-white/20 w-4">{i + 1}</span>
                                <div>
                                    <p className="text-xs font-medium text-white/80">{item.name}</p>
                                    <p className="text-[10px] text-white/30">{item.detail}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400/80">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 px-1 mb-6 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Static Stock (No Sales)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {data.deadStock.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-white/20 w-4">{i + 1}</span>
                                <div>
                                    <p className="text-xs font-medium text-white/60">{item.name}</p>
                                    <p className="text-[10px] text-white/30">Cost Value: {item.value}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Needs Attention</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Ranked List Panel ──────────────────────────────────────────────────────────
function RankedPanel({
    title,
    subtitle,
    items,
    icon: Icon
}: {
    title: string
    subtitle: string
    items: { name: string; detail: string; value: string }[]
    icon?: any
}) {
    return (
        <div className="space-y-0">
            {items.length === 0 ? (
                <p className="text-xs text-white/20 text-center py-4">No data yet</p>
            ) : (
                items.slice(0, 5).map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-semibold text-white/15 w-4 text-right tabular-nums">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-xs font-medium text-white/70">
                                    {item.name}
                                </p>
                                <p className="text-[10px] text-white/30">
                                    {item.detail}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-white/50 tabular-nums">
                            {item.value}
                        </span>
                    </div>
                ))
            )}
        </div>
    )
}

import { fetchWithRetry } from "@/lib/api-client"

// ─── Data Fetching ──────────────────────────────────────────────────────────────
async function fetchDashboardData(): Promise<DashboardData> {
    const res = await fetchWithRetry("/api/dashboard")
    return res.data
}

import { toast } from "sonner"

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    useEffect(() => {
        fetchDashboardData()
            .then(setData)
            .catch((err) => {
                console.error(err)
                if (err.message?.includes("fetch failed") || err.code === "PGRST301") {
                    toast.error("Database Connection Failed. Check if Supabase is active.")
                }
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-white/30 text-sm">Failed to load dashboard data</p>
            </div>
        )
    }

    const salesTrend = data.yesterdaySales > 0
        ? ((data.todaySales - data.yesterdaySales) / data.yesterdaySales * 100).toFixed(1)
        : "0"
    const salesTrendUp = data.todaySales >= data.yesterdaySales

    return (
        <div className="space-y-6 max-w-6xl">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Executive Dashboard
                    </h1>
                    <p className="text-[12px] text-white/30 mt-1">
                        Consolidated overview of shop performance and inventory health.
                    </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Live System Online</span>
                </div>
            </div>

            {/* ── Row 1: Quick Actions ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <button
                    onClick={() => router.push("/dashboard/sale")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-emerald-950 py-3 text-xs font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all active:scale-[0.99]"
                >
                    <Zap className="h-4 w-4" />
                    Launch Quick Sale
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => router.push("/dashboard/inventory")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-[11px] font-bold text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Entry
                    </button>
                    <button
                        onClick={() => router.push("/dashboard/inventory?action=update-stock")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-[11px] font-bold text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-colors"
                    >
                        <Truck className="h-3.5 w-3.5" />
                        Incoming Stock
                    </button>
                </div>
            </div>

            {/* ── Row 2: Performance Vitals ───────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                    label="Revenue Today"
                    value={`₹${data.todaySales.toLocaleString("en-IN")}`}
                    sub="vs yesterday"
                    icon={DollarSign}
                    trend={{ value: `${salesTrendUp ? "+" : ""}${salesTrend}%`, up: salesTrendUp }}
                    gradient="bg-zinc-900/50 border-white/[0.03]"
                />
                <MetricCard
                    label="Period Growth"
                    value={`₹${data.monthRevenue.toLocaleString("en-IN")}`}
                    sub="this month"
                    icon={TrendingUp}
                    gradient="bg-zinc-900/50 border-white/[0.03]"
                />
                <MetricCard
                    label="Inventory Value"
                    value={`₹${data.inventoryValue.toLocaleString("en-IN")}`}
                    sub={`${data.totalSKUs} unique SKUs`}
                    icon={Package}
                    gradient="bg-zinc-900/50 border-white/[0.03]"
                />
                <MetricCard
                    label="Critical Alerts"
                    value={String(data.lowStockCount)}
                    sub="low stock items"
                    icon={AlertTriangle}
                    trend={data.lowStockCount > 0 ? { value: "Action Req", up: false } : undefined}
                    gradient="bg-zinc-900/50 border-white/[0.03]"
                />
            </div>

            {/* ── Main Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Analytics Snapshot */}
                <DashboardSection
                    title="Revenue & Growth Dynamics"
                    subtitle="30-day transaction analysis"
                    icon={BarChart3}
                    className="lg:col-span-3"
                    details={<RevenueDetails data={data} />}
                >
                    <SalesTrendChart data={data.dailySales} total={data.monthRevenue} />
                </DashboardSection>

                {/* Performance Ranking */}
                <DashboardSection
                    title="High-Velocity Items"
                    subtitle="Top movers by volume"
                    icon={TrendingUp}
                    className="lg:col-span-2"
                    details={<RankingDetails data={data} />}
                >
                    <RankedPanel
                        title="Fast Moving Items"
                        subtitle="Highest turnover"
                        items={data.fastMovers}
                        icon={TrendingUp}
                    />
                </DashboardSection>

                {/* Heatmap Section */}
                <DashboardSection
                    title="System Activity"
                    subtitle="Annual transaction consistency"
                    icon={Zap}
                    className="lg:col-span-5"
                    details={<ActivityDetails data={data} />}
                >
                    <StreakHeatmap data={data.dailySalesMap} onDayClick={setSelectedDate} />
                </DashboardSection>

                {/* Dead Stock / Alert Section */}
                <DashboardSection
                    title="Depleted & Static Inventory"
                    subtitle="Items requiring immediate review"
                    icon={AlertTriangle}
                    className="lg:col-span-2"
                    details={<InventoryDetails data={data} />}
                >
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
                            <p className="text-[10px] uppercase font-bold text-amber-500/50 mb-1">Stock Warning</p>
                            <p className="text-xs text-amber-200/70">{data.lowStockCount} items have reached their reorder threshold.</p>
                        </div>
                        <RankedPanel
                            title="Slow Moving"
                            subtitle="Zero sales recorded"
                            items={data.deadStock}
                            icon={Package}
                        />
                    </div>
                </DashboardSection>

                {/* Inventory Snapshot */}
                <DashboardSection
                    title="Category distribution"
                    subtitle="Warehouse value allocation"
                    icon={Layers}
                    className="lg:col-span-3"
                    details={<InventoryDetails data={data} />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {data.inventoryByCategory.slice(0, 4).map((cat) => (
                                <div key={cat.name} className="flex justify-between items-center text-[11px] py-1 border-b border-white/[0.04]">
                                    <span className="text-white/50">{cat.name}</span>
                                    <span className="text-white/80 font-bold">₹{cat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center items-center p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Total Items</p>
                            <p className="text-2xl font-black text-white">{data.totalSKUs}</p>
                            <button
                                onClick={() => router.push("/dashboard/inventory")}
                                className="mt-3 text-[10px] font-bold text-sky-400/80 hover:text-sky-400 transition-colors uppercase tracking-widest"
                            >
                                View Inventory
                            </button>
                        </div>
                    </div>
                </DashboardSection>
            </div>

            <DailySalesModal date={selectedDate} onClose={() => setSelectedDate(null)} />
        </div>
    )
}
