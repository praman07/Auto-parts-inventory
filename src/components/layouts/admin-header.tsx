"use client";

import { Menu, Home, Search, Bell, Monitor, Radio, Cpu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CommandPalette } from "@/components/layouts/command-palette";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/sale": "Quick Sale",
    "/dashboard/orders": "Orders",
    "/dashboard/inventory": "Inventory",
    "/dashboard/stock": "Stock Movements",
    "/dashboard/suppliers": "Suppliers",
    "/dashboard/customers": "Customers",
    "/dashboard/appointments": "Appointments",
    "/dashboard/reports": "Reports",
    "/dashboard/settings": "Settings",
    "/dashboard/profile": "Profile",
    "/dashboard/gate": "Admin Login",
};

interface AdminHeaderProps {
    onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
    const [openCommand, setOpenCommand] = useState(false);
    const pathname = usePathname();
    const title = pageTitles[pathname] || "Dashboard";

    return (
        <>
            <header className="h-11 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
                <div className="flex items-center gap-3">
                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-1.5 text-white/40 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                        onClick={onMenuToggle}
                    >
                        <Menu className="h-4 w-4" strokeWidth={1.5} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white/90 tracking-tight leading-none">{title}</span>
                            <div className="md:flex hidden items-center gap-1.5 mt-0.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] uppercase tracking-wider text-white/25 font-black">Live System</span>
                            </div>
                        </div>

                        {/* Search on Dashboard */}
                        <div className="h-4 w-px bg-white/[0.06] mx-2 hidden md:block" />

                        <button
                            className="hidden md:flex items-center gap-2 h-7 px-3 text-[10px] text-white/25 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-colors w-40 lg:w-48 group"
                            onClick={() => setOpenCommand(true)}
                        >
                            <Search className="h-3 w-3 group-hover:text-orange-500/50 transition-colors" strokeWidth={1.5} />
                            <span>Quick search</span>
                            <kbd className="ml-auto text-[8px] text-white/10 font-mono">⌘K</kbd>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* System Status Indicators */}
                    <div className="hidden lg:flex items-center gap-3 px-3 mr-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
                        <Cpu className="w-3 h-3 text-white/20" />
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-2 rounded-full bg-emerald-500/40" />)}
                        </div>
                    </div>



                    <Link href="/">
                        <button className="p-1.5 text-white/25 hover:text-white hover:bg-white/[0.04] rounded-md transition-colors" title="Visit Website">
                            <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                    </Link>

                    <div className="h-7 w-px bg-white/[0.06] mx-1" />

                    <div className="flex items-center gap-2 pl-1 select-none">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Admin</span>
                            <span className="text-[10px] font-bold text-white/70">Bhogal</span>
                        </div>
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.08] flex items-center justify-center text-[10px] font-black text-white/40">
                            <User className="w-4 h-4 text-white/20" />
                        </div>
                    </div>
                </div>
            </header>

            <CommandPalette open={openCommand} setOpen={setOpenCommand} />
        </>
    );
}
