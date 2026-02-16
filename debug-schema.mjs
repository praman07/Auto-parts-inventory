import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkData() {
    console.log('--- Database Check ---')

    // 1. Check Shops
    const { data: shops, error: shopError } = await supabase.from('shops').select('*')
    if (shopError) {
        console.error('Error fetching shops:', shopError)
    } else {
        console.log(`Shops found: ${shops.length}`)
        if (shops.length > 0) {
            console.log('Sample Shop ID:', shops[0].id)
        }
    }

    // 2. Check Suppliers
    const { data: supps, error: suppError } = await supabase.from('suppliers').select('*').limit(1)
    if (suppError) {
        console.error('Error fetching suppliers:', suppError)
    } else {
        console.log(`Suppliers count check: ${supps.length === 0 ? 'Empty' : 'Contains data'}`)
    }

    // 3. Check Products (for fallback shop_id)
    const { data: prods, error: prodError } = await supabase.from('products').select('shop_id').limit(1)
    if (prodError) {
        console.error('Error fetching products:', prodError)
    } else if (prods.length > 0) {
        console.log('Shop ID found in products table:', prods[0].shop_id)
    }

    console.log('--- End of Check ---')
}

checkData()
