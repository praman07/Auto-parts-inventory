"use client"

import { useState, useEffect, useRef } from "react"
import { X, Loader2, User, Phone, MapPin, Mail, FileText, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface SupplierSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
    supplier?: any | null
}

export function SupplierSheet({ open, onOpenChange, onSaved, supplier }: SupplierSheetProps) {
    const nameRef = useRef<HTMLInputElement>(null)
    const isEditing = !!supplier

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [city, setCity] = useState("")
    const [address, setAddress] = useState("")
    const [notes, setNotes] = useState("")
    const [gstNumber, setGstNumber] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            if (supplier) {
                setName(supplier.name || "")
                setPhone(supplier.phone || "")
                setEmail(supplier.email || "")
                setCity(supplier.city || "")
                setAddress(supplier.address || "")
                setNotes(supplier.notes || "")
                setGstNumber(supplier.gst_number || "")
            } else {
                setName("")
                setPhone("")
                setEmail("")
                setCity("")
                setAddress("")
                setNotes("")
                setGstNumber("")
            }
            setTimeout(() => nameRef.current?.focus(), 150)
        }
    }, [open, supplier])

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault()
        console.log("!!! handleSubmit CALLED !!!")

        if (saving) return

        if (!name.trim()) {
            toast.error("Supplier name is required")
            nameRef.current?.focus()
            return
        }

        setSaving(true)
        try {
            console.log("Step 1: Fetching shopId...")
            const { data: shops, error: shopError } = await supabase.from("shops").select("id").limit(1)

            if (shopError) {
                console.error("Shop fetch error:", shopError)
                throw new Error(`Connection error: ${shopError.message}. Check your Supabase settings.`)
            }

            const shopId = shops?.[0]?.id

            if (!shopId) {
                console.error("No shop found in database")
                throw new Error("Initialization Error: No shop record found. Please add a shop to your database first or run the setup SQL.")
            }

            const data = {
                shop_id: shopId,
                name: name.trim(),
                phone: phone.trim() || null,
                email: email.trim() || null,
                city: city.trim() || null,
                address: address.trim() || null,
                notes: notes.trim() || null,
                gst_number: gstNumber.trim() || null,
            }

            if (isEditing) {
                console.log("Step 3: Attempting database update...")
                const { error: updateError } = await supabase.from("suppliers").update(data).eq("id", supplier.id)
                if (updateError) {
                    console.error("Step 3 FAIL: Update error", updateError)
                    throw updateError
                }
                toast.success("Supplier updated")
            } else {
                console.log("Step 3: Attempting database insert...")
                const { error: insertError } = await supabase.from("suppliers").insert(data)
                if (insertError) {
                    console.error("Step 3 FAIL: Insert error", insertError)
                    if (insertError.code === "42501") {
                        throw new Error("Permission Denied: RLS policy blocking. Please run the SQL fix I provided.")
                    }
                    throw insertError
                }
                console.log("Step 3 SUCCESS: Supplier added")
                toast.success("Supplier added")
            }

            onSaved()
            onOpenChange(false)
        } catch (err: any) {
            console.error("Supplier submission failed:", err)
            toast.error(err.message || "Failed to save supplier")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

            <div className="relative w-[450px] max-w-full bg-zinc-950 border-l border-white/[0.08] flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <User className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white">{isEditing ? "Edit Supplier" : "Add New Supplier"}</h2>
                            <p className="text-[11px] text-white/30">{isEditing ? "Modify vendor details" : "Add a new vendor to your records"}</p>
                        </div>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Supplier Name *</label>
                            <div className="relative">
                                <input
                                    ref={nameRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Acme Auto Parts"
                                    className="w-full h-11 px-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Phone + Email */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="888 000 0000"
                                        className="w-full h-11 pl-9 pr-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all tabular-nums"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@vendor.com"
                                        className="w-full h-11 pl-9 pr-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* City + GST */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City Name"
                                        className="w-full h-11 pl-9 pr-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">GST Number</label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input
                                        type="text"
                                        value={gstNumber}
                                        onChange={(e) => setGstNumber(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full h-11 pl-9 pr-4 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 transition-all uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Full Address</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Store / Warehouse address..."
                                rows={2}
                                className="w-full px-4 py-3 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 resize-none"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Internal Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Mention payment terms, primary products, etc."
                                rows={3}
                                className="w-full px-4 py-3 text-[14px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer - Moved inside Form */}
                    <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2 bg-zinc-950">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white/70 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 h-11 text-[13px] font-bold bg-white text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEditing ? "Update Vendor" : "Add Vendor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
