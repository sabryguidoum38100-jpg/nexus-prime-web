'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Pick {
  id: string;
  home: string;
  away: string;
  pick: string;
  odds: number;
  confidence: number;
  edge_percent: number;
  ai_analysis: string;
}

export default function PickModal({ 
  pick, 
  bankroll, 
  onClose 
}: { 
  pick: Pick | null; 
  bankroll: number; 
  onClose: () => void; 
}) {
  if (!pick) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-white font-black text-2xl mb-1">{pick.home} vs {pick.away}</h2>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Analyse IA Approfondie</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-600 text-[10px] font-black uppercase mb-1">Cote Pinnacle</p>
                <p className="text-white font-black text-xl">{pick.odds.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-600 text-[10px] font-black uppercase mb-1">Confiance</p>
                <p className="text-cyan-400 font-black text-xl">{(pick.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-600 text-[10px] font-black uppercase mb-1">Edge Détecté</p>
                <p className="text-emerald-400 font-black text-xl">+{pick.edge_percent.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Raisonnement du Modèle
                </h3>
                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 text-gray-400 text-sm leading-relaxed italic">
                  &quot;{pick.ai_analysis}&quot;
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-500 font-black text-xs uppercase tracking-widest">Stratégie Bankroll</span>
                  <span className="text-white font-bold text-xs italic opacity-50">Basé sur €{bankroll.toLocaleString()}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Mise Recommandée</p>
                    <p className="text-white font-black text-2xl">€{(bankroll * (pick.edge_percent / 100) * 0.25).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Fraction Kelly</p>
                    <p className="text-amber-500 font-black text-xl">0.25 (Quarter)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
