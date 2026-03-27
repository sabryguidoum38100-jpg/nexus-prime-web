'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface User { email: string; }

function AuthModal({ mode, onClose, onSuccess }: {
  mode: 'login' | 'register'; onClose: () => void; onSuccess: (u: User) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    if (!email || !email.includes('@')) {
      setError('Adresse email invalide.');
    } else if (password.length < 6) {
      setError('Mot de passe trop court (6 caractères minimum).');
    } else {
      onSuccess({ email });
      onClose();
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition">✕</button>
        <div className="mb-6 text-center">
          <div className="text-2xl mb-2">👑</div>
          <h2 className="text-white font-bold text-xl">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
          <p className="text-gray-500 text-sm mt-1">Nexus Prime Elite</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition placeholder-gray-600"
              placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition placeholder-gray-600"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60">
            {loading ? '⏳ Traitement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

const NAV_LINKS = [
  { href: '/#picks-section', label: 'Picks', icon: '🎯' },
  { href: '/historique', label: 'Historique', icon: '📈' },
  { href: '/methodologie', label: 'Méthodologie', icon: '⚙️' },
  { href: '/pricing', label: 'Premium', icon: '👑', premium: true },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/50' : 'bg-transparent'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-0 rounded-lg border border-amber-400/30 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-black">N</span>
              </div>
            </div>
            <div>
              <span className="text-white font-black text-base tracking-tight">NEXUS</span>
              <span className="text-amber-400 font-black text-base tracking-tight"> PRIME</span>
              <span className="ml-1.5 text-[10px] text-gray-600 font-semibold uppercase tracking-widest hidden sm:inline">Elite</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || (link.href === '/historique' && pathname === '/historique') || (link.href === '/methodologie' && pathname === '/methodologie');
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    (link as { premium?: boolean }).premium
                      ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 text-amber-400 border border-amber-500/20 hover:border-amber-500/40'
                      : isActive ? 'bg-white/8 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="text-xs">{link.icon}</span>{link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">{user.email[0].toUpperCase()}</span>
                  </div>
                  <span className="text-white text-xs font-semibold truncate max-w-[100px]">{user.email}</span>
                </div>
                <button onClick={() => setUser(null)} className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-white text-xs transition">Déconnexion</button>
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal('login')}
                  className="hidden sm:block px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm font-semibold transition-all hover:bg-white/5">
                  Connexion
                </button>
                <button onClick={() => setAuthModal('register')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02]">
                  Commencer
                </button>
              </>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect width="16" height="2" rx="1" fill="currentColor"/>
                <rect y="5" width="16" height="2" rx="1" fill="currentColor"/>
                <rect y="10" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden">
              <div className="container mx-auto px-4 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      (link as { premium?: boolean }).premium ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <span>{link.icon}</span>{link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSuccess={u => { setUser(u); setAuthModal(null); }} />}
      </AnimatePresence>
    </>
  );
}
