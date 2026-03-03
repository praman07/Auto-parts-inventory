"use client";

import { CartProvider } from "@/context/cart-context";
import { SecurityProvider } from "@/context/security-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SecurityProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </SecurityProvider>
    );
}
