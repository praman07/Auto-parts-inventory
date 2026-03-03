-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    working_hours TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_whatsapp TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    about_text TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- Allow admins to update
CREATE POLICY "Allow admins to update settings"
ON public.settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial data
INSERT INTO public.settings (
    address, 
    working_hours, 
    contact_phone, 
    contact_whatsapp, 
    contact_email, 
    about_text
) VALUES (
    'Main Bazaar Road, Bhogal, Jangpura, New Delhi — 110014',
    'Mon — Sat: 9:00 AM — 7:00 PM | Sunday: Closed',
    '+91 87270 61407',
    '918727061407',
    'support@bhogalmoto.com',
    'Your trusted workshop for motorcycle spare parts and professional servicing. Quality parts, expert mechanics.'
) ON CONFLICT DO NOTHING;
