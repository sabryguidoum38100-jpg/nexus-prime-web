'use client';

import { motion } from 'framer-motion';

export default function Hero() {
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
          <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-lg hover:shadow-2xl hover:shadow-emerald-400/50 transition-all transform hover:scale-105">
            Générer un Pick
          </button>
          <button className="px-8 py-4 rounded-lg border-2 border-emerald-400/50 text-emerald-400 font-bold text-lg hover:bg-emerald-400/10 transition-all">
            Voir les Signaux
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
            { label: 'Picks Générés', value: '12.5K+' },
            { label: 'Taux de Confiance', value: '78.3%' },
            { label: 'Edge Moyen', value: '+4.2%' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-emerald-400 text-sm font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
