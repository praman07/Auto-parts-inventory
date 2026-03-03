"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    toggleCart: () => void;
    isAnimating: boolean;
    isLoggedIn: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // prevent double-fetch on mount
    const hasFetched = useRef(false);

    // ── Auth state watcher ───────────────────────────────────
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
                setAuthToken(session.access_token);
                setIsLoggedIn(true);
            } else {
                // Not logged in — cart is strictly empty
                setItems([]);
                setIsLoggedIn(false);
            }
        });

        // Listen for login/logout
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                if (event === "SIGNED_IN" && session?.user) {
                    setUserId(session.user.id);
                    setAuthToken(session.access_token);
                    setIsLoggedIn(true);
                    hasFetched.current = false; // allow fresh fetch
                } else if (event === "SIGNED_OUT") {
                    // Wipe cart completely — no localStorage remnants
                    setItems([]);
                    setUserId(null);
                    setAuthToken(null);
                    setIsLoggedIn(false);
                    hasFetched.current = false;
                    localStorage.removeItem("bhogal-cart");
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

    // ── Load cart from cloud when user is known ──────────────
    useEffect(() => {
        if (authToken && userId && !hasFetched.current) {
            hasFetched.current = true;
            fetchCloudCart(authToken);
        }
    }, [authToken, userId]);

    // ── Cloud fetch ──────────────────────────────────────────
    const fetchCloudCart = async (token: string) => {
        try {
            const res = await fetch('/api/cart/sync', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const { items: cloudItems } = await res.json();
            if (Array.isArray(cloudItems)) {
                setItems(cloudItems);
            }
        } catch (e) {
            console.error("Cart fetch failed:", e);
        }
    };

    // ── Cloud sync ───────────────────────────────────────────
    const syncCartItem = async (
        id: string,
        quantity: number,
        action: 'add' | 'update' | 'remove' | 'clear'
    ) => {
        if (!authToken) return;
        try {
            await fetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, id, quantity })
            });
        } catch (e) {
            console.error("Cart sync failed:", e);
        }
    };

    // ── Actions ──────────────────────────────────────────────
    const addItem = (newItem: Omit<CartItem, "quantity">, quantityToAdd = 1) => {
        if (!isLoggedIn || !authToken) {
            // Save the current page so we can redirect back after login
            const returnUrl = window.location.pathname;
            window.location.href = `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
            return;
        }

        setItems((current) => {
            const existing = current.find((i) => i.id === newItem.id);
            const finalQty = existing ? existing.quantity + quantityToAdd : quantityToAdd;

            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);

            syncCartItem(newItem.id, finalQty, "add");

            if (existing) {
                return current.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: finalQty } : i
                );
            }
            return [...current, { ...newItem, quantity: quantityToAdd }];
        });
    };

    const removeItem = (id: string) => {
        if (!isLoggedIn) return;
        setItems((current) => current.filter((i) => i.id !== id));
        syncCartItem(id, 0, "remove");
        toast.info("Part removed", { duration: 2000 });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (!isLoggedIn) return;
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((current) =>
            current.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
        syncCartItem(id, quantity, "update");
    };

    const clearCart = () => {
        if (!isLoggedIn) return;
        setItems([]);
        syncCartItem("", 0, "clear");
    };

    const toggleCart = () => setIsCartOpen((v) => !v);

    const totalItems = items.reduce((t, i) => t + i.quantity, 0);
    const totalPrice = items.reduce((t, i) => t + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                toggleCart,
                isAnimating,
                isLoggedIn,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
