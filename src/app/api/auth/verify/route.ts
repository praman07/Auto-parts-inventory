import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        const { data, error } = await supabase.from('settings').select('admin_password').limit(1).single();

        let validPassword = 'admin123'; // Fallback if DB fails early on

        if (error) {
            console.error('Failed to fetch admin password:', error.message, error.hint || '');
            // If the column doesn't exist yet, we allow the fallback to let them in, but still log the error.
            if (error.code !== '42703' && error.code !== 'PGRST116') {
                return NextResponse.json({ success: false, error: 'Database connection error. Please try again.' }, { status: 500 });
            }
        } else if (data && data.admin_password) {
            validPassword = data.admin_password;
        }

        // Compare the provided password
        if (validPassword === password) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
        }
    } catch (e: any) {
        console.error('API /api/auth/verify Unexpected Error:', e);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
