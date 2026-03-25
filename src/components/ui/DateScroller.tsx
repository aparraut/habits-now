'use client';

import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DateScroller() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Obtener fecha seleccionada de la URL o usar hoy por defecto
  const selectedDateParam = searchParams.get('fecha');
  const selectedDate = selectedDateParam 
    ? startOfDay(new Date(selectedDateParam + 'T12:00:00')) // Use mid-day to avoid TZ issues
    : startOfDay(new Date());

  // Generar un rango de días (ej. 14 días atrás y hoy)
  const days = Array.from({ length: 15 }, (_, i) => subDays(startOfDay(new Date()), 14 - i));

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    router.push(`/?fecha=${dateStr}`);
  };

  const handleToday = () => {
    router.push('/');
  };

  // Auto-scroll al final (hoy) la primera vez
  useEffect(() => {
    if (scrollRef.current && !selectedDateParam) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedDateParam]);

  return (
    <div className="relative mb-6 -mx-4">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar scroll-smooth"
      >
        {days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all duration-300 border relative overflow-hidden ${
                isSelected 
                  ? 'bg-[#39ff14] border-[#39ff14] text-[#0f172a] shadow-[0_10px_20px_rgba(57,255,20,0.3)] scale-110 z-10' 
                  : 'bg-[#1e293b] border-[#334155] text-gray-400 hover:border-gray-500 hover:bg-[#1e293b]/80'
              }`}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              )}
              <span className={`text-[9px] font-black uppercase tracking-widest relative z-10 ${isSelected ? 'text-[#0f172a]' : 'text-gray-500'}`}>
                {format(date, 'eee', { locale: es })}
              </span>
              <span className="text-2xl font-black mt-0.5 relative z-10">
                {format(date, 'd')}
              </span>
              {isToday && !isSelected && (
                <div className="absolute bottom-2 w-1.5 h-1.5 bg-[#39ff14] rounded-full shadow-[0_0_5px_rgba(57,255,20,0.8)]"></div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Barra de herramientas / Indicador de "Viajando al pasado" */}
      <div className="px-4 flex items-center justify-center gap-4">
        {!isSameDay(selectedDate, new Date()) ? (
          <>
            <button 
              onClick={handleToday}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39ff14]/10 text-[#39ff14] text-[11px] font-black rounded-full border border-[#39ff14]/30 hover:bg-[#39ff14]/20 transition-all shadow-[0_0_10px_rgba(57,255,20,0.1)] group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">⏪</span>
              VOLVER A HOY
            </button>
            <span className="inline-block px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[11px] font-black rounded-full border border-blue-500/20 animate-pulse">
              🕰️ VIENDO: {format(selectedDate, "d 'DE' MMMM", { locale: es }).toUpperCase()}
            </span>
          </>
        ) : (
          <span className="inline-block px-3 py-1 bg-gray-500/10 text-gray-500 text-[10px] font-bold rounded-full border border-gray-500/10 opacity-70">
            DASHBOARD ACTUALIZADO
          </span>
        )}
      </div>
    </div>
  );
}
