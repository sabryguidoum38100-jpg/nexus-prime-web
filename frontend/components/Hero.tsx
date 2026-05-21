'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToPicks = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('picks-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) return <div className="min-h-[60vh] bg-black" />;

  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-black">
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge haut */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">
              Moteur ONNX v6 · Calibration Platt · Live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Pronostics IA <br />
            <span className="text-amber-500">Prédiction 2026</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Moteur IA multi-feature haute performance. Signaux temps réel. <span className="text-white">Edge détecté automatiquement.</span>
          </p>

          {/* Boutons CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button 
              onClick={scrollToPicks}
              className="px-8 py-4 rounded-full bg-amber-500 text-black font-black text-sm flex items-center gap-2 hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              🎯 Voir les Picks
            </button>
            <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-black text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
              📡 Signaux Live
            </button>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Picks générés</p>
              <p className="text-white font-black text-4xl mb-1">10</p>
              <p className="text-gray-700 text-[10px] font-bold uppercase">Aujourd&apos;hui</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Taux de confiance</p>
              <p className="text-cyan-400 font-black text-4xl mb-1">70.4%</p>
              <p className="text-gray-700 text-[10px] font-bold uppercase">Moyenne IA</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Edge moyen</p>
              <p className="text-emerald-400 font-black text-4xl mb-1">+5.46%</p>
              <p className="text-gray-700 text-[10px] font-bold uppercase">Calibré Platt</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
