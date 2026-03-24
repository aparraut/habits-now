'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('¡Revisa tu correo para el enlace de acceso!');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a192f]">
      <div className="w-full max-w-sm p-8 bg-[#1e293b] rounded-2xl shadow-xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Habits Now</h1>
          <p className="mt-2 text-sm text-gray-400">Accede para seguir tu progreso</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-[#0a192f] bg-[#00eeff] rounded-lg hover:bg-opacity-90 transition-all shadow-[0_0_15px_rgba(0,238,255,0.4)]"
          >
            Continuar con Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-gray-400">O usa tu email</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg focus:outline-none focus:border-[#39ff14] text-[#ededed] placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-transparent border-2 border-[#39ff14] rounded-lg hover:bg-[#39ff14] hover:text-[#0a192f] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {loading ? 'Enviando...' : 'Enviar enlace mágico'}
            </button>
          </form>

          {message && (
            <p className="text-xs text-center text-[#39ff14] mt-4">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
