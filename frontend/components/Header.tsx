'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-black text-xl">N</div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-black text-lg tracking-tighter group-hover:text-amber-500 transition-colors">NEXUS</span>
            <span className="text-amber-500 font-black text-[10px] tracking-[0.2em]">PRIME <span className="text-white/50">ELITE</span></span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: 'Picks', href: '/#picks-section', icon: '🎯' },
            { name: 'Historique', href: '/historique', icon: '📊' },
            { name: 'Méthodologie', href: '/methodologie', icon: '⚙️' },
            { name: 'Assistant IA', href: '/chat', icon: '🤖', badge: 'BETA' },
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors relative group"
            >
              <span>{item.icon}</span>
              {item.name}
              {item.badge && <span className="text-[7px] bg-white/10 px-1 rounded text-white/50">{item.badge}</span>}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all">
            👑 Premium
          </Link>
          <Link href="/login" className="text-white text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}
