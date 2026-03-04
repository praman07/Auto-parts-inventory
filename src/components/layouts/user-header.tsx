"use client";

import { cn } from "@/lib/utils";
import { Search, ShoppingCart, Menu, User, ShoppingBag, LogOut, UserCircle } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { userNavItems } from "./user-nav-config";
import { useCart } from "@/context/cart-context";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Image from "next/image";

interface UserHeaderProps {
    className?: string;
}

export function UserHeader({ className }: UserHeaderProps) {
    const pathname = usePathname();
    const { totalItems, isAnimating } = useCart();
    const [user, setUser] = useState<any>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_, session) => setUser(session?.user || null)
        );
        return () => subscription.unsubscribe();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setMobileOpen(false);
        window.location.href = "/";
    };

    const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Account";
    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
        : null;

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl px-4 md:px-8",
            className
        )}>
            <div className="flex items-center gap-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                        <Image src="/logo.png" alt="Bhogal Auto Logo" width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm sm:text-lg font-black tracking-tighter text-white uppercase italic hidden sm:block">
                        Bhogal <span className="text-orange-500">Auto Service</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:block">
                    <ul className="flex items-center gap-6">
                        {userNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-white",
                                            isActive ? "text-white" : "text-white/40"
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Search */}
                <button className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30 hover:bg-white/[0.06] transition-colors">
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-medium pr-8">Search spares...</span>
                </button>

                {/* Cart */}
                <Link href="/cart" className="relative p-2 transition-colors group">
                    <motion.div
                        animate={isAnimating ? {
                            rotate: [0, -20, 20, -20, 20, 0],
                            scale: [1, 1.2, 1],
                            color: ["#9ca3af", "#f97316", "#9ca3af"]
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className={cn(
                            "relative transition-colors",
                            isAnimating ? "text-orange-500" : "text-white/40 group-hover:text-white"
                        )}
                    >
                        <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in ring-2 ring-zinc-950">
                                {totalItems}
                            </span>
                        )}
                    </motion.div>
                </Link>

                {/* Desktop User Auth */}
                <div className="hidden sm:flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group"
                            >
                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-black">
                                    {initials || <User className="w-3 h-3" />}
                                </div>
                                <span className="text-xs font-bold text-white/70 group-hover:text-white">{firstName}</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors">
                            <User className="w-3 h-3" /> Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu — only mounted on client to avoid Radix ID hydration mismatch */}
                {mounted && (
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <button className="md:hidden p-2 text-white/40 hover:text-white">
                                <Menu className="w-6 h-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-80 bg-zinc-950 border-white/[0.1] text-white p-0">
                            <div className="flex flex-col h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
                                {/* Mobile Menu Header — user info */}
                                <div className="p-6 border-b border-white/[0.06]">
                                    {user ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm">
                                                {initials || <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{user.user_metadata?.full_name || "User"}</p>
                                                <p className="text-[10px] text-white/30 font-medium truncate max-w-[180px]">{user.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <Image src="/logo.png" alt="Bhogal Auto Logo" width={36} height={36} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-lg font-black tracking-tighter text-white uppercase italic">
                                                Bhogal <span className="text-orange-500">Auto Service</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Nav Links */}
                                <nav className="flex-1 p-6 overflow-y-auto">
                                    <ul className="space-y-1">
                                        {userNavItems.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-4 text-base font-bold transition-all px-4 py-3 rounded-xl",
                                                            isActive
                                                                ? "text-orange-500 bg-orange-500/10"
                                                                : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <item.icon className="w-5 h-5 shrink-0" />
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            );
                                        })}

                                        {/* Profile link in mobile menu when signed in */}
                                        {user && (
                                            <li>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-4 text-base font-bold transition-all px-4 py-3 rounded-xl",
                                                        pathname === "/profile"
                                                            ? "text-orange-500 bg-orange-500/10"
                                                            : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <UserCircle className="w-5 h-5 shrink-0" />
                                                    My Profile
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </nav>

                                {/* Mobile Footer */}
                                <div className="p-6 border-t border-white/[0.06] space-y-3">
                                    {user ? (
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center justify-center gap-2 h-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    ) : (
                                        <Link
                                            href="/auth/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="w-full flex items-center justify-center gap-2 h-12 bg-white text-zinc-950 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                                        >
                                            <User className="w-4 h-4" /> Sign In
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </header>
    );
}
