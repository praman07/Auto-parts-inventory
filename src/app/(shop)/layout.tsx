import { UserHeader } from "@/components/layouts/user-header";
import { Footer } from "@/components/layouts/footer";
import { UserSecurity } from "@/components/UserSecurity";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserSecurity>
            <div className="flex flex-col min-h-screen">
                <UserHeader />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </UserSecurity>
    );
}
