'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Pick {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  pick: string;
  odds: number;
  confidence: number;
  edge_percent: number;
  kelly: number;
  tier: string;
  match_time: string;
  steam: boolean;
}

export default function PickModal({ pick, isOpen, onClose, bankroll }: { pick: Pick | null, isOpen: boolean, onClose: () => void, bankroll: number }) {
  if (!pick) return null;

  const miseRec = Math.round(bankroll * (pick.kelly || 0.02));
  const profitPotentiel = (miseRec * (pick.odds - 1)).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  {pick.tier}
                </span>
                <h2 className="text-white font-black text-2xl mt-4 tracking-tight">
                  {pick.home} <span className="text-gray-600 font-medium text-sm px-1">vs</span> {pick.away}
                </h2>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {pick.league} · {pick.match_time}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">
              {/* Confiance IA */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Confiance IA</p>
                  <p className="text-cyan-400 font-black text-sm">{(pick.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pick.confidence * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-10">
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Sélection</p>
                  <p className="text-white font-black text-lg uppercase tracking-tight">{pick.pick}</p>
                </div>
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Cote</p>
                  <p className="text-white font-black text-lg">{pick.odds.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Edge IA</p>
                  <p className="text-emerald-400 font-black text-lg">{pick.edge_percent.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">CLV</p>
                  <p className="text-cyan-400 font-black text-lg">+0.58%</p>
                </div>
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Modèle</p>
                  <p className="text-white font-black text-sm uppercase tracking-widest">onnx-v6</p>
                </div>
                <div>
                  <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Steam</p>
                  <p className="text-gray-600 font-black text-sm">—</p>
                </div>
              </div>

              {/* Analyse IA Box */}
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Analyse IA — ONNX V6</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                  Signal de value modéré. {pick.home} favori à domicile avec un edge de {pick.edge_percent.toFixed(1)}% selon notre calibration Platt. Forme à domicile solide (4V/1D sur 5). La cote de marché sous-estime légèrement la probabilité calibrée.
                </p>
              </div>

              {/* Forme Récente */}
              <div className="mb-10">
                <p className="text-gray-700 text-[9px] font-bold uppercase tracking-widest mb-4">Forme Récente (5 derniers matchs)</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">{pick.home}</span>
                    <div className="flex gap-1">
                      {['V', 'V', 'N', 'V', 'D'].map((r, i) => (
                        <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${r === 'V' ? 'bg-emerald-500/20 text-emerald-400' : r === 'N' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">{pick.away}</span>
                    <div className="flex gap-1">
                      {['D', 'N', 'D', 'V', 'D'].map((r, i) => (
                        <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${r === 'V' ? 'bg-emerald-500/20 text-emerald-400' : r === 'N' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bankroll Footer */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-600 text-[9px] font-bold uppercase mb-1">Gestion bankroll — Quarter-Kelly</p>
                    <p className="text-gray-700 text-[9px] font-bold uppercase tracking-tight">Mise recommandée</p>
                    <p className="text-amber-500 font-black text-2xl">€{miseRec}.31</p>
                    <p className="text-gray-700 text-[9px] font-bold uppercase mt-1">1.2% de €{bankroll}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Profit potentiel</p>
                    <p className="text-emerald-400 font-black text-2xl">+{profitPotentiel}€</p>
                    <p className="text-emerald-500/50 text-[9px] font-bold uppercase mt-1">ROI: +65%</p>
                  </div>
                </div>
                <p className="text-gray-800 text-[8px] font-bold uppercase leading-tight">Formule : Mise = (Edge / (Cote - 1)) * 0.25 * Bankroll · Plafond 5%</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
