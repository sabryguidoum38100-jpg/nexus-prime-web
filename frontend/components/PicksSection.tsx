'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pick {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  stake: number;
  edge_percent: number;
  kelly: number;
  clv?: number;
  tier: number;
  steam: boolean;
  model_version?: string;
}

// Kelly Criterion: f* = (bp - q) / b
// b = decimal_odds - 1, p = win_prob, q = 1 - p
function calcKellyStake(bankroll: number, kelly: number): number {
  const fraction = Math.min(kelly, 0.25); // cap at 25% max
  return Math.round(bankroll * fraction * 100) / 100;
}

function PickModal({ pick, onClose, bankroll = 1000 }: { pick: Pick; onClose: () => void; bankroll?: number }) {
  const conf = (pick.confidence * 100).toFixed(1);
  const tierLabel = pick.tier === 1 ? 'ELITE' : pick.tier === 2 ? 'PRO' : 'INFO';
  const tierGradient =
    pick.tier === 1 ? 'from-yellow-400 to-orange-400' :
    pick.tier === 2 ? 'from-emerald-400 to-cyan-400' :
    'from-gray-400 to-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="relative bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-emerald-500/10"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl transition">✕</button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black text-black bg-gradient-to-r ${tierGradient}`}>
              {tierLabel}
            </span>
            {pick.steam && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                ⚡ STEAM
              </span>
            )}
            <span className="ml-auto text-emerald-400 font-bold text-sm">{pick.edge_percent.toFixed(2)}% Edge</span>
          </div>
          <h2 className="text-xl font-bold text-white">{pick.match_id}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {pick.sport} — Signal : <span className="text-emerald-400 font-semibold">{pick.pick}</span>
          </p>
        </div>

        {/* Barre de confiance */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Confiance IA</span>
            <span className="text-white font-bold">{conf}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${conf}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            />
          </div>
        </div>

        {/* Stats grille */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: '💰 Stake recommandé', value: `€${calcKellyStake(bankroll, pick.kelly).toFixed(2)}` },
            { label: '📐 Kelly Criterion', value: `${(pick.kelly * 100).toFixed(1)}%` },
            { label: '📊 Edge détecté', value: `${pick.edge_percent.toFixed(2)}%` },
            { label: '🏆 Tier', value: tierLabel },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">{item.label}</p>
              <p className="text-white font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-xs text-center">
          Pronostic généré par modèle XGBoost/ONNX. Pariez de manière responsable.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function PicksSection({ bankroll = 1000 }: { bankroll?: number }) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [filterSport, setFilterSport] = useState('all');
  const [filterConf, setFilterConf] = useState('all');

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nexus-prime-web.onrender.com';
      const response = await fetch(`${backendUrl}/api/picks`, { method: 'GET' });
      const data = await response.json();
      setPicks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch picks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks();
    const interval = setInterval(fetchPicks, 60000);
    return () => clearInterval(interval);
  }, []);

  const sports = ['all', ...Array.from(new Set(picks.map(p => p.sport)))];

  const filtered = picks.filter(p => {
    const sportOk = filterSport === 'all' || p.sport === filterSport;
    const confPct = p.confidence * 100;
    const confOk =
      filterConf === 'all' ? true :
      filterConf === 'high' ? confPct >= 70 :
      filterConf === 'medium' ? confPct >= 50 && confPct < 70 :
      confPct < 50;
    return sportOk && confOk;
  });

  const getTierColor = (tier: number) =>
    tier === 1 ? 'bg-yellow-500' : tier === 2 ? 'bg-emerald-500' : 'bg-gray-500';

  const getTierLabel = (tier: number) =>
    tier === 1 ? 'ELITE' : tier === 2 ? 'PRO' : 'INFO';

  return (
    <>
      <div className="w-full bg-gray-900 rounded-xl p-6 border border-gray-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">
            🎯 AI Picks
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} résultats)</span>
          </h2>
          <button
            onClick={fetchPicks}
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-sm font-semibold transition-all"
          >
            {loading ? '⏳ Chargement…' : '🔄 Actualiser'}
          </button>
        </div>

        {/* Filtres Sport */}
        <div className="flex flex-wrap gap-2 mb-3">
          {sports.slice(0, 6).map(s => (
            <button key={s} onClick={() => setFilterSport(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterSport === s
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}>
              {s === 'all' ? '🌍 Tous les sports' : s}
            </button>
          ))}
        </div>

        {/* Filtres Confiance */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: '⭐ Toutes confiances' },
            { key: 'high', label: '🔥 Haute (70%+)' },
            { key: 'medium', label: '📊 Moyenne (50-70%)' },
            { key: 'low', label: '📉 Faible (<50%)' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterConf(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterConf === f.key
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste des picks */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>{loading ? 'Chargement des picks…' : 'Aucun pick pour ces filtres.'}</p>
            </div>
          ) : (
            filtered.map((pick, idx) => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedPick(pick)}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-emerald-500/50 cursor-pointer hover:bg-gray-750 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(pick.tier)}`}>
                      {getTierLabel(pick.tier)}
                    </span>
                    {pick.steam && (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        ⚡ STEAM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold text-sm">{pick.edge_percent.toFixed(2)}% Edge</span>
                    <span className="text-gray-600 text-xs group-hover:text-gray-300 transition-colors">Détails →</span>
                  </div>
                </div>

                <p className="text-white font-semibold mb-1">{pick.match_id}</p>
                <p className="text-gray-400 text-sm mb-3">{pick.pick}</p>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-gray-400">Confiance</p>
                    <p className="text-white font-bold">{(pick.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-gray-400">Stake</p>
                    <p className="text-white font-bold">€{calcKellyStake(bankroll, pick.kelly).toFixed(0)}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-gray-400">Kelly</p>
                    <p className="text-white font-bold">{(pick.kelly * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-gray-400">Sport</p>
                    <p className="text-white font-bold truncate">{pick.sport}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPick && <PickModal pick={selectedPick} onClose={() => setSelectedPick(null)} bankroll={bankroll} />}
      </AnimatePresence>
    </>
  );
}
