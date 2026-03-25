import { createClient } from '@/lib/supabase/server';
import { Target, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ClientPlanesList from './ClientPlanesList';

export const metadata = {
  title: 'Mis Planes - Habits Now',
};

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-4 max-w-md mx-auto min-h-screen">
        <p className="text-gray-400 text-center mt-20">Inicia sesión para gestionar tus planes.</p>
      </main>
    );
  }

  // Fetch users cycles
  const { data: ciclos, error: errC } = await supabase
    .from('ciclos')
    .select('*')
    .eq('usuario_id', user.id)
    .order('fecha_inicio', { ascending: false });

  // Fetch archived habits
  const { data: archivados, error: errH } = await supabase
    .from('habitos')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('activo', false);

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <header className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Mis Planes</h1>
          <p className="text-sm text-gray-400 mt-1">Organiza o recupera tus hábitos</p>
        </div>
        <Link 
          href="/planes/nuevo"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50 shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
        >
          <span className="text-2xl leading-none -mt-1">+</span>
        </Link>
      </header>

      {(errC || errH) && <div className="text-red-500 font-medium my-4">Error cargando datos: {errC?.message || errH?.message}</div>}

      <ClientPlanesList 
        initialCiclos={ciclos || []} 
        initialArchivados={archivados || []} 
      />
    </main>
  );
}
