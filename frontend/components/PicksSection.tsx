'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Pick {
  id: string;
  match_id: string;
  sport: string;
  market: string;
  pick: string;
  confidence: number;
  stake: number;
  edge_percent: number;
}

const MOCK_PICKS: Pick[] = [
  {
    id: '1',
    match_id: 'PSG vs OM',
    sport: 'Football',
    market: '1N2',
    pick: 'HOME',
    confidence: 0.78,
    stake: 50,
    edge_percent: 4.2,
  },
  {
    id: '2',
    match_id: 'MONACO vs LILLE',
    sport: 'Football',
    market: 'O/U 2.5',
    pick: 'OVER',
    confidence: 0.72,
    stake: 30,
    edge_percent: 3.8,
  },
  {
    id: '3',
    match_id: 'REAL vs BARCELONA',
    sport: 'Football',
    market: '1N2',
    pick: 'DRAW',
    confidence: 0.65,
    stake: 25,
    edge_percent: 2.5,
  },
];

export default function PicksSection() {
  const [picks, setPicks] = useState<Pick[]>(MOCK_PICKS);
  const [loading, setLoading] = useState(false);

  const generateNewPick = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.button
        onClick={generateNewPick}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-lg hover:shadow-2xl hover:shadow-emerald-400/50 transition-all disabled:opacity-50"
      >
        {loading ? '⏳ Génération...' : '🎯 Générer un Pick'}
      </motion.button>

      <div className="grid gap-4">
        {picks.map((pick, idx) => (
          <motion.div
            key={pick.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-400/60 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{pick.match_id}</h3>
                <p className="text-sm text-gray-400">{pick.sport} • {pick.market}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">{pick.pick}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-black/40">
                <p className="text-xs text-gray-400 mb-1">Confiance</p>
                <p className="text-2xl font-bold text-emerald-400">{(pick.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-black/40">
                <p className="text-xs text-gray-400 mb-1">Edge</p>
                <p className="text-2xl font-bold text-cyan-400">{pick.edge_percent.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-black/40">
                <p className="text-xs text-gray-400 mb-1">Mise</p>
                <p className="text-2xl font-bold text-white">${pick.stake}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 font-semibold hover:bg-emerald-400/30 transition-all">
                Détails
              </button>
              <button className="flex-1 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 font-semibold hover:bg-cyan-400/30 transition-all">
                Parier
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
