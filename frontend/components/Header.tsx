'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '🎯 Picks', href: '/#picks-section' },
    { name: '📊 Historique', href: '/historique' },
    { name: '⚙️ Méthodologie', href: '/methodologie' },
    { name: '🤖 Assistant IA', href: '/chat' },
    { name: '👑 Premium', href: '/pricing' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/8 py-3' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-lg group-hover:scale-110 transition-transform">N</div>
          <span className="text-white font-black text-xl tracking-tighter">NEXUS <span className="text-amber-500">PRIME</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Connexion
          </Link>
          <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-colors">
            Commencer
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/8 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/8 flex flex-col gap-4">
                <Link href="/login" className="text-white font-bold">Connexion</Link>
                <Link href="/signup" className="text-amber-500 font-bold">Créer un compte</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
