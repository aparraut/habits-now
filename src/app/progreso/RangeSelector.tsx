'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Filter } from 'lucide-react';

export default function RangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('rango') || 'mes';

  const options = [
    { id: 'semana', label: 'Semana', days: 7 },
    { id: 'mes', label: 'Mes', days: 30 },
    { id: 'año', label: 'Año', days: 365 },
    { id: 'todo', label: 'Todo', days: 9999 }
  ];

  const handleSelect = (id: string) => {
    router.push(`/progreso?rango=${id}`);
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => handleSelect(opt.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            currentRange === opt.id 
              ? 'bg-[#00eeff] border-[#00eeff] text-[#0f172a] shadow-[0_0_10px_rgba(0,238,255,0.4)]' 
              : 'bg-[#1e293b] border-[#334155] text-gray-400 hover:border-gray-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
