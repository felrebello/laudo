// Tipos gerados para o schema do Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      units: {
        Row: {
          id: string
          name: string
          price_2d: number
          price_3d_total: number
          price_3d_partial: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price_2d?: number
          price_3d_total?: number
          price_3d_partial?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_2d?: number
          price_3d_total?: number
          price_3d_partial?: number
          created_at?: string
          updated_at?: string
        }
      }
      app_config: {
        Row: {
          id: string
          competency: string
          bank_data: string
          pix_key: string
          logo_url: string
          observations: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competency?: string
          bank_data?: string
          pix_key?: string
          logo_url?: string
          observations?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competency?: string
          bank_data?: string
          pix_key?: string
          logo_url?: string
          observations?: string
          created_at?: string
          updated_at?: string
        }
      }
      clinic_specialist_prices: {
        Row: {
          id: string
          clinic_name: string
          specialist_name: string
          price_2d: number
          price_3d_total: number
          price_3d_partial: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_name: string
          specialist_name: string
          price_2d?: number
          price_3d_total?: number
          price_3d_partial?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_name?: string
          specialist_name?: string
          price_2d?: number
          price_3d_total?: number
          price_3d_partial?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Tipos de conveniência para uso na aplicação
export type Unit = Database['public']['Tables']['units']['Row'];
export type AppConfig = Database['public']['Tables']['app_config']['Row'];
export type ClinicSpecialistPrice = Database['public']['Tables']['clinic_specialist_prices']['Row'];
