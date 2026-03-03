import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Uses service role key to bypass RLS — safe because this is server-only
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Fall back to anon if no service key (will still work if RLS allows it)
    return createClient(url, serviceKey || anonKey);
}

export async function GET() {
    try {
        const supabase = getAdminClient();

        // Fetch all appointments
        const { data: appts, error: apptErr } = await supabase
            .from('appointments')
            .select('user_id, user_name, user_email, vehicle_model, preferred_date, status');

        // Fetch sales — try all possible name/email column variants
        const { data: salesRaw, error: salesErr } = await supabase
            .from('sales')
            .select('*');

        // Try customers table
        const { data: customersTable } = await supabase
            .from('customers')
            .select('user_id, full_name, phone, email');

        const map = new Map<string, {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            bookings: number;
            lastBooking: string | null;
            vehicles: string[];
            totalSpent: number;
        }>();

        // helper to upsert into map
        const upsert = (key: string, name: string, email: string, phone: string | null, amount: number, date?: string, vehicle?: string) => {
            if (!map.has(key)) {
                map.set(key, { id: key, name, email, phone, bookings: 0, lastBooking: null, vehicles: [], totalSpent: 0 });
            }
            const e = map.get(key)!;
            if (!e.name || e.name === 'Unknown') e.name = name || e.name;
            if (!e.email && email) e.email = email;
            if (!e.phone && phone) e.phone = phone;
            if (amount) e.totalSpent += amount;
            if (date) {
                if (!e.lastBooking || new Date(date) > new Date(e.lastBooking)) e.lastBooking = date;
            }
            if (vehicle && !e.vehicles.includes(vehicle)) e.vehicles.push(vehicle);
        };

        // Seed from customers table
        (customersTable || []).forEach((c: any) => {
            if (c.user_id) upsert(c.user_id, c.full_name || 'Unknown', c.email || '', c.phone || null, 0);
        });

        // Aggregate from appointments
        (appts || []).forEach((a: any) => {
            const key = a.user_id || (a.user_email ? `email-${a.user_email}` : null);
            if (!key) return;
            upsert(key, a.user_name || a.user_email?.split('@')[0] || 'Unknown',
                a.user_email || '', null, 0, a.preferred_date, a.vehicle_model);
            map.get(key)!.bookings += 1;
        });

        // Pull from sales with customer_id join
        const customerIds = [...new Set(
            (salesRaw || []).map((s: any) => s.customer_id).filter(Boolean)
        )];

        // Fetch customer records by IDs from customers table
        let customersByid: any[] = [];
        if (customerIds.length > 0) {
            const { data } = await supabase
                .from('customers')
                .select('id, user_id, full_name, phone, email, city')
                .in('id', customerIds);
            customersByid = data || [];
        }

        // Build customer_id → info map
        const custIdMap = new Map<string, any>();
        customersByid.forEach((c: any) => custIdMap.set(c.id, c));

        // Process sales
        (salesRaw || []).forEach((s: any) => {
            const amount = Number(s.total_amount || 0);
            const custInfo = s.customer_id ? custIdMap.get(s.customer_id) : null;

            // If sale has a user_id matching a known customer
            if (s.user_id && map.has(s.user_id)) {
                map.get(s.user_id)!.totalSpent += amount;
                return;
            }

            // Use customer_id resolved info
            const key = (custInfo?.user_id) || (s.customer_id ? `cid-${s.customer_id}` : null) || (s.user_id ? `uid-${s.user_id}` : null);
            if (!key) return;

            const name = custInfo?.full_name || 'Walk-in Customer';
            const email = custInfo?.email || '';
            const phone = custInfo?.phone || null;

            upsert(key, name, email, phone, amount, s.created_at);
        });

        const customers = Array.from(map.values())
            .sort((a, b) => b.bookings - a.bookings || b.totalSpent - a.totalSpent);

        return NextResponse.json({
            customers,
            _debug: {
                apptCount: (appts || []).length,
                apptError: apptErr?.message || null,
                salesCount: (salesRaw || []).length,
                salesError: salesErr?.message || null,
                salesColumns: salesRaw?.[0] ? Object.keys(salesRaw[0]) : [],
                customersTableCount: (customersTable || []).length,
                usingServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            }
        });
    } catch (e: any) {
        console.error('API /api/customers error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
