'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { Flame, Trophy, TrendingUp, Calendar, BarChart3, Star } from 'lucide-react';

interface Log {
  fecha: string;
  habito_id: string;
  puntuacion: number;
}

interface Habit {
  id: string;
  nombre: string;
  icono: string | null;
}

interface StatsDashboardClientProps {
  logs: Log[];
  habits: Habit[];
  range: string;
  selectedHabitId: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-charcoal/80 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00EEFF] shadow-[0_0_8px_#00eeff]" />
          <p className="text-sm font-black text-foreground">
            {payload[0].value.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">pts</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function StatsDashboardClient({ logs, habits, range, selectedHabitId }: StatsDashboardClientProps) {
  // 0. Filter logs if a specific habit is selected
  const filteredLogs = useMemo(() => {
    if (selectedHabitId === 'todas') return logs;
    return logs.filter(l => l.habito_id === selectedHabitId);
  }, [logs, selectedHabitId]);

  // 1. Process Trend Data (Average score per day)
  const trendData = useMemo(() => {
    const dailyMap = new Map<string, { total: number, count: number }>();
    filteredLogs.forEach(log => {
      const current = dailyMap.get(log.fecha) || { total: 0, count: 0 };
      current.total += log.puntuacion;
      current.count++;
      dailyMap.set(log.fecha, current);
    });

    return Array.from(dailyMap.entries())
      .map(([fecha, stats]) => ({
        name: fecha.split('-').slice(1).join('/'), // format MM/DD
        avg: stats.total / stats.count,
        fullDate: fecha
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [logs]);

  // 2. Process Weekday Data (Average score per weekday)
  const weekdayData = useMemo(() => {
    const weekNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdayMap = new Map<number, { total: number, count: number }>();
    
    filteredLogs.forEach(log => {
      const d = new Date(log.fecha + 'T12:00:00');
      const day = d.getDay();
      const current = weekdayMap.get(day) || { total: 0, count: 0 };
      current.total += log.puntuacion;
      current.count++;
      weekdayMap.set(day, current);
    });

    return weekNames.map((name, i) => ({
      name,
      avg: (weekdayMap.get(i)?.total || 0) / (weekdayMap.get(i)?.count || 1)
    }));
  }, [filteredLogs]);

  // 3. Process Habit Data (Average score per habit) - Always show all habits for context or focus on selected
  const habitData = useMemo(() => {
    const habitMap = new Map<string, { total: number, count: number, name: string }>();
    
    // We use original logs here if "todas" is selected, or just the filtered one for focus
    const sourceLogs = selectedHabitId === 'todas' ? logs : filteredLogs;

    sourceLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habito_id);
      if (!habit) return;
      const current = habitMap.get(log.habito_id) || { total: 0, count: 0, name: habit.nombre };
      current.total += log.puntuacion;
      current.count++;
      habitMap.set(log.habito_id, current);
    });

    return Array.from(habitMap.values())
      .map(h => ({
        name: h.name,
        avg: h.total / h.count
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [logs, filteredLogs, habits, selectedHabitId]);

  // 4. Calculate KPIs
  const kpis = useMemo(() => {
    const totalScore = filteredLogs.reduce((acc, log) => acc + log.puntuacion, 0);
    const avgScore = filteredLogs.length > 0 ? totalScore / filteredLogs.length : 0;
    
    const completedLogs = filteredLogs.filter(l => l.puntuacion > 1).length;
    const consistency = filteredLogs.length > 0 ? (completedLogs / filteredLogs.length) * 100 : 0;
    
    const bestDay = weekdayData.reduce((prev, current) => (current.avg > prev.avg) ? current : prev, weekdayData[0]);
    const topHabit = habitData[0];

    return {
      avgScore: avgScore.toFixed(2),
      consistency: consistency.toFixed(1),
      bestDay: bestDay?.name || '-',
      topHabit: topHabit?.name || '-'
    };
  }, [logs, weekdayData, habitData]);

  // 5. Calculate Habits Streaks (New Rule: Score > 1 maintains streak)
  const { topHabitWithStreak, maxStreak } = useMemo(() => {
    const habitStreaks = new Map<string, number>();
    const today = new Date().toISOString().split('T')[0];

    habits.forEach(habit => {
      let streak = 0;
      const hLogs = logs.filter(l => l.habito_id === habit.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
      
      // Basic streak calculation
      for (let i = 0; i < hLogs.length; i++) {
        if (hLogs[i].puntuacion > 1) {
          streak++;
        } else {
          break;
        }
      }
      habitStreaks.set(habit.id, streak);
    });

    let bestId = '';
    let maxS = -1;
    habitStreaks.forEach((streak, id) => {
      if (streak > maxS) {
        maxS = streak;
        bestId = id;
      } else if (streak === maxS) {
        // Tie-breaker: total points
        const pointsA = logs.filter(l => l.habito_id === id).reduce((acc, l) => acc + l.puntuacion, 0);
        const pointsB = logs.filter(l => l.habito_id === bestId).reduce((acc, l) => acc + l.puntuacion, 0);
        if (pointsA > pointsB) bestId = id;
      }
    });

    return { 
      topHabitWithStreak: habits.find(h => h.id === bestId),
      maxStreak: maxS
    };
  }, [logs, habits]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1 sm:px-4">
      
      {/* 4 KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[
          { label: 'Promedio general', value: kpis.avgScore, icon: TrendingUp, color: 'text-electric-blue' },
          { label: 'Consistencia', value: `${kpis.consistency}%`, icon: BarChart3, color: 'text-neon-green' },
          { label: 'Mejor día', value: kpis.bestDay, icon: Calendar, color: 'text-orange-500' },
          { label: 'Hábito Destacado', value: kpis.topHabit, icon: Trophy, color: 'text-yellow-500' },
        ].map((kpi, i) => (
          <div key={i} className="bg-charcoal/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-white/5 shadow-xl backdrop-blur-md hover:border-white/10 transition-all group overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-1.5 sm:mb-2">
              <kpi.icon className={`w-3 sm:w-4 h-3 sm:h-4 ${kpi.color}`} />
              <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">{kpi.label}</span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground group-hover:scale-110 transition-transform origin-left truncate">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Daily Tendency (Area Chart for Aura effect) */}
      <div className="bg-charcoal/60 p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-22xl backdrop-blur-md">
        <h3 className="text-[9px] sm:text-[11px] font-black text-gray-500 mb-6 sm:mb-10 uppercase tracking-[0.3em] flex items-center gap-2">
          <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-electric-blue" />
          Tendencia diaria
        </h3>
        <div className="h-[200px] sm:h-[300px] lg:h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00EEFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00EEFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                minTickGap={20}
                tick={{ fill: '#666', fontWeight: 700, fontSize: 9 }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fill: '#666', fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00EEFF', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#00EEFF" 
                strokeWidth={4} 
                dot={{ fill: '#00EEFF', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#00EEFF', strokeWidth: 2, fill: '#0f172a' }}
                animationDuration={2500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekday Average (Bar Chart) */}
        <div className="bg-charcoal/60 p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-22xl backdrop-blur-md">
          <h3 className="text-[9px] sm:text-[11px] font-black text-gray-500 mb-6 sm:mb-10 uppercase tracking-[0.3em] flex items-center gap-2">
            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-neon-green" />
            Promedio por día
          </h3>
          <div className="h-[200px] sm:h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700, fontSize: 10 }} />
                <YAxis hide domain={[0, 5]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} animationDuration={1500} barSize={35}>
                  {weekdayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avg > 3.5 ? '#39FF14' : entry.avg > 2 ? '#00EEFF' : '#4361EE'} 
                      className="transition-all hover:opacity-100 opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Habit Spotlight - Improved design & Truncation fix */}
        <div className="bg-gradient-to-br from-charcoal to-[#0f172a] p-6 sm:p-10 rounded-[2rem] border border-white/5 shadow-22xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 transition-all duration-1000 blur-3xl pointer-events-none">
            <Star className="w-64 h-64 text-neon-green" />
          </div>
          <div className="flex items-center gap-2 text-gray-500 mb-8 relative z-10">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-[9px] sm:text-[11px] uppercase font-black tracking-[0.3em]">Líder de Racha</span>
          </div>
          {topHabitWithStreak ? (
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-[2.5rem] bg-background flex items-center justify-center text-4xl sm:text-6xl shadow-inner border border-white/5 group-hover:scale-105 transition-all duration-700 flex-shrink-0">
                  {topHabitWithStreak.icono || '💎'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-2xl sm:text-5xl text-foreground leading-none tracking-tighter truncate mb-2 sm:mb-4">{topHabitWithStreak.nombre}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] sm:text-sm font-black text-neon-green flex items-center gap-2 px-4 py-1.5 bg-neon-green/10 rounded-full w-fit border border-neon-green/20">
                      <Flame className="w-4 h-4" />
                      {maxStreak} <span className="opacity-70">DÍAS</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[3px]">
                <div 
                  className="h-full bg-gradient-to-r from-neon-green/50 via-neon-green to-emerald-400 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all duration-1500" 
                  style={{ width: `${Math.min((maxStreak / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ) : (
             <p className="text-sm text-gray-500 italic py-16 text-center uppercase tracking-widest font-black opacity-30">Analizando tus rachas...</p>
          )}
        </div>
      </div>

      {/* Average per Habit (Horizontal Bar Chart) */}
      <div className="bg-charcoal/60 p-4 sm:p-8 rounded-[2rem] border border-white/5 shadow-22xl backdrop-blur-md pb-14">
        <h3 className="text-[9px] sm:text-[11px] font-black text-gray-500 mb-10 sm:mb-14 uppercase tracking-[0.3em] flex items-center gap-2">
          <BarChart className="w-5 h-5 text-orange-400" />
          Análisis por Hábito
        </h3>
        <div className="min-h-[300px] w-full" style={{ height: `${Math.max(habitData.length * 70, 300)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={habitData} 
              layout="vertical" 
              margin={{ left: 0, right: 30 }}
            >
              <XAxis type="number" hide domain={[0, 5]} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#AAA" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={110}
                className="font-black tracking-tighter"
                tick={{ fill: '#AAA' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="avg" radius={[0, 10, 10, 0]} barSize={28} animationDuration={1800}>
                {habitData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avg > 4 ? '#39FF14' : entry.avg > 3 ? '#00EEFF' : '#4361EE'} 
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
