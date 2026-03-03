"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/animated-card";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, User, Package, MapPin } from "lucide-react";

type OrderDetail = {
    id: string;
    created_at: string;
    total_amount: number;
    user_id: string;
    // If we had address_id in sales, we'd fetch address details. 
    // For now, fetching user info.
    users: {
        full_name: string | null;
        email: string | null;
        phone: string | null;
    } | null;
    sale_items: {
        id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
        products: {
            name: string;
            sku: string | null;
        } | null;
    }[];
};

export default function OrderDetailsPage() {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();


    useEffect(() => {
        if (params.id) {
            fetchOrder(params.id as string);
        }
    }, [params.id]);

    const fetchOrder = async (id: string) => {
        const { data, error } = await supabase
            .from("sales")
            .select(`
        *,
        users (
          full_name,
          email
        ),
        sale_items (
          *,
          products (
            name,
            sku
          )
        )
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching order:", error);
        } else {
            setOrder(data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!order) {
        return <div className="p-8 text-center">Order not found</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold italic tracking-tighter">Booking #{order.id.slice(0, 8)}</h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{format(new Date(order.created_at), "PPP p")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Info: Items */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-black italic tracking-tight uppercase text-sm"><Package className="h-4 w-4 text-orange-500" /> Selected parts</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.sale_items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.products?.name || "Unknown Product"}</div>
                                                <div className="text-xs text-muted-foreground">{item.products?.sku}</div>
                                            </TableCell>
                                            <TableCell className="text-right">₹{item.unit_price.toLocaleString("en-IN")}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-black italic">₹{item.subtotal.toLocaleString("en-IN")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="font-semibold">{order.users?.full_name || "Guest"}</p>
                                <p className="text-sm text-muted-foreground">{order.users?.email}</p>
                            </div>
                        </CardContent>
                    </Card>


                    <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <span className="font-black italic uppercase tracking-widest text-xs opacity-40">Booking Amount</span>
                                <span className="font-black italic text-2xl text-orange-500">₹{order.total_amount.toLocaleString("en-IN")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
