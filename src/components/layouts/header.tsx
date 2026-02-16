"use client";

import { cn } from "@/lib/utils";
import { Search, Bell, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { CommandPalette } from "@/components/layouts/command-palette";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layouts/nav-config";

interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    const [openCommand, setOpenCommand] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <header className={cn("sticky top-0 z-10 flex h-11 items-center justify-between border-b border-white/[0.06] bg-zinc-950/90 px-4 backdrop-blur-md", className)}>
                <div className="flex items-center gap-3">
                    {/* Mobile Nav */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="md:hidden p-1 text-white/40 hover:text-white/60">
                                <Menu className="h-4 w-4" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-52 p-0 bg-zinc-950 border-white/[0.06]">
                            <div className="flex h-11 items-center border-b border-white/[0.06] px-4">
                                <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Bhogal</span>
                            </div>
                            <nav className="py-2">
                                <ul className="space-y-0.5 px-1.5">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                                                        isActive
                                                            ? "bg-white/[0.08] text-white"
                                                            : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <item.icon className={cn("mr-2.5 h-4 w-4", isActive ? "text-white/80" : "")} strokeWidth={1.5} />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Search */}
                    <button
                        className="flex items-center gap-2 h-7 px-3 text-[11px] text-white/25 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-colors w-48 lg:w-56"
                        onClick={() => setOpenCommand(true)}
                    >
                        <Search className="h-3 w-3" strokeWidth={1.5} />
                        <span>Search...</span>
                        <kbd className="ml-auto hidden sm:inline text-[9px] text-white/15 font-mono">⌘K</kbd>
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-white/25 hover:text-white/50 rounded-md hover:bg-white/[0.04] transition-colors">
                        <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <div className="h-6 w-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/40 ml-1">
                        B
                    </div>
                </div>
            </header>

            <CommandPalette open={openCommand} setOpen={setOpenCommand} />
        </>
    );
}
