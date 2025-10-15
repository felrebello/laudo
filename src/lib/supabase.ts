// Cliente Supabase configurado para o projeto com modo offline
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente existem
const isOfflineMode = !supabaseUrl || !supabaseAnonKey;

if (isOfflineMode) {
  console.warn('⚠️ Running in offline preview mode: Supabase disabled');
  console.warn('💡 Data will be stored in localStorage instead of database');
}

// Mock do cliente Supabase para modo offline
const createMockSupabaseClient = () => {
  const mockStorage = {
    units: 'laudos_units',
    config: 'laudos_config',
  };

  return {
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          maybeSingle: async () => {
            if (table === 'app_config') {
              const data = localStorage.getItem(mockStorage.config);
              return { data: data ? JSON.parse(data) : null, error: null };
            }
            return { data: null, error: null };
          },
        }),
        order: (column: string) => ({
          then: async (resolve: any) => {
            if (table === 'units') {
              const data = localStorage.getItem(mockStorage.units);
              resolve({ data: data ? JSON.parse(data) : [], error: null });
            } else {
              resolve({ data: [], error: null });
            }
          },
        }),
        then: async (resolve: any) => {
          if (table === 'units') {
            const data = localStorage.getItem(mockStorage.units);
            resolve({ data: data ? JSON.parse(data) : [], error: null });
          } else if (table === 'app_config') {
            const data = localStorage.getItem(mockStorage.config);
            resolve({ data: data ? JSON.parse(data) : null, error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
      }),
      insert: (values: any) => ({
        then: async (resolve: any) => {
          if (table === 'units') {
            const existing = localStorage.getItem(mockStorage.units);
            const units = existing ? JSON.parse(existing) : [];
            const newUnit = Array.isArray(values) ? values[0] : values;
            newUnit.id = newUnit.id || crypto.randomUUID();
            newUnit.created_at = new Date().toISOString();
            newUnit.updated_at = new Date().toISOString();
            units.push(newUnit);
            localStorage.setItem(mockStorage.units, JSON.stringify(units));
            resolve({ data: newUnit, error: null });
          } else {
            resolve({ data: null, error: null });
          }
        },
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            if (table === 'units') {
              const existing = localStorage.getItem(mockStorage.units);
              const units = existing ? JSON.parse(existing) : [];
              const index = units.findIndex((u: any) => u.id === value);
              if (index !== -1) {
                units[index] = { ...units[index], ...values, updated_at: new Date().toISOString() };
                localStorage.setItem(mockStorage.units, JSON.stringify(units));
              }
              resolve({ data: null, error: null });
            } else if (table === 'app_config') {
              const config = { id: value, ...values, updated_at: new Date().toISOString() };
              localStorage.setItem(mockStorage.config, JSON.stringify(config));
              resolve({ data: null, error: null });
            } else {
              resolve({ data: null, error: null });
            }
          },
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            if (table === 'units') {
              const existing = localStorage.getItem(mockStorage.units);
              const units = existing ? JSON.parse(existing) : [];
              const filtered = units.filter((u: any) => u.id !== value);
              localStorage.setItem(mockStorage.units, JSON.stringify(filtered));
              resolve({ data: null, error: null });
            } else {
              resolve({ data: null, error: null });
            }
          },
        }),
      }),
    }),
  } as any;
};

// Criar instância do cliente Supabase ou mock
export const supabase = isOfflineMode
  ? createMockSupabaseClient()
  : createClient<Database>(supabaseUrl, supabaseAnonKey);
