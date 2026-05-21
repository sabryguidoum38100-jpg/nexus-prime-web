'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PickCard from './PickCard';
import LiveSignals from './LiveSignals';
import PickModal from './PickModal';

export default function PicksSection() {
  const [activeTab, setActiveTab] = useState<'ai' | 'live'>('ai');
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankroll, setBankroll] = useState(1000);
  const [selectedPick, setSelectedPick] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/picks')
      .then(res => res.json())
      .then(data => {
        setPicks(data.picks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openModal = (pick: any) => {
    setSelectedPick(pick);
    setIsModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <section id="picks-section" className="py-20 bg-black min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Onglets principaux */}
        <div className="flex gap-12 border-b border-white/10 mb-12">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'ai' ? 'text-amber-500' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            Picks IA
            {activeTab === 'ai' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'live' ? 'text-amber-500' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            Signaux Live
            {activeTab === 'live' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'ai' ? (
            <motion.div
              key="ai-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Header de la section AI */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-white font-black text-2xl flex items-center gap-3 uppercase tracking-tighter">
                    AI Picks <span className="text-gray-600 text-sm">({picks.length})</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                    </span>
                  </h2>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Moteur ONNX v6 · Calibration Platt · Edge 2-10%
                  </p>
                </div>

                {/* Bankroll Selector */}
                <div className="flex items-center gap-3 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/5">
                  <span className="text-gray-500 text-[10px] font-bold uppercase ml-3">Bankroll €</span>
                  <input 
                    type="number" 
                    value={bankroll}
                    onChange={(e) => setBankroll(Number(e.target.value))}
                    className="w-20 bg-transparent text-white font-black text-sm outline-none"
                  />
                  <div className="flex gap-1 pr-1">
                    {[500, 1000, 2000, 5000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setBankroll(val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                          bankroll === val ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {val >= 1000 ? `${val/1000}k` : val}
                      </button>
                    ))}
                    <button className="p-1 text-gray-600 hover:text-white transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtres secondaires */}
              <div className="flex flex-wrap gap-2 mb-10">
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                  {['Tous', 'ELITE', 'PRO', 'INFO'].map(f => (
                    <button key={f} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${f === 'Tous' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                  {['Toutes confiances', 'Haute (70%+)', 'Moyenne (50-70%)', 'Faible (<50%)'].map((f, i) => (
                    <button key={f} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                      {i === 1 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {i === 2 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      {i === 3 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Picks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {picks.map((pick) => (
                  <PickCard 
                    key={pick.id} 
                    pick={pick} 
                    bankroll={bankroll}
                    onOpen={() => openModal(pick)} 
                    onAdd={() => {}} 
                  />
                ))}
              </div>

              {/* Section Premium Locked */}
              <div className="mt-12 pt-12 border-t border-white/5">
                <div className="flex items-center justify-center gap-3 mb-10">
                  <span className="w-8 h-px bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">👑 PREMIUM — Pass Nexus 👑</span>
                  <span className="w-8 h-px bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 pointer-events-none grayscale">
                   <div className="bg-[#0a0a0a] border border-amber-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <span className="text-3xl mb-4">👑</span>
                      <h4 className="text-white font-black text-xl mb-2 uppercase">Pick Premium</h4>
                      <p className="text-gray-600 text-xs mb-6 uppercase font-bold tracking-widest">Réservé aux abonnés Pass Nexus</p>
                      <button className="px-8 py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest">Débloquer — 19,99€/mois</button>
                   </div>
                   <div className="bg-[#0a0a0a] border border-amber-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <span className="text-3xl mb-4">👑</span>
                      <h4 className="text-white font-black text-xl mb-2 uppercase">Pick Premium</h4>
                      <p className="text-gray-600 text-xs mb-6 uppercase font-bold tracking-widest">Réservé aux abonnés Pass Nexus</p>
                      <button className="px-8 py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest">Débloquer — 19,99€/mois</button>
                   </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="live-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <LiveSignals />
            </motion.div>
          )}
        </AnimatePresence>

        <PickModal 
          pick={selectedPick} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          bankroll={bankroll}
        />
      </div>
    </section>
  );
}
