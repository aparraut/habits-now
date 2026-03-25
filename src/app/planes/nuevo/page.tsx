'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Target, Calendar, Check } from 'lucide-react';
import Link from 'next/link';

export default function NuevoPlanPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]); // Default today
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !fechaInicio || !fechaFin) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (fechaInicio > fechaFin) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión');

      const { error: insertError } = await supabase.from('ciclos').insert({
        usuario_id: user.id,
        nombre: nombre.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });

      if (insertError) throw insertError;

      router.push('/planes');
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al crear el plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <header className="mb-8 mt-4 flex items-center gap-4">
        <Link href="/planes" className="p-3 bg-[#1e293b] rounded-full border border-[#334155] text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ededed]">Nuevo Plan</h1>
          <p className="text-xs text-[#39ff14] mt-1 font-medium">Ciclo de temporada</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider px-1">
            Nombre del Reto/Plan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Target className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Reto Verano 2026"
              className="w-full pl-12 pr-4 py-4 bg-[#1e293b] rounded-xl border border-[#334155] text-[#ededed] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#39ff14]/50 focus:border-[#39ff14] font-medium transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Día Inicio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-[#1e293b] rounded-xl border border-[#334155] text-[#ededed] text-sm focus:outline-none focus:border-[#00eeff]/50 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Día Fin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-[#1e293b] rounded-xl border border-[#334155] text-[#ededed] text-sm focus:outline-none focus:border-red-500/50 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 p-4 bg-[#39ff14] text-[#0f172a] rounded-xl font-bold hover:bg-opacity-90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-8 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          {loading ? (
            <span className="animate-pulse">Armando el plan...</span>
          ) : (
            <>
              <Check className="w-6 h-6" />
              Crear Plan
            </>
          )}
        </button>
      </form>
    </main>
  );
}
