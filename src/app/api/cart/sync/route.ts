import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to get currently authed user
async function getUser(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
}

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                quantity,
                products (
                    id,
                    name,
                    selling_price,
                    image_url
                )
            `)
            .eq('user_id', user.id);

        if (error) throw error;

        // Map database format to CartContext format
        const items = data.map((row: any) => ({
            id: row.products.id,
            name: row.products.name,
            price: row.products.selling_price,
            quantity: row.quantity,
            image: row.products.image_url || undefined
        }));

        console.log(`[API Cart Sync] Fetched ${items.length} items for user ${user.id}`);

        return NextResponse.json({ items });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action, id, quantity } = body;

        if (action === 'add' || action === 'update') {
            // Upsert handles both inserting new items and updating quantities for existing ones
            // due to the UNIQUE(user_id, product_id) constraint in the DB
            const { error } = await supabase
                .from('cart_items')
                .upsert({
                    user_id: user.id,
                    product_id: id,
                    quantity: quantity
                }, {
                    onConflict: 'user_id, product_id'
                });
            if (error) throw error;
        } else if (action === 'remove') {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .match({ user_id: user.id, product_id: id });
            if (error) throw error;
        } else if (action === 'clear') {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
