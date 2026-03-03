
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .order('name');

        if (error) {
            console.error("API /api/shop/products Fetch Error:", error);
            return NextResponse.json({ error: error.message }, { status: 502 });
        }

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error("API /api/shop/products Unexpected Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
