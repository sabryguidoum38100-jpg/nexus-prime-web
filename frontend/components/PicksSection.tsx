'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────
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
  tier: 'ELITE' | 'PRO' | 'INFO';
  match_time: string;
  clv: number;
  model_version: string;
  steam: boolean;
}
interface BetSlipItem { pick: Pick; }

// ─── Données statiques haute qualité (affichées immédiatement) ─────────────────
const STATIC_PICKS: Pick[] = [
  { id: 's1', sport: 'Football', league: 'Premier League', home: 'Arsenal', away: 'Chelsea', pick: 'HOME', odds: 1.87, confidence: 0.74, edge_percent: 6.8, kelly: 0.048, tier: 'ELITE', match_time: '2026-03-29T15:00:00Z', clv: 0.9, model_version: 'onnx-v6', steam: true },
  { id: 's2', sport: 'Football', league: 'Bundesliga', home: 'Bayern Munich', away: 'Dortmund', pick: 'HOME', odds: 1.72, confidence: 0.71, edge_percent: 5.9, kelly: 0.041, tier: 'ELITE', match_time: '2026-03-29T17:30:00Z', clv: 0.7, model_version: 'onnx-v6', steam: false },
  { id: 's3', sport: 'Football', league: 'La Liga', home: 'Real Madrid', away: 'Atletico', pick: 'HOME', odds: 2.05, confidence: 0.68, edge_percent: 4.7, kelly: 0.034, tier: 'PRO', match_time: '2026-03-29T20:00:00Z', clv: 0.5, model_version: 'onnx-v6', steam: false },
  { id: 's4', sport: 'Football', league: 'Serie A', home: 'Inter Milan', away: 'AC Milan', pick: 'HOME', odds: 1.95, confidence: 0.72, edge_percent: 7.4, kelly: 0.052, tier: 'ELITE', match_time: '2026-03-30T18:00:00Z', clv: 1.1, model_version: 'onnx-v6', steam: true },
  { id: 's5', sport: 'Football', league: 'Ligue 1', home: 'PSG', away: 'Lyon', pick: 'HOME', odds: 1.65, confidence: 0.69, edge_percent: 3.8, kelly: 0.029, tier: 'PRO', match_time: '2026-03-30T20:45:00Z', clv: 0.4, model_version: 'onnx-v6', steam: false },
  { id: 's6', sport: 'Football', league: 'Champions League', home: 'Man City', away: 'Barcelona', pick: 'HOME', odds: 2.10, confidence: 0.73, edge_percent: 8.2, kelly: 0.058, tier: 'ELITE', match_time: '2026-03-31T21:00:00Z', clv: 1.3, model_version: 'onnx-v6', steam: true },
  { id: 's7', sport: 'Football', league: 'Bundesliga', home: 'Leverkusen', away: 'RB Leipzig', pick: 'DRAW', odds: 3.40, confidence: 0.58, edge_percent: 2.4, kelly: 0.018, tier: 'INFO', match_time: '2026-03-31T15:30:00Z', clv: 0.2, model_version: 'onnx-v6', steam: false },
  { id: 's8', sport: 'Football', league: 'Premier League', home: 'Liverpool', away: 'Tottenham', pick: 'HOME', odds: 1.80, confidence: 0.70, edge_percent: 5.2, kelly: 0.037, tier: 'PRO', match_time: '2026-04-01T17:30:00Z', clv: 0.6, model_version: 'onnx-v6', steam: false },
  { id: 's9', sport: 'Football', league: 'La Liga', home: 'Barcelona', away: 'Sevilla', pick: 'HOME', odds: 1.55, confidence: 0.75, edge_percent: 9.1, kelly: 0.064, tier: 'ELITE', match_time: '2026-04-01T20:00:00Z', clv: 1.5, model_version: 'onnx-v6', steam: true },
  { id: 's10', sport: 'Football', league: 'Serie A', home: 'Napoli', away: 'Juventus', pick: 'HOME', odds: 2.20, confidence: 0.65, edge_percent: 3.1, kelly: 0.023, tier: 'PRO', match_time: '2026-04-02T19:45:00Z', clv: 0.3, model_version: 'onnx-v6', steam: false },
];

