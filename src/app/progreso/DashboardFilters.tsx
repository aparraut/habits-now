'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, RefreshCw } from 'lucide-react';

interface Habit {
  id: string;
  nombre: string;
}

interface DashboardFiltersProps {
  habits: Habit[];
}

export default function DashboardFilters({ habits }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentRange = searchParams.get('rango') || 'mes';
  const currentHabitId = searchParams.get('habito') || 'todas';

  const rangeOptions = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'año', label: 'Año' },
    { id: 'todo', label: 'Todo' }
  ];

  const updateFilters = (newRange?: string, newHabit?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange) params.set('rango', newRange);
    if (newHabit) params.set('habito', newHabit);
    router.push(`/progreso?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-10 bg-charcoal/40 p-3 sm:p-4 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-2xl">
      <div className="flex-1 flex flex-col xs:flex-row gap-3">
        {/* Range Selector */}
        <div className="relative flex-1 group">
          <select
            value={currentRange}
            onChange={(e) => updateFilters(e.target.value)}
            className="w-full bg-background/50 border border-white/5 text-foreground text-[11px] sm:text-xs font-black uppercase tracking-widest py-3.5 px-5 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-neon-green/50 transition-all hover:bg-background/80"
          >
            {rangeOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-neon-green transition-colors" />
        </div>

        {/* Habit Selector */}
        <div className="relative flex-[1.5] group">
          <select
            value={currentHabitId}
            onChange={(e) => updateFilters(undefined, e.target.value)}
            className="w-full bg-background/50 border border-white/5 text-foreground text-[11px] sm:text-xs font-black uppercase tracking-widest py-3.5 px-5 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-electric-blue/50 transition-all hover:bg-background/80"
          >
            <option value="todas">Todas las materias</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.nombre}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-electric-blue transition-colors" />
        </div>
      </div>

      {/* Update Button - High Contrast Neon */}
      <button 
        onClick={() => router.refresh()}
        className="relative group overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-[#0f172a] font-black text-[11px] sm:text-[12px] uppercase tracking-wider px-10 py-4 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 w-full md:w-auto"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
        <span>Actualizar</span>
      </button>
    </div>
  );
}
