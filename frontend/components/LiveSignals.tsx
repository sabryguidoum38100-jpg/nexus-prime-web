'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSignal {
  id: string;
  match: string;
  league: string;
  pick: string;
  odds: number;
  edge_percent: number;
  confidence: number;
  tier: 'ELITE' | 'PRO' | 'INFO';
  steam: boolean;
  created_at: string;
}

const SIGNAL_POOL: Omit<LiveSignal, 'id' | 'created_at'>[] = [
  { match: 'Arsenal vs Bournemouth', league: 'Premier League', pick: 'HOME', odds: 1.47, edge_percent: 2.23, confidence: 0.695, tier: 'INFO', steam: false },
  { match: 'Mallorca vs Real Madrid', league: 'La Liga', pick: 'AWAY', odds: 1.38, edge_percent: 4.18, confidence: 0.731, tier: 'PRO', steam: false },
  { match: 'PSG vs Toulouse', league: 'Ligue 1', pick: 'HOME', odds: 1.34, edge_percent: 2.67, confidence: 0.766, tier: 'INFO', steam: false },
  { match: 'Leverkusen vs Wolfsburg', league: 'Bundesliga', pick: 'HOME', odds: 1.28, edge_percent: 2.10, confidence: 0.789, tier: 'INFO', steam: false },
  { match: 'Lazio vs Parma', league: 'Serie A', pick: 'HOME', odds: 1.91, edge_percent: 2.06, confidence: 0.534, tier: 'INFO', steam: false },
  { match: 'Real Sociedad vs Levante', league: 'La Liga', pick: 'HOME', odds: 1.65, edge_percent: 3.20, confidence: 0.625, tier: 'PRO', steam: false },
  { match: 'Strasbourg vs Nice', league: 'Ligue 1', pick: 'HOME', odds: 1.94, edge_percent: 3.15, confidence: 0.532, tier: 'PRO', steam: false },
  { match: 'Brentford vs Everton', league: 'Premier League', pick: 'HOME', odds: 2.38, edge_percent: 2.83, confidence: 0.432, tier: 'INFO', steam: false },
  { match: 'West Ham vs Wolves', league: 'Premier League', pick: 'AWAY', odds: 4.90, edge_percent: 2.02, confidence: 0.208, tier: 'INFO', steam: false },
  { match: 'Lille vs RC Lens', league: 'Ligue 1', pick: 'DRAW', odds: 3.65, edge_percent: 2.24, confidence: 0.280, tier: 'INFO', steam: false },
  { match: 'Bayern vs RB Leipzig', league: 'Bundesliga', pick: 'HOME', odds: 1.55, edge_percent: 6.80, confidence: 0.740, tier: 'ELITE', steam: true },
  { match: 'Inter vs Juventus', league: 'Serie A', pick: 'HOME', odds: 2.05, edge_percent: 7.40, confidence: 0.720, tier: 'ELITE', steam: true },
];

const TIER_STYLE = {
  ELITE: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  PRO:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  INFO:  { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

function genId() { return Math.random().toString(36).slice(2, 10); }
function makeSignal(base: Omit<LiveSignal, 'id' | 'created_at'>): LiveSignal {
  return { ...base, id: genId(), created_at: new Date().toISOString() };
}

export default function LiveSignals() {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [status, setStatus] = useState<'live' | 'connecting'>('connecting');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setStatus('live');
      const initial = SIGNAL_POOL.slice(0, 3).map(makeSignal);
      setSignals(initial);
      initial.forEach(s => usedRef.current.add(s.match));
    }, 1500);
    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (status !== 'live') return;
    const addSignal = () => {
      const available = SIGNAL_POOL.filter(s => !usedRef.current.has(s.match));
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
    timerRef.current = setTimeout(tick, 8000 + Math.random() * 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status]);

  return (
    <div className="w-full bg-[#0a0a0a] rounded-2xl p-6 border border-white/8">
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
          <a href="/pricing" className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition">Signaux temps réel → Pass Nexus</a>
        </div>
      )}
    </div>
  );
}
