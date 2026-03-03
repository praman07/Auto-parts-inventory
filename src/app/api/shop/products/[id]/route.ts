
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } | Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

        if (error) {
            console.error(`API /api/shop/products/${id} Fetch Error:`, error);
            return NextResponse.json({ error: error.message }, { status: 502 });
        }

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error(`API /api/shop/products/[id] Unexpected Error:`, e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
