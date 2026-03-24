import { db } from './local';
import { createClient } from '../supabase/client';

export async function processSyncQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const supabase = createClient();
  const ops = await db.syncQueue.orderBy('createdAt').toArray();

  if (ops.length === 0) return;

  for (const op of ops) {
    try {
      const table = supabase.from(op.table as "habitos");
      if (op.action === 'insert') {
        // @ts-expect-error
        const { error } = await table.insert(op.data);
        if (error) console.error('Sync insert error:', error);
      } else if (op.action === 'update') {
        // @ts-expect-error
        const { error } = await table.update(op.data).eq('id', op.recordId);
        if (error) console.error('Sync update error:', error);
      } else if (op.action === 'delete') {
        const { error } = await table.delete().eq('id', op.recordId);
        if (error) console.error('Sync delete error:', error);
      }
      
      // Remove from queue after attempting sync
      if (op.id) await db.syncQueue.delete(op.id);
    } catch (e) {
      console.error('Failed to process sync operation', e);
    }
  }
}

export function setupSyncListeners() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('App is online, processing sync queue...');
      processSyncQueue();
    });
  }
}
