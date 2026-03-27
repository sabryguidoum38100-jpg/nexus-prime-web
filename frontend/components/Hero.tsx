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
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Pronostics IA
            </span>
            <br />
            <span className="text-white">Prédiction 2026</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Moteur IA multi-feature haute performance. Signaux temps réel. Edge détecté automatiquement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <button onClick={() => scrollTo('picks-section')} className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-lg hover:shadow-2xl hover:shadow-emerald-400/50 transition-all transform hover:scale-105">
            🎯 Générer un Pick
          </button>
          <button onClick={() => scrollTo('live-section')} className="px-8 py-4 rounded-lg border-2 border-emerald-400/50 text-emerald-400 font-bold text-lg hover:bg-emerald-400/10 transition-all">
            📡 Voir les Signaux
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
        >
          {[
            { label: 'Picks Générés', value: `${stats.totalPicks}`, color: 'text-white' },
            { label: 'Taux de Confiance', value: `${stats.avgConfidence.toFixed(1)}%`, color: 'text-cyan-400' },
            { label: 'Edge Moyen', value: `+${stats.avgEdge.toFixed(2)}%`, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors">
              <p className="text-gray-600 text-xs font-semibold mb-2">{stat.label}</p>
              <p className={`text-2xl font-black ${(stat as {color: string}).color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
