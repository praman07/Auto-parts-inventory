import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Box,
    Calendar,
    ClipboardList,
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
        title: "Appointments",
        href: "/dashboard/appointments",
        icon: Calendar,
    },
    {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
    },
    {
        title: "Product Requests",
        href: "/dashboard/orders/requests",
        icon: ClipboardList,
    },
    {
        title: "Sales History",
        href: "/dashboard/orders",
        icon: ShoppingCart,
    },
    {
        title: "Stock",
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
