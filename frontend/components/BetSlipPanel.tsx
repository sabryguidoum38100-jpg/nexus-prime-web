'use client';
import { motion } from 'framer-motion';

interface Pick {
  id: string;
  home: string;
  away: string;
  pick: string;
  odds: number;
  kelly: number;
}

export default function BetSlipPanel({ 
  items, 
  bankroll, 
  onClose, 
  onRemove 
}: { 
  items: Pick[]; 
  bankroll: number; 
  onClose: () => void; 
  onRemove: (id: string) => void;
}) {
  const totalOdds = items.reduce((acc, item) => acc * item.odds, 1);
  const avgKelly = items.length > 0 ? items.reduce((acc, item) => acc + item.kelly, 0) / items.length : 0;
  const suggestedStake = bankroll * avgKelly;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-[#050505] border-l border-white/10 z-[150] shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white font-black text-xl uppercase tracking-tighter">Votre Bet Slip</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <span className="text-4xl mb-4">📋</span>
            <p className="text-white font-bold">Le slip est vide</p>
            <p className="text-xs">Ajoutez des picks pour calculer votre mise</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
              <button 
                onClick={() => onRemove(item.id)}
                className="absolute top-2 right-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <div className="flex justify-between items-start mb-2">
                <p className="text-white font-bold text-sm">{item.home} vs {item.away}</p>
                <span className="text-emerald-400 font-black text-sm">{item.odds.toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Sélection : {item.pick}</p>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-6 bg-white/3 border-t border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase">Cote Totale</span>
            <span className="text-white font-black text-xl">{totalOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase">Mise Rec. (Kelly)</span>
            <span className="text-amber-500 font-black text-xl">€{suggestedStake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase">Profit Potentiel</span>
            <span className="text-emerald-400 font-black text-xl">€{(suggestedStake * totalOdds - suggestedStake).toFixed(2)}</span>
          </div>
          
          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-amber-500/30 transition-all mt-4">
            Simuler le Placement
          </button>
          <p className="text-center text-gray-700 text-[9px] uppercase font-bold tracking-tighter">
            Basé sur une bankroll de €{bankroll.toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
