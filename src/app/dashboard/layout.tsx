"use client";

import { Sidebar } from "@/components/layouts/sidebar";
import { AdminHeader } from "@/components/layouts/admin-header";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === '/dashboard/login') {
            setIsAuthenticated(true);
            return;
        }

        const auth = sessionStorage.getItem("admin_auth");
        if (auth === "true") {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.replace("/dashboard/login");
        }
    }, [pathname, router]);

    if (isAuthenticated === null) return <div className="min-h-screen bg-zinc-950" />;

    if (pathname === '/dashboard/login') {
        return <div className="bg-zinc-950 min-h-screen">{children}</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Sidebar - Desktop */}
            <Sidebar className="hidden md:flex flex-shrink-0" />

            {/* Mobile Sidebar (Drawer) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-52 bg-zinc-950 border-white/[0.06]">
                    <Sidebar className="flex w-full h-full" />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader onMenuToggle={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-5">
                    <div className="mx-auto max-w-7xl animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
