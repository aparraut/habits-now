'use client';
import Link from 'next/link';
import { CheckSquare, TrendingUp, Settings, Target } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';

export default function BottomBar() {
  const pathname = usePathname();
  const { locale } = useI18n();

  const isEn = locale === 'en';
  
  const labels = {
    today: isEn ? 'Today' : 'Hoy',
    planes: isEn ? 'Plans' : 'Planes',
    progress: isEn ? 'Progress' : 'Progreso',
    settings: isEn ? 'Settings' : 'Ajustes'
  };

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#1e293b] border-t border-[#0f172a] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto pb-safe px-2">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-gray-300'}`}>
          <CheckSquare className={`w-5 h-5 mb-1 ${pathname === '/' && 'scale-110 shadow-sm'} transition-transform`} />
          <span className="text-[10px] font-bold">{labels.today}</span>
        </Link>
        <Link href="/planes" className={`flex flex-col items-center justify-center w-full h-full ${pathname.startsWith('/planes') ? 'text-[#39ff14]' : 'text-gray-400 hover:text-gray-300'}`}>
          <Target className={`w-5 h-5 mb-1 ${pathname.startsWith('/planes') && 'scale-110 shadow-sm'} transition-transform`} />
          <span className="text-[10px] font-bold">{labels.planes}</span>
        </Link>
        <Link href="/progreso" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/progreso' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-gray-300'}`}>
          <TrendingUp className={`w-5 h-5 mb-1 ${pathname === '/progreso' && 'scale-110 shadow-sm'} transition-transform`} />
          <span className="text-[10px] font-bold">{labels.progress}</span>
        </Link>
        <Link href="/ajustes" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/ajustes' ? 'text-[#39ff14]' : 'text-gray-400 hover:text-gray-300'}`}>
          <Settings className={`w-5 h-5 mb-1 ${pathname === '/ajustes' && 'scale-110 shadow-sm'} transition-transform`} />
          <span className="text-[10px] font-bold">{labels.settings}</span>
        </Link>
      </div>
    </nav>
  );
}