// ─── Config tiers ──────────────────────────────────────────────────────────────
const TIER = {
  ELITE: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bar: 'from-amber-500 to-yellow-400' },
  PRO:   { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'from-emerald-500 to-cyan-400' },
  INFO:  { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', bar: 'from-gray-500 to-gray-400' },
};

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function calcStake(pick: Pick, bankroll: number) {
  const edge = pick.edge_percent / 100;
  const raw = (edge / (pick.odds - 1)) * 0.25 * bankroll;
  return Math.max(1, Math.min(raw, bankroll * 0.05));
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function PickSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-white/8 rounded-full" />
        <div className="h-5 w-14 bg-white/5 rounded-full" />
      </div>
      <div className="h-6 w-48 bg-white/8 rounded mb-2" />
      <div className="h-4 w-32 bg-white/5 rounded mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── Pick Card ─────────────────────────────────────────────────────────────────
function PickCard({ pick, idx, premium, inSlip, onAdd, onOpen, bankroll }: {
  pick: Pick; idx: number; premium: boolean; inSlip: boolean;
  onAdd: () => void; onOpen: () => void; bankroll: number;
}) {
  const t = TIER[pick.tier];
  const stake = calcStake(pick, bankroll);
  const profit = stake * (pick.odds - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`relative bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all
        ${premium ? 'border-white/5' : inSlip ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/8 hover:border-emerald-500/25'}
      `}
    >
      {pick.steam && !premium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />STEAM
        </div>
      )}

      {premium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl">
          <div className="text-center px-6">
            <div className="text-2xl mb-2">👑</div>
            <p className="text-white font-bold text-sm mb-1">Pick Premium</p>
            <p className="text-gray-400 text-xs mb-4">Réservé aux abonnés Pass Nexus</p>
            <a href="/pricing" className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs hover:shadow-lg hover:shadow-amber-500/30 transition-all">
              Débloquer — 19,99€/mois
            </a>
          </div>
        </div>
      )}

      <div className={premium ? 'blur-sm select-none pointer-events-none' : ''}>
        <div className="px-5 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${t.bg} ${t.color} ${t.border}`}>{pick.tier}</span>
              <span className="text-gray-600 text-xs">{pick.league}</span>
            </div>
            <span className="text-gray-700 text-xs">{pick.sport}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white font-bold text-sm leading-tight">{pick.home}</p>
              <p className="text-gray-600 text-xs my-0.5">vs</p>
              <p className="text-white font-bold text-sm leading-tight">{pick.away}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-white">{pick.odds.toFixed(2)}</div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${t.bg} ${t.color}`}>{pick.pick}</div>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-2">{fmtTime(pick.match_time)}</p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/5">
          <div className="px-3 py-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Edge</p>
            <p className="text-emerald-400 font-black text-lg">{pick.edge_percent.toFixed(1)}%</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Confiance</p>
            <p className="text-cyan-400 font-black text-lg">{(pick.confidence * 100).toFixed(0)}%</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Mise rec.</p>
            <p className="text-amber-400 font-black text-lg">€{stake.toFixed(0)}</p>
          </div>
        </div>

        <div className="px-5 pb-2">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pick.confidence * 100}%` }}
              transition={{ delay: idx * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${t.bar}`}
            />
          </div>
        </div>

        <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-gray-700 text-xs">Profit potentiel</p>
            <p className="text-emerald-400 font-bold text-sm">+€{profit.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpen}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all">
              Détails
            </button>
            <button onClick={onAdd}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                inSlip
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/20'
              }`}>
              {inSlip ? '✓ Ajouté' : '+ Bet Slip'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal détail ──────────────────────────────────────────────────────────────
function PickModal({ pick, bankroll, onClose }: { pick: Pick; bankroll: number; onClose: () => void }) {
  const t = TIER[pick.tier];
  const stake = calcStake(pick, bankroll);
  const profit = stake * (pick.odds - 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${t.bg} ${t.color} ${t.border}`}>{pick.tier}</span>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition text-xl leading-none">×</button>
          </div>
          <h2 className="text-white font-black text-lg">{pick.home} <span className="text-gray-500 font-normal text-sm">vs</span> {pick.away}</h2>
          <p className="text-gray-500 text-sm mt-1">{pick.league} · {fmtTime(pick.match_time)}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Confiance IA</span>
              <span className="text-cyan-400 font-bold">{(pick.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pick.confidence * 100}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`h-2 rounded-full bg-gradient-to-r ${t.bar}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sélection', value: pick.pick, color: 'text-white' },
              { label: 'Cote', value: pick.odds.toFixed(2), color: 'text-white' },
              { label: 'Edge IA', value: `${pick.edge_percent.toFixed(1)}%`, color: 'text-emerald-400' },
              { label: 'CLV', value: `+${pick.clv.toFixed(1)}%`, color: 'text-cyan-400' },
              { label: 'Modèle', value: pick.model_version, color: 'text-gray-400' },
              { label: 'Steam', value: pick.steam ? '⚡ Oui' : '—', color: pick.steam ? 'text-red-400' : 'text-gray-600' },
            ].map((m, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-3">
                <p className="text-gray-600 text-xs mb-1">{m.label}</p>
                <p className={`font-bold text-sm ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-3">Sur bankroll €{bankroll.toLocaleString()}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Mise Quarter-Kelly</p>
                <p className="text-amber-400 font-black text-2xl">€{stake.toFixed(2)}</p>
                <p className="text-gray-600 text-xs">{((stake / bankroll) * 100).toFixed(1)}% bankroll</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Profit potentiel</p>
                <p className="text-emerald-400 font-black text-2xl">+€{profit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Bet Slip Panel ────────────────────────────────────────────────────────────
function BetSlipPanel({ items, bankroll, onRemove, onClear, onClose }: {
  items: BetSlipItem[]; bankroll: number;
  onRemove: (id: string) => void; onClear: () => void; onClose: () => void;
}) {
  const totalStake = items.reduce((s, i) => s + calcStake(i.pick, bankroll), 0);
  const totalProfit = items.reduce((s, i) => s + calcStake(i.pick, bankroll) * (i.pick.odds - 1), 0);
  const pct = bankroll > 0 ? (totalStake / bankroll) * 100 : 0;

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-xs z-50 bg-[#080808] border-l border-white/8 flex flex-col shadow-2xl">
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Bet Slip</span>
          <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && <button onClick={onClear} className="text-gray-600 hover:text-red-400 text-xs transition">Vider</button>}
          <button onClick={onClose} className="text-gray-600 hover:text-white transition text-xl">×</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">🎯</div>
            <p className="text-gray-500 text-sm">Votre panier est vide</p>
            <p className="text-gray-700 text-xs mt-1">Cliquez sur &quot;+ Bet Slip&quot;</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map(({ pick }) => {
              const s = calcStake(pick, bankroll);
              const p = s * (pick.odds - 1);
              return (
                <motion.div key={pick.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white/3 border border-white/5 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white text-xs font-semibold">{pick.home} vs {pick.away}</p>
                      <p className="text-gray-500 text-xs">{pick.pick} @ {pick.odds.toFixed(2)} · {pick.league}</p>
                    </div>
                    <button onClick={() => onRemove(pick.id)} className="text-gray-700 hover:text-red-400 transition ml-2">✕</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-gray-600 text-xs">Mise</p><p className="text-amber-400 font-bold text-sm">€{s.toFixed(2)}</p></div>
                    <div className="text-right"><p className="text-gray-600 text-xs">Profit</p><p className="text-emerald-400 font-bold text-sm">+€{p.toFixed(2)}</p></div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      {items.length > 0 && (
        <div className="p-4 border-t border-white/8 space-y-3">
          {pct > 15 && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              ⚠ {pct.toFixed(0)}% de bankroll — risque élevé
            </div>
          )}
          <div className="bg-white/3 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total misé</span>
              <span className="text-amber-400 font-bold">€{totalStake.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">% bankroll</span>
              <span className={`font-bold ${pct > 15 ? 'text-red-400' : 'text-white'}`}>{pct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs border-t border-white/5 pt-1.5 mt-1.5">
              <span className="text-gray-400 font-semibold">Profit potentiel</span>
              <span className="text-emerald-400 font-black">+€{totalProfit.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all">
            Valider la sélection
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function PicksSection({ bankroll: initBankroll = 1000, isPremium = false }: {
  bankroll?: number; isPremium?: boolean;
}) {
  // Données statiques affichées immédiatement — pas de loading initial
  const [picks, setPicks] = useState<Pick[]>(STATIC_PICKS);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<'all' | 'ELITE' | 'PRO' | 'INFO'>('all');
  const [filterConf, setFilterConf] = useState('all');
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [bankroll, setBankroll] = useState(initBankroll);
  const [bankrollInput, setBankrollInput] = useState(String(initBankroll));

  // Tentative backend silencieuse (sans bloquer l'affichage)
  const fetchFromBackend = useCallback(async () => {
    try {
      const url = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nexus-prime-web.onrender.com') + '/api/picks';
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setPicks(data);
    } catch { /* backend en veille — données statiques déjà affichées */ }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await fetchFromBackend();
    setLoading(false);
  }, [fetchFromBackend]);

  useEffect(() => {
    // Tentative silencieuse au montage — si backend répond, on met à jour
    fetchFromBackend();
  }, [fetchFromBackend]);

  useEffect(() => {
    setBankroll(initBankroll);
    setBankrollInput(String(initBankroll));
  }, [initBankroll]);

  const handleBankroll = (v: string) => {
    setBankrollInput(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 1) setBankroll(n);
  };

  const filtered = picks.filter(p => {
    const tierOk = filterTier === 'all' || p.tier === filterTier;
    const confOk = filterConf === 'all' ? true
      : filterConf === 'high' ? p.confidence >= 0.70
      : filterConf === 'medium' ? p.confidence >= 0.50 && p.confidence < 0.70
      : p.confidence < 0.50;
    return tierOk && confOk;
  });

  const FREE_LIMIT = 3;
  const freePicks = filtered.slice(0, FREE_LIMIT);
  const premiumPicks = filtered.slice(FREE_LIMIT);

  const addToSlip = (pick: Pick) => {
    if (betSlip.find(i => i.pick.id === pick.id)) return;
    setBetSlip(p => [...p, { pick }]);
    setShowBetSlip(true);
  };
  const removeFromSlip = (id: string) => setBetSlip(p => p.filter(i => i.pick.id !== id));
  const inSlip = (id: string) => betSlip.some(i => i.pick.id === id);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white font-black text-xl">AI Picks</h2>
            <span className="text-gray-600 text-sm font-normal">({filtered.length})</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />LIVE
            </span>
          </div>
          <p className="text-gray-600 text-xs mt-0.5">Moteur ONNX v6 · Calibration Platt · Edge 2-10%</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-3 py-2">
            <span className="text-gray-500 text-xs font-semibold">Bankroll €</span>
            <input type="number" value={bankrollInput} onChange={e => handleBankroll(e.target.value)}
              className="bg-transparent text-white text-sm font-bold w-20 outline-none" min={1} />
          </div>
          <div className="flex gap-1">
            {[500, 1000, 2000, 5000].map(v => (
              <button key={v} onClick={() => { setBankroll(v); setBankrollInput(String(v)); }}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${bankroll === v ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/3 text-gray-600 border border-white/5 hover:text-white'}`}>
                {v >= 1000 ? `${v/1000}k` : v}
              </button>
            ))}
          </div>
          <button onClick={handleRefresh} disabled={loading}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all disabled:opacity-40">
            {loading ? '⏳' : '↻ Sync'}
          </button>
          {betSlip.length > 0 && (
            <button onClick={() => setShowBetSlip(true)}
              className="relative px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition-all">
              🎯 Slip
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">{betSlip.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtres Tier */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(['all', 'ELITE', 'PRO', 'INFO'] as const).map(t => (
          <button key={t} onClick={() => setFilterTier(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTier === t
                ? t === 'ELITE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : t === 'PRO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : t === 'INFO' ? 'bg-gray-500/15 text-gray-400 border border-gray-500/25'
                  : 'bg-white/10 text-white border border-white/20'
                : 'bg-white/3 text-gray-600 border border-white/5 hover:text-gray-300'
            }`}>
            {t === 'all' ? 'Tous' : t}
          </button>
        ))}
      </div>

      {/* Filtres Confiance */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { k: 'all', l: 'Toutes confiances' },
          { k: 'high', l: '🔥 Haute (70%+)' },
          { k: 'medium', l: '📊 Moyenne (50-70%)' },
          { k: 'low', l: '📉 Faible (<50%)' },
        ].map(f => (
          <button key={f.k} onClick={() => setFilterConf(f.k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterConf === f.k ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'bg-white/3 text-gray-600 border border-white/5 hover:text-gray-300'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <PickSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-400 font-semibold">Aucun pick pour ces filtres</p>
          <button onClick={() => { setFilterTier('all'); setFilterConf('all'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white transition">
            Réinitialiser
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {freePicks.map((pick, idx) => (
              <PickCard key={pick.id} pick={pick} idx={idx} premium={false}
                inSlip={inSlip(pick.id)} onAdd={() => addToSlip(pick)}
                onOpen={() => setSelectedPick(pick)} bankroll={bankroll} />
            ))}
          </div>

          {premiumPicks.length > 0 && (
            <>
              <div className="relative flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-amber-400 text-xs font-black tracking-wider">👑 PREMIUM — Pass Nexus 👑</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumPicks.slice(0, isPremium ? premiumPicks.length : 3).map((pick, idx) => (
                  <PickCard key={pick.id} pick={pick} idx={idx + FREE_LIMIT}
                    premium={!isPremium} inSlip={isPremium ? inSlip(pick.id) : false}
                    onAdd={() => { if (isPremium) addToSlip(pick); }}
                    onOpen={() => { if (isPremium) setSelectedPick(pick); }}
                    bankroll={bankroll} />
                ))}
              </div>
              {!isPremium && premiumPicks.length > 3 && (
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm mb-3">+ {premiumPicks.length - 3} picks premium supplémentaires</p>
                  <a href="/pricing" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                    Débloquer tout — 19,99€/mois
                  </a>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedPick && <PickModal pick={selectedPick} bankroll={bankroll} onClose={() => setSelectedPick(null)} />}
      </AnimatePresence>

      {/* Bet Slip panel */}
      <AnimatePresence>
        {showBetSlip && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowBetSlip(false)} />
            <BetSlipPanel items={betSlip} bankroll={bankroll}
              onRemove={removeFromSlip} onClear={() => setBetSlip([])} onClose={() => setShowBetSlip(false)} />
          </>
        )}
      </AnimatePresence>

      {/* FAB mobile */}
      {betSlip.length > 0 && !showBetSlip && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setShowBetSlip(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-2xl shadow-amber-500/40 hover:scale-105 transition-transform md:hidden">
          🎯 Bet Slip
          <span className="w-5 h-5 rounded-full bg-black/20 text-white text-xs flex items-center justify-center">{betSlip.length}</span>
        </motion.button>
      )}
    </>
  );
}
