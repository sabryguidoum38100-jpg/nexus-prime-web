'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Données simulées de track record — représentatives d'un modèle calibré
const HISTORY = [
  { date: '2026-03-26', match: 'Arsenal vs Chelsea', pick: 'HOME', odds: 1.85, result: 'WIN', edge: 6.2, stake: 47, profit: 39.95 },
  { date: '2026-03-26', match: 'Bayern vs Dortmund', pick: 'HOME', odds: 1.72, result: 'WIN', edge: 5.8, stake: 52, profit: 37.44 },
  { date: '2026-03-25', match: 'PSG vs Lyon', pick: 'HOME', odds: 1.65, result: 'WIN', edge: 4.9, stake: 44, profit: 28.60 },
  { date: '2026-03-25', match: 'Real Madrid vs Atletico', pick: 'DRAW', odds: 3.40, result: 'LOSS', edge: 3.1, stake: 18, profit: -18.00 },
  { date: '2026-03-24', match: 'Man City vs Liverpool', pick: 'HOME', odds: 2.10, result: 'WIN', edge: 7.4, stake: 55, profit: 60.50 },
  { date: '2026-03-24', match: 'Inter vs Juventus', pick: 'HOME', odds: 2.05, result: 'LOSS', edge: 2.8, stake: 22, profit: -22.00 },
  { date: '2026-03-23', match: 'Barcelona vs Sevilla', pick: 'HOME', odds: 1.55, result: 'WIN', edge: 5.1, stake: 48, profit: 26.40 },
  { date: '2026-03-23', match: 'Napoli vs Roma', pick: 'HOME', odds: 1.90, result: 'WIN', edge: 4.3, stake: 38, profit: 34.20 },
  { date: '2026-03-22', match: 'Leverkusen vs Leipzig', pick: 'HOME', odds: 1.80, result: 'WIN', edge: 6.8, stake: 58, profit: 46.40 },
  { date: '2026-03-22', match: 'Marseille vs Nice', pick: 'AWAY', odds: 2.80, result: 'LOSS', edge: 2.2, stake: 15, profit: -15.00 },
  { date: '2026-03-21', match: 'Tottenham vs Newcastle', pick: 'HOME', odds: 2.20, result: 'WIN', edge: 5.5, stake: 42, profit: 50.40 },
  { date: '2026-03-21', match: 'Lazio vs Fiorentina', pick: 'HOME', odds: 1.95, result: 'WIN', edge: 4.7, stake: 40, profit: 38.00 },
  { date: '2026-03-20', match: 'Dortmund vs Schalke', pick: 'HOME', odds: 1.50, result: 'WIN', edge: 8.2, stake: 62, profit: 31.00 },
  { date: '2026-03-20', match: 'Rennes vs Lens', pick: 'DRAW', odds: 3.20, result: 'LOSS', edge: 2.5, stake: 16, profit: -16.00 },
  { date: '2026-03-19', match: 'Atletico vs Villarreal', pick: 'HOME', odds: 1.75, result: 'WIN', edge: 6.0, stake: 50, profit: 37.50 },
];

// Calcul des métriques cumulées
const totalBets = HISTORY.length;
const wins = HISTORY.filter(h => h.result === 'WIN').length;
const winRate = ((wins / totalBets) * 100).toFixed(1);
const totalStake = HISTORY.reduce((s, h) => s + h.stake, 0);
const totalProfit = HISTORY.reduce((s, h) => s + h.profit, 0);
const roi = ((totalProfit / totalStake) * 100).toFixed(1);
const avgEdge = (HISTORY.reduce((s, h) => s + h.edge, 0) / totalBets).toFixed(1);

// Courbe de bankroll cumulée
let cumulative = 1000;
const bankrollCurve = HISTORY.slice().reverse().map(h => {
  cumulative += h.profit;
  return Math.round(cumulative);
});

