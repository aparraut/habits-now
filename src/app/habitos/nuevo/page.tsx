'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoHabito() {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('⭐');
  const [cicloId, setCicloId] = useState('');
  const [ciclosDisponibles, setCiclosDisponibles] = useState<{id:string, nombre:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (user) {
        supabase.from('ciclos').select('id, nombre').eq('usuario_id', user.id).then(({data}) => {
          if (data) setCiclosDisponibles(data);
        });
      }
    });
  }, []);

  // Opciones rápidas de iconos
  const iconos = ['⭐', '🏃', '💧', '📚', '🧘', '🥗', '💻', '🎸'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await (supabase.from('habitos') as any).insert({
        usuario_id: user.id,
        nombre: nombre.trim(),
        icono: icono,
        frecuencia: { type: 'daily' },
        ciclo_id: cicloId || null
      });
      
      setNombre('');
      setIcono('⭐');
      
      router.refresh(); // Forzar actualización de Server Components en Next.js 16
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen">
      <header className="mb-8 mt-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-foreground p-2 -ml-2 rounded-full hover:bg-charcoal transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nuevo Hábito</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">Elige un ícono</label>
          <div className="flex flex-wrap gap-3">
            {iconos.map(ico => (
              <button
                key={ico}
                type="button"
                onClick={() => setIcono(ico)}
                className={`w-14 h-14 text-2xl flex items-center justify-center rounded-2xl transition-all duration-300 ${icono === ico ? 'bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.3)] scale-110' : 'bg-charcoal opacity-70 hover:opacity-100 hover:bg-[#334155]'}`}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-2 ml-1">¿Qué quieres construir?</label>
          <input
            id="nombre"
            type="text"
            required
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Caminar 10,000 pasos"
            className="w-full px-5 py-4 bg-charcoal border-2 border-transparent focus:border-neon-green rounded-2xl outline-none text-foreground text-lg font-medium transition-colors placeholder:text-gray-600 placeholder:font-normal shadow-inner"
          />
        </div>

        <div>
          <label htmlFor="ciclo" className="block text-sm font-medium text-gray-400 mb-2 ml-1">¿Pertenece a un Reto o Plan?</label>
          <select
            id="ciclo"
            value={cicloId}
            onChange={(e) => setCicloId(e.target.value)}
            className="w-full px-5 py-4 bg-charcoal border-2 border-[#334155] focus:border-neon-green rounded-2xl outline-none text-foreground text-base font-medium transition-colors cursor-pointer appearance-none shadow-inner"
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
          className="w-full flex items-center justify-center gap-3 py-4 text-lg font-bold text-background bg-neon-green rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_4px_20px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 mt-10 active:scale-95"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
          {loading ? 'Creando...' : 'Guardar hábito'}
        </button>
      </form>
    </main>
  );
}
