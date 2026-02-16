"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Plus,
    Search,
    MoreHorizontal,
    Phone,
    MapPin,
    ExternalLink,
    Mail,
    Trash2,
    Edit,
    Eye,
    Loader2,
    Package
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { SupplierSheet } from "./supplier-sheet"

interface Supplier {
    id: string
    name: string
    phone: string | null
    email: string | null
    city: string | null
    address: string | null
    gst_number: string | null
    notes: string | null
    product_count?: number
    last_purchase_date?: string | null
    outstanding_balance?: number
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

    const fetchSuppliers = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch suppliers
            const { data: supps, error } = await supabase
                .from("suppliers")
                .select("*, products(count)")
                .order("name")

            if (error) throw error

            // Map product count correctly from the join
            const mapped: Supplier[] = (supps || []).map(s => ({
                ...s,
                product_count: s.products?.[0]?.count || 0
            }))

            setSuppliers(mapped.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })))
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to load suppliers")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSuppliers()
    }, [fetchSuppliers])

    const filteredSuppliers = suppliers.filter(s => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return true
        return (
            s.name.toLowerCase().includes(q) ||
            (s.phone || "").includes(q) ||
            (s.city || "").toLowerCase().includes(q)
        )
    })

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return

        try {
            const { error } = await supabase.from("suppliers").delete().eq("id", id)
            if (error) throw error
            toast.success("Supplier deleted")
            fetchSuppliers()
        } catch (err: any) {
            toast.error("Failed to delete supplier")
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Suppliers</h1>
                    <p className="text-[13px] text-white/40">Manage your vendors and supply chain</p>
                </div>
                <button
                    onClick={() => { setSelectedSupplier(null); setIsSheetOpen(true) }}
                    className="flex items-center justify-center gap-2 h-9 px-4 text-[13px] font-bold bg-white text-zinc-950 rounded-xl hover:bg-zinc-200 transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Add Supplier
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                    type="text"
                    placeholder="Search suppliers by name, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Loading vendors...</p>
                </div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-3xl text-center px-4">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.04] flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-white font-bold mb-1">No suppliers found</h3>
                    <p className="text-[13px] text-white/30 max-w-[200px]">
                        {searchQuery ? "Try adjusting your search query." : "Add your first supplier to get started."}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setIsSheetOpen(true)}
                            className="mt-6 px-4 py-2 text-[13px] font-bold bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition-colors"
                        >
                            Add Your First Supplier
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-zinc-900/30 border border-white/[0.06] rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Supplier Name</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">Contact</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider">City</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider text-center">Products</th>
                                    <th className="px-5 py-3.5 text-[11px] font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredSuppliers.map((s) => (
                                    <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-white">{s.name}</span>
                                                {s.email && <span className="text-[11px] text-white/30">{s.email}</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-[13px] font-medium text-white/70">
                                                <Phone className="w-3.5 h-3.5 text-white/20" />
                                                <a href={`tel:${s.phone}`} className="hover:text-violet-400 transition-colors tabular-nums">
                                                    {s.phone || "—"}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-[13px] text-white/60">{s.city || "—"}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white/[0.06] text-[11px] font-bold text-white/50 border border-white/[0.04]">
                                                {s.product_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedSupplier(s); setIsSheetOpen(true) }}
                                                    className="p-1.5 text-white/30 hover:text-white/80 hover:bg-white/[0.06] rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    className="p-1.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {filteredSuppliers.map((s) => (
                            <div key={s.id} className="bg-zinc-900/50 border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-white leading-tight">{s.name}</h3>
                                        <span className="text-[11px] text-white/40">{s.city || "No city set"}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setSelectedSupplier(s); setIsSheetOpen(true) }}
                                            className="p-2 text-white/40 bg-white/[0.04] rounded-xl"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id, s.name)}
                                            className="p-2 text-red-400 bg-red-400/10 rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[12px] text-white/60">
                                            <Phone className="w-3.5 h-3.5 text-white/20" />
                                            <a href={`tel:${s.phone}`} className="tabular-nums font-medium">{s.phone}</a>
                                        </div>
                                        <span className="text-[11px] font-bold text-white/30">
                                            {s.product_count} Products
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <SupplierSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onSaved={fetchSuppliers}
                supplier={selectedSupplier}
            />
        </div>
    )
}
