import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Flame, Trophy, TrendingUp, Calendar, BarChart3, Clock, BarChart } from 'lucide-react';
import Link from 'next/link';
import RangeSelector from './RangeSelector';

export const metadata = {
  title: 'Progreso - Habits Now',
};

interface PageProps {
  searchParams: Promise<{ rango?: string; habito?: string }>;
}

import StatsDashboardClient from './StatsDashboardClient';

import DashboardFilters from './DashboardFilters';

export default async function ProgresoPage({ searchParams }: PageProps) {
  const { rango, habito } = await searchParams;
  const currentRange = rango || 'mes';
  const currentHabitId = habito || 'todas';

  return (
    <main className="p-4 max-w-4xl mx-auto min-h-screen pb-24">
      <header className="mb-8 mt-4 px-2">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground">Metricas y patrones</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Dashboard de Análisis</p>
          </div>
          <div className="bg-charcoal px-3 py-1.5 rounded-xl border border-background shadow-sm">
            <TrendingUp className="w-5 h-5 text-neon-green" />
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="h-10 bg-charcoal rounded-2xl animate-pulse mb-8" />}>
        <FiltersWrapper />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsDashboard range={currentRange} selectedHabitId={currentHabitId} />
      </Suspense>
    </main>
  );
}

async function FiltersWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: habits } = await supabase.from('habitos').select('id, nombre').eq('usuario_id', user.id).eq('activo', true);
  return <DashboardFilters habits={habits || []} />;
}

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-charcoal rounded-2xl border border-background shadow-sm"></div>)}
      </div>
      <div className="h-64 bg-charcoal rounded-2xl border border-background shadow-sm"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-56 bg-charcoal rounded-2xl border border-background"></div>
        <div className="h-56 bg-charcoal rounded-2xl border border-background"></div>
      </div>
    </div>
  );
}

async function StatsDashboard({ range, selectedHabitId }: { range: string, selectedHabitId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-gray-400 text-center mt-20">Inicia sesión para analizar tu progreso.</p>;
  }

  // Fetch logs based on range
  const today = new Date();
  let daysToFetch = 30;
  if (range === 'semana') daysToFetch = 7;
  if (range === 'año') daysToFetch = 365;
  if (range === 'todo') daysToFetch = 730; 

  const startTime = new Date();
  startTime.setDate(today.getDate() - daysToFetch);
  const startDateStr = startTime.toISOString().split('T')[0];

  const { data: habitos } = await supabase.from('habitos').select('id, nombre, icono').eq('usuario_id', user.id);
  const { data: logs } = await supabase
    .from('registros_diarios')
    .select('fecha, habito_id, puntuacion')
    .eq('usuario_id', user.id)
    .gte('fecha', startDateStr);

  const habits = (habitos || []) as any[];
  const rawLogs = (logs || []) as any[];

  if (habits.length === 0) {
    return (
      <div className="text-center mt-24">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">No hay datos suficientes</p>
        <Link href="/habitos/nuevo" className="p-4 bg-charcoal border border-background rounded-2xl text-neon-green font-bold inline-block hover:scale-110 transition-transform shadow-lg">
          Crea tu primer hábito
        </Link>
      </div>
    );
  }

  // Pre-process dates to ensure they are valid for the client
  const validLogs = rawLogs.map(l => ({
    fecha: l.fecha!,
    habito_id: l.habito_id,
    puntuacion: l.puntuacion || 1
  }));

  return (
    <StatsDashboardClient 
      logs={validLogs} 
      habits={habits}
      range={range}
      selectedHabitId={selectedHabitId}
    />
  );
}
