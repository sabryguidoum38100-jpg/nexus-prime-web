'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface User { email: string; name: string; }

// ─── Indicateur de force du mot de passe ────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const labels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-emerald-400', 'bg-emerald-400'];
  const textColors = ['', 'text-red-400', 'text-orange-400', 'text-emerald-400', 'text-emerald-400'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({ mode: initialMode, onClose, onSuccess }: {
  mode: 'login' | 'register'; onClose: () => void; onSuccess: (u: User) => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    await new Promise(r => setTimeout(r, 900));

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Adresse email invalide.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe trop court (6 caractères minimum).');
      setLoading(false);
      return;
    }
    if (mode === 'register' && password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    const name = email.split('@')[0];
    const user: User = { email, name };

    // Émettre l'événement global pour le toast de bienvenue
    window.dispatchEvent(new CustomEvent('nexus-auth', {
      detail: { type: 'login', name, bankroll: 1000 }
    }));

    setSuccess(mode === 'login' ? `Bienvenue ${name} !` : `Compte créé ! Bienvenue ${name} !`);
    await new Promise(r => setTimeout(r, 600));
    onSuccess(user);
    onClose();
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative bg-[#080808] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/80"
        onClick={e => e.stopPropagation()}>

        {/* Accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition text-sm">✕</button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-400/20 flex items-center justify-center">
            <span className="text-xl">👑</span>
          </div>
          <h2 className="text-white font-black text-xl">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Nexus Prime Elite</p>
        </div>

        {/* Badge sécurité */}
        <div className="flex items-center justify-center gap-3 mb-5 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <span className="text-emerald-400 text-xs">🔒</span>
          <span className="text-emerald-400 text-xs font-semibold">Connexion sécurisée SSL 256-bit</span>
          <span className="text-gray-600 text-xs">·</span>
          <span className="text-gray-500 text-xs">Données chiffrées</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition placeholder-gray-600"
              placeholder="vous@exemple.com" />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition placeholder-gray-600"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-xs">
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {mode === 'register' && <PasswordStrength password={password} />}
          </div>

          {/* Confirmation mdp (register uniquement) */}
          {mode === 'register' && (
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                autoComplete="new-password"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 transition placeholder-gray-600 ${
                  confirm && confirm !== password
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : confirm && confirm === password
                    ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    : 'border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20'
                }`}
                placeholder="••••••••" />
              {confirm && confirm === password && (
                <p className="text-emerald-400 text-xs mt-1">✓ Les mots de passe correspondent</p>
              )}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 text-xs">⚠</span>
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-xs">✓</span>
              <p className="text-emerald-400 text-xs">{success}</p>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-60 hover:scale-[1.01]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Traitement sécurisé…
              </span>
            ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>

          {/* Lien bascule login/register */}
          <p className="text-center text-gray-600 text-xs">
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); setPassword(''); setConfirm(''); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition">
                  Créer un compte
                </button>
              </>
            ) : (
              <>Déjà un compte ?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setConfirm(''); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition">
                  Se connecter
                </button>
              </>
            )}
          </p>

          {/* Mentions légales */}
          {mode === 'register' && (
            <p className="text-center text-gray-700 text-xs leading-relaxed">
              En créant un compte, vous acceptez nos{' '}
              <a href="#" className="text-gray-500 hover:text-gray-300 underline transition">CGU</a>
              {' '}et notre{' '}
              <a href="#" className="text-gray-500 hover:text-gray-300 underline transition">Politique de confidentialité</a>.
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}

const NAV_LINKS = [
  { href: '/#picks-section', label: 'Picks', icon: '🎯' },
  { href: '/historique', label: 'Historique', icon: '📈' },
  { href: '/methodologie', label: 'Méthodologie', icon: '⚙️' },
  { href: '/chat', label: 'Assistant IA', icon: '🤖', chat: true },
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

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          scrolled ? 'bg-black/85 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/50' : 'bg-transparent'
        }`}
      >
        {/* Accent line or */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || pathname === link.href.replace('/#picks-section', '/');
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    (link as { premium?: boolean }).premium
                      ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 text-amber-400 border border-amber-500/20 hover:border-amber-500/40'
                      : (link as { chat?: boolean }).chat
                      ? isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-cyan-500/70 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20'
                      : isActive ? 'bg-white/8 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="text-xs">{link.icon}</span>{link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <span className="text-black text-[10px] font-black">{user.email[0].toUpperCase()}</span>
                  </div>
                  <span className="text-white text-xs font-semibold truncate max-w-[100px]">{user.email}</span>
                </div>
                <button onClick={() => {
                  setUser(null);
                  window.dispatchEvent(new CustomEvent('nexus-auth', { detail: { type: 'logout' } }));
                }} className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-white text-xs transition hover:bg-white/5">
                  Déconnexion
                </button>
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
            {/* Hamburger mobile */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition ml-1">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect width="16" height="2" rx="1" fill="currentColor"/>
                <rect y="5" width="16" height="2" rx="1" fill="currentColor"/>
                <rect y="10" width="16" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* Menu mobile */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden">
              <div className="container mx-auto px-4 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      (link as { premium?: boolean }).premium
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : (link as { chat?: boolean }).chat
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <span>{link.icon}</span>{link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <button onClick={() => { setAuthModal('login'); setMobileOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all hover:bg-white/5 text-left">
                      🔑 Connexion
                    </button>
                    <button onClick={() => { setAuthModal('register'); setMobileOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm">
                      👑 Créer un compte
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={u => { setUser(u); setAuthModal(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
