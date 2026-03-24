'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: '¡Revisa tu correo para confirmar tu cuenta!', type: 'success' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ text: 'Credenciales inválidas o correo no confirmado', type: 'error' });
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a192f]">
      <div className="w-full max-w-sm p-8 bg-[#1e293b] rounded-2xl shadow-xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">Habits Now</h1>
          <p className="mt-2 text-sm text-gray-400">
            {isSignUp ? 'Crea una cuenta nueva' : 'Accede para seguir tu progreso'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-[#0a192f] bg-[#00eeff] rounded-lg hover:bg-opacity-90 transition-all shadow-[0_0_15px_rgba(0,238,255,0.4)]"
          >
            Continuar con Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-gray-400">O usa tu email</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
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
            <div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña (mínimo 6 char)"
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg focus:outline-none focus:border-[#39ff14] text-[#ededed] placeholder-gray-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#39ff14] bg-transparent border-2 border-[#39ff14] rounded-lg hover:bg-[#39ff14] hover:text-[#0a192f] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          {message.text && (
            <p className={`text-sm text-center mt-4 ${message.type === 'error' ? 'text-red-400' : 'text-[#39ff14]'}`}>
              {message.text}
            </p>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage({ text: '', type: '' });
              }}
              className="text-xs text-gray-400 hover:text-[#39ff14] transition-colors"
            >
              {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
