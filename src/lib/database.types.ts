// Hand-written types matching supabase/schema.sql
// Regenerate with `supabase gen types typescript` if schema changes

export type Database = {
    public: {
        Tables: {
            shops: {
                Row: {
                    id: string
                    name: string
                    currency_symbol: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    currency_symbol?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    currency_symbol?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    shop_id: string | null
                    full_name: string | null
                    role: "owner" | "staff"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    shop_id?: string | null
                    full_name?: string | null
                    role?: "owner" | "staff"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string | null
                    full_name?: string | null
                    role?: "owner" | "staff"
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    shop_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    name?: string
                    created_at?: string
                }
            }
            subcategories: {
                Row: {
                    id: string
                    shop_id: string
                    category_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    category_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    category_id?: string
                    name?: string
                    created_at?: string
                }
            }
            suppliers: {
                Row: {
                    id: string
                    shop_id: string
                    name: string
                    contact_person: string | null
                    phone: string | null
                    email: string | null
                    address: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    name: string
                    contact_person?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    name?: string
                    contact_person?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    shop_id: string
                    name: string
                    description: string | null
                    category_id: string | null
                    subcategory_id: string | null
                    supplier_id: string | null
                    sku: string | null
                    cost_price: number
                    selling_price: number
                    stock_quantity: number
                    low_stock_threshold: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    name: string
                    description?: string | null
                    category_id?: string | null
                    subcategory_id?: string | null
                    supplier_id?: string | null
                    sku?: string | null
                    cost_price?: number
                    selling_price?: number
                    stock_quantity?: number
                    low_stock_threshold?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    name?: string
                    description?: string | null
                    category_id?: string | null
                    subcategory_id?: string | null
                    supplier_id?: string | null
                    sku?: string | null
                    cost_price?: number
                    selling_price?: number
                    stock_quantity?: number
                    low_stock_threshold?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            sales: {
                Row: {
                    id: string
                    shop_id: string
                    user_id: string | null
                    total_amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    user_id?: string | null
                    total_amount: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    user_id?: string | null
                    total_amount?: number
                    created_at?: string
                }
            }
            sale_items: {
                Row: {
                    id: string
                    sale_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    sale_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    sale_id?: string
                    product_id?: string
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
                    created_at?: string
                }
            }
            stock_movements: {
                Row: {
                    id: string
                    shop_id: string
                    product_id: string
                    type: "purchase" | "sale" | "adjustment" | "return" | "initial"
                    quantity: number
                    reference_id: string | null
                    notes: string | null
                    user_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    product_id: string
                    type: "purchase" | "sale" | "adjustment" | "return" | "initial"
                    quantity: number
                    reference_id?: string | null
                    notes?: string | null
                    user_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    product_id?: string
                    type?: "purchase" | "sale" | "adjustment" | "return" | "initial"
                    quantity?: number
                    reference_id?: string | null
                    notes?: string | null
                    user_id?: string | null
                    created_at?: string
                }
            }
            daily_records: {
                Row: {
                    id: string
                    shop_id: string
                    date: string
                    total_sales: number
                    total_profit: number
                    cash_in_hand: number | null
                    status: string
                    closed_at: string | null
                    closed_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    date?: string
                    total_sales?: number
                    total_profit?: number
                    cash_in_hand?: number | null
                    status?: string
                    closed_at?: string | null
                    closed_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    date?: string
                    total_sales?: number
                    total_profit?: number
                    cash_in_hand?: number | null
                    status?: string
                    closed_at?: string | null
                    closed_by?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Convenience aliases
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Sale = Database["public"]["Tables"]["sales"]["Row"]
export type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"]
export type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"]
export type SaleItemInsert = Database["public"]["Tables"]["sale_items"]["Insert"]
export type StockMovement = Database["public"]["Tables"]["stock_movements"]["Row"]
export type StockMovementInsert = Database["public"]["Tables"]["stock_movements"]["Insert"]
export type DailyRecord = Database["public"]["Tables"]["daily_records"]["Row"]
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]
