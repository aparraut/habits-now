import HabitCard from "@/components/habits/HabitCard";
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';

export const unstable_instant = { 
  prefetch: 'static',
  samples: [
    { headers: [ ["x-next-locale", "es"] ] }
  ]
};

export default async function Home() {
  return (
    <main className="p-4 max-w-md mx-auto min-h-screen">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Hoy</h1>
        <p className="text-sm text-gray-400">¿Cómo van tus hábitos?</p>
      </header>

      <Suspense fallback={<p className="text-gray-400 text-center mt-10">Cargando hábitos...</p>}>
        <HabitsList />
      </Suspense>
    </main>
  );
}

async function HabitsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: habitosResp } = await supabase.from('habitos').select('*').eq('usuario_id', user.id);
  
  const today = new Date().toISOString().split('T')[0];
  const { data: logsResp } = await supabase
    .from('registros_diarios')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('fecha', today);

  const habits = (habitosResp as any[]) || [];
  const logs = (logsResp as any[]) || [];

  if (habits.length === 0) {
    return <p className="text-gray-400 text-center mt-10">No tienes hábitos aún. Añade uno para comenzar.</p>;
  }
  
  return (
    <section className="space-y-4">
      {habits.map(habit => {
        const todayLog = logs?.find(log => log.habito_id === habit.id);
        return (
          <HabitCard 
            key={habit.id} 
            id={habit.id} 
            userId={user.id}
            name={habit.nombre} 
            icon={habit.icono} 
            initialScore={todayLog?.puntuacion || null}
            logId={todayLog?.id || null}
          />
        );
      })}
    </section>
  );
}
