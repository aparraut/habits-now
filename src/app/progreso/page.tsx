import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Progreso - Habits Now',
};

export default async function ProgresoPage() {
  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Progreso</h1>
        <p className="text-sm text-gray-400 mt-1">Tus estadísticas de los últimos 30 días</p>
      </header>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsDashboard />
      </Suspense>
    </main>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-[#1e293b] rounded-2xl border border-[#334155]"></div>
        <div className="h-28 bg-[#1e293b] rounded-2xl border border-[#334155]"></div>
      </div>
      <div className="h-64 bg-[#1e293b] rounded-2xl border border-[#334155]"></div>
      <div className="h-24 bg-[#1e293b] rounded-2xl border border-[#334155]"></div>
    </div>
  );
}

async function StatsDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-gray-400 text-center mt-20">Inicia sesión para analizar tu progreso.</p>;
  }

  // Fetch last 30 days of logs
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: habitos } = await (supabase.from('habitos') as any).select('id, nombre, icono').eq('usuario_id', user.id);
  const { data: logs } = await (supabase.from('registros_diarios') as any)
    .select('fecha, habito_id, puntuacion')
    .eq('usuario_id', user.id)
    .gte('fecha', startDateStr);

  const habits = habitos || [];
  const validLogs = (logs || []).filter((l: any) => l.puntuacion && l.puntuacion > 0); // Contamos positivos

  if (habits.length === 0) {
    return (
      <div className="text-center mt-24">
        <p className="text-gray-400">No hay información de progreso disponible.</p>
        <Link href="/habitos/nuevo" className="text-[#39ff14] font-bold mt-4 inline-block hover:text-white transition-colors">
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
  // Today is i=0
  for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last30Days.push({
          date: dateStr,
          dayNum: d.getDate(),
          count: activityMap.get(dateStr) || 0
      });
  }

  // 2. Calculate Current Streak
  let currentStreak = 0;
  for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      
      if (count > 0) {
          currentStreak++;
      } else if (i > 0) { 
          // If today is empty, we don't break the streak yet. But if yesterday is empty, it's broken.
          break;
      }
  }

  // 3. Find Most Consistent Habit
  const habitCounts = new Map<string, number>();
  validLogs.forEach((log: any) => {
      if (log.habito_id) {
          habitCounts.set(log.habito_id, (habitCounts.get(log.habito_id) || 0) + 1);
      }
  });

  let topHabitId = '';
  let maxCount = -1;
  habitCounts.forEach((count, id) => {
      if (count > maxCount) {
          maxCount = count;
          topHabitId = id;
      }
  });

  const topHabit = habits.find((h: any) => h.id === topHabitId);
  const monthlyCompletionRate = validLogs.length > 0 ? Math.round((validLogs.length / (habits.length * 30)) * 100) : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Resumen Rápido (Top Cards) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] shadow-lg flex flex-col justify-center hover:border-orange-500/50 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-xs sm:text-sm font-medium">Racha Actual</span>
          </div>
          <p className="text-3xl font-bold text-[#ededed]">
            {currentStreak} <span className="text-lg font-normal text-gray-500">días</span>
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] shadow-lg flex flex-col justify-center hover:border-[#39ff14]/50 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 text-[#39ff14]" />
            <span className="text-xs sm:text-sm font-medium">Cumplimiento</span>
          </div>
          <p className="text-3xl font-bold text-[#ededed]">
            {Math.min(monthlyCompletionRate, 100)}<span className="text-lg font-normal text-gray-500">%</span>
          </p>
        </div>
      </div>

      {/* Heatmap del mes */}
      <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-[#ededed]">
            <Calendar className="w-5 h-5 text-[#00eeff]" />
            <h2 className="font-semibold">Últimos 30 Días</h2>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-[#0f172a] rounded-md text-gray-400 border border-[#334155]">
            {validLogs.length} completados
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {last30Days.map((day) => {
            // Determine density color
            let bgColor = 'bg-[#0f172a] border border-[#334155] text-gray-600'; // Vacuum state (0)
            if (day.count > 0) bgColor = 'bg-[#39ff14] bg-opacity-20 border border-[#39ff14]/30 text-[#39ff14]/70'; // Low intensity
            if (day.count >= 2) bgColor = 'bg-[#39ff14] bg-opacity-50 border border-[#39ff14]/60 text-[#1e293b] font-bold'; // Mid intensity
            if (day.count >= 4) bgColor = 'bg-[#39ff14] border border-[#39ff14] text-[#0f172a] font-bold shadow-[0_0_10px_rgba(57,255,20,0.4)]'; // High intensity

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
          <div className="w-3 h-3 rounded-sm bg-[#0f172a] border border-[#334155]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#39ff14] bg-opacity-20 border border-[#39ff14]/30"></div>
          <div className="w-3 h-3 rounded-sm bg-[#39ff14] bg-opacity-50 border border-[#39ff14]/60"></div>
          <div className="w-3 h-3 rounded-sm bg-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)]"></div>
          <span>Más</span>
        </div>
      </div>

      {/* Hábito Estrella */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 rounded-2xl border border-[#334155] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-24 h-24 text-yellow-400" />
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 mb-4 relative z-10">
          <Trophy className="w-5 h-5 text-yellow-400 shadow-yellow-400/50 drop-shadow-md" />
          <span className="text-sm font-medium">Hábito Estrella del Mes</span>
        </div>
        
        {topHabit ? (
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0f172a] flex items-center justify-center text-3xl shadow-inner border border-[#334155]">
                {topHabit.icono || '💎'}
              </div>
              <div>
                <p className="font-extrabold text-xl text-[#ededed]">{topHabit.nombre}</p>
                <p className="text-sm font-medium text-[#00eeff] mt-0.5">Constante: {maxCount} días logrados</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic relative z-10">
            Aún no hay suficientes datos para encontrar a tu estrella. ¡Sigue rompiéndola!
          </p>
        )}
      </div>

    </div>
  );
}
