'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Connexion réussie");
        window.location.href = '/dashboard';
      } else {
        toast.error(data.error || "Erreur de connexion");
      }
    } catch (err) {
      toast.error("Erreur technique");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#0a0a0a] border border-white/8 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-4">N</div>
              <h1 className="text-white text-2xl font-black mb-2">Bon retour</h1>
              <p className="text-gray-500 text-sm">Accédez à vos signaux et votre dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se Connecter'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-gray-500 text-xs">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-amber-500 font-bold hover:underline">Créer un accès</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
