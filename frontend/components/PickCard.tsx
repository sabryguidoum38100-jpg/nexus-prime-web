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
  kelly: number;
  tier: string;
  match_time: string;
  steam: boolean;
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
  const isHighConf = pick.confidence > 0.8;
  const isElite = pick.tier === 'ELITE';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative group bg-[#0a0a0a] border ${isElite ? 'border-amber-500/30' : 'border-white/10'} rounded-2xl overflow-hidden shadow-xl`}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${isElite ? 'from-amber-500/20 to-yellow-500/20' : 'from-emerald-500/10 to-cyan-500/10'} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
      
      <div className="relative p-6 bg-[#0a0a0a] h-full flex flex-col">
        {/* Header de la carte */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{pick.league}</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                isElite ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {pick.tier}
              </span>
              {pick.steam && (
                <span className="flex items-center gap-1 text-[8px] font-black text-red-500 animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-red-500" /> STEAM
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-lg leading-none">@ {pick.odds.toFixed(2)}</p>
            <p className="text-gray-600 text-[8px] font-bold uppercase mt-1">Pinnacle Odds</p>
          </div>
        </div>

        {/* Match Info */}
        <div className="mb-6">
          <h3 className="text-white font-black text-xl tracking-tighter leading-tight mb-1">{pick.home}</h3>
          <h3 className="text-white font-black text-xl tracking-tighter leading-tight">{pick.away}</h3>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/3 p-2.5 rounded-xl border border-white/5">
            <p className="text-gray-600 text-[8px] font-black uppercase mb-1">Edge</p>
            <p className="text-emerald-400 font-black text-sm">+{pick.edge_percent.toFixed(1)}%</p>
          </div>
          <div className="bg-white/3 p-2.5 rounded-xl border border-white/5">
            <p className="text-gray-600 text-[8px] font-black uppercase mb-1">Conf.</p>
            <p className="text-cyan-400 font-black text-sm">{(pick.confidence * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white/3 p-2.5 rounded-xl border border-white/5">
            <p className="text-gray-600 text-[8px] font-black uppercase mb-1">Kelly</p>
            <p className="text-amber-500 font-black text-sm">{(pick.kelly * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Prediction Display */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-[8px] font-bold uppercase mb-0.5">IA Signal</p>
            <p className="text-white font-black text-sm tracking-tight">{pick.pick}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onOpen}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
              title="Analyse IA"
            >
              📊
            </button>
            <button 
              onClick={onAdd}
              className="px-4 h-10 rounded-xl bg-amber-500 text-black font-black text-xs hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              + SLIP
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
