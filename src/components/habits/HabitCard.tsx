'use client';
import { useState, useOptimistic, startTransition } from 'react';
import { Pencil } from 'lucide-react';
import JournalModal from '@/components/habits/JournalModal';
import { db } from '@/lib/db/local';
import { processSyncQueue } from '@/lib/db/sync';

interface HabitCardProps {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  initialScore: number | null;
  logId: string | null;
}

export default function HabitCard({ id, userId, name, icon, initialScore, logId }: HabitCardProps) {
  const [optimisticScore, setOptimisticScore] = useOptimistic<number | null, number>(
    initialScore,
    (state, newScore) => newScore
  );
  const [isJournalOpen, setJournalOpen] = useState(false);

  const handleScore = async (val: number) => {
    startTransition(() => {
      setOptimisticScore(val);
    });

    const today = new Date().toISOString().split('T')[0];
    
    // In local Dexie, we need to handle insert vs update
    const recordId = logId || crypto.randomUUID(); // Fallback random ID if it's a new log
    const data = {
      id: recordId,
      habito_id: id,
      usuario_id: userId,
      fecha: today,
      puntuacion: val,
      nota_diario: null // keeping journal separate for now
    };

    try {
      // 1. Save to Offline Local DB
      await db.registros_diarios.put(data);

      // 2. Queue for Sync
      await db.syncQueue.add({
        table: 'registros_diarios',
        action: logId ? 'update' : 'insert',
        recordId: recordId,
        data: data,
        createdAt: Date.now()
      });

      // 3. Process Sync Queue quietly
      processSyncQueue();
    } catch (err) {
      console.error('Failed to save to local DB:', err);
    }
  };

  return (
    <div className="bg-[#1e293b] p-4 rounded-2xl flex flex-col gap-3 shadow-md border border-[#0f172a]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-xl">
            {icon || '📝'}
          </div>
          <span className="font-semibold text-lg">{name}</span>
        </div>
        <button onClick={() => setJournalOpen(true)} className="p-2 text-gray-400 hover:text-[#00eeff] transition-colors rounded-full hover:bg-[#0f172a]">
          <Pencil className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex justify-between mt-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => handleScore(val)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
              optimisticScore === val 
                ? 'bg-[#39ff14] text-[#0f172a] shadow-[0_0_10px_rgba(57,255,20,0.5)] scale-105' 
                : 'bg-[#0f172a] text-gray-400 hover:bg-gray-700 hover:scale-105'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      <JournalModal isOpen={isJournalOpen} onClose={() => setJournalOpen(false)} habitName={name} habitId={id} />
    </div>
  );
}
