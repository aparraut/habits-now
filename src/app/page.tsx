import HabitCard from "@/components/habits/HabitCard";
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';



import DateScroller from "@/components/ui/DateScroller";

interface PageProps {
  searchParams: Promise<{ fecha?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { fecha } = await searchParams;
  const selectedDate = fecha || new Date().toISOString().split('T')[0];

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen relative pb-24">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Habits Now</h1>
        <p className="text-sm text-gray-400">Tu progreso diario</p>
      </header>

      <DateScroller />

      <Suspense key={selectedDate} fallback={
        <div className="flex flex-col items-center justify-center mt-20 space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-t-neon-green border-gray-800 animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium italic">Viajando en el tiempo...</p>
        </div>
      }>
        <HabitsList selectedDate={selectedDate} />
      </Suspense>
    </main>
  );
}

async function HabitsList({ selectedDate }: { selectedDate: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: habitosResp } = await supabase.from('habitos').select('*').eq('usuario_id', user.id);
  const { data: logsResp } = await supabase.from('registros_diarios').select('*').eq('usuario_id', user.id).eq('fecha', selectedDate);
  const { data: ciclosResp } = await supabase.from('ciclos').select('*').eq('usuario_id', user.id);

  interface Habit { id: string; nombre: string; icono: string | null; activo: boolean | null; ciclo_id: string | null; creado_en: string | null; }
  interface Log { id: string; habito_id: string; puntuacion: number | null; }
  interface Ciclo { id: string; fecha_inicio: string; fecha_fin: string; }

  const habits = (habitosResp as unknown as Habit[]) || [];
  const logs = (logsResp as unknown as Log[]) || [];
  const ciclos = (ciclosResp as unknown as Ciclo[]) || [];

  // Filtrar hábitos:
  // 1. Solo si fueron creados antes o el mismo día que estamos viendo
  // 2. Solo si están activos (activo=true) O si tienen un log ese día (aunque ahora estén archivados)
  const activeHabits = habits.filter(habit => {
    // Si tiene log hoy, lo mostramos sí o sí (historia)
    const hasLogToday = logs.some(l => l.habito_id === habit.id);
    if (hasLogToday) return true;

    // Si no tiene log, solo lo mostramos si está activo y en temporada.
    // Ignoramos la fecha de creación "creado_en" porque la importación masiva 
    // puede haber puesto una fecha reciente a hábitos antiguos.
    if (!habit.activo) return false;

    if (!habit.ciclo_id) return true; // Permanente activo
    const ciclo = ciclos.find(c => c.id === habit.ciclo_id);
    if (!ciclo) return true; 
    return selectedDate >= ciclo.fecha_inicio && selectedDate <= ciclo.fecha_fin;
  });

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 space-y-6">
        <div className="w-20 h-20 bg-charcoal rounded-full flex items-center justify-center mb-2">
          <Plus className="w-10 h-10 text-neon-green opacity-50" />
        </div>
        <p className="text-gray-400 text-center font-medium">No tienes hábitos aún.</p>
        <Link 
          href="/habitos/nuevo"
          className="px-6 py-3 bg-charcoal border-2 border-background rounded-xl text-neon-green font-bold hover:border-neon-green hover:bg-opacity-80 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Crear mi primer hábito
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <section className="space-y-4">
        {activeHabits.map(habit => {
          const todayLog = logs.find(log => log.habito_id === habit.id);
          return (
            <HabitCard 
              key={habit.id} 
              id={habit.id} 
              userId={user.id}
              name={habit.nombre} 
              icon={habit.icono} 
              initialScore={todayLog?.puntuacion || null}
              logId={todayLog?.id || null}
              selectedDate={selectedDate}
            />
          );
        })}
      </section>

      <div className="fixed inset-0 pointer-events-none z-40 flex justify-center">
        <div className="w-full max-w-md relative h-full">
          <Link 
            href="/habitos/nuevo" 
            className="absolute bottom-24 right-6 w-14 h-14 bg-neon-green text-background rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:-translate-y-1 transition-transform pointer-events-auto"
          >
            <Plus className="w-8 h-8" />
          </Link>
        </div>
      </div>
    </>
  );
}
