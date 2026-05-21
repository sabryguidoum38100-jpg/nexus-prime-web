'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);
  const miseRec = Math.round(bankroll * (pick.kelly || 0.02));
  const profitPotentiel = (miseRec * (pick.odds - 1)).toFixed(2);
  
  const isElite = pick.tier === 'ELITE';
  const accentColor = isElite ? 'amber-500' : 'emerald-400';
  const badgeColor = isElite ? 'amber-500' : 'emerald-500';

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="relative group"
    >
      {/* Glow effect dynamique */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${isElite ? 'from-amber-500/20 to-yellow-500/10' : 'from-emerald-500/20 to-cyan-500/10'} rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition duration-500`} />
      
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-7 h-full flex flex-col transition-colors group-hover:border-white/20">
        
        {/* Header: Badge & League & Odds */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded bg-${badgeColor}/10 border border-${badgeColor}/20 text-${accentColor} text-[9px] font-black uppercase tracking-wider`}>
                {pick.tier === 'ELITE' ? 'ELITE' : 'PRO'}
              </span>
              <span className="text-gray-700 text-[9px] font-bold uppercase tracking-widest">{pick.league}</span>
            </div>
            <p className="text-gray-600 text-[9px] font-bold uppercase">{pick.sport}</p>
          </div>
          <div className="text-right">
            <motion.p 
              animate={{ scale: isHovered ? 1.1 : 1 }}
              className="text-white font-black text-3xl tracking-tighter"
            >
              {pick.odds.toFixed(2)}
            </motion.p>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isHovered ? 'text-amber-500' : 'text-gray-600'} transition-colors`}>
              {pick.pick}
            </p>
          </div>
        </div>

        {/* Match Name */}
        <div className="mb-8">
          <h3 className="text-white font-black text-xl tracking-tight leading-tight group-hover:text-amber-500 transition-colors">{pick.home}</h3>
          <p className="text-gray-600 text-xs font-bold my-0.5 uppercase">vs</p>
          <h3 className="text-white font-black text-xl tracking-tight leading-tight">{pick.away}</h3>
          <p className="text-gray-700 text-[9px] font-bold uppercase mt-2">Sam. 4 avr. · 16:15</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="flex flex-col">
            <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Edge</p>
            <p className="text-emerald-400 font-black text-base">{pick.edge_percent.toFixed(1)}%</p>
          </div>
          <div className="flex flex-col">
            <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Confiance</p>
            <p className="text-white font-black text-base">{(pick.confidence * 100).toFixed(0)}%</p>
          </div>
          <div className="flex flex-col">
            <p className="text-gray-700 text-[9px] font-bold uppercase mb-1">Mise rec.</p>
            <motion.p 
              key={bankroll}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-500 font-black text-base"
            >
              €{miseRec}
            </motion.p>
          </div>
        </div>

        {/* Footer: Profit & Actions */}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-gray-700 text-[9px] font-bold uppercase mb-0.5">Profit potentiel</p>
            <p className="text-emerald-400 font-black text-sm">+{profitPotentiel}€</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onOpen}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Détails
            </button>
            <button 
              onClick={onAdd}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
            >
              <span>+</span> Bet Slip
            </button>
          </div>
        </div>

        {/* Scanline effect discret */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
          <motion.div 
            animate={{ y: ['0%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-full h-[10%] bg-white/5 blur-xl"
          />
        </div>
      </div>
    </motion.div>
  );
}
