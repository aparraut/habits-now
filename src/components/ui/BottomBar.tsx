'use client';
import Link from 'next/link';
import { CheckSquare, TrendingUp, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';

export default function BottomBar() {
  const pathname = usePathname();
  const { locale } = useI18n();

  const isEn = locale === 'en';
  
  const labels = {
    today: isEn ? 'Today' : 'Hoy',
    progress: isEn ? 'Progress' : 'Progreso',
    settings: isEn ? 'Settings' : 'Ajustes'
  };

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#1e293b] border-t border-[#0f172a] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto pb-safe">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' ? 'text-[#39ff14]' : 'text-gray-400'}`}>
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{labels.today}</span>
        </Link>
        <Link href="/progreso" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/progreso' ? 'text-[#39ff14]' : 'text-gray-400'}`}>
          <TrendingUp className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{labels.progress}</span>
        </Link>
        <Link href="/ajustes" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/ajustes' ? 'text-[#39ff14]' : 'text-gray-400'}`}>
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{labels.settings}</span>
        </Link>
      </div>
    </nav>
  );
}
