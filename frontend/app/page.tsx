'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PicksSection from '@/components/PicksSection';
import LiveSignals from '@/components/LiveSignals';
import Footer from '@/components/Footer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('picks');

  // Permet au Hero de switcher vers l'onglet "live" via un event custom
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'live') setActiveTab('live');
      if (detail === 'picks') setActiveTab('picks');
    };
    window.addEventListener('nexus-tab', handler);
    return () => window.removeEventListener('nexus-tab', handler);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
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
            🎯 Picks IA
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
            📡 Signaux Live
          </motion.button>
        </div>

        {activeTab === 'picks' && <PicksSection />}
        {activeTab === 'live' && <div id="live-section"><LiveSignals /></div>}
      </div>

      <Footer />
    </main>
  );
}
