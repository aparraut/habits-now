'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, Globe, HardDrive, User, Trash2 } from 'lucide-react';
import { db } from '@/lib/db/local';

export default function SettingsClient({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Clear the local Dexie DB automatically upon logout so another user doesn't see old data
    try {
      await db.delete();
      await db.open(); 
    } catch(e) {
      console.error(e);
    }
    
    // Refresh to trigger middleware redirection to /login
    router.refresh(); 
  };

  const clearOfflineData = async () => {
    if (confirm('¿Estás seguro de borrar los datos locales? Esto no borrará tu progreso en la nube, pero limpiará el caché y puede obligarte a volver a descargar tus hábitos.')) {
      try {
        await db.delete();
        await db.open(); // Reset DB schema
        alert('Caché local limpiado con éxito.');
        router.refresh();
      } catch(e) {
        console.error(e);
        alert('Error limpiando caché local.');
      }
    }
  };

  const toggleLanguage = () => {
    const isEn = document.cookie.includes('NEXT_LOCALE=en');
    const newLocale = isEn ? 'es' : 'en';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Account Section */}
      <section className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] shadow-lg">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 px-1 uppercase tracking-wider">Cuenta</h2>
        
        <div className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-xl border border-[#334155] shadow-inner">
          <div className="bg-[#1e293b] p-3 rounded-full border border-[#334155]">
            <User className="w-6 h-6 text-[#39ff14]" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-[#ededed] truncate">{initialEmail}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Sincronización Activa</p>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] shadow-lg">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 px-1 uppercase tracking-wider">Preferencias del Sistema</h2>
        
        <div className="space-y-3">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-[#334155] hover:bg-[#334155] hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#00eeff]" />
              <span className="text-[#ededed] font-medium">Auto-Traducir Idioma</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-[#1e293b] rounded text-[#39ff14] border border-[#334155]">
              Alternar
            </span>
          </button>

          <button 
            onClick={clearOfflineData}
            className="w-full flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-[#334155] hover:bg-[#334155] hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              <div className="text-left">
                <p className="text-[#ededed] font-medium">Limpiar caché local</p>
                <p className="text-[10px] text-gray-500">Resuelve problemas de sincronización</p>
              </div>
            </div>
            <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-8">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión Segura
        </button>
      </section>
      
      <p className="text-center text-xs text-gray-600 pt-8 pb-4">
        Habits Now PWA v0.1.0 (Alpha)<br/>Build with Next.js 16
      </p>
    </div>
  );
}
