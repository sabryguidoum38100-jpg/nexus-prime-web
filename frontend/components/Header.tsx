'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  bankroll: number;
}

function AuthModal({ mode, onClose, onSuccess }: {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [tab, setTab] = useState(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bankroll, setBankroll] = useState('1000');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    if (tab === 'signup' && !name) { setError('Entrez votre nom.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tab === 'login' ? 'login' : 'register',
          name,
          email,
          password,
          bankroll: parseFloat(bankroll) || 1000,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
      } else {
        onSuccess(data.user);
      }
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="relative bg-gray-900 border border-emerald-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-emerald-500/10"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl transition">✕</button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center font-black text-black text-lg">N</div>
          <div>
            <p className="font-bold text-white">Nexus Prime</p>
            <p className="text-xs text-gray-400">Pronostics IA 2026</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-6">
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setTab(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === m ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {tab === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition" />
          {tab === 'signup' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Bankroll initiale (€)</label>
              <input type="number" value={bankroll} onChange={e => setBankroll(e.target.value)} placeholder="1000"
                min="10" max="1000000"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition" />
            </div>
          )}
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60">
            {loading ? '⏳ Chargement...' : tab === 'login' ? '🚀 Se connecter' : '✨ Créer mon compte'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          Authentification sécurisée · JWT httpOnly · Données chiffrées
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function Header() {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUser();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [fetchUser]);

  const handleSuccess = (u: User) => {
    setUser(u);
    setAuthModal(null);
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg' : 'bg-black/80 backdrop-blur-md border-b border-emerald-500/20'}`}
      >
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-black">NP</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Nexus Prime</h1>
                <p className="text-xs text-gray-400">Pronos IA 2026</p>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex gap-6 items-center text-sm text-gray-400">
            <Link href="/about" className="hover:text-emerald-400 transition">À propos</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition">Contact</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 items-center">
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{user.name.split(' ')[0]}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-white font-semibold text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                        <p className="text-emerald-400 text-xs mt-1">Plan : {user.plan === 'free' ? 'Gratuit' : user.plan}</p>
                        <p className="text-cyan-400 text-xs">Bankroll : €{user.bankroll?.toLocaleString()}</p>
                      </div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                        🚪 Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal('login')}
                  className="px-6 py-2 rounded-lg border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-all">
                  Connexion
                </button>
                <button onClick={() => setAuthModal('signup')}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:shadow-lg hover:shadow-emerald-400/50 transition-all">
                  Commencer
                </button>
              </>
            )}
          </motion.div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSuccess={handleSuccess} />}
      </AnimatePresence>
    </>
  );
}
