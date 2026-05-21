'use client';
import { motion } from 'framer-motion';

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
  tier: string;
  match_time: string;
  steam: boolean;
  ai_analysis: string;
}

export default function PickCard({ 
  pick, 
  bankroll, 
  onOpen, 
  onAdd 
}: { 
  pick: Pick; 
  bankroll: number; 
  onOpen: () => void; 
  onAdd: () => void; 
}) {
  const isHighConf = pick.confidence >= 0.7;
  const isElite = pick.tier === 'ELITE';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative group bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 ${
        isElite ? 'bg-amber-500/10 group-hover:opacity-100 opacity-50' : 'bg-emerald-500/5 group-hover:opacity-100 opacity-30'
      }`} />

      <div className="p-5 relative z-10">
        {/* Header: League & Tier */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">{pick.league}</span>
            {pick.steam && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-bold animate-pulse">STEAM</span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
            isElite ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
            pick.tier === 'PRO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-gray-500/10 text-gray-400 border border-white/5'
          }`}>
            {pick.tier}
          </span>
        </div>

        {/* Teams */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm truncate max-w-[140px]">{pick.home}</span>
            <span className="text-gray-700 text-[10px]">VS</span>
            <span className="text-white font-bold text-sm truncate max-w-[140px] text-right">{pick.away}</span>
          </div>
        </div>

        {/* Prediction Main */}
        <div className="bg-white/3 rounded-xl p-4 border border-white/5 mb-6 group-hover:bg-white/5 transition-colors">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Sélection IA</p>
              <h3 className="text-white font-black text-xl tracking-tight">
                {pick.pick === 'HOME' ? pick.home : pick.pick === 'AWAY' ? pick.away : 'Match Nul'}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Cote</p>
              <span className="text-emerald-400 font-black text-xl">{pick.odds.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/40 p-3 rounded-lg border border-white/5">
            <p className="text-gray-600 text-[9px] font-bold uppercase mb-1">Edge Calibré</p>
            <p className="text-white font-black text-sm">+{pick.edge_percent.toFixed(1)}%</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/5">
            <p className="text-gray-600 text-[9px] font-bold uppercase mb-1">Confiance</p>
            <p className={`font-black text-sm ${isHighConf ? 'text-cyan-400' : 'text-white'}`}>
              {(pick.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={onOpen}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
          >
            Analyse IA
          </button>
          <button 
            onClick={onAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            + Slip
          </button>
        </div>
      </div>
    </motion.div>
  );
}
