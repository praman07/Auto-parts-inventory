
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim()
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()

if (!url || !key) {
    console.error('Supabase config missing in .env.local')
    process.exit(1)
}

const supabase = createClient(url, key)

async function testFetch() {
    console.log('--- DB Connection Test ---')
    console.log('Testing connection to:', url)

    try {
        const { data, error } = await supabase.from('shops').select('id').limit(1)
        if (error) {
            console.error('Fetch ERROR:', error)
            if (error.message.includes('permission denied')) {
                console.log('HINT: Check RLS policies.')
            }
        } else {
            console.log('Fetch SUCCESS! Data received:', data)
        }
    } catch (e) {
        console.error('UNEXPECTED CATCH:', e)
        if (e.message.includes('fetch failed')) {
            console.log('HINT: Your Supabase project might be paused or unreachable.')
        }
    }
}

testFetch()
