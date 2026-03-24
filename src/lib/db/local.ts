import Dexie, { type EntityTable } from 'dexie';
import { Database } from '@/types/supabase';

export type Habito = Database['public']['Tables']['habitos']['Row'];
export type RegistroDiario = Database['public']['Tables']['registros_diarios']['Row'];

export interface SyncOperation {
  id?: number;
  table: 'habitos' | 'registros_diarios';
  action: 'insert' | 'update' | 'delete';
  recordId: string;
  data: Record<string, unknown>;
  createdAt: number;
}

const db = new Dexie('HabitsNowLocal') as Dexie & {
  habitos: EntityTable<Habito, 'id'>;
  registros_diarios: EntityTable<RegistroDiario, 'id'>;
  syncQueue: EntityTable<SyncOperation, 'id'>;
};

db.version(1).stores({
  habitos: 'id, usuario_id, nombre',
  registros_diarios: 'id, habito_id, usuario_id, fecha',
  syncQueue: '++id, table, action, createdAt'
});

export { db };
