import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Sidebar - Fix width or allow it to control itself */}
            <Sidebar className="hidden md:flex flex-shrink-0" />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-5">
                    <div className="mx-auto max-w-7xl animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
