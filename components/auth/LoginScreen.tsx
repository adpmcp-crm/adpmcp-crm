'use client';

import React, { useState } from 'react';
import { 
  loginWithGoogle, 
  loginWithApple, 
  loginWithMicrosoft,
  loginWithEmail,
  signupWithEmail,
  resetPassword
} from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Mail, 
  Lock, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

type AuthMode = 'login' | 'signup' | 'forgot';

export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'signup') {
        await signupWithEmail(email, password);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'Ocorreu um erro. Tente novamente.';
      if (err.code === 'auth/user-not-found') message = 'Usuário não encontrado.';
      if (err.code === 'auth/wrong-password') message = 'Senha incorreta.';
      if (err.code === 'auth/email-already-in-use') message = 'Este e-mail já está em uso.';
      if (err.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      if (err.code === 'auth/invalid-email') message = 'E-mail inválido.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'microsoft') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') await loginWithGoogle();
      if (provider === 'apple') await loginWithApple();
      if (provider === 'microsoft') await loginWithMicrosoft();
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      setError(`Erro ao entrar com ${provider}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-8 border border-gray-100"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative">
             <Image 
                src="https://ais-dev-lnpxtzhoh7caesmhab2ibw-124689498029.europe-west2.run.app/logo.png" 
                alt="ADP Logo" 
                width={60} 
                height={60}
                className="object-contain z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
             />
             <ShieldCheck className="w-10 h-10 text-blue-600 absolute" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ADP Ministério Comunhão e Plenitude
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === 'login' && 'Bem-vindo de volta ao Sacred Ledger'}
            {mode === 'signup' && 'Crie sua conta no Sacred Ledger'}
            {mode === 'forgot' && 'Recupere o acesso à sua conta'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl text-xs font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {mode === 'login' && 'Entrar'}
                    {mode === 'signup' && 'Criar Conta'}
                    {mode === 'forgot' && 'Enviar Link'}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-500">
              Não tem uma conta?{' '}
              <button onClick={() => setMode('signup')} className="font-bold text-blue-600 hover:underline">Cadastre-se</button>
            </p>
          ) : (
            <button 
              onClick={() => setMode('login')} 
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </button>
          )}
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Ou entre com</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 group"
            title="Google"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 group"
            title="Apple"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.44-1.2 0-2.13-.44-3.23-1.44-1.12-1.02-2.1-1.52-3.3-1.52-1.2 0-2.28.5-3.4 1.52-.96.95-1.92 1.44-2.88 1.44s-1.8-.49-2.52-1.44c-1.56-2.04-2.34-4.8-2.34-8.28 0-3.48.78-6.24 2.34-8.28.72-.95 1.56-1.44 2.52-1.44.96 0 1.92.49 2.88 1.44 1.12 1.02 2.2 1.52 3.4 1.52 1.2 0 2.18-.5 3.3-1.52 1.19-1 2.27-1.44 3.23-1.44 1.2 0 2.13.44 3.23 1.44 1.56 2.04 2.34 4.8 2.34 8.28 0 3.48-.78 6.24-2.34 8.28zM12 10.08c0-2.64 2.16-4.8 4.8-4.8.12 0 .24 0 .36.01-.48-2.52-2.64-4.41-5.16-4.41-2.88 0-5.28 2.4-5.28 5.28 0 2.88 2.4 5.28 5.28 5.28 2.52 0 4.68-1.89 5.16-4.41-.12.01-.24.01-.36.01-2.64 0-4.8-2.16-4.8-4.8z"/>
            </svg>
          </button>
          <button
            onClick={() => handleSocialLogin('microsoft')}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 group"
            title="Microsoft"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
          </button>
        </div>

        <p className="mt-8 text-[10px] text-center text-gray-400 leading-relaxed">
          Ao entrar, você concorda com os nossos <br />
          <button className="font-bold hover:text-gray-600 transition-colors">Termos de Uso</button> e <button className="font-bold hover:text-gray-600 transition-colors">Política de Privacidade</button>.
        </p>
      </motion.div>
    </div>
  );
}
