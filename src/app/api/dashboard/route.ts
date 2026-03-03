
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()

        // 1) Today's sales (with details)
        const { data: todaySalesData, error: sErr } = await supabase
            .from("sales")
            .select("id, total_amount, created_at")
            .gte("created_at", todayStart)

        if (sErr) throw sErr;

        const todaySales = (todaySalesData || []).reduce((s, r) => s + Number(r.total_amount), 0)

        // Hourly breakdown
        const hourlyMap: Record<string, number> = {}
        for (let i = 0; i < 24; i++) hourlyMap[`${i}:00`] = 0
        for (const s of todaySalesData || []) {
            const hour = new Date(s.created_at).getHours()
            hourlyMap[`${hour}:00`] += Number(s.total_amount)
        }
        const hourlySales = Object.entries(hourlyMap).map(([hour, total]) => ({ hour, total }))

        // All recent sales for today
        const allSales = (todaySalesData || []).map(s => ({
            id: s.id,
            total: Number(s.total_amount),
            date: s.created_at
        })).sort((a, b) => b.date.localeCompare(a.date))

        // 2) Yesterday's sales (for trend)
        const { data: yesterdaySalesData } = await supabase
            .from("sales")
            .select("total_amount")
            .gte("created_at", yesterdayStart)
            .lt("created_at", todayStart)

        const yesterdaySales = (yesterdaySalesData || []).reduce((s, r) => s + Number(r.total_amount), 0)

        // 3) Monthly revenue
        const { data: monthSalesData } = await supabase
            .from("sales")
            .select("total_amount")
            .gte("created_at", monthStart)

        const monthRevenue = (monthSalesData || []).reduce((s, r) => s + Number(r.total_amount), 0)

        // 4) Inventory value + Category breakdown
        const { data: productsData } = await supabase
            .from("products")
            .select("cost_price, selling_price, stock_quantity, low_stock_threshold, name, categories(name)")

        const products = productsData || []
        const inventoryValue = products.reduce((s, p) => s + Number(p.cost_price) * Number(p.stock_quantity), 0)
        const totalSKUs = products.length

        const catMap: Record<string, { count: number; value: number }> = {}
        for (const p of products) {
            const catName = (p as any).categories?.name || "Uncategorized"
            if (!catMap[catName]) catMap[catName] = { count: 0, value: 0 }
            catMap[catName].count++
            catMap[catName].value += Number(p.selling_price) * Number(p.stock_quantity)
        }
        const inventoryByCategory = Object.entries(catMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.value - a.value)

        // 5) Low stock count + items
        const lowStockProducts = products.filter(
            (p) => Number(p.stock_quantity) <= Number(p.low_stock_threshold) && Number(p.stock_quantity) > 0
        )
        const lowStockCount = lowStockProducts.length
        const lowStockItems = lowStockProducts.slice(0, 5).map((p) => ({
            name: p.name,
            qty: Number(p.stock_quantity),
        }))

        // 6) Fast-moving items
        const { data: saleItemsData } = await supabase
            .from("sale_items")
            .select("product_id, quantity, subtotal")

        const productSales: Record<string, { qty: number; revenue: number }> = {}
        for (const si of saleItemsData || []) {
            if (!productSales[si.product_id]) productSales[si.product_id] = { qty: 0, revenue: 0 }
            productSales[si.product_id].qty += Number(si.quantity)
            productSales[si.product_id].revenue += Number(si.subtotal)
        }

        const { data: allProducts } = await supabase
            .from("products")
            .select("id, name")

        const productMap: Record<string, string> = {}
        for (const p of allProducts || []) productMap[p.id] = p.name

        const fastMovers = Object.entries(productSales)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 10)
            .map(([pid, data]) => ({
                name: productMap[pid] || "Unknown",
                detail: `${data.qty} sold`,
                value: `₹${data.revenue.toLocaleString("en-IN")}`,
            }))

        // 7) Dead stock
        const soldProductIds = new Set(Object.keys(productSales))
        const deadStockItems = (allProducts || [])
            .filter((p) => !soldProductIds.has(p.id))
            .slice(0, 10)
            .map((p) => {
                const prod = products.find((pr) => pr.name === p.name)
                const val = prod ? Number(prod.cost_price) * Number(prod.stock_quantity) : 0
                return {
                    name: p.name,
                    detail: "No sales recorded",
                    value: `₹${val.toLocaleString("en-IN")}`,
                }
            })

        // 8) Monthly activity for current year
        const { data: yearSalesData } = await supabase
            .from("sales")
            .select("total_amount, created_at")
            .gte("created_at", yearStart)

        const monthActivityMap: Record<string, { count: number; revenue: number }> = {}
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        months.forEach(m => monthActivityMap[m] = { count: 0, revenue: 0 })

        for (const s of yearSalesData || []) {
            const monthIndex = new Date(s.created_at).getMonth()
            const monthName = months[monthIndex]
            monthActivityMap[monthName].count++
            monthActivityMap[monthName].revenue += Number(s.total_amount)
        }
        const monthlyActivity = Object.entries(monthActivityMap).map(([month, data]) => ({ month, ...data }))

        // 9) Daily sales count for Heatmap
        const salesCountMap: Record<string, number> = {}
        for (const s of yearSalesData || []) {
            const key = s.created_at.slice(0, 10)
            salesCountMap[key] = (salesCountMap[key] || 0) + 1
        }
        const dailySalesMap = Object.entries(salesCountMap).map(([date, count]) => ({ date, count }))

        // 10) Daily sales amount for 30-day chart
        const { data: last30Sales } = await supabase
            .from("sales")
            .select("total_amount, created_at")
            .gte("created_at", thirtyDaysAgo)

        const dailyMap: Record<string, number> = {}
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            dailyMap[key] = 0
        }
        for (const s of last30Sales || []) {
            const key = s.created_at.slice(0, 10)
            if (dailyMap[key] !== undefined) dailyMap[key] += Number(s.total_amount)
        }
        const dailySales = Object.values(dailyMap)

        return NextResponse.json({
            data: {
                todaySales,
                yesterdaySales,
                monthRevenue,
                inventoryValue,
                totalSKUs,
                lowStockCount,
                fastMovers,
                deadStock: deadStockItems,
                lowStockItems,
                dailySales,
                dailySalesMap,
                hourlySales,
                inventoryByCategory,
                monthlyActivity,
                allSales
            }
        });
    } catch (e: any) {
        console.error("API /api/dashboard Fetch Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 502 });
    }
}
