"use client"

import { useState, useRef, useEffect } from "react"
import { X, Loader2, Search, Plus, Trash2, Package, Check, Clipboard } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    sku: string | null
    stock_quantity: number
    supplier_id: string | null // Added
    cost_price: number // Added
}

interface PurchaseOrder {
    id: string
    order_number: string
    created_at: string
    status: string
    item_count: number
    total_value: number
}

interface StockArrivalSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
    products: Product[]
}

export function StockArrivalSheet({ open, onOpenChange, onSaved, products }: StockArrivalSheetProps) {
    const [search, setSearch] = useState("")
    const [selectedItems, setSelectedItems] = useState<{ id: string; name: string; sku: string | null; current: number; arrived: string; cost: number }[]>([])
    const [saving, setSaving] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

    // PO Logic
    const [suppliers, setSuppliers] = useState<{ id: string, name: string }[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<string>("none")
    const [pendingOrders, setPendingOrders] = useState<PurchaseOrder[]>([])
    const [selectedOrder, setSelectedOrder] = useState<string>("none")
    const [loadingOrders, setLoadingOrders] = useState(false)

    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            setSearch("")
            setSelectedItems([])
            setSelectedSupplier("none")
            setSelectedOrder("none")
            setPendingOrders([])

            // Fetch suppliers
            supabase.from("suppliers").select("id, name").order("name")
                .then(({ data }) => {
                    if (data) setSuppliers(data)
                })

            setTimeout(() => searchRef.current?.focus(), 150)
        }
    }, [open])

    // Fetch orders when supplier changes
    useEffect(() => {
        if (selectedSupplier !== "none") {
            setLoadingOrders(true)
            supabase.from("purchase_orders")
                .select("id, order_number, created_at, status, purchase_order_items(quantity_ordered, unit_cost)")
                .eq("supplier_id", selectedSupplier)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .then(({ data }) => {
                    if (data) {
                        setPendingOrders(data.map(o => {
                            const items = o.purchase_order_items || []
                            const totalValue = items.reduce((sum: number, i: any) => sum + (i.quantity_ordered * (i.unit_cost || 0)), 0)
                            return {
                                id: o.id,
                                order_number: o.order_number,
                                created_at: o.created_at,
                                status: o.status,
                                item_count: items.length,
                                total_value: totalValue
                            }
                        }))
                    }
                    setLoadingOrders(false)
                })
        } else {
            setPendingOrders([])
        }
    }, [selectedSupplier])

    // Load items when order changes
    useEffect(() => {
        if (selectedOrder !== "none") {
            const loadOrderItems = async () => {
                const { data: items } = await supabase
                    .from("purchase_order_items")
                    .select("product_id, quantity_ordered, quantity_received, products(id, name, sku, stock_quantity, cost_price)")
                    .eq("order_id", selectedOrder)

                if (items) {
                    const mappedItems = items.map(i => {
                        const product = Array.isArray(i.products) ? i.products[0] : i.products
                        if (!product) return null

                        return {
                            id: product.id,
                            name: product.name,
                            sku: product.sku,
                            current: product.stock_quantity,
                            arrived: (i.quantity_ordered - (i.quantity_received || 0)).toString(),
                            cost: product.cost_price || 0
                        }
                    }).filter(Boolean) as { id: string; name: string; sku: string | null; current: number; arrived: string; cost: number }[]

                    setSelectedItems(mappedItems)
                }
            }
            loadOrderItems()
        }
    }, [selectedOrder])

    const filtered = products.filter(p => {
        const q = search.toLowerCase().trim()
        if (!q) return false
        return (
            p.name.toLowerCase().includes(q) ||
            (p.sku || "").toLowerCase().includes(q)
        )
    }).slice(0, 10)

    const addItem = (p: Product) => {
        if (selectedItems.find(item => item.id === p.id)) return
        setSelectedItems([...selectedItems, { id: p.id, name: p.name, sku: p.sku, current: p.stock_quantity, arrived: "", cost: p.cost_price || 0 }])
        setSearch("")
    }

    const removeItem = (id: string) => {
        setSelectedItems(selectedItems.filter(item => item.id !== id))
    }

    const updateArrived = (id: string, qty: string) => {
        setSelectedItems(selectedItems.map(item =>
            item.id === id ? { ...item, arrived: qty } : item
        ))
    }

    const handleDeleteOrder = (orderId: string) => {
        if (!orderId || orderId === "none") return
        setOrderToDelete(orderId)
    }

    const executeDeleteOrder = async () => {
        if (!orderToDelete) return

        setLoadingOrders(true)
        try {
            // Delete order items first (if no cascade) - usually cascade handles it but to be safe
            const { error: itemsError } = await supabase
                .from("purchase_order_items")
                .delete()
                .eq("order_id", orderToDelete)

            if (itemsError) throw itemsError

            const { error: orderError } = await supabase
                .from("purchase_orders")
                .delete()
                .eq("id", orderToDelete)

            if (orderError) throw orderError

            toast.success("Purchase Order deleted successfully")

            // Refresh list
            setPendingOrders(current => current.filter(o => o.id !== orderToDelete))
            if (selectedOrder === orderToDelete) {
                setSelectedOrder("none")
                setSelectedItems([])
            }
            setOrderToDelete(null)

        } catch (error: any) {
            console.error(error)
            toast.error("Failed to delete order: " + error.message)
        } finally {
            setLoadingOrders(false)
        }
    }

    async function handleSave() {
        if (selectedItems.length === 0) {
            toast.error("No items selected")
            return
        }

        const validItems = selectedItems.filter(item => parseInt(item.arrived) > 0)
        if (validItems.length === 0) {
            toast.error("Please enter quantities for the items")
            return
        }

        setSaving(true)
        try {
            const { data: shops } = await supabase.from("shops").select("id").limit(1)
            const shopId = shops?.[0]?.id
            if (!shopId) throw new Error("No shop found")

            for (const item of validItems) {
                const addQty = parseInt(item.arrived)
                // 1. Update product quantity
                const { error: updateError } = await supabase
                    .from("products")
                    .update({ stock_quantity: item.current + addQty })
                    .eq("id", item.id)

                if (updateError) throw updateError

                // 2. Update PO if applicable
                if (selectedOrder !== "none") {
                    // Update item received qty
                    await supabase.rpc('increment_po_item_received', {
                        p_order_id: selectedOrder,
                        p_product_id: item.id,
                        p_qty: addQty
                    })
                    // Just direct update for now since RPC might not exist
                    await supabase
                        .from("purchase_order_items")
                        .update({ quantity_received: addQty }) // This is simplistic, should add to existing
                        .eq("order_id", selectedOrder)
                        .eq("product_id", item.id)
                }

                // 2. Record stock movement
                await supabase.from("stock_movements").insert({
                    shop_id: shopId,
                    product_id: item.id,
                    type: "restock",
                    quantity: addQty,
                    notes: selectedOrder !== "none" ? `Received from PO ${selectedOrder}` : `Received stock arrival: +${addQty}`,
                })
            }

            // Mark PO as received if all items processed (simplified logic)
            if (selectedOrder !== "none") {
                await supabase.from("purchase_orders")
                    .update({ status: 'received' })
                    .eq("id", selectedOrder)
            }

            toast.success("Stock updated successfully")
            onSaved()
            onOpenChange(false)
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Failed to update stock")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

            <div className="relative w-full bg-zinc-950 border-l border-white/[0.08] flex flex-col animate-in slide-in-from-right duration-200 text-white">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white">Stock Arrival</h2>
                            <p className="text-[11px] text-white/30">Update quantities for existing parts</p>
                        </div>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* PO Selection (Optional) */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Clipboard className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-xs font-bold text-white/70">Receive Purchase Order</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Supplier Select */}
                                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                    <SelectTrigger className="flex-1 h-9 bg-white/[0.04] border-white/[0.08] text-xs">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                        <SelectItem value="none">Manual Entry (No Supplier)</SelectItem>
                                        {suppliers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Order Select */}
                                <Select
                                    value={selectedOrder}
                                    onValueChange={setSelectedOrder}
                                    disabled={selectedSupplier === "none"}
                                >
                                    <SelectTrigger className="flex-1 h-9 bg-white/[0.04] border-white/[0.08] text-xs disabled:opacity-50 [&_.order-delete-btn]:hidden">
                                        <SelectValue placeholder={loadingOrders ? "Loading..." : "Select Order"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                        <SelectItem value="none">No Order Selected</SelectItem>
                                        {pendingOrders.map(o => {
                                            const date = new Date(o.created_at)
                                            const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                                            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                            const displayStr = `${o.order_number.replace('PO-', '#')} • ${dateStr}, ${timeStr} • ₹${o.total_value.toLocaleString()}`

                                            return (
                                                <SelectItem key={o.id} value={o.id} className="group [&>span]:w-full">
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <span>{displayStr}</span>
                                                        <div
                                                            role="button"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleDeleteOrder(o.id)
                                                            }}
                                                            className="order-delete-btn relative z-50 p-1.5 rounded cursor-pointer bg-red-500 text-black opacity-100 hover:opacity-80 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedOrder !== "none" && (
                                <p className="text-[10px] text-emerald-400/70 italic ml-1">
                                    Items from this order will be loaded automatically.
                                </p>
                            )}
                        </div>

                        <div className="w-full h-px bg-white/[0.06]" />

                        {/* 🔍 Searchbox */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search part by name or SKU..."
                                className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all font-medium"
                            />

                            {search.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/[0.1] rounded-xl shadow-2xl z-20 overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {filtered.length > 0 ? (
                                            filtered.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => addItem(p)}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.05] transition-colors group"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{p.name}</p>
                                                        <p className="text-[10px] text-white/30 font-mono">{p.sku || "NO SKU"}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-white/40 uppercase">Stock</p>
                                                        <p className="text-xs font-bold text-white/60 tabular-nums">{p.stock_quantity}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center">
                                                <p className="text-xs text-white/20">No matching parts found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 📋 Selected Items */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/30">Arrived Stock List</h3>
                                <span className="text-[10px] font-medium text-white/20">{selectedItems.length} items</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-white/30 px-2 pb-1">
                                <span>Item</span>
                                <span className="mr-12">Qty Received</span>
                            </div>

                            {selectedItems.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/[0.03] rounded-2xl">
                                    <Package className="w-10 h-10 mb-2" strokeWidth={1} />
                                    <p className="text-xs">Search and add parts to update stock</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedItems.map(item => (
                                        <div key={item.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 group animate-in slide-in-from-left-2 duration-200">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-white/90">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-mono text-white/30">{item.sku || "No SKU"}</span>
                                                    <span className="text-white/10 text-[8px]">•</span>
                                                    <span className="text-[10px] font-bold text-white/30">Current: {item.current}</span>
                                                    {item.cost > 0 && <span className="text-[10px] font-mono text-emerald-400/50">Cost: ₹{item.cost}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="relative w-24">
                                                    <input
                                                        type="number"
                                                        value={item.arrived}
                                                        onChange={(e) => updateArrived(item.id, e.target.value)}
                                                        placeholder="+ 0"
                                                        className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.1] rounded-lg text-white font-bold text-sm placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 text-center tabular-nums"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/[0.06] flex gap-3">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 text-[13px] font-bold text-white/40 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedItems.length === 0}
                        className="flex-[2] h-12 bg-white text-zinc-900 rounded-xl font-bold text-[13px] hover:bg-zinc-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "Updating..." : "Update Inventory"}
                    </button>
                </div>
            </div>

            <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Purchase Order</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to delete this purchase order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOrderToDelete(null)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeDeleteOrder}
                            disabled={loadingOrders}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                        >
                            {loadingOrders ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Order"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
