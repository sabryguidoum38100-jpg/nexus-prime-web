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
      setSignals(prev => [newSignal, ...prev].slice(0, 8));
    };

    const tick = () => {
      addSignal();
      timerRef.current = setTimeout(tick, 8000 + Math.random() * 4000);
    };

    timerRef.current = setTimeout(tick, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status]);

  if (!mounted) return <div className="min-h-[300px]" />;

  return (
    <div className="w-full bg-[#0a0a0a] rounded-2xl p-6 border border-white/8 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-bold text-lg">Signaux Live</h2>
          <p className="text-gray-600 text-xs mt-0.5">Mises à jour temps réel · Moteur ONNX v6</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className={`absolute inset-0 rounded-full ${status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping opacity-50`} />
          </div>
          <span className={`text-xs font-semibold ${status === 'live' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {status === 'live' ? 'En direct' : 'Connexion...'}
          </span>
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {status === 'connecting' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Connexion au flux live...</p>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3">📡</div>
            <p className="text-gray-500 text-sm">En attente de signaux...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {signals.map(signal => {
              const t = TIER_STYLE[signal.tier];
              return (
                <motion.div key={signal.id}
                  initial={{ opacity: 0, x: 20, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${t.bg} ${t.text} ${t.border}`}>{signal.tier}</span>
                        {signal.steam && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />STEAM
                          </span>
                        )}
                        <span className="text-gray-700 text-xs ml-auto">
                          {new Date(signal.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm truncate">{signal.match}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{signal.league} · {signal.pick} @ {signal.odds.toFixed(2)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 font-black text-base">{signal.edge_percent.toFixed(1)}%</p>
                      <p className="text-gray-600 text-xs">Edge</p>
                      <p className="text-cyan-400 font-bold text-sm mt-1">{(signal.confidence * 100).toFixed(0)}%</p>
                      <p className="text-gray-600 text-xs">Conf.</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      {signals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-gray-700 text-xs">{signals.length} signaux actifs</p>
          <a href="/login" className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition">Signaux temps réel → Pass Nexus</a>
        </div>
      )}
    </div>
  );
}
