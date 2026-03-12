'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/80 border-b border-emerald-500/20">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-black">
            NP
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Nexus Prime
            </h1>
            <p className="text-xs text-gray-400">Pronos IA 2026</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <button className="px-6 py-2 rounded-lg border border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 transition-all">
            Connexion
          </button>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:shadow-lg hover:shadow-emerald-400/50 transition-all">
            Commencer
          </button>
        </motion.div>
      </nav>
    </header>
  );
}
