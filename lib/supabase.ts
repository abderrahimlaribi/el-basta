import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          tracking_id: string
          items: OrderItem[]
          delivery_address: string
          total_price: number
          status: "En préparation" | "En cours de livraison" | "Livré" | "Annulé"
          estimated_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_id: string
          items: OrderItem[]
          delivery_address: string
          total_price: number
          status?: "En préparation" | "En cours de livraison" | "Livré" | "Annulé"
          estimated_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_id?: string
          items?: OrderItem[]
          delivery_address?: string
          total_price?: number
          status?: "En préparation" | "En cours de livraison" | "Livré" | "Annulé"
          estimated_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
}

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]
