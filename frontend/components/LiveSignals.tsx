'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Signal {
  id: string;
  match: string;
  league: string;
  pick: string;
  odds: number;
  confidence: number;
  edge_percent: number;
  tier: 'ELITE' | 'VALUE' | 'SMART';
  steam: boolean;
  created_at: string;
}

const TIER_STYLE = {
  ELITE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  VALUE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  SMART: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};

const LIVE_DATA_POOL = [
  { match: "Real Madrid vs Man City", league: "Ligue des Champions", odds: 1.95 },
  { match: "Arsenal vs Bayern", league: "Ligue des Champions", odds: 2.10 },
  { match: "PSG vs Barcelona", league: "Ligue des Champions", odds: 1.85 },
  { match: "Liverpool vs Atalanta", league: "Europa League", odds: 1.45 },
  { match: "Leverkusen vs West Ham", league: "Europa League", odds: 1.65 },
  { match: "Milan vs Roma", league: "Europa League", odds: 2.30 },
  { match: "Marseille vs Benfica", league: "Europa League", odds: 2.45 },
  { match: "Dortmund vs Atletico", league: "Ligue des Champions", odds: 2.20 },
];

export default function LiveSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [status, setStatus] = useState<'connecting' | 'live'>('connecting');
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const usedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => setStatus('live'), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (status !== 'live') return;

    const makeSignal = (base: any): Signal => ({
      id: Math.random().toString(36).substring(2, 9),
      ...base,
      pick: Math.random() > 0.5 ? 'Over 2.5' : 'Home ML',
      confidence: 0.75 + Math.random() * 0.15,
      edge_percent: 2.5 + Math.random() * 4.5,
      tier: Math.random() > 0.7 ? 'ELITE' : Math.random() > 0.4 ? 'VALUE' : 'SMART',
      steam: Math.random() > 0.8,
      created_at: new Date().toISOString(),
    });

    const addSignal = () => {
      const available = LIVE_DATA_POOL.filter(p => !usedRef.current.has(p.match));
      if (available.length === 0) { usedRef.current.clear(); return; }
      const base = available[Math.floor(Math.random() * available.length)];
      const newSignal = makeSignal(base);
      usedRef.current.add(base.match);
      setSignals(prev => [newSignal, ...prev].slice(0, 10));
    };

    const tick = () => {
      addSignal();
      timerRef.current = setTimeout(tick, 6000 + Math.random() * 4000);
    };

    timerRef.current = setTimeout(tick, 1500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status]);

  if (!mounted) return <div className="min-h-[400px]" />;

  return (
    <div className="w-full bg-[#0a0a0a] rounded-2xl p-6 border border-white/8 shadow-2xl relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-white font-black text-xl tracking-tighter uppercase">Flux Inférence Live</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">ONNX_ENGINE_V6 // SECURE_STREAM</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded bg-white/5 border border-white/10">
          <span className="text-amber-500 font-black text-[10px] tracking-widest uppercase">
            {status === 'live' ? 'SYSTEM_READY' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      <div className="space-y-2 min-h-[300px] relative z-10">
        {status === 'connecting' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Initializing Neural Stream...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {signals.map(signal => {
              const t = TIER_STYLE[signal.tier];
              return (
                <motion.div key={signal.id}
                  initial={{ opacity: 0, x: 10, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.98 }}
                  className="bg-white/2 border border-white/5 rounded-lg p-3 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${t.bg} ${t.text} ${t.border}`}>{signal.tier}</span>
                        <span className="text-gray-700 text-[8px] font-bold uppercase">{signal.league}</span>
                      </div>
                      <p className="text-white font-black text-xs truncate tracking-tight uppercase">{signal.match}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-emerald-400 font-black text-xs">+{signal.edge_percent.toFixed(1)}%</p>
                        <p className="text-gray-700 text-[8px] font-bold uppercase">Edge</p>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-right min-w-[40px]">
                        <p className="text-white font-black text-xs">@ {signal.odds.toFixed(2)}</p>
                        <p className="text-gray-700 text-[8px] font-bold uppercase">Odds</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-white font-black text-xs">{signals.length}</span>
            <span className="text-gray-700 text-[8px] font-bold uppercase">Signals</span>
          </div>
          <div className="flex flex-col">
            <span className="text-emerald-500 font-black text-xs">100%</span>
            <span className="text-gray-700 text-[8px] font-bold uppercase">Uptime</span>
          </div>
        </div>
        <Link href="/login" className="px-4 py-2 rounded bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-white transition-colors">
          Unlock Full Stream
        </Link>
      </div>
    </div>
  );
}
