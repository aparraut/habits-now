import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Flame, Trophy, TrendingUp, Calendar, BarChart3, Clock, BarChart } from 'lucide-react';
import Link from 'next/link';
import RangeSelector from './RangeSelector';

export const metadata = {
  title: 'Progreso - Habits Now',
};

interface PageProps {
  searchParams: Promise<{ rango?: string }>;
}

export default async function ProgresoPage({ searchParams }: PageProps) {
  const { rango } = await searchParams;
  const currentRange = rango || 'mes';

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Progreso</h1>
        <p className="text-sm text-gray-400 mt-1">Explora tus resultados e insights</p>
      </header>

      <RangeSelector />

      <Suspense fallback={<StatsSkeleton />}>
        <StatsDashboard range={currentRange} />
      </Suspense>
    </main>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-4">
      {/* Cards de resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-charcoal rounded-2xl border border-background"></div>
        <div className="h-28 bg-charcoal rounded-2xl border border-background"></div>
      </div>
      {/* Heatmap */}
      <div className="h-48 bg-charcoal rounded-2xl border border-background"></div>
      {/* Star Habit */}
      <div className="h-32 bg-charcoal rounded-2xl border border-background"></div>
      {/* Pattern Chart */}
      <div className="h-56 bg-charcoal rounded-2xl border border-background"></div>
    </div>
  );
}

