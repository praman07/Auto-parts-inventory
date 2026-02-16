"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader2, ChevronDown, Plus, Check, Sparkles, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ProductSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
}

const UNIT_TYPES = ["Piece", "Box", "Set", "Bottle", "Pair", "Kit"] as const

/* ── tiny inline dropdown ──────────────────────────────── */
function Dropdown({
    label,
    value,
    options,
    onChange,
    onCreate,
    placeholder,
}: {
    label: string
    value: string
    options: { id: string; name: string }[]
    onChange: (id: string) => void
    onCreate?: (name: string) => Promise<string | null>
    placeholder?: string
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        function close(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", close)
        return () => document.removeEventListener("mousedown", close)
    }, [])

    useEffect(() => {
        if (open) {
            setSearch("")
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
    )
    const selected = options.find((o) => o.id === value)
    const showCreate = onCreate && search.trim() && !filtered.some((f) => f.name.toLowerCase() === search.trim().toLowerCase())

    return (
        <div ref={ref} className="relative">
            <label className="block text-[11px] font-semibold text-white/50 mb-1.5">{label}</label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between h-11 px-3.5 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white hover:border-white/15 transition-colors"
            >
                <span className={selected ? "text-white" : "text-white/25"}>
                    {selected?.name || placeholder || "Select..."}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-zinc-900 border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-[13px] bg-white/[0.05] border border-white/[0.06] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                    <div className="max-h-44 overflow-y-auto px-1 pb-1">
                        {filtered.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => { onChange(o.id); setOpen(false) }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors ${o.id === value ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white"}`}
                            >
                                {o.id === value && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                <span className={o.id === value ? "" : "ml-5.5"}>{o.name}</span>
                            </button>
                        ))}
                        {filtered.length === 0 && !showCreate && (
                            <p className="px-3 py-2 text-[12px] text-white/25">No results</p>
                        )}
                        {showCreate && (
                            <button
                                type="button"
                                onClick={async () => {
                                    const newId = await onCreate!(search.trim())
                                    if (newId) { onChange(newId); setOpen(false) }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create &ldquo;{search.trim()}&rdquo;
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function MultiSelectDropdown({
    label,
    values,
    options,
    onChange,
    placeholder,
    onClearAll,
    onSelectAll,
    showActions,
}: {
    label: string
    values: string[]
    options: { id: string; name: string }[]
    onChange: (ids: string[]) => void
    placeholder?: string
    onClearAll?: () => void
    onSelectAll?: () => void
    showActions?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function close(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", close)
        return () => document.removeEventListener("mousedown", close)
    }, [])

    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
    )

    const toggle = (id: string) => {
        if (values.includes(id)) {
            onChange(values.filter((v) => v !== id))
        } else {
            onChange([...values, id])
        }
    }

    return (
        <div ref={ref} className="relative">
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-white/50">{label}</label>
                {showActions && (
                    <div className="flex gap-2">
                        {onSelectAll && (
                            <button
                                type="button"
                                onClick={onSelectAll}
                                className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Select All
                            </button>
                        )}
                        {values.length > 0 && onClearAll && (
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div
                onClick={() => setOpen(!open)}
                className="w-full flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white hover:border-white/15 transition-colors cursor-pointer"
            >
                {values.length === 0 && <span className="text-white/25 text-[14px]">{placeholder || "Select..."}</span>}
                {values.map((id) => (
                    <div
                        key={id}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.08] rounded-lg text-[12px] font-medium text-white border border-white/10"
                    >
                        {options.find((o) => o.id === id)?.name}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggle(id) }}
                            className="p-0.5 hover:bg-white/10 rounded"
                        >
                            <X className="w-3 h-3 text-white/40" />
                        </button>
                    </div>
                ))}
            </div>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-zinc-900 border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="p-2">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-[13px] bg-white/[0.05] border border-white/[0.06] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                    <div className="max-h-44 overflow-y-auto px-1 pb-1">
                        {filtered.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => toggle(o.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors ${values.includes(o.id) ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white"}`}
                            >
                                <span>{o.name}</span>
                                {values.includes(o.id) && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                        ))}
                        {filtered.length === 0 && <p className="px-3 py-2 text-[12px] text-white/25 text-center">No results</p>}
                    </div>
                </div>
            )}
        </div>
    )
}

function BikeSheet({
    open,
    onOpenChange,
    shopId,
    companies,
    onCreated,
    onCreateCompany,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    shopId: string | null
    companies: { id: string; name: string }[]
    onCreated: () => void
    onCreateCompany: (name: string) => Promise<string | null>
}) {
    const [name, setName] = useState("")
    const [companyId, setCompanyId] = useState("")
    const [year, setYear] = useState("")
    const [saving, setSaving] = useState(false)

    async function handleSave() {
        if (!name.trim() || !companyId || !shopId) {
            toast.error("Please fill all required fields")
            return
        }
        setSaving(true)
        try {
            const { error } = await supabase.from("bikes").insert({
                shop_id: shopId,
                company_id: companyId,
                model_name: name.trim(),
                year_optional: year.trim() || null,
            })
            if (error) throw error
            toast.success("Bike added")
            onCreated()
            onOpenChange(false)
            setName("")
            setYear("")
        } catch (err: any) {
            toast.error(err.message || "Failed to add bike")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div className="relative w-full max-w-sm bg-zinc-950 border border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[15px] font-bold text-white">Add New Bike</h3>
                        <p className="text-[11px] text-white/30">Connect a model to a company</p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-1.5 text-white/25 hover:text-white/50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <Dropdown
                        label="Company *"
                        value={companyId}
                        options={companies}
                        onChange={setCompanyId}
                        onCreate={onCreateCompany}
                        placeholder="Select Company"
                    />
                    <div>
                        <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Model Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Classic 350"
                            className="w-full h-11 px-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Year Range (Optional)</label>
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="e.g. 2012 - 2021"
                            className="w-full h-11 px-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-11 text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-11 text-[13px] font-bold bg-white text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Bike
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ── main sheet ─────────────────────────────────────────── */
export function ProductSheet({ open, onOpenChange, onSaved }: ProductSheetProps) {
    const nameRef = useRef<HTMLInputElement>(null)

    // Data
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [subcategories, setSubcategories] = useState<{ id: string; name: string; category_id: string }[]>([])
    const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
    const [bikes, setBikes] = useState<{ id: string; name: string; company_id: string; year_optional?: string }[]>([])
    const [shopId, setShopId] = useState<string | null>(null)

    // Form
    const [name, setName] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [subcategoryId, setSubcategoryId] = useState("")
    const [supplierId, setSupplierId] = useState("")
    const [unitType, setUnitType] = useState("Piece")
    const [sellingPrice, setSellingPrice] = useState("")
    const [costPrice, setCostPrice] = useState("")
    const [stockQuantity, setStockQuantity] = useState("")
    const [lowStockThreshold, setLowStockThreshold] = useState("5")
    const [trackInventory, setTrackInventory] = useState(true)
    const [sku, setSku] = useState("")
    const [autoSku, setAutoSku] = useState(true)
    const [description, setDescription] = useState("")
    const [partNumber, setPartNumber] = useState("")
    const [isUniversal, setIsUniversal] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState("")
    const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([])
    const [showOptional, setShowOptional] = useState(false)

    // State
    const [saving, setSaving] = useState(false)
    const [isBikeSheetOpen, setIsBikeSheetOpen] = useState(false)

    const loadData = useCallback(async () => {
        const [{ data: shops }, { data: cats }, { data: subs }, { data: supps }, { data: comps }, { data: bks }] = await Promise.all([
            supabase.from("shops").select("id").limit(1),
            supabase.from("categories").select("id, name").order("name"),
            supabase.from("subcategories").select("id, name, category_id").order("name"),
            supabase.from("suppliers").select("id, name").order("name"),
            supabase.from("companies").select("id, name").order("name"),
            supabase.from("bikes").select("id, model_name, company_id, year_optional").order("model_name"),
        ])
        if (shops?.[0]) setShopId(shops[0].id)
        if (cats) setCategories(cats)
        if (subs) setSubcategories(subs)
        if (supps) setSuppliers(supps)
        if (comps) setCompanies(comps)
        if (bks) {
            setBikes(bks.map(b => ({ id: b.id, name: `${b.model_name}${b.year_optional ? ` (${b.year_optional})` : ''}`, company_id: b.company_id })))
        }
    }, [])

    useEffect(() => {
        if (open) {
            loadData()
            setTimeout(() => nameRef.current?.focus(), 150)
        }
    }, [open, loadData])

    // Reset subcategory when category changes
    useEffect(() => {
        setSubcategoryId("")
    }, [categoryId])

    const filteredSubs = subcategories.filter((s) => s.category_id === categoryId)
    const filteredBikes = bikes.filter((b) => b.company_id === selectedCompanyId)

    // Profit calc
    const cost = parseFloat(costPrice) || 0
    const sell = parseFloat(sellingPrice) || 0
    const profit = sell - cost
    const margin = sell > 0 ? ((profit / sell) * 100) : 0

    function resetForm() {
        setName("")
        setCategoryId("")
        setSubcategoryId("")
        setSupplierId("")
        setUnitType("Piece")
        setSellingPrice("")
        setCostPrice("")
        setStockQuantity("")
        setLowStockThreshold("5")
        setTrackInventory(true)
        setSku("")
        setAutoSku(true)
        setPartNumber("")
        setDescription("")
        setIsUniversal(false)
        setSelectedCompanyId("")
        setSelectedBikeIds([])
        setShowOptional(false)
    }

    async function createCategory(catName: string): Promise<string | null> {
        if (!shopId) return null

        // Case-insensitive duplicate check
        const existing = categories.find(c => c.name.toLowerCase() === catName.toLowerCase())
        if (existing) {
            toast.error(`Category "${existing.name}" already exists`)
            return existing.id
        }

        const { data, error } = await supabase.from("categories").insert({ shop_id: shopId, name: catName }).select("id").single()
        if (error || !data) { toast.error("Failed to create category"); return null }
        setCategories((prev) => [...prev, { id: data.id, name: catName }].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })))
        toast.success(`Category "${catName}" created`)
        return data.id
    }

    async function createSubcategory(subName: string): Promise<string | null> {
        if (!shopId || !categoryId) return null
        const { data, error } = await supabase.from("subcategories").insert({ shop_id: shopId, category_id: categoryId, name: subName }).select("id").single()
        if (error || !data) { toast.error("Failed to create subcategory"); return null }
        setSubcategories((prev) => [...prev, { id: data.id, name: subName, category_id: categoryId }])
        toast.success(`Subcategory "${subName}" created`)
        return data.id
    }

    async function createSupplier(suppName: string): Promise<string | null> {
        if (!shopId) return null

        // Case-insensitive duplicate check
        const existing = suppliers.find(s => s.name.toLowerCase() === suppName.toLowerCase())
        if (existing) {
            toast.error(`Supplier "${existing.name}" already exists`)
            return existing.id
        }

        const { data, error } = await supabase.from("suppliers").insert({ shop_id: shopId, name: suppName }).select("id").single()
        if (error || !data) { toast.error("Failed to create supplier"); return null }
        setSuppliers((prev) => [...prev, { id: data.id, name: suppName }].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })))
        toast.success(`Supplier "${suppName}" added`)
        return data.id
    }

    async function createCompany(compName: string): Promise<string | null> {
        if (!shopId) return null

        // Case-insensitive duplicate check
        const existing = companies.find(c => c.name.toLowerCase() === compName.toLowerCase())
        if (existing) {
            toast.error(`Company "${existing.name}" already exists`)
            return existing.id
        }

        const { data, error } = await supabase.from("companies").insert({ shop_id: shopId, name: compName }).select("id").single()
        if (error || !data) { toast.error("Failed to create company"); return null }
        setCompanies((prev) => [...prev, { id: data.id, name: compName }].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })))
        return data.id
    }

    function generateSku(): string {
        const catName = categories.find((c) => c.id === categoryId)?.name || "GEN"
        const prefix = catName.substring(0, 3).toUpperCase()
        const num = String(Math.floor(Math.random() * 9000) + 1000)
        return `${prefix}-${num}`
    }

    async function handleSave(addAnother: boolean) {
        if (!name.trim()) { toast.error("Product name is required"); nameRef.current?.focus(); return }
        if (!sellingPrice || parseFloat(sellingPrice) <= 0) { toast.error("Selling price is required"); return }
        if (!shopId) { toast.error("No shop found"); return }

        setSaving(true)
        try {
            const finalSku = autoSku ? generateSku() : sku.trim() || null

            const initialQty = parseInt(stockQuantity) || 0

            const { data, error } = await supabase.from("products").insert({
                shop_id: shopId,
                name: name.trim(),
                category_id: categoryId || null,
                subcategory_id: subcategoryId || null,
                supplier_id: supplierId || null,
                sku: finalSku,
                cost_price: parseFloat(costPrice) || 0,
                selling_price: parseFloat(sellingPrice) || 0,
                part_number: partNumber,
                stock_quantity: parseInt(stockQuantity) || 0,
                low_stock_threshold: trackInventory ? (parseInt(lowStockThreshold) || 5) : 0,
                is_universal: isUniversal,
                description: description.trim() || null,
            }).select("id").single()

            if (error) { console.error(error); toast.error("Failed to save product"); return }

            // Compatibility
            if (!isUniversal && selectedBikeIds.length > 0) {
                const inserts = selectedBikeIds.map(bikeId => ({
                    product_id: data.id,
                    bike_id: bikeId
                }))
                await supabase.from("product_bikes").insert(inserts)
            }

            // Initial Stock Movement
            if (initialQty > 0) {
                await supabase.from("stock_movements").insert({
                    shop_id: shopId,
                    product_id: data.id,
                    type: "initial",
                    quantity: initialQty,
                    notes: "Opening stock",
                })
            }

            if (addAnother) {
                toast.success(`"${name.trim()}" added`)
                resetForm()
                onSaved()
                setTimeout(() => nameRef.current?.focus(), 100)
            } else {
                toast.success(`"${name.trim()}" added`)
                onSaved()
                resetForm()
                onOpenChange(false)
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        } finally {
            setSaving(false)
        }
    }


    if (!open) return null

    /* ── Main Form ─── */
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

            <div className="relative w-[480px] max-w-full bg-zinc-950 border-l border-white/[0.08] flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <Package className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white">New Product</h2>
                            <p className="text-[11px] text-white/30">Add to inventory</p>
                        </div>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {/* ─── MANDATORY ─── */}
                        <div>
                            <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Product Name *</label>
                            <input
                                ref={nameRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Brake Pads — Front"
                                autoFocus
                                className="w-full h-12 px-4 text-[15px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Dropdown
                                label="Category *"
                                value={categoryId}
                                options={categories}
                                onChange={setCategoryId}
                                onCreate={createCategory}
                                placeholder="Type to search or create..."
                            />
                            {categoryId && filteredSubs.length > 0 ? (
                                <Dropdown
                                    label="Subcategory (Type to create)"
                                    value={subcategoryId}
                                    options={filteredSubs}
                                    onChange={setSubcategoryId}
                                    onCreate={createSubcategory}
                                    placeholder="Type to add new..."
                                />
                            ) : categoryId ? (
                                <Dropdown
                                    label="Subcategory"
                                    value={subcategoryId}
                                    options={[]}
                                    onChange={setSubcategoryId}
                                    onCreate={createSubcategory}
                                    placeholder="+ Create"
                                />
                            ) : (
                                <div>
                                    <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Subcategory</label>
                                    <div className="h-11 px-3.5 flex items-center text-[14px] text-white/15 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                        Pick category first
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-12 px-4 text-[18px] font-semibold bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all tabular-nums"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Opening Stock</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    placeholder="0"
                                    className="w-full h-12 px-4 text-[18px] font-semibold bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all tabular-nums"
                                />
                            </div>
                        </div>

                        {/* ─── HIGH-VALUE ─── */}
                        <div className="border-t border-white/[0.04] pt-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Dropdown
                                    label="Supplier"
                                    value={supplierId}
                                    options={suppliers}
                                    onChange={setSupplierId}
                                    onCreate={createSupplier}
                                    placeholder="Optional"
                                />
                                <div>
                                    <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Unit Type</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {UNIT_TYPES.map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setUnitType(u)}
                                                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${unitType === u
                                                    ? "bg-white/[0.12] text-white border border-white/[0.15]"
                                                    : "text-white/35 hover:text-white/60 border border-transparent hover:border-white/[0.06]"
                                                    }`}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cost Price + Margin */}
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Cost Price (₹)</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-11 px-4 text-[15px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all tabular-nums"
                                />
                                {cost > 0 && sell > 0 && (
                                    <div className="flex items-center gap-3 mt-2 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[12px] font-semibold text-emerald-400">
                                                ₹{profit.toFixed(0)} profit
                                            </span>
                                        </div>
                                        <span className="text-[12px] font-semibold text-white/30">·</span>
                                        <span className={`text-[12px] font-semibold ${margin >= 20 ? "text-emerald-400" : margin >= 10 ? "text-amber-400" : "text-red-400"}`}>
                                            {margin.toFixed(1)}% margin
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Track Inventory Toggle */}
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-[13px] font-medium text-white/70">Track Inventory</p>
                                    <p className="text-[11px] text-white/25">Monitor stock levels for this product</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTrackInventory(!trackInventory)}
                                    className={`relative w-10 h-[22px] rounded-full transition-colors ${trackInventory ? "bg-emerald-500" : "bg-white/[0.08]"}`}
                                >
                                    <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${trackInventory ? "left-[22px]" : "left-[3px]"}`} />
                                </button>
                            </div>

                            {trackInventory && (
                                <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Low Stock Alert Quantity</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                value={lowStockThreshold}
                                                onChange={(e) => setLowStockThreshold(e.target.value)}
                                                placeholder="0"
                                                className="w-full h-11 px-4 text-[15px] font-semibold bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all tabular-nums"
                                            />
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <span className="text-[11px] font-bold text-white/20 uppercase">Units</span>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-[10px] text-white/25">You will be notified to restock when quantity hits this number.</p>
                                    </div>
                                </div>
                            )}

                            {/* Compatibility System */}
                            <div className="pt-4 border-t border-white/[0.04]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[13px] font-bold text-white">Bike Compatibility</p>
                                        <p className="text-[11px] text-white/30">Select specific bikes or mark as universal</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-white/40 uppercase tracking-tighter">Specific Models</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newVal = !isUniversal; // if it was universal (toggle off), newVal is false (stay universal) - wait
                                                // Let's use isUniversal directly but label it as "Specific Models"
                                                // If toggle is ON -> Specific Models (isUniversal = false)
                                                // If toggle is OFF -> Universal (isUniversal = true)
                                                setIsUniversal(!isUniversal)
                                            }}
                                            className={`relative w-10 h-[22px] rounded-full transition-colors ${!isUniversal ? "bg-violet-500" : "bg-white/[0.08]"}`}
                                        >
                                            <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${!isUniversal ? "left-[22px]" : "left-[3px]"}`} />
                                        </button>
                                    </div>
                                </div>

                                {!isUniversal && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="grid grid-cols-2 gap-3 items-end">
                                            <Dropdown
                                                label="Filter Manufacturer"
                                                value={selectedCompanyId}
                                                options={companies}
                                                onChange={(id) => {
                                                    setSelectedCompanyId(id)
                                                }}
                                                onCreate={createCompany}
                                                placeholder="All Companies"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsBikeSheetOpen(true)}
                                                className="h-11 px-3.5 flex items-center justify-center gap-2 text-[12px] font-bold bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Bike
                                            </button>
                                        </div>

                                        <MultiSelectDropdown
                                            label="Select Compatible Models *"
                                            values={selectedBikeIds}
                                            options={selectedCompanyId ? filteredBikes : bikes}
                                            onChange={setSelectedBikeIds}
                                            placeholder={selectedCompanyId ? `Select ${companies.find(c => c.id === selectedCompanyId)?.name} models...` : "Choose models"}
                                            showActions
                                            onClearAll={() => setSelectedBikeIds([])}
                                            onSelectAll={selectedCompanyId ? () => {
                                                const currentIds = new Set(selectedBikeIds);
                                                filteredBikes.forEach(b => currentIds.add(b.id));
                                                setSelectedBikeIds(Array.from(currentIds));
                                            } : undefined}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── OPTIONAL ─── */}
                        <button
                            type="button"
                            onClick={() => setShowOptional(!showOptional)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-white/30 hover:text-white/50 transition-colors"
                        >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptional ? "rotate-180" : ""}`} />
                            {showOptional ? "Hide" : "More"} options
                        </button>

                        {showOptional && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-150">
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.04]">
                                    {/* Part Number */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Part Number</label>
                                        <input
                                            type="text"
                                            value={partNumber}
                                            onChange={(e) => setPartNumber(e.target.value)}
                                            placeholder="Manufacturer P/N"
                                            className="w-full h-11 px-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                                        />
                                    </div>

                                    {/* SKU */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">SKU</label>
                                            <button
                                                type="button"
                                                onClick={() => setAutoSku(!autoSku)}
                                                className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${autoSku ? "text-violet-400" : "text-white/25"}`}
                                            >
                                                {autoSku ? "Auto" : "Manual"}
                                            </button>
                                        </div>
                                        {autoSku ? (
                                            <div className="h-11 px-4 flex items-center text-[14px] text-white/20 bg-white/[0.02] border border-white/[0.04] rounded-xl font-mono">
                                                {categoryId ? generateSku() : "Will auto-generate"}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={sku}
                                                onChange={(e) => setSku(e.target.value)}
                                                placeholder="e.g. BRK-0042"
                                                className="w-full h-11 px-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white font-mono placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-white/50 mb-1.5">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional notes..."
                                        rows={2}
                                        className="w-full px-4 py-3 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex-1 h-11 text-[13px] font-semibold border border-white/[0.1] text-white/60 rounded-xl hover:bg-white/[0.04] hover:text-white transition-colors disabled:opacity-40"
                    >
                        Save & Add Another
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex-1 h-11 text-[13px] font-semibold bg-white text-zinc-900 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </div>

            <BikeSheet
                open={isBikeSheetOpen}
                onOpenChange={setIsBikeSheetOpen}
                shopId={shopId}
                companies={companies}
                onCreated={loadData}
                onCreateCompany={createCompany}
            />
        </div>
    )
}
