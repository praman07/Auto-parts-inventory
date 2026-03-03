"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Loader2, ChevronDown, Plus, Check, Sparkles, Package, CloudUpload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ProductSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
    initialData?: any // Added for editing
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
export function ProductSheet({ open, onOpenChange, onSaved, initialData }: ProductSheetProps) {
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
    const [imageUrl, setImageUrl] = useState("")
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
            if (initialData) {
                setName(initialData.name || "")
                setCategoryId(initialData.category_id || "")
                setSubcategoryId(initialData.subcategory_id || "")
                setSupplierId(initialData.supplier_id || "")
                setSellingPrice(String(initialData.selling_price || ""))
                setCostPrice(String(initialData.cost_price || ""))
                setStockQuantity(String(initialData.stock_quantity || ""))
                setLowStockThreshold(String(initialData.low_stock_threshold || "5"))
                setTrackInventory(initialData.low_stock_threshold > 0)
                setImageUrl(initialData.image_url || "")
                setSku(initialData.sku || "")
                setAutoSku(!initialData.sku)
                setDescription(initialData.description || "")
                setPartNumber(initialData.part_number || "")
                setIsUniversal(initialData.is_universal)
                setSelectedBikeIds(initialData.compatibility?.map((c: any) => c.id) || [])
                setShowOptional(!!(initialData.description || initialData.part_number || initialData.sku))
            } else {
                resetForm()
            }
            setTimeout(() => nameRef.current?.focus(), 150)
        }
    }, [open, loadData, initialData])

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
        setImageUrl("")
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

            let res;
            const productPayload = {
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
                image_url: imageUrl.trim() || null,
                description: description.trim() || null,
            }

            if (initialData?.id) {
                res = await supabase.from("products").update(productPayload).eq("id", initialData.id).select("id").single()
                // Clear old compatibility
                await supabase.from("product_bikes").delete().eq("product_id", initialData.id)
            } else {
                res = await supabase.from("products").insert(productPayload).select("id").single()
            }

            if (res.error) { console.error(res.error); toast.error("Failed to save product"); return }
            const data = res.data

            // Compatibility
            if (!isUniversal && selectedBikeIds.length > 0) {
                const inserts = selectedBikeIds.map(bikeId => ({
                    product_id: data.id,
                    bike_id: bikeId
                }))
                await supabase.from("product_bikes").insert(inserts)
            }

            // Initial Stock Movement (Only for new)
            if (!initialData?.id && initialQty > 0) {
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

            <div className="relative w-[900px] max-w-full bg-black border-l border-white/[0.08] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Package className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black text-white tracking-tight">{initialData?.id ? "Edit Inventory" : "New Inventory Unit"}</h2>
                            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{initialData?.id ? "Modify existing record" : "Register new unit"}</p>
                        </div>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 grid grid-cols-12 gap-x-8 gap-y-6">
                        {/* LEFT COLUMN: Identity & Media (Col 1-5) */}
                        <div className="col-span-12 lg:col-span-5 space-y-6">
                            {/* Product Name */}
                            <div>
                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2.5">Product Name *</label>
                                <input
                                    ref={nameRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Brake Pads — Front"
                                    autoFocus
                                    className="w-full h-14 px-5 text-[16px] bg-white/[0.03] border border-white/[0.1] rounded-2xl text-white placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all font-black tracking-tight"
                                />
                            </div>

                            {/* Image Upload System */}
                            <div>
                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2.5">Product Asset / Photo</label>
                                <div
                                    onClick={() => document.getElementById('product-image-upload')?.click()}
                                    className="relative aspect-square w-full rounded-3xl bg-white/[0.02] border border-dashed border-white/[0.1] overflow-hidden flex flex-col items-center justify-center cursor-pointer group hover:bg-white/[0.04] hover:border-orange-500/30 transition-all duration-300"
                                >
                                    {imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                <CloudUpload className="text-white w-8 h-8 mb-2" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Update Photo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 p-8 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                                                <Plus className="text-white/20 w-6 h-6 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Upload Local File</p>
                                                <p className="text-[9px] text-zinc-600 font-bold leading-relaxed px-4">JPEG, PNG or WEB-P supported. Clear photos improve sales.</p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="product-image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const fileExt = file.name.split('.').pop();
                                            const fileName = `${Math.random()}.${fileExt}`;
                                            const filePath = `products/${fileName}`;

                                            toast.loading("Uploading photo...");

                                            const { error: uploadError } = await supabase.storage
                                                .from('inventory')
                                                .upload(filePath, file);

                                            if (uploadError) {
                                                toast.error("Upload failed: " + uploadError.message);
                                                return;
                                            }

                                            const { data: { publicUrl } } = supabase.storage
                                                .from('inventory')
                                                .getPublicUrl(filePath);

                                            setImageUrl(publicUrl);
                                            toast.dismiss();
                                            toast.success("Photo synced");
                                        }}
                                    />
                                </div>
                                <div className="mt-3">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Or Direct Link</p>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full h-10 px-4 text-[12px] bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/50 placeholder:text-zinc-800 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Profit Insights */}
                            {cost > 0 && sell > 0 && (
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Projected Gain</p>
                                            <p className="text-[15px] font-black text-emerald-400 tabular-nums">₹{profit.toFixed(0)} <span className="text-[10px] text-emerald-500/40 ml-1">NET</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Margin</p>
                                        <p className={`text-[15px] font-black tabular-nums ${margin >= 20 ? "text-emerald-400" : margin >= 10 ? "text-amber-400" : "text-red-400"}`}>
                                            {margin.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Configuration & Specs (Col 6-12) */}
                        <div className="col-span-12 lg:col-span-7 space-y-8 lg:pl-4 lg:border-l lg:border-white/[0.04]">
                            {/* Section: Taxonomy */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Taxonomy & Source</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Dropdown
                                        label="Primary Category *"
                                        value={categoryId}
                                        options={categories}
                                        onChange={setCategoryId}
                                        onCreate={createCategory}
                                        placeholder="Pick Section..."
                                    />
                                    {categoryId && filteredSubs.length > 0 ? (
                                        <Dropdown
                                            label="Subcategory / Placement"
                                            value={subcategoryId}
                                            options={filteredSubs}
                                            onChange={setSubcategoryId}
                                            onCreate={createSubcategory}
                                            placeholder="Pick Detail..."
                                        />
                                    ) : categoryId ? (
                                        <Dropdown
                                            label="Subcategory / Placement"
                                            value={subcategoryId}
                                            options={[]}
                                            onChange={setSubcategoryId}
                                            onCreate={createSubcategory}
                                            placeholder="+ Create New"
                                        />
                                    ) : (
                                        <div>
                                            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Subcategory</label>
                                            <div className="h-11 px-4 flex items-center text-[13px] text-white/10 bg-white/[0.01] border border-white/[0.04] rounded-xl italic">
                                                Identify category first
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Dropdown
                                    label="Original Supplier / Dealer"
                                    value={supplierId}
                                    options={suppliers}
                                    onChange={setSupplierId}
                                    onCreate={createSupplier}
                                    placeholder="Search manufacturers..."
                                />
                            </div>

                            {/* Section: Inventory Strategy */}
                            <div className="space-y-5 pt-6 border-t border-white/[0.06]">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Inventory Strategy</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Retail Selling Price (₹) *</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                step="0.01"
                                                value={sellingPrice}
                                                onChange={(e) => setSellingPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full h-14 px-5 text-[22px] font-black bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 placeholder:text-emerald-900/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all tabular-nums"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40 font-black">MRP</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Opening Physical Stock</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            value={stockQuantity}
                                            onChange={(e) => setStockQuantity(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-14 px-5 text-[22px] font-black bg-white/[0.02] border border-white/[0.08] rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all tabular-nums"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trackInventory ? "bg-orange-500/10 text-orange-500" : "bg-white/5 text-white/20"}`}>
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-white/80 uppercase">Threshold Management</p>
                                                <p className="text-[10px] text-white/30 font-bold italic">Automatic alerts for low stock</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTrackInventory(!trackInventory)}
                                            className={`relative w-12 h-6 rounded-full transition-all ${trackInventory ? "bg-orange-500 shadow-lg shadow-orange-500/20" : "bg-white/10"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${trackInventory ? "left-7" : "left-1"}`} />
                                        </button>
                                    </div>

                                    {trackInventory && (
                                        <div className="animate-in slide-in-from-top-1 duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={lowStockThreshold}
                                                        onChange={(e) => setLowStockThreshold(e.target.value)}
                                                        className="w-full h-10 px-4 bg-black/40 border border-white/10 rounded-xl text-white font-bold text-sm"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Action At</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Compatibility Section */}
                            <div className="pt-6 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">Vehicle Compatibility</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-white/30 uppercase">Specific Setup</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsUniversal(!isUniversal)}
                                            className={`relative w-12 h-6 rounded-full transition-all ${!isUniversal ? "bg-violet-500 shadow-lg shadow-violet-500/20" : "bg-white/10"}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!isUniversal ? "left-7" : "left-1"}`} />
                                        </button>
                                    </div>
                                </div>

                                {!isUniversal ? (
                                    <div className="space-y-4 p-5 bg-violet-500/[0.02] border border-violet-500/10 rounded-3xl animate-in zoom-in-95 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Dropdown
                                                label="Filter Brand"
                                                value={selectedCompanyId}
                                                options={companies}
                                                onChange={setSelectedCompanyId}
                                                onCreate={createCompany}
                                                placeholder="All Brands"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsBikeSheetOpen(true)}
                                                className="h-11 px-4 flex items-center justify-center gap-2 text-[12px] font-black bg-white/[0.03] border border-white/[0.1] rounded-xl text-white hover:bg-white/[0.06] transition-all"
                                            >
                                                <Plus className="w-4 h-4" /> Add Model
                                            </button>
                                        </div>
                                        <MultiSelectDropdown
                                            label="Compatible Models *"
                                            values={selectedBikeIds}
                                            options={selectedCompanyId ? filteredBikes : bikes}
                                            onChange={setSelectedBikeIds}
                                            placeholder="Pick compatible units..."
                                            showActions
                                            onClearAll={() => setSelectedBikeIds([])}
                                            onSelectAll={selectedCompanyId ? () => {
                                                const currentIds = new Set(selectedBikeIds);
                                                filteredBikes.forEach(b => currentIds.add(b.id));
                                                setSelectedBikeIds(Array.from(currentIds));
                                            } : undefined}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-6 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl flex items-center justify-center gap-4">
                                        <Sparkles className="w-5 h-5 text-emerald-500/40" />
                                        <p className="text-[11px] font-black text-emerald-500/60 uppercase tracking-widest">Universal fitment — applicable to all bikes</p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Metadata */}
                            <div className="pt-6 border-t border-white/[0.06]">
                                <button
                                    type="button"
                                    onClick={() => setShowOptional(!showOptional)}
                                    className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl hover:bg-white/[0.04] transition-all group"
                                >
                                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Advanced Logistics (Cost, SKU, P/N)</span>
                                    <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${showOptional ? "rotate-180" : ""}`} />
                                </button>

                                {showOptional && (
                                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 pb-4 animate-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Internal Cost (₹)</label>
                                            <input
                                                type="number"
                                                value={costPrice}
                                                onChange={(e) => setCostPrice(e.target.value)}
                                                className="w-full h-11 px-4 bg-white/[0.04] border border-white/10 rounded-xl text-white/70 font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Part Number</label>
                                            <input
                                                type="text"
                                                value={partNumber}
                                                onChange={(e) => setPartNumber(e.target.value)}
                                                className="w-full h-11 px-4 bg-white/[0.04] border border-white/10 rounded-xl text-white font-bold"
                                                placeholder="e.g. 12345-ABC"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2.5">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest">Internal SKU</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setAutoSku(!autoSku)}
                                                    className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md border transition-all ${autoSku ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-white/5 border-white/10 text-white/30"}`}
                                                >
                                                    {autoSku ? "Auto-Generate: ON" : "Manual entry"}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={autoSku ? "SYSTEM-GENERATED" : sku}
                                                onChange={(e) => setSku(e.target.value)}
                                                disabled={autoSku}
                                                placeholder="Pick unique SKU..."
                                                className="w-full h-11 px-4 bg-white/[0.02] border border-white/10 rounded-xl text-white font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Internal Description / Notes</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full h-24 p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white/60 text-sm italic resize-none"
                                                placeholder="Add internal notes, storage location, or additional specs..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Footer / Actions ─── */}
                <div className="px-8 py-6 border-t border-white/[0.06] bg-zinc-900/50 backdrop-blur-xl flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-12 px-6 text-[13px] font-black text-white/40 hover:text-white transition-colors"
                    >
                        Discard
                    </button>
                    <div className="flex-1" />
                    {!initialData?.id && (
                        <button
                            type="button"
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="h-12 px-6 text-[13px] font-black border border-white/[0.08] text-white/60 rounded-2xl hover:bg-white/[0.05] hover:text-white transition-all disabled:opacity-40"
                        >
                            Save & Add Another
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="h-12 px-10 text-[13px] font-black bg-orange-500 text-white rounded-2xl hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "Processing..." : initialData?.id ? "Update Changes" : "Confirm Entry"}
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
