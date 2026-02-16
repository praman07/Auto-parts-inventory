"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Download, AlertTriangle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
// import * as XLSX from "xlsx" // Removed due to install issues

interface RestockSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    products: any[] // We'll filter this list
    onOrderGenerated?: () => void
}

interface ProductOrder {
    id: string
    name: string
    part_number: string | null
    sku: string | null
    current_stock: number
    threshold: number
    cost_price: number
    supplier_id: string | null
    supplier_name: string
    to_order: number
    selected: boolean
}

export function RestockSheet({ open, onOpenChange, products, onOrderGenerated }: RestockSheetProps) {
    const [showFormatDialog, setShowFormatDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [orderItems, setOrderItems] = useState<ProductOrder[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all")
    const [suppliers, setSuppliers] = useState<{ id: string, name: string }[]>([])

    // Initialize list when opened
    useEffect(() => {
        if (open && products.length > 0) {
            const lowStockItems = products
                .filter(p => p.stock_quantity <= p.low_stock_threshold)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    part_number: p.part_number,
                    sku: p.sku,
                    current_stock: p.stock_quantity,
                    threshold: p.low_stock_threshold,
                    cost_price: p.cost_price,
                    supplier_id: p.supplier_id,
                    supplier_name: p.supplier_name || "Unknown Supplier",
                    // Default logic: Order enough to reach 2x threshold (or at least 10 if threshold is 0)
                    to_order: Math.max(0, (p.low_stock_threshold * 2) - p.stock_quantity) || 10,
                    selected: true
                }))

            setOrderItems(lowStockItems)

            // Extract unique suppliers from these items
            const uniqueSuppliers = Array.from(new Set(lowStockItems.map(p => JSON.stringify({ id: p.supplier_id, name: p.supplier_name }))))
                .map(s => JSON.parse(s))
                .filter(s => s.id) // Only valid suppliers
                .sort((a, b) => a.name.localeCompare(b.name))

            setSuppliers(uniqueSuppliers)
        }
    }, [open, products])

    const filteredItems = selectedSupplier === "all"
        ? orderItems
        : orderItems.filter(item => item.supplier_id === selectedSupplier)

    const selectedCount = filteredItems.filter(i => i.selected).length
    const totalOrderValue = filteredItems
        .filter(i => i.selected)
        .reduce((sum, item) => sum + (item.to_order * item.cost_price), 0)

    const handleGenerateOrderClick = () => {
        if (selectedCount === 0) return
        setShowFormatDialog(true)
    }

    const processOrderGeneration = async (format: 'pdf' | 'excel') => {
        setShowFormatDialog(false)
        setLoading(true)
        try {
            const itemsToOrder = filteredItems.filter(i => i.selected && i.to_order > 0)

            // Group by supplier
            const ordersBySupplier: Record<string, typeof itemsToOrder> = {}
            const itemsWithoutSupplier: typeof itemsToOrder = []

            itemsToOrder.forEach(item => {
                if (item.supplier_id) {
                    if (!ordersBySupplier[item.supplier_id]) ordersBySupplier[item.supplier_id] = []
                    ordersBySupplier[item.supplier_id].push(item)
                } else {
                    itemsWithoutSupplier.push(item)
                }
            })

            if (itemsWithoutSupplier.length > 0) {
                toast.error(`Skipping ${itemsWithoutSupplier.length} items without a valid supplier.`)
            }

            const supplierIds = Object.keys(ordersBySupplier)
            if (supplierIds.length === 0) {
                toast.error("No valid items to order.")
                setLoading(false)
                return
            }

            // Process each supplier order
            for (const supplierId of supplierIds) {
                const supplierItems = ordersBySupplier[supplierId]
                const supplierName = supplierItems[0].supplier_name
                const dateObj = new Date()
                const dateStr = dateObj.toISOString().split('T')[0]
                const timeStr = dateObj.toLocaleTimeString()
                const fullDateTime = `${dateObj.toLocaleDateString()} ${timeStr}`
                const orderNumber = `PO-${dateStr}-${Math.floor(Math.random() * 1000)}`

                // 1. Create DB Record
                const { data: po, error: poError } = await supabase
                    .from("purchase_orders")
                    .insert({
                        supplier_id: supplierId,
                        order_number: orderNumber,
                        status: "pending",
                        notes: `Generated via Restock Sheet from ${supplierItems.length} low stock items.`
                    })
                    .select()
                    .single()

                if (poError) throw poError

                // 2. Create PO Items
                const poItemsData = supplierItems.map(item => ({
                    order_id: po.id,
                    product_id: item.id,
                    quantity_ordered: item.to_order,
                    unit_cost: item.cost_price
                }))

                const { error: itemsError } = await supabase
                    .from("purchase_order_items")
                    .insert(poItemsData)

                if (itemsError) throw itemsError

                // 3. Generate File
                if (format === 'pdf') {
                    const doc = new jsPDF()

                    // Header
                    doc.setFontSize(18)
                    doc.text("PURCHASE ORDER", 14, 20)

                    doc.setFontSize(10)
                    doc.text(`Order #: ${orderNumber}`, 14, 30)
                    doc.text(`Date: ${fullDateTime}`, 14, 35)
                    doc.text(`Supplier: ${supplierName}`, 14, 40)

                    // Table
                    const tableColumn = ["Product Name", "Quantity"]
                    const tableRows = supplierItems.map(item => [
                        item.name,
                        item.to_order
                    ])

                    autoTable(doc, {
                        head: [tableColumn],
                        body: tableRows,
                        startY: 50,
                        theme: 'grid',
                        styles: { fontSize: 10, cellPadding: 2 },
                        headStyles: { fillColor: [22, 163, 74] }, // Emerald header
                    })

                    doc.save(`${supplierName}_${orderNumber}.pdf`)
                } else {
                    // Excel/CSV
                    const headers = ["Part Number", "SKU", "Part Name", "Qty Ordered", "Unit Cost", "Total Cost"]
                    const rows = supplierItems.map(item => [
                        item.part_number || "N/A",
                        item.sku || "N/A",
                        `"${item.name.replace(/"/g, '""')}"`, // Escape quotes
                        item.to_order,
                        item.cost_price,
                        item.to_order * item.cost_price
                    ])

                    const csvContent = [
                        [`PURCHASE ORDER: ${orderNumber}`],
                        [`Date: ${fullDateTime}`],
                        [`Supplier: ${supplierName}`],
                        [],
                        headers,
                        ...rows,
                        [],
                        ["", "", "", "", "GRAND TOTAL", supplierItems.reduce((sum, i) => sum + (i.to_order * i.cost_price), 0)]
                    ].map(e => e.join(",")).join("\n")

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                    const link = document.createElement("a")
                    const url = URL.createObjectURL(blob)
                    link.setAttribute("href", url)
                    link.setAttribute("download", `${supplierName}_${orderNumber}.csv`)
                    link.style.visibility = 'hidden'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }
            }

            toast.success(`Generated ${supplierIds.length} Purchase Order(s) successfully!`)
            onOpenChange(false)
            if (onOrderGenerated) onOrderGenerated()

        } catch (error: any) {
            console.error("Failed to generate order:", error)
            toast.error("Failed to generate order: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelectAll = (checked: boolean) => {
        setOrderItems(current =>
            current.map(item => {
                if (selectedSupplier === "all" || item.supplier_id === selectedSupplier) {
                    return { ...item, selected: checked }
                }
                return item
            })
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full max-w-full sm:max-w-full flex flex-col h-full bg-zinc-950 border-white/[0.08] text-white p-0 gap-0">

                {/* Header */}
                <div className="p-6 border-b border-white/[0.08] bg-zinc-900/50">
                    <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Restock Low Inventory
                    </SheetTitle>
                    <SheetDescription className="text-white/40 mt-1">
                        Select items to generate a formal Purchase Order (.xlsx).
                        Items below your Low Stock Threshold are automatically listed here.
                    </SheetDescription>
                </div>

                {/* Filters */}
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] bg-zinc-900/30">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-medium text-white/50 whitespace-nowrap">Filter by Supplier:</span>
                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                            <SelectTrigger className="flex-1 sm:w-48 h-8 text-xs bg-white/[0.04] border-white/[0.08]">
                                <SelectValue placeholder="All Suppliers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Suppliers ({suppliers.length})</SelectItem>
                                {suppliers.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono w-full sm:w-auto">
                        <span className="text-white/40">Selected: <b className="text-white">{selectedCount}</b></span>
                        <span className="text-white/40">Est. Value: <b className="text-emerald-400">₹{totalOrderValue.toLocaleString()}</b></span>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-zinc-900/50 sticky top-0 z-10">
                            <TableRow className="border-white/[0.08] hover:bg-transparent">
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={selectedCount > 0 && selectedCount === filteredItems.length}
                                        onCheckedChange={toggleSelectAll}
                                        className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                </TableHead>
                                <TableHead className="text-white/40">Part Details</TableHead>
                                <TableHead className="text-white/40 text-right">Stock / Limit</TableHead>
                                <TableHead className="text-white/40 text-right w-32">Suggest</TableHead>
                                <TableHead className="text-white/40 text-right w-32">Order Qty</TableHead>
                                <TableHead className="text-white/40 text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-white/30 text-xs">
                                        No low stock items found for this supplier.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                                        <TableCell>
                                            <Checkbox
                                                checked={item.selected}
                                                onCheckedChange={(checked) => {
                                                    setOrderItems(current => current.map(i => i.id === item.id ? { ...i, selected: !!checked } : i))
                                                }}
                                                className="border-white/20 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white/90">{item.name}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-white/40">
                                                    <span>{item.supplier_name}</span>
                                                    {item.part_number && <span>• P/N: {item.part_number}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <span className="text-red-400 font-bold">{item.current_stock}</span> / <span className="text-white/30">{item.threshold}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-white/50">
                                            {Math.max(0, (item.threshold * 2) - item.current_stock) || 10}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Input
                                                type="number"
                                                className="h-7 w-20 text-right bg-white/[0.04] border-white/[0.08] text-xs"
                                                value={item.to_order}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0
                                                    setOrderItems(current => current.map(i => i.id === item.id ? { ...i, to_order: val } : i))
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-mono text-white/60">
                                            ₹{(item.to_order * item.cost_price).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/[0.08] flex justify-end gap-3 bg-zinc-900/80">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-transparent hover:bg-white/5 text-white hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerateOrderClick}
                        disabled={loading || selectedCount === 0}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Generate Order ({selectedCount})
                    </Button>
                </div>

            </SheetContent>

            <Dialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Select Order Format</DialogTitle>
                        <DialogDescription className="text-white/40">
                            Choose the format for the purchase order file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                        <Button
                            onClick={() => processOrderGeneration('pdf')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-16 flex items-center justify-between px-6 group"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-bold text-lg">PDF Format</span>
                                <span className="text-xs text-white/60 font-normal">Recommended for Suppliers</span>
                            </div>
                            <Download className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                        </Button>

                        <Button
                            onClick={() => processOrderGeneration('excel')}
                            variant="secondary"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 h-14 flex items-center justify-between px-6 text-white"
                        >
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="font-medium">Excel / CSV</span>
                                <span className="text-[10px] text-zinc-400">Detailed data for records</span>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono">.csv</span>
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowFormatDialog(false)}
                            className="text-white/40 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    )
}
