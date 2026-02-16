import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Box,
} from "lucide-react";

export const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Quick Sale",
        href: "/dashboard/sale",
        icon: ShoppingCart,
        variant: "primary" as const,
    },
    {
        title: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
    },
    {
        title: "Stock Movements",
        href: "/dashboard/stock",
        icon: Box,
    },
    {
        title: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Users,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];