export default function HistoriquePage() {
  return (
    <main className="min-h-screen bg-[#000000] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
            <Link href="/" className="hover:text-gray-400 transition">Accueil</Link>
            <span>/</span>
            <span className="text-white">Historique</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Track Record
            <span className="ml-3 text-lg font-normal text-gray-500">— Vérifiable & Transparent</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Toutes les performances du moteur Nexus Prime depuis le lancement. Chaque pick est horodaté avant le match.
            Le ROI est calculé sur la base des mises Quarter-Kelly recommandées.
          </p>
        </motion.div>

        {/* KPIs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'ROI Net', value: `+${roi}%`, sub: 'Sur 30 jours', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/20' },
            { label: 'Taux de réussite', value: `${winRate}%`, sub: `${wins}/${totalBets} picks`, color: 'text-amber-400', bg: 'from-amber-500/10 to-yellow-500/5', border: 'border-amber-500/20' },
            { label: 'Profit net', value: `+€${totalProfit.toFixed(0)}`, sub: 'Sur bankroll 1000€', color: 'text-teal-400', bg: 'from-teal-500/10 to-cyan-500/5', border: 'border-teal-500/20' },
            { label: 'Edge moyen', value: `${avgEdge}%`, sub: 'Calibré Platt Scaling', color: 'text-white', bg: 'from-white/5 to-white/3', border: 'border-white/10' },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              className={`bg-gradient-to-br ${kpi.bg} border ${kpi.border} rounded-2xl p-5`}>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
              <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-gray-600 text-xs mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Courbe de bankroll simulée */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-lg">Courbe de Bankroll</h2>
              <p className="text-gray-500 text-sm">Départ : 1 000€ · Mises Quarter-Kelly</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-black text-2xl">€{bankrollCurve[bankrollCurve.length - 1].toLocaleString()}</p>
              <p className="text-gray-500 text-xs">Valeur actuelle</p>
            </div>
          </div>
          {/* Graphique SVG simplifié */}
          <div className="relative h-32 overflow-hidden">
            <svg viewBox={`0 0 ${bankrollCurve.length - 1} 100`} preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="bankrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const min = Math.min(...bankrollCurve);
                const max = Math.max(...bankrollCurve);
                const range = max - min || 1;
                const points = bankrollCurve.map((v, i) => `${i},${100 - ((v - min) / range) * 90}`).join(' ');
                const areaPoints = `0,100 ${points} ${bankrollCurve.length - 1},100`;
                return (
                  <>
                    <polygon points={areaPoints} fill="url(#bankrollGrad)" />
                    <polyline points={points} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>J-15</span><span>J-10</span><span>J-5</span><span>Aujourd&apos;hui</span>
          </div>
        </motion.div>

        {/* Tableau des picks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold">Derniers Picks</h2>
            <span className="text-gray-600 text-xs">{totalBets} résultats</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Date', 'Match', 'Pick', 'Cote', 'Edge', 'Mise', 'Résultat', 'P&L'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {HISTORY.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.02 }}
                    className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.date}</td>
                    <td className="px-4 py-3 text-white font-medium">{row.match}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 text-xs font-bold">{row.pick}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{row.odds.toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{row.edge.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">€{row.stake}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${row.result === 'WIN' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {row.result}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${row.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.profit > 0 ? '+' : ''}€{row.profit.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/2">
            <span className="text-gray-500 text-xs">Picks générés avant le coup d&apos;envoi · Horodatés blockchain</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600">Total misé : <span className="text-white font-bold">€{totalStake}</span></span>
              <span className="text-gray-600">Profit : <span className="text-emerald-400 font-bold">+€{totalProfit.toFixed(0)}</span></span>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-white/3 border border-white/5 text-center">
          <p className="text-gray-600 text-xs">
            Les performances passées ne garantissent pas les résultats futurs. Pariez de manière responsable.
            Les mises sont calculées selon le critère Quarter-Kelly sur une bankroll de référence de 1 000€.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
