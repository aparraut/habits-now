'use client';
import { useState, useOptimistic, startTransition } from 'react';
import { Pencil, MoreVertical, Edit2, Archive } from 'lucide-react';
import JournalModal from '@/components/habits/JournalModal';
import { db } from '@/lib/db/local';
import { processSyncQueue } from '@/lib/db/sync';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HabitCardProps {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  initialScore: number | null;
  logId: string | null;
  selectedDate?: string;
}

export default function HabitCard({ 
  id, 
  userId, 
  name, 
  icon, 
  initialScore, 
  logId,
  selectedDate = new Date().toISOString().split('T')[0]
}: HabitCardProps) {
  const [optimisticScore, setOptimisticScore] = useOptimistic<number | null, number>(
    initialScore,
    (state, newScore) => newScore
  );
  const [isJournalOpen, setJournalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    if (confirm(`¿Quieres archivar "${name}"? No aparecerá en tu lista diaria, pero podrás reactivarlo desde el Baúl.`)) {
      const supabase = createClient();
      // Resolvemos el error de tipo 'never' forzando el tipo del payload de update
      await supabase.from('habitos').update({ activo: false } as never).eq('id', id);
      router.refresh();
      setIsMenuOpen(false);
    }
  };

  const handleScore = async (val: number) => {
    startTransition(async () => {
      setOptimisticScore(val);

      const targetDate = selectedDate;
      const recordId = logId || crypto.randomUUID();
      const data = {
        id: recordId,
        habito_id: id,
        usuario_id: userId,
        fecha: targetDate,
        puntuacion: val,
        nota_diario: null
      };

      try {
        await db.registros_diarios.put(data);
        await db.syncQueue.add({
          table: 'registros_diarios',
          action: logId ? 'update' : 'insert',
          recordId: recordId,
          data: data,
          createdAt: Date.now()
        });

        processSyncQueue();
        router.refresh();
      } catch (err) {
        console.error('Failed to save to local DB:', err);
      }
    });
  };

  return (
    <div className="bg-charcoal p-4 rounded-2xl flex flex-col gap-3 shadow-md border border-background">
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl">
            {icon || '📝'}
          </div>
          <span className="font-semibold text-lg">{name}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => setJournalOpen(true)} className="p-2 text-gray-400 hover:text-electric-blue transition-colors rounded-full hover:bg-background">
            <Pencil className="w-5 h-5" />
          </button>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:text-foreground transition-colors rounded-full hover:bg-background">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-[#0f172a] rounded-xl shadow-xl border border-[#334155] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <Link 
              href={`/habitos/${id}/editar`}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-charcoal hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Editar hábito
            </Link>
            <button 
              onClick={handleArchive}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <Archive className="w-4 h-4" />
              Archivar hábito
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => handleScore(val)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
              optimisticScore === val 
                ? 'bg-neon-green text-background shadow-[0_0_10px_rgba(57,255,20,0.5)] scale-105' 
                : 'bg-background text-gray-400 hover:bg-gray-700 hover:scale-105'
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
