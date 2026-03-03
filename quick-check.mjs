
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim()
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()

if (!url || !key) {
    console.error('Missing URL or Key in .env.local')
    process.exit(1)
}

const supabase = createClient(url, key)

async function runCheck() {
    console.log('--- DB Connectivity Check ---')
    console.log('URL:', url)

    // Check tables presence
    const tables = ['shops', 'products', 'appointments', 'categories']
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (error) {
            console.log(`Table [${table}]: ERROR - ${error.code} (${error.message})`)
        } else {
            console.log(`Table [${table}]: OK - Found ${count} records`)
        }
    }
}

runCheck()
