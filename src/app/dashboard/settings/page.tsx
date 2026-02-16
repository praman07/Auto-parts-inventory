"use client"
// Trigger rebuild


import React from "react"
import {
    Store,
    Users,
    CreditCard,
    FileText,
    Bell,
    Settings,
    BadgeCheck,
    Tag,
    Clock,
    Globe,
    CloudUpload,
    CheckCircle,
    PieChart,
    Building2
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"


export default function SettingsPage() {
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex flex-col shrink-0 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:pr-6">
                <div className="mb-4 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Settings Menu</p>
                </div>
                <nav className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20">
                        <Store className="w-4 h-4" />
                        General Shop Info
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        Team Access
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                        <CreditCard className="w-4 h-4" />
                        Labor Rates
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                        <FileText className="w-4 h-4" />
                        Tax Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </Button>
                </nav>
                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                        <Settings className="w-4 h-4" />
                        System Preferences
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8 pb-10">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <span>Settings</span>
                            <span className="text-[10px]">&gt;</span>
                            <span className="text-slate-900 dark:text-white font-medium">General Shop Info</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">General Shop Info</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your shop's core identity, scheduling, and regional preferences.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400 italic hidden sm:block">Last saved: 2 minutes ago</p>
                        <Button className="shadow-lg shadow-primary/30">Save Changes</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Shop Identity Section */}
                    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                            <BadgeCheck className="text-primary w-5 h-5" />
                            Business Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Shop Name</label>
                                    <Input defaultValue="Bhogal Auto Service" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                                    <Input type="tel" defaultValue="+91 98765-43210" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Physical Address</label>
                                    <Textarea rows={3} defaultValue="Street No. 12, Industrial Area-B, Ludhiana, Punjab 141003" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <label className="block w-full text-sm font-bold text-slate-700 dark:text-slate-300">Shop Logo</label>
                                <div className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 transition-colors hover:border-primary hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <div className="flex items-center justify-center rounded-full bg-white dark:bg-slate-800 p-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <CloudUpload className="text-primary w-8 h-8" />
                                    </div>
                                    <p className="mt-4 text-xs font-semibold text-slate-500">Drag and drop or click to upload</p>
                                    <p className="text-[10px] text-slate-400">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Labor Rates Section */}
                    <section className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white px-1">
                            <Tag className="text-primary w-5 h-5" />
                            Labor Rates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Standard Rate */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2 text-emerald-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Default</span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Standard Rate</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Baseline hourly service fee for routine maintenance and minor repairs.</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-slate-400 font-bold mb-1.5">$</span>
                                    <Input className="text-2xl font-black h-12 w-24 p-2" type="number" defaultValue="85.00" />
                                    <span className="text-slate-400 font-bold mb-1.5 whitespace-nowrap">/ hr</span>
                                </div>
                            </div>

                            {/* Diagnostic Rate */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 text-blue-600">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Diagnostic Rate</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Specialized troubleshooting rate for complex electrical and engine issues.</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-slate-400 font-bold mb-1.5">$</span>
                                    <Input className="text-2xl font-black h-12 w-24 p-2" type="number" defaultValue="120.00" />
                                    <span className="text-slate-400 font-bold mb-1.5 whitespace-nowrap">/ hr</span>
                                </div>
                            </div>

                            {/* Fleet Rate */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-2 text-purple-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Fleet Rate</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Discounted baseline rate reserved for long-term business account contracts.</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-slate-400 font-bold mb-1.5">$</span>
                                    <Input className="text-2xl font-black h-12 w-24 p-2" type="number" defaultValue="70.00" />
                                    <span className="text-slate-400 font-bold mb-1.5 whitespace-nowrap">/ hr</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Operating Hours & Regional Settings Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Operating Hours Grid */}
                        <section className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                                <Clock className="text-primary w-5 h-5" />
                                Operating Hours
                            </h3>
                            <div className="space-y-3">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                                    <div key={day} className="grid grid-cols-12 items-center gap-4 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all even:bg-slate-50 dark:even:bg-slate-900">
                                        <span className="col-span-3 text-sm font-bold text-slate-700 dark:text-slate-300">{day}</span>
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">OPEN</span>
                                        </div>
                                        <div className="col-span-7 flex items-center justify-end gap-2">
                                            <Input type="time" defaultValue="09:00" className="h-8 w-24 text-xs" />
                                            <span className="text-slate-400 text-xs">—</span>
                                            <Input type="time" defaultValue={day === 'Friday' ? "20:00" : "18:00"} className="h-8 w-24 text-xs" />
                                        </div>
                                    </div>
                                ))}
                                <div className="grid grid-cols-12 items-center gap-4 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all bg-slate-50 dark:bg-slate-900">
                                    <span className="col-span-3 text-sm font-bold text-slate-700 dark:text-slate-300">Saturday</span>
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">LTD HOURS</span>
                                    </div>
                                    <div className="col-span-7 flex items-center justify-end gap-2">
                                        <Input type="time" defaultValue="10:00" className="h-8 w-24 text-xs" />
                                        <span className="text-slate-400 text-xs">—</span>
                                        <Input type="time" defaultValue="14:00" className="h-8 w-24 text-xs" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 items-center gap-4 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <span className="col-span-3 text-sm font-bold text-slate-700 dark:text-slate-300">Sunday</span>
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">CLOSED</span>
                                    </div>
                                    <div className="col-span-7 flex items-center justify-end gap-2">
                                        <span className="text-xs text-slate-400 font-medium italic">Shop is not operational</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Regional Preferences */}
                        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                                <Globe className="text-primary w-5 h-5" />
                                Regional
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                                    <Select defaultValue="inr">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
                                            <SelectItem value="inr">INR (₹) - Indian Rupee</SelectItem>
                                            <SelectItem value="eur">EUR (€) - Euro</SelectItem>
                                            <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date Format</label>
                                    <Select defaultValue="ddmm">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Date Format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mmdd">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="ddmm">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Default Tax %</label>
                                    <div className="relative">
                                        <Input type="number" step="0.1" defaultValue="18.0" className="pr-10" />
                                        <span className="absolute right-3 top-2 text-slate-400 text-sm font-bold">%</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    {/* Custom Checkbox mimicking the design */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded border border-primary bg-primary text-white">
                                            <span className="text-[14px]">✓</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-calculate regional taxes</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
