'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CalendarRange, Trash2, Target, Lock, Archive, Play, Info } from 'lucide-react';
import Link from 'next/link';

type Ciclo = {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type HabitoArchivado = {
  id: string;
  nombre: string;
  icono: string | null;
  ciclo_id: string | null;
};

export default function ClientPlanesList({ 
  initialCiclos, 
  initialArchivados 
}: { 
  initialCiclos: Ciclo[], 
  initialArchivados: HabitoArchivado[] 
}) {
  const [activeTab, setActiveTab] = useState<'planes' | 'baul'>('planes');
  const router = useRouter();
  const supabase = createClient();

  const getStatus = (inicio: string, fin: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr >= inicio && todayStr <= fin) return 'ACTIVO';
    if (todayStr < inicio) return 'PRÓXIMO';
    return 'FINALIZADO';
  };

  const handleDeleteCiclo = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de borrar el plan "${nombre}"? Los hábitos dentro de este plan NO se borrarán.`)) {
      await supabase.from('ciclos').delete().eq('id', id);
      router.refresh();
    }
  };

  const handleReactivarHabito = async (id: string, nombre: string) => {
    if (confirm(`¿Quieres reactivar "${nombre}"? Volverá a aparecer en tu lista diaria.`)) {
      await (supabase.from('habitos') as any).update({ activo: true }).eq('id', id);
      router.refresh();
    }
  };

  const handleBorrarDefinitivo = async (id: string, nombre: string) => {
    if (confirm(`¿BORRAR DEFINITIVAMENTE "${nombre}"? Se perderá todo su historial y estadísticas para siempre.`)) {
      await supabase.from('habitos').delete().eq('id', id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Selector */}
      <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-[#334155]">
        <button
          onClick={() => setActiveTab('planes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'planes' ? 'bg-[#1e293b] text-[#39ff14] shadow-lg border border-[#334155]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Target className="w-4 h-4" />
          Planes
        </button>
        <button
          onClick={() => setActiveTab('baul')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'baul' ? 'bg-[#1e293b] text-[#39ff14] shadow-lg border border-[#334155]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Archive className="w-4 h-4" />
          El Baúl
          {initialArchivados.length > 0 && (
            <span className="bg-[#39ff14]/20 text-[#39ff14] text-[10px] px-1.5 py-0.5 rounded-full">
              {initialArchivados.length}
            </span>
          )}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'planes' ? (
          <div className="space-y-4">
            {initialCiclos.length === 0 ? (
              <div className="text-center py-12 px-8 bg-[#1e293b] rounded-3xl border border-[#334155] border-dashed">
                <Target className="w-12 h-12 text-[#39ff14]/20 mx-auto mb-4" />
                <h3 className="text-[#ededed] font-bold mb-2">No hay planes creados</h3>
                <p className="text-gray-500 text-xs">Crea un reto de temporada para aumentar tu compromiso.</p>
              </div>
            ) : (
              initialCiclos.map((ciclo) => {
                const { id, nombre, fecha_inicio, fecha_fin } = ciclo;
                const status = getStatus(fecha_inicio, fecha_fin);
                
                let statusColors = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                let cardColors = 'bg-[#1e293b] border-[#334155] hover:border-gray-500/50';
                
                if (status === 'ACTIVO') {
                  statusColors = 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]';
                  cardColors = 'bg-[#1e293b] border-[#39ff14]/50 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]';
                } else if (status === 'PRÓXIMO') {
                  statusColors = 'bg-[#00eeff]/20 text-[#00eeff] border-[#00eeff]/50';
                  cardColors = 'bg-[#1e293b] border-[#334155] hover:border-[#00eeff]/50';
                }

                return (
                  <div key={id} className={`p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${cardColors}`}>
                    {status === 'FINALIZADO' && (
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Lock className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border tracking-wider ${statusColors}`}>
                          {status}
                        </span>
                        <h2 className="text-xl font-extrabold text-[#ededed] mt-3">{nombre}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 font-medium">
                          <CalendarRange className="w-4 h-4 text-gray-500" />
                          <span>{fecha_inicio} &rarr; {fecha_fin}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCiclo(id, nombre)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {initialArchivados.length === 0 ? (
              <div className="text-center py-12 px-8 bg-[#1e293b] rounded-3xl border border-[#334155] border-dashed">
                <Archive className="w-12 h-12 text-[#39ff14]/20 mx-auto mb-4" />
                <h3 className="text-[#ededed] font-bold mb-2">El Baúl está vacío</h3>
                <p className="text-gray-500 text-xs">Aquí aparecerán los hábitos que decidas pausar para no perder tu progreso.</p>
              </div>
            ) : (
              initialArchivados.map((habito) => (
                <div key={habito.id} className="p-4 bg-[#1e293b] border border-[#334155] rounded-2xl flex items-center justify-between hover:border-gray-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center text-2xl shadow-inner border border-[#334155]/50">
                      {habito.icono}
                    </div>
                    <div>
                      <h3 className="text-[#ededed] font-bold text-lg leading-tight">{habito.nombre}</h3>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
                        <Info className="w-3 h-3" />
                        Historia conservada en la BD
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleReactivarHabito(habito.id, habito.nombre)}
                      className="p-3 bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 rounded-xl hover:bg-[#39ff14]/20 transition-all shadow-sm"
                      title="Reactivar hábito"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => handleBorrarDefinitivo(habito.id, habito.nombre)}
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Borrar definitivamente"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
            <p className="text-[10px] text-center text-gray-500 px-6 mt-4">
              Los hábitos en el Baúl no consumen espacio en tu pantalla diaria pero mantienen viva tu racha histórica.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