async function StatsDashboard({ range }: { range: string }) {
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
  if (range === 'todo') daysToFetch = 730; // Limitamos a 2 años para mantener el rendimiento por ahora

  const startTime = new Date();
  startTime.setDate(today.getDate() - daysToFetch);
  const startDateStr = startTime.toISOString().split('T')[0];

  const { data: habitos } = await supabase.from('habitos').select('id, nombre, icono').eq('usuario_id', user.id);
  const { data: logs } = await supabase
    .from('registros_diarios')
    .select('fecha, habito_id, puntuacion')
    .eq('usuario_id', user.id)
    .gte('fecha', startDateStr);

  interface HabitRow { id: string; nombre: string; icono: string | null; }
  interface LogRow { fecha: string | null; habito_id: string; puntuacion: number | null; }

  const habits = (habitos as unknown as HabitRow[]) || [];
  const validLogs = ((logs as unknown as LogRow[]) || []).filter(l => l.puntuacion && l.puntuacion > 0);

  if (habits.length === 0) {
    return (
      <div className="text-center mt-24">
        <p className="text-gray-400">No hay información de progreso disponible.</p>
        <Link href="/habitos/nuevo" className="text-neon-green font-bold mt-4 inline-block hover:text-white transition-colors">
          Crea tu primer hábito para empezar a medir
        </Link>
      </div>
    );
  }

  // 1. Calculate Activity Heatmap (Last 30 days mapped to an array)
  const activityMap = new Map<string, number>();
  validLogs.forEach((log: any) => {
      const date = log.fecha;
      if (date) {
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      }
  });

  const last30Days = [];
  // i=0 is today
  const iterations = Math.min(daysToFetch, 30); // Solo mostramos los últimos 30 en el mini-heatmap para no romper el grid
  for (let i = iterations - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last30Days.push({
          date: dateStr,
          dayNum: d.getDate(),
          count: activityMap.get(dateStr) || 0
      });
  }

  // 2. Patrón Semanal: ¿Qué día de la semana es más fuerte?
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // 0=Domingo
  const weekPatternMap = new Map<number, number>();
  validLogs.forEach((log: any) => {
    const d = new Date(log.fecha + 'T12:00:00'); // Evitar problemas de TZ
    const day = d.getDay();
    weekPatternMap.set(day, (weekPatternMap.get(day) || 0) + 1);
  });

  const weekNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const maxWeeklyCount = Math.max(...weekNames.map((_, i) => weekPatternMap.get(i) || 0), 1);
  const bestDayIndex = weekNames.reduce((best, _, i) => 
    (weekPatternMap.get(i) || 0) > (weekPatternMap.get(best) || 0) ? i : best, 1);

  // 3. Current Streak (Calculado siempre sobre los últimos 30 días para consistencia)
  let currentStreak = 0;
  for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      
      if (count > 0) {
          currentStreak++;
      } else if (i > 0) { 
          break;
      }
  }

  // 3. Find Most Consistent Habit with tie-breaker
  const habitStats = new Map<string, { count: number, totalPoints: number }>();
  validLogs.forEach((log: any) => {
      if (log.habito_id) {
          const s = habitStats.get(log.habito_id) || { count: 0, totalPoints: 0 };
          s.count++;
          s.totalPoints += (log.puntuacion || 0);
          habitStats.set(log.habito_id, s);
      }
  });

  let topHabitId = '';
  let maxWeight = -1;
  let finalMaxCount = 0;
  
  habitStats.forEach((stats, id) => {
      // Priorizamos días logrados (count), y si empatan, desempatamos por puntos totales logrados.
      const weight = (stats.count * 100) + stats.totalPoints;
      if (weight > maxWeight) {
          maxWeight = weight;
          topHabitId = id;
          finalMaxCount = stats.count;
      }
  });

  const topHabit = habits.find((h: any) => h.id === topHabitId);
  const maxCount = finalMaxCount; // Para mostrar en la UI
  const monthlyCompletionRate = validLogs.length > 0 ? Math.round((validLogs.length / (habits.length * daysToFetch)) * 100) : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Resumen Rápido (Top Cards) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-charcoal p-5 rounded-2xl border border-background shadow-lg flex flex-col justify-center hover:border-orange-500/50 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-xs sm:text-sm font-medium">Racha Actual</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {currentStreak} <span className="text-lg font-normal text-gray-500">días</span>
          </p>
        </div>

        <div className="bg-charcoal p-5 rounded-2xl border border-background shadow-lg flex flex-col justify-center hover:border-neon-green/50 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 text-neon-green" />
            <span className="text-xs sm:text-sm font-medium">Cumplimiento</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {Math.min(monthlyCompletionRate, 100)}<span className="text-lg font-normal text-gray-500">%</span>
          </p>
        </div>
      </div>

      {/* Heatmap del mes */}
      <div className="bg-charcoal p-5 rounded-2xl border border-background shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-electric-blue" />
            <h2 className="font-semibold">{range === 'semana' ? 'Últimos 7 días' : range === 'año' ? 'Último Año' : 'Últimos 30 días'}</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-background rounded-md text-gray-400 border border-background uppercase tracking-wider">
            {validLogs.length} logs
          </span>
        </div>
        
        <div className={`grid ${range === 'semana' ? 'grid-cols-7' : 'grid-cols-7'} gap-2 sm:gap-3`}>
          {(range === 'semana' ? last30Days.slice(-7) : last30Days).map((day) => {
            // Determine density color
            let bgColor = 'bg-background border border-background text-gray-600'; // Vacuum state (0)
            if (day.count > 0) bgColor = 'bg-neon-green/20 border border-neon-green/30 text-neon-green/70'; // Low intensity
            if (day.count >= 2) bgColor = 'bg-neon-green/50 border border-neon-green/60 text-charcoal font-bold'; // Mid intensity
            if (day.count >= 4) bgColor = 'bg-neon-green border border-neon-green text-background font-bold shadow-[0_0_10px_rgba(57,255,20,0.4)]'; // High intensity

            return (
              <div 
                key={day.date} 
                className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all hover:scale-125 cursor-default ${bgColor}`}
                title={`${day.date}: ${day.count} hábitos`}
              >
                {day.dayNum}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-500">
          <span>Menos</span>
          <div className="w-3 h-3 rounded-sm bg-background border border-background"></div>
          <div className="w-3 h-3 rounded-sm bg-neon-green/20 border border-neon-green/30"></div>
          <div className="w-3 h-3 rounded-sm bg-neon-green/50 border border-neon-green/60"></div>
          <div className="w-3 h-3 rounded-sm bg-neon-green shadow-[0_0_5px_rgba(57,255,20,0.5)]"></div>
          <span>Más</span>
        </div>
      </div>

      {/* Hábito Estrella */}
      <div className="bg-gradient-to-br from-charcoal to-background p-5 rounded-2xl border border-background shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-24 h-24 text-yellow-400" />
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 mb-4 relative z-10">
          <Trophy className="w-5 h-5 text-yellow-500 shadow-yellow-500/50 drop-shadow-md" />
          <span className="text-sm font-medium uppercase tracking-wider">Hábito Estrella ({range})</span>
        </div>

        {topHabit ? (
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center text-3xl shadow-inner border border-background/50 group-hover:scale-110 transition-transform">
                {topHabit.icono || '💎'}
              </div>
              <div>
                <p className="font-black text-2xl text-foreground leading-tight">{topHabit.nombre}</p>
                <p className="text-sm font-bold text-electric-blue mt-1 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {maxCount} días logrados
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic relative z-10 px-2 py-4 text-center border border-dashed border-background rounded-xl">
            Aún no hay suficientes datos para encontrar a tu estrella. ¡Sigue rompiéndola!
          </p>
        )}
      </div>

      {/* Patrón Semanal (Most Effective Day) */}
      <div className="bg-charcoal p-6 rounded-2xl border border-background shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart3 className="w-5 h-5 text-neon-green" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Día Más Efectivo</h2>
          </div>
          <span className="text-neon-green font-black text-lg underline decoration-2 underline-offset-4">
            {weekNames[bestDayIndex]}
          </span>
        </div>
        
        <div className="flex items-end justify-between h-40 gap-2 sm:gap-4 px-2">
          {weekNames.map((name, i) => {
            const count = weekPatternMap.get(i) || 0;
            const height = (count / maxWeeklyCount) * 100;
            const isBest = i === bestDayIndex;
            
            return (
              <div key={name} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full relative h-[120px] flex items-end">
                  <div 
                    style={{ height: `${Math.max(height, 5)}%` }}
                    className={`w-full max-w-[24px] mx-auto rounded-t-md transition-all duration-700 delay-${i * 100} ${
                      isBest 
                        ? 'bg-neon-green shadow-[0_0_20px_rgba(57,255,20,0.3)]' 
                        : 'bg-background opacity-40'
                    }`}
                  ></div>
                </div>
                <span className={`text-[10px] font-black tracking-tighter uppercase ${isBest ? 'text-neon-green' : 'text-gray-500'}`}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
