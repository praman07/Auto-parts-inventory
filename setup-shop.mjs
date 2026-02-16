import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function setupDefaultShop() {
    console.log('Checking for shops...')
    const { data: shops } = await supabase.from('shops').select('id')

    if (shops && shops.length === 0) {
        console.log('No shops found. Creating a default shop...')
        const { data: newShop, error } = await supabase.from('shops').insert({
            name: 'Bhogal Auto Service',
            currency_symbol: '₹'
        }).select().single()

        if (error) {
            console.error('Error creating shop:', error)
        } else {
            console.log('Successfully created default shop:', newShop.id)
        }
    } else {
        console.log('Shop already exists.')
    }
}

setupDefaultShop()
