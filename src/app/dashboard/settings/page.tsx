"use client"

import React, { useEffect, useState } from "react"
import {
    Store,
    Phone,
    Clock,
    Globe,
    CloudUpload,
    CheckCircle,
    MapPin,
    MessageCircle,
    Info,
    RefreshCw,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        id: "",
        address: "",
        working_hours: "",
        contact_phone: "",
        contact_whatsapp: "",
        contact_email: "",
        about_text: "",
        admin_password: "",
        hero_images: "",
    })
    const [showPin, setShowPin] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        setLoading(true)
        try {
            const { data, error } = await supabase.from("settings").select("*").limit(1)
            if (error) throw error
            if (data && data.length > 0) {
                const s = data[0]
                setSettings({
                    id: s.id || "",
                    address: s.address || "",
                    working_hours: s.working_hours || "",
                    contact_phone: s.contact_phone || "",
                    contact_whatsapp: s.contact_whatsapp || "",
                    contact_email: s.contact_email || "",
                    about_text: s.about_text || "",
                    admin_password: s.admin_password || "",
                    hero_images: s.hero_images || "",
                })
            }
        } catch (err: any) {
            console.error("Error fetching settings:", err.message || err)
            toast.error("Failed to load settings profile")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const { error } = await supabase
                .from("settings")
                .update({
                    address: settings.address,
                    working_hours: settings.working_hours,
                    contact_phone: settings.contact_phone,
                    contact_whatsapp: settings.contact_whatsapp,
                    contact_email: settings.contact_email,
                    about_text: settings.about_text,
                    admin_password: settings.admin_password,
                    hero_images: settings.hero_images,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", settings.id)

            if (error) throw error
            toast.success("Settings updated successfully")
        } catch (err: any) {
            console.error("Error saving settings:", err.message)
            toast.error("Failed to save settings: " + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500">
                <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                <span className="font-bold uppercase tracking-widest text-xs">Loading shop config...</span>
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Store className="text-orange-500 w-8 h-8" /> Shop Control
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 italic">Dynamically sync shop details across the entire platform</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-white text-zinc-950 hover:bg-zinc-100 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Commit Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Essential Info */}
                <div className="space-y-8">
                    <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter">
                            <Info className="text-blue-500 w-5 h-5" /> Public Identity
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Shop Bio / About</label>
                                <Textarea
                                    className="bg-black/50 border-white/10 rounded-2xl min-h-[120px] text-zinc-300 font-medium p-4 focus:border-orange-500/50 transition-all"
                                    placeholder="Enter shop description for the footer..."
                                    value={settings.about_text}
                                    onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Physical Location</label>
                                <Textarea
                                    className="bg-black/50 border-white/10 rounded-2xl min-h-[80px] text-zinc-300 font-medium p-4 focus:border-orange-500/50 transition-all"
                                    placeholder="Street, City, Pin..."
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest">Hero Background Images (CSV)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="hero-upload"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = e.target.files
                                                if (!files || files.length === 0) return

                                                toast.loading("Uploading images...")
                                                const newUrls = [...settings.hero_images.split(",").map(s => s.trim()).filter(Boolean)]

                                                try {
                                                    for (const file of Array.from(files)) {
                                                        const fileExt = file.name.split('.').pop()
                                                        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                                                        const filePath = `hero/${fileName}`

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('shop_assets')
                                                            .upload(filePath, file)

                                                        if (uploadError) throw uploadError

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('shop_assets')
                                                            .getPublicUrl(filePath)

                                                        newUrls.push(publicUrl)
                                                    }

                                                    setSettings({ ...settings, hero_images: newUrls.join(", ") })
                                                    toast.dismiss()
                                                    toast.success("Images uploaded and added to list")
                                                } catch (error: any) {
                                                    toast.dismiss()
                                                    toast.error("Upload failed: " + error.message)
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="hero-upload"
                                            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[9px] font-black text-orange-400 cursor-pointer hover:bg-orange-500/20 transition-all uppercase tracking-widest"
                                        >
                                            <CloudUpload className="w-3 h-3" /> Upload Local
                                        </label>
                                    </div>
                                </div>
                                <Textarea
                                    className="bg-black/50 border-white/10 rounded-2xl min-h-[100px] text-zinc-300 font-medium p-4 focus:border-orange-500/50 transition-all font-mono text-xs"
                                    placeholder="/hero_1.png, /hero_2.png ..."
                                    value={settings.hero_images}
                                    onChange={(e) => setSettings({ ...settings, hero_images: e.target.value })}
                                />
                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-3 px-1 italic">Comma separated paths or URLs. Local uploads are appended automatically.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter">
                            <Clock className="text-emerald-500 w-5 h-5" /> Operational Hours
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Display Text</label>
                                <Input
                                    className="h-14 bg-black/50 border-white/10 rounded-2xl text-zinc-300 font-bold px-4 focus:border-orange-500/50 transition-all"
                                    placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM"
                                    value={settings.working_hours}
                                    onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                                />
                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-3 px-1">Visible on home page and contact section</p>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Master Admin Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPin ? "text" : "password"}
                                        className="h-14 bg-black/50 border-white/10 rounded-2xl text-zinc-300 font-bold px-4 pr-12 focus:border-orange-500/50 transition-all tracking-widest font-mono"
                                        placeholder="Enter new master password..."
                                        value={settings.admin_password}
                                        onChange={(e) => setSettings({ ...settings, admin_password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-3 px-1">Used to secure the admin dashboard</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Communication */}
                <div className="space-y-8">
                    <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter">
                            <Globe className="text-orange-500 w-5 h-5" /> Connectivity
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Voice Contact
                                </label>
                                <Input
                                    className="h-14 bg-black/50 border-white/10 rounded-2xl text-zinc-300 font-bold px-4 transition-all"
                                    value={settings.contact_phone}
                                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp (Digits Only)
                                </label>
                                <Input
                                    className="h-14 bg-black/50 border-white/10 rounded-2xl text-zinc-300 font-bold px-4 transition-all font-mono"
                                    placeholder="e.g. 918727061407"
                                    value={settings.contact_whatsapp}
                                    onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                                    <Store className="w-3 h-3 text-violet-500" /> Business Email
                                </label>
                                <Input
                                    className="h-14 bg-black/50 border-white/10 rounded-2xl text-zinc-300 font-bold px-4 transition-all"
                                    value={settings.contact_email}
                                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                                <MapPin className="text-orange-500 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-tight mb-2">Sync Intelligence</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed font-bold">
                                    Updating these parameters will instantly refresh the Hero, Footer, and Contact components across the public-facing website. No rebuild required.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
