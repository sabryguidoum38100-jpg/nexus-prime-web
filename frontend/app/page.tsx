'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PicksSection from '@/components/PicksSection';
import LiveSignals from '@/components/LiveSignals';
import Footer from '@/components/Footer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('picks');
  const [bankroll, setBankroll] = useState(1000);

  // Fetch user session to get bankroll
  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => {
        if (data.user?.bankroll) {
          setBankroll(data.user.bankroll);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for auth changes (login/logout events)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'live') setActiveTab('live');
      if (detail === 'picks') setActiveTab('picks');
      if (detail?.type === 'login') {
        setBankroll(detail.bankroll || 1000);
        toast.success(`Bienvenue ${detail.name} ! Bankroll : €${(detail.bankroll || 1000).toLocaleString()}`, {
          duration: 4000,
        });
      }
      if (detail?.type === 'logout') {
        setBankroll(1000);
        toast.info('Deconnexion reussie');
      }
    };
    window.addEventListener('nexus-tab', handler);
    window.addEventListener('nexus-auth', handler);
    return () => {
      window.removeEventListener('nexus-tab', handler);
      window.removeEventListener('nexus-auth', handler);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#fff',
          },
        }}
      />
      <Header />
      <Hero />
      <div id="picks-section" className="container mx-auto px-4 py-20">
        <div className="flex gap-4 mb-12 border-b border-emerald-500/30">
          <motion.button
            onClick={() => setActiveTab('picks')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'picks'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Picks IA
          </motion.button>
          <motion.button
            onClick={() => { setActiveTab('live'); document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'live'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Signaux Live
          </motion.button>
        </div>
        {activeTab === 'picks' && <PicksSection bankroll={bankroll} />}
        {activeTab === 'live' && <div id="live-section"><LiveSignals /></div>}
      </div>
      <Footer />
    </main>
  );
}
