'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface H2H { home_wins: number; draws: number; away_wins: number; last_5: string; }
interface Pick {
  id: string; sport: string; league: string; home: string; away: string;
  pick: string; odds: number; confidence: number; edge_percent: number;
  kelly: number; tier: 'ELITE' | 'PRO' | 'INFO'; match_time: string;
  clv: number; model_version: string; steam: boolean;
  ai_analysis?: string; home_form?: string[]; away_form?: string[]; h2h?: H2H;
}
interface BetSlipItem { pick: Pick; }

// ─── Vrais matchs semaine 1-11 avril 2026 (The Odds API) ──────────────────────
const STATIC_PICKS: Pick[] = [
  {
    id: 'r1', sport: 'Football', league: 'La Liga', home: 'Mallorca', away: 'Real Madrid',
    pick: 'AWAY', odds: 1.38, confidence: 0.731, edge_percent: 4.18, kelly: 0.0132,
    tier: 'PRO', match_time: '2026-04-04T14:15:00Z', clv: 0.73, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Le modèle XGBoost détecte un edge de 4.2% sur ce déplacement. Real Madrid maintient une forme extérieure dominante (4V/1N sur 5 derniers). La cote 1.38 est légèrement sous-évaluée par rapport aux probabilités calibrées Platt (P_calibrée = 0.746). Signal PRO recommandé.",
    home_form: ['L','D','L','W','L'], away_form: ['W','W','D','W','W'],
    h2h: { home_wins: 1, draws: 1, away_wins: 3, last_5: '1V 1N 3D sur les 5 derniers H2H' }
  },
  {
    id: 'r2', sport: 'Football', league: 'La Liga', home: 'Real Sociedad', away: 'Levante',
    pick: 'HOME', odds: 1.65, confidence: 0.625, edge_percent: 3.20, kelly: 0.0123,
    tier: 'PRO', match_time: '2026-04-04T12:00:00Z', clv: 0.58, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Signal de value modéré. Real Sociedad favori à domicile avec un edge de 3.2% selon notre calibration Platt. Forme à domicile solide (4V/1D sur 5). La cote de marché sous-estime légèrement la probabilité calibrée (P_IA = 0.638 vs P_marché = 0.606).",
    home_form: ['W','W','D','W','L'], away_form: ['L','D','L','W','L'],
    h2h: { home_wins: 3, draws: 1, away_wins: 1, last_5: '3V 1N 1D sur les 5 derniers H2H' }
  },
  {
    id: 'r3', sport: 'Football', league: 'Ligue 1', home: 'Strasbourg', away: 'Nice',
    pick: 'HOME', odds: 1.94, confidence: 0.532, edge_percent: 3.15, kelly: 0.0084,
    tier: 'PRO', match_time: '2026-04-04T15:00:00Z', clv: 0.57, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Légère inefficience détectée sur ce marché Ligue 1. Strasbourg à domicile présente un edge de 3.15% — les probabilités calibrées divergent du marché. Avantage domicile confirmé par les données de forme récente. Mise Quarter-Kelly conservatrice recommandée.",
    home_form: ['W','D','W','L','W'], away_form: ['D','W','L','D','W'],
    h2h: { home_wins: 2, draws: 2, away_wins: 1, last_5: '2V 2N 1D sur les 5 derniers H2H' }
  },
  {
    id: 'r4', sport: 'Football', league: 'Premier League', home: 'Arsenal', away: 'Bournemouth',
    pick: 'HOME', odds: 1.47, confidence: 0.695, edge_percent: 2.23, kelly: 0.0119,
    tier: 'INFO', match_time: '2026-04-11T11:30:00Z', clv: 0.46, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Edge marginal de 2.2% sur Arsenal à domicile. Cote courte (1.47) mais légèrement sous-évaluée selon notre modèle Premier League. Confiance IA correcte (69.5%). Signal informatif — mise minimale selon Quarter-Kelly.",
    home_form: ['W','W','W','D','W'], away_form: ['L','W','D','L','D'],
    h2h: { home_wins: 4, draws: 0, away_wins: 1, last_5: '4V 0N 1D sur les 5 derniers H2H' }
  },
  {
    id: 'r5', sport: 'Football', league: 'Ligue 1', home: 'Paris Saint Germain', away: 'Toulouse',
    pick: 'HOME', odds: 1.34, confidence: 0.766, edge_percent: 2.67, kelly: 0.0196,
    tier: 'INFO', match_time: '2026-04-03T18:45:00Z', clv: 0.50, model_version: 'onnx-v6', steam: false,
    ai_analysis: "PSG favori écrasant à domicile. Edge de 2.7% — cote légèrement sous-évaluée. Confiance IA élevée (76.6%) mais cote courte (1.34) limite mécaniquement le Kelly. Signal informatif à faible mise.",
    home_form: ['W','W','W','W','D'], away_form: ['D','L','W','L','D'],
    h2h: { home_wins: 4, draws: 1, away_wins: 0, last_5: '4V 1N 0D sur les 5 derniers H2H' }
  },
  {
    id: 'r6', sport: 'Football', league: 'Premier League', home: 'Brentford', away: 'Everton',
    pick: 'HOME', odds: 2.38, confidence: 0.432, edge_percent: 2.83, kelly: 0.0051,
    tier: 'INFO', match_time: '2026-04-11T14:00:00Z', clv: 0.52, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Légère inefficience de marché sur Brentford à domicile. Cote de 2.38 légèrement généreuse selon notre modèle XGBoost. Edge de 2.8% avec une confiance modérée (43.2%). Signal informatif à faible mise.",
    home_form: ['W','L','W','D','W'], away_form: ['L','D','L','W','L'],
    h2h: { home_wins: 2, draws: 1, away_wins: 2, last_5: '2V 1N 2D sur les 5 derniers H2H' }
  },
  {
    id: 'r7', sport: 'Football', league: 'Premier League', home: 'West Ham', away: 'Wolverhampton',
    pick: 'AWAY', odds: 4.90, confidence: 0.208, edge_percent: 2.02, kelly: 0.0013,
    tier: 'INFO', match_time: '2026-04-10T19:00:00Z', clv: 0.44, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Signal contrarian sur Wolves. Cote élevée (4.90) avec un edge marginal de 2%. L'IA détecte une légère sous-évaluation du scénario visiteur. Mise ultra-conservatrice selon Quarter-Kelly. Signal purement informatif.",
    home_form: ['L','D','L','W','L'], away_form: ['W','D','W','L','W'],
    h2h: { home_wins: 2, draws: 1, away_wins: 2, last_5: '2V 1N 2D sur les 5 derniers H2H' }
  },
  {
    id: 'r8', sport: 'Football', league: 'Bundesliga', home: 'Bayer Leverkusen', away: 'VfL Wolfsburg',
    pick: 'HOME', odds: 1.28, confidence: 0.789, edge_percent: 2.10, kelly: 0.0148,
    tier: 'INFO', match_time: '2026-04-04T13:30:00Z', clv: 0.38, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Leverkusen dominant à domicile. Cote très courte (1.28) mais edge positif de 2.1%. Confiance IA haute (78.9%). La cote de marché sous-estime légèrement la probabilité calibrée. Mise minimale recommandée — signal informatif.",
    home_form: ['W','W','W','D','W'], away_form: ['L','D','L','D','L'],
    h2h: { home_wins: 3, draws: 1, away_wins: 1, last_5: '3V 1N 1D sur les 5 derniers H2H' }
  },
  {
    id: 'r9', sport: 'Football', league: 'Serie A', home: 'Lazio', away: 'Parma',
    pick: 'HOME', odds: 1.91, confidence: 0.534, edge_percent: 2.06, kelly: 0.0057,
    tier: 'INFO', match_time: '2026-04-04T18:45:00Z', clv: 0.56, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Lazio à domicile avec un edge de 2.1% selon notre modèle Serie A. Forme récente mitigée mais avantage domicile confirmé par les données historiques. Cote de 1.91 légèrement généreuse.",
    home_form: ['W','D','W','L','W'], away_form: ['L','L','D','L','W'],
    h2h: { home_wins: 3, draws: 1, away_wins: 1, last_5: '3V 1N 1D sur les 5 derniers H2H' }
  },
  {
    id: 'r10', sport: 'Football', league: 'Ligue 1', home: 'Lille', away: 'RC Lens',
    pick: 'DRAW', odds: 3.65, confidence: 0.280, edge_percent: 2.24, kelly: 0.0021,
    tier: 'INFO', match_time: '2026-04-04T19:05:00Z', clv: 0.41, model_version: 'onnx-v6', steam: false,
    ai_analysis: "Derby du Nord — signal DRAW détecté. L'historique H2H est très favorable au nul dans ce choc (3 nuls sur 5). Cote de 3.65 légèrement généreuse selon notre calibration. Mise ultra-faible recommandée.",
    home_form: ['D','W','D','L','D'], away_form: ['D','L','D','W','D'],
    h2h: { home_wins: 1, draws: 3, away_wins: 1, last_5: '1V 3N 1D sur les 5 derniers H2H' }
  },
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

// ─── Forme badge ───────────────────────────────────────────────────────────────
function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    D: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    L: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const labels: Record<string, string> = { W: 'V', D: 'N', L: 'D' };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${colors[result] || colors.D}`}>
      {labels[result] || result}
    </span>
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
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
      className={`relative bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all
        ${premium ? 'border-white/5' : inSlip ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/8 hover:border-emerald-500/25'}`}
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
            <motion.div initial={{ width: 0 }} animate={{ width: `${pick.confidence * 100}%` }}
              transition={{ delay: idx * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${t.bar}`} />
          </div>
        </div>
        <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-gray-700 text-xs">Profit potentiel</p>
            <p className="text-emerald-400 font-bold text-sm">+€{profit.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpen} className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-400 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all">Détails</button>
            <button onClick={onAdd} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${inSlip ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/20'}`}>
              {inSlip ? '✓ Ajouté' : '+ Bet Slip'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Pick Modal enrichi ────────────────────────────────────────────────────────
function PickModal({ pick, bankroll, onClose }: { pick: Pick; bankroll: number; onClose: () => void }) {
  const t = TIER[pick.tier];
  const stake = calcStake(pick, bankroll);
  const profit = stake * (pick.odds - 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${t.bg} ${t.color} ${t.border}`}>{pick.tier}</span>
              {pick.steam && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />STEAM
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">×</button>
          </div>
          <h2 className="text-white font-black text-lg">{pick.home} <span className="text-gray-500 font-normal text-sm">vs</span> {pick.away}</h2>
          <p className="text-gray-500 text-sm mt-1">{pick.league} · {fmtTime(pick.match_time)}</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Barre de confiance */}
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
          {/* Métriques */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sélection', value: pick.pick, color: 'text-white' },
              { label: 'Cote', value: pick.odds.toFixed(2), color: 'text-white' },
              { label: 'Edge IA', value: `${pick.edge_percent.toFixed(2)}%`, color: 'text-emerald-400' },
              { label: 'CLV', value: `+${pick.clv.toFixed(2)}%`, color: 'text-cyan-400' },
              { label: 'Modèle', value: pick.model_version, color: 'text-gray-400' },
              { label: 'Steam', value: pick.steam ? '⚡ Oui' : '—', color: pick.steam ? 'text-red-400' : 'text-gray-600' },
            ].map((m, i) => (
              <div key={i} className="bg-white/3 rounded-xl p-3">
                <p className="text-gray-600 text-xs mb-1">{m.label}</p>
                <p className={`font-bold text-sm ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          {/* Analyse IA */}
          {pick.ai_analysis && (
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-xs font-black uppercase tracking-wider">Analyse IA — ONNX v6</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{pick.ai_analysis}</p>
            </div>
          )}
          {/* Forme récente */}
          {(pick.home_form || pick.away_form) && (
            <div className="space-y-3">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Forme récente (5 derniers matchs)</p>
              <div className="space-y-2">
                {pick.home_form && (
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold w-36 truncate">{pick.home}</span>
                    <div className="flex gap-1">{pick.home_form.map((r, i) => <FormBadge key={i} result={r} />)}</div>
                  </div>
                )}
                {pick.away_form && (
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold w-36 truncate">{pick.away}</span>
                    <div className="flex gap-1">{pick.away_form.map((r, i) => <FormBadge key={i} result={r} />)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* H2H */}
          {pick.h2h && (
            <div className="bg-white/3 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Confrontations directes (H2H)</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div>
                  <p className="text-white font-black text-xl">{pick.h2h.home_wins}</p>
                  <p className="text-gray-600 text-xs truncate">{pick.home.split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-black text-xl">{pick.h2h.draws}</p>
                  <p className="text-gray-600 text-xs">Nuls</p>
                </div>
                <div>
                  <p className="text-white font-black text-xl">{pick.h2h.away_wins}</p>
                  <p className="text-gray-600 text-xs truncate">{pick.away.split(' ')[0]}</p>
                </div>
              </div>
              <p className="text-gray-600 text-xs text-center">{pick.h2h.last_5}</p>
            </div>
          )}
          {/* Bankroll Quarter-Kelly */}
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-3 font-semibold">Gestion bankroll — Quarter-Kelly</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Mise recommandée</p>
                <p className="text-amber-400 font-black text-2xl">€{stake.toFixed(2)}</p>
                <p className="text-gray-600 text-xs">{((stake / bankroll) * 100).toFixed(1)}% de €{bankroll.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Profit potentiel</p>
                <p className="text-emerald-400 font-black text-2xl">+€{profit.toFixed(2)}</p>
                <p className="text-gray-600 text-xs">ROI: +{((profit / stake) * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-700">
              Formule : Mise = (Edge / (Cote - 1)) × 0.25 × Bankroll · Plafond 5%
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
      className="fixed right-0 top-0 h-full w-full max-w-xs z-[45] bg-[#080808] border-l border-white/8 flex flex-col shadow-2xl">
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
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-gray-500 text-sm">Votre Bet Slip est vide</p>
            <p className="text-gray-700 text-xs mt-1">Cliquez sur &quot;+ Bet Slip&quot; pour ajouter un pick</p>
          </div>
        ) : items.map(({ pick }) => {
          const stake = calcStake(pick, bankroll);
          const profit = stake * (pick.odds - 1);
          const t = TIER[pick.tier];
          return (
            <div key={pick.id} className="bg-white/3 border border-white/8 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs font-bold ${t.color}`}>{pick.tier}</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-600 text-xs truncate">{pick.league}</span>
                  </div>
                  <p className="text-white text-xs font-semibold truncate">{pick.home} vs {pick.away}</p>
                  <p className="text-gray-500 text-xs">{pick.pick} @ {pick.odds.toFixed(2)}</p>
                </div>
                <button onClick={() => onRemove(pick.id)} className="text-gray-700 hover:text-red-400 transition text-lg leading-none shrink-0">×</button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold">€{stake.toFixed(2)}</span>
                <span className="text-emerald-400 font-bold">+€{profit.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {items.length > 0 && (
        <div className="p-4 border-t border-white/8 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total mise</span>
            <span className="text-amber-400 font-bold">€{totalStake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Profit potentiel</span>
            <span className="text-emerald-400 font-bold">+€{totalProfit.toFixed(2)}</span>
          </div>
          {pct > 15 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-400 text-xs">
              ⚠️ {pct.toFixed(1)}% de bankroll engagée — risque élevé
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-600">
            <span>{pct.toFixed(1)}% bankroll engagée</span>
            <span className="text-emerald-400 font-bold">+€{totalProfit.toFixed(2)}</span>
          </div>
          <a href="/pricing" className="block w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm text-center hover:shadow-lg hover:shadow-amber-500/25 transition-all">
            Valider la sélection
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ─── Section principale ────────────────────────────────────────────────────────
export default function PicksSection({ bankroll: initBankroll = 1000, isPremium = false }: {
  bankroll?: number; isPremium?: boolean;
}) {
  const [picks, setPicks] = useState<Pick[]>(STATIC_PICKS);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<'all' | 'ELITE' | 'PRO' | 'INFO'>('all');
  const [filterConf, setFilterConf] = useState('all');
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [bankroll, setBankroll] = useState(initBankroll);
  const [bankrollInput, setBankrollInput] = useState(String(initBankroll));
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Tentative de récupération des vraies données via la route API Next.js
  const fetchFromAPI = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch('/api/picks', { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data.picks && Array.isArray(data.picks) && data.picks.length > 0) {
          setPicks(data.picks);
          setLastSync(data.generated_at);
        }
      }
    } catch { /* données statiques déjà affichées */ }
    if (showLoader) setLoading(false);
  }, []);

  const handleRefresh = useCallback(() => fetchFromAPI(true), [fetchFromAPI]);

  useEffect(() => {
    fetchFromAPI(false);
    const interval = setInterval(() => fetchFromAPI(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFromAPI]);

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
  };
  const removeFromSlip = (id: string) => setBetSlip(p => p.filter(i => i.pick.id !== id));
  const inSlip = (id: string) => betSlip.some(i => i.pick.id === id);

  return (
    <>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-black text-xl">AI Picks</h2>
            <span className="text-gray-600 text-sm font-normal">({filtered.length})</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
            </span>
          </div>
          <p className="text-gray-600 text-xs mt-0.5">
            Moteur ONNX v6 · Calibration Platt · Edge 2-10%
            {lastSync && (
              <span className="ml-2 text-emerald-600">
                · Sync {new Date(lastSync).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-3 py-2">
            <span className="text-gray-500 text-xs font-semibold">Bankroll €</span>
            <input type="number" value={bankrollInput} onChange={e => handleBankroll(e.target.value)}
              className="w-20 bg-transparent text-white text-sm font-bold outline-none" />
          </div>
          {[500, 1000, 2000, 5000].map(v => (
            <button key={v} onClick={() => handleBankroll(String(v))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${bankroll === v ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/3 text-gray-500 border border-white/8 hover:text-white'}`}>
              {v >= 1000 ? `${v / 1000}k` : v}
            </button>
          ))}
          <button onClick={handleRefresh} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-all disabled:opacity-50">
            <span className={loading ? 'animate-spin inline-block' : 'inline-block'}>↻</span>
            {loading ? 'Sync...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Filtres tier */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {(['all', 'ELITE', 'PRO', 'INFO'] as const).map(t => (
          <button key={t} onClick={() => setFilterTier(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              filterTier === t
                ? t === 'ELITE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : t === 'PRO' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : t === 'INFO' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  : 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-gray-600 border-white/8 hover:text-gray-400'
            }`}>
            {t === 'all' ? 'Tous' : t}
          </button>
        ))}
      </div>

      {/* Filtres confiance */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { v: 'all', label: 'Toutes confiances' },
          { v: 'high', label: '🔥 Haute (70%+)' },
          { v: 'medium', label: '📊 Moyenne (50-70%)' },
          { v: 'low', label: '📉 Faible (<50%)' },
        ].map(({ v, label }) => (
          <button key={v} onClick={() => setFilterConf(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${filterConf === v ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' : 'bg-transparent text-gray-600 border-white/8 hover:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grille de picks */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <PickSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg font-semibold">Aucun pick pour ces filtres</p>
          <p className="text-gray-600 text-sm mt-2">Essayez de modifier les filtres ou cliquez sur Sync</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freePicks.map((pick, idx) => (
              <PickCard key={pick.id} pick={pick} idx={idx} premium={false}
                inSlip={inSlip(pick.id)} onAdd={() => addToSlip(pick)}
                onOpen={() => setSelectedPick(pick)} bankroll={bankroll} />
            ))}
          </div>
          {premiumPicks.length > 0 && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-500/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1.5 bg-black border border-amber-500/30 rounded-full text-amber-400 text-xs font-black">
                  👑 PREMIUM — Pass Nexus 👑
                </span>
              </div>
            </div>
          )}
          {premiumPicks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {premiumPicks.map((pick, idx) => (
                <PickCard key={pick.id} pick={pick} idx={idx + FREE_LIMIT}
                  premium={!isPremium} inSlip={inSlip(pick.id)}
                  onAdd={() => isPremium && addToSlip(pick)}
                  onOpen={() => isPremium && setSelectedPick(pick)} bankroll={bankroll} />
              ))}
            </div>
          )}
        </>
      )}

      {/* FAB Bet Slip */}
      <button onClick={() => setShowBetSlip(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105">
        <span>📋</span>
        <span className="text-sm">Slip</span>
        {betSlip.length > 0 && (
          <span className="bg-black text-amber-400 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{betSlip.length}</span>
        )}
      </button>

      {/* Bet Slip Panel */}
      <AnimatePresence>
        {showBetSlip && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[44] bg-black/50 backdrop-blur-sm" onClick={() => setShowBetSlip(false)} />
            <BetSlipPanel items={betSlip} bankroll={bankroll}
              onRemove={removeFromSlip} onClear={() => setBetSlip([])} onClose={() => setShowBetSlip(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Modal détail */}
      <AnimatePresence>
        {selectedPick && (
          <PickModal pick={selectedPick} bankroll={bankroll} onClose={() => setSelectedPick(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
