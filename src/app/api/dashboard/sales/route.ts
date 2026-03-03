import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const startDate = new Date(dateStr);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(dateStr);
        endDate.setUTCHours(23, 59, 59, 999);

        // Fetch sales for this date
        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('id, created_at, total_amount')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (salesError) throw salesError;

        if (!sales || sales.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const saleIds = sales.map((s: any) => s.id);

        // Fetch items for these sales
        const { data: items, error: itemsError } = await supabase
            .from('sale_items')
            .select(`
                id,
                sale_id,
                product_id,
                quantity,
                unit_price,
                subtotal,
                products (
                    name,
                    part_number,
                    sku
                ),
                sales (
                    created_at,
                    total_amount
                )
            `)
            .in('sale_id', saleIds)
            .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;

        return NextResponse.json({ data: items });
    } catch (e: any) {
        console.error('Error fetching daily sales:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { itemId, newQuantity, productId, oldQuantity, saleId, unitPrice } = body;

        if (!itemId || newQuantity === undefined || newQuantity < 0) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const quantityDiff = newQuantity - oldQuantity;
        if (quantityDiff === 0) {
            return NextResponse.json({ success: true });
        }

        // 1. Update sale_items
        const newSubtotal = newQuantity * unitPrice;
        if (newQuantity === 0) {
            await supabase.from('sale_items').delete().eq('id', itemId);
        } else {
            await supabase.from('sale_items').update({ quantity: newQuantity, subtotal: newSubtotal }).eq('id', itemId);
        }

        // 2. Adjust product stock (diff is positive means more sold, so subtract from stock)
        // Actually RPC decrement_stock / increment_stock or just update directly
        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', productId).single();
        if (product) {
            const newStock = product.stock_quantity - quantityDiff;
            await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId);
        }

        // 3. Adjust Sale Total Amount
        const { data: sale } = await supabase.from('sales').select('total_amount').eq('id', saleId).single();
        if (sale) {
            const subtotalDiff = newSubtotal - (oldQuantity * unitPrice);
            await supabase.from('sales').update({ total_amount: sale.total_amount + subtotalDiff }).eq('id', saleId);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Error updating sale item:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}
