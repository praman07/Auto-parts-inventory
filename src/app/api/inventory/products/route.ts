
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: prods, error } = await supabase
            .from("products")
            .select(`
                *,
                categories(name),
                subcategories(name),
                suppliers(name),
                product_bikes(
                    bike_id,
                    bikes(
                        id,
                        model_name,
                        companies(name)
                    )
                )
            `);

        if (error) {
            console.error("API /api/inventory/products Fetch Error:", error);
            // Even if Supabase fails (e.g. timeout), return a 500 status that our client wrapper will catch & retry
            return NextResponse.json({ error: error.message }, { status: 502 });
        }

        return NextResponse.json({ data: prods });
    } catch (e: any) {
        console.error("API /api/inventory/products Unexpected Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
