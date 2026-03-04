import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { shop_id, user_id, total_amount, items, appointment } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'items are required' }, { status: 400 });
        }

        const supabase = getAdminClient();

        // Resolve shop_id
        let resolvedShopId = shop_id;
        if (!resolvedShopId) {
            const { data: shop } = await supabase.from('shops').select('id').limit(1).single();
            if (!shop) return NextResponse.json({ error: 'No shop found' }, { status: 400 });
            resolvedShopId = shop.id;
        }

        let saleId: string | null = null;

        // === ATTEMPT SALE CREATION (best-effort) ===
        try {
            const salePayload: any = {
                shop_id: resolvedShopId,
                total_amount: total_amount || 0,
            };
            // Only include user_id if it's a real value
            if (user_id) salePayload.user_id = user_id;

            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert(salePayload)
                .select('id')
                .single();

            if (saleError) {
                console.warn('Sale insert failed (non-fatal):', saleError.message);
            } else if (sale) {
                saleId = sale.id;

                // Insert sale items
                const saleItems = items.map((item: any) => ({
                    sale_id: sale.id,
                    product_id: item.product_id || item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price || item.price,
                    subtotal: (item.unit_price || item.price) * item.quantity,
                }));
                await supabase.from('sale_items').insert(saleItems);

                // Stock movements
                const movements = items.map((item: any) => ({
                    shop_id: resolvedShopId,
                    product_id: item.product_id || item.id,
                    type: 'sale',
                    quantity: -item.quantity,
                    reference_id: sale.id,
                    notes: `Sale #${sale.id.slice(0, 8)}`,
                }));
                await supabase.from('stock_movements').insert(movements);

                // Decrement stock
                for (const item of items) {
                    const pid = item.product_id || item.id;
                    const { data: prod } = await supabase
                        .from('products').select('stock_quantity').eq('id', pid).single();
                    if (prod) {
                        await supabase.from('products')
                            .update({ stock_quantity: Math.max(0, Number(prod.stock_quantity) - item.quantity) })
                            .eq('id', pid);
                    }
                }
            }
        } catch (saleEx: any) {
            console.warn('Sale block failed (non-fatal):', saleEx.message);
        }

        // === CREATE APPOINTMENT (required for user checkout) ===
        if (appointment) {
            const apptPayload: any = {
                ...appointment,
                status: 'pending',
            };
            if (saleId) apptPayload.sale_id = saleId;

            const { error: apptError } = await supabase.from('appointments').insert(apptPayload);
            if (apptError) {
                console.error('Appointment error:', apptError);
                return NextResponse.json({
                    error: 'Appointment could not be created: ' + apptError.message,
                    sale_id: saleId
                }, { status: 500 });
            }
        }

        return NextResponse.json({ sale_id: saleId, success: true });
    } catch (e: any) {
        console.error('API /api/sales POST error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
