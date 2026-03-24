import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Ajustes - Habits Now',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Ajustes</h1>
        <p className="text-sm text-gray-400 mt-1">Configura tu experiencia general</p>
      </header>
      
      <SettingsClient initialEmail={user?.email || 'Usuario anónimo'} />
    </main>
  );
}
