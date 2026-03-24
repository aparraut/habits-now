export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          username: string | null
          idioma: 'es' | 'en' | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          idioma?: 'es' | 'en' | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          idioma?: 'es' | 'en' | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
      habitos: {
        Row: {
          id: string
          usuario_id: string
          nombre: string
          icono: string | null
          frecuencia: Json | null
          creado_en: string | null
        }
        Insert: {
          id?: string
          usuario_id: string
          nombre: string
          icono?: string | null
          frecuencia?: Json | null
          creado_en?: string | null
        }
        Update: {
          id?: string
          usuario_id?: string
          nombre?: string
          icono?: string | null
          frecuencia?: Json | null
          creado_en?: string | null
        }
      }
      registros_diarios: {
        Row: {
          id: string
          habito_id: string
          usuario_id: string
          fecha: string | null
          puntuacion: number | null
          nota_diario: string | null
        }
        Insert: {
          id?: string
          habito_id: string
          usuario_id: string
          fecha?: string | null
          puntuacion?: number | null
          nota_diario?: string | null
        }
        Update: {
          id?: string
          habito_id?: string
          usuario_id?: string
          fecha?: string | null
          puntuacion?: number | null
          nota_diario?: string | null
        }
      }
    }
  }
}
