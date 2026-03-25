'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditarHabito({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('⭐');
  const [cicloId, setCicloId] = useState('');
  const [ciclosDisponibles, setCiclosDisponibles] = useState<{id:string, nombre:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const iconos = ['⭐', '🏃', '💧', '📚', '🧘', '🥗', '💻', '🎸', '🔥', '💪', '🌙', '☀️'];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cData } = await (supabase.from('ciclos') as any).select('id, nombre').eq('usuario_id', user.id);
        if (cData) setCiclosDisponibles(cData);
      }

      const { data } = await (supabase.from('habitos') as any).select('*').eq('id', resolvedParams.id).single();
      if (data) {
        setNombre(data.nombre);
        if (data.icono) setIcono(data.icono);
        if (data.ciclo_id) setCicloId(data.ciclo_id);
      }
      setInitialLoading(false);
    }
    loadData();
  }, [resolvedParams.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setLoading(true);
    await (supabase.from('habitos') as any).update({
      nombre: nombre.trim(),
      icono: icono,
      ciclo_id: cicloId || null
    }).eq('id', resolvedParams.id);
    
    // Explicitly reset to wipe client boundary cache before leaving
    setNombre(''); 
    
    router.refresh();
    router.push('/');
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39ff14]" /></div>;
  }

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen">
      <header className="mb-8 mt-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-[#ededed] p-2 -ml-2 rounded-full hover:bg-[#1e293b] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#ededed]">Editar Hábito</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">Cambiar ícono</label>
          <div className="flex flex-wrap gap-3">
            {iconos.map(ico => (
              <button
                key={ico}
                type="button"
                onClick={() => setIcono(ico)}
                className={`w-14 h-14 text-2xl flex items-center justify-center rounded-2xl transition-all duration-300 ${icono === ico ? 'bg-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)] scale-110' : 'bg-[#1e293b] opacity-70 hover:opacity-100 hover:bg-[#334155]'}`}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-2 ml-1">Nombre</label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-5 py-4 bg-[#1e293b] border-2 border-transparent focus:border-[#39ff14] rounded-2xl outline-none text-[#ededed] text-lg font-medium transition-colors shadow-inner"
          />
        </div>

        <div>
          <label htmlFor="ciclo" className="block text-sm font-medium text-gray-400 mb-2 ml-1">¿Pertenece a un Reto o Plan?</label>
          <select
            id="ciclo"
            value={cicloId}
            onChange={(e) => setCicloId(e.target.value)}
            className="w-full px-5 py-4 bg-[#1e293b] border-2 border-[#334155] focus:border-[#39ff14] rounded-2xl outline-none text-[#ededed] text-base font-medium transition-colors cursor-pointer appearance-none shadow-inner"
          >
            <option value="">Permanente (Ningún plan)</option>
            {ciclosDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          className="w-full flex items-center justify-center gap-3 py-4 text-lg font-bold text-[#0f172a] bg-[#39ff14] rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_4px_20px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 mt-10 active:scale-95"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
          {loading ? 'Actualizando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  );
}
