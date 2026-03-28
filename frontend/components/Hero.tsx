'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  const [stats, setStats] = useState({ totalPicks: 10, avgConfidence: 70.4, avgEdge: 5.46 });

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nexus-prime-web.onrender.com';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(`${backendUrl}/api/picks`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((data: Array<{ confidence: number; edge_percent: number }>) => {
        clearTimeout(timer);
        if (!Array.isArray(data) || data.length === 0) return;
        const total = data.length;
        const avgConf = (data.reduce((s, p) => s + p.confidence, 0) / total) * 100;
        const avgEdge = data.reduce((s, p) => s + p.edge_percent, 0) / total;
        setStats({ totalPicks: total, avgConfidence: avgConf, avgEdge });
      })
      .catch(() => clearTimeout(timer));
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="pt-36 pb-24 px-4 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-4xl">

        {/* Badge ONNX */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-bold tracking-wider">MOTEUR ONNX v6 · CALIBRATION PLATT · LIVE</span>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Pronostics IA
            </span>
            <br />
            <span className="text-white">Prédiction 2026</span>
          </h1>
        </motion.div>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Moteur IA multi-feature haute performance. Signaux temps réel.{' '}
          <span className="text-white font-semibold">Edge détecté automatiquement.</span>
        </motion.p>

        {/* Boutons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap mb-16"
        >
          <button
            onClick={() => scrollTo('picks-section')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-base hover:shadow-2xl hover:shadow-amber-500/40 transition-all transform hover:scale-105"
          >
            🎯 Voir les Picks
          </button>
          <button
            onClick={() => scrollTo('live-section')}
            className="px-8 py-4 rounded-xl border border-white/15 text-gray-300 font-semibold text-base hover:bg-white/5 hover:border-white/30 hover:text-white transition-all"
          >
            📡 Signaux Live
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { label: 'Picks Générés', value: `${stats.totalPicks}`, color: 'text-white', sub: 'Aujourd\'hui' },
            { label: 'Taux de Confiance', value: `${stats.avgConfidence.toFixed(1)}%`, color: 'text-cyan-400', sub: 'Moyenne IA' },
            { label: 'Edge Moyen', value: `+${stats.avgEdge.toFixed(2)}%`, color: 'text-emerald-400', sub: 'Calibré Platt' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all hover:bg-white/5">
              <p className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-gray-700 text-xs">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
