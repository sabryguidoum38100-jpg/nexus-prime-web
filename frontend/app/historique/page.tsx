'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  date: string;
  match: string;
  pick: string;
  odds: number;
  edge: number;
  result: 'WIN' | 'LOSS' | 'VOID';
  roi: number;
}

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de données historiques robustes
    setTimeout(() => {
      setHistory([
        { id: '1', date: '2026-05-20', match: 'Man City vs Real Madrid', pick: 'HOME', odds: 1.85, edge: 4.2, result: 'WIN', roi: 8.5 },
        { id: '2', date: '2026-05-19', match: 'Bayern vs Arsenal', pick: 'DRAW', odds: 3.40, edge: 2.1, result: 'LOSS', roi: -5.0 },
        { id: '3', date: '2026-05-19', match: 'PSG vs Dortmund', pick: 'HOME', odds: 1.55, edge: 5.8, result: 'WIN', roi: 5.5 },
        { id: '4', date: '2026-05-18', match: 'Liverpool vs Leverkusen', pick: 'AWAY', odds: 4.20, edge: 1.5, result: 'WIN', roi: 32.0 },
        { id: '5', date: '2026-05-17', match: 'Inter vs Milan', pick: 'HOME', odds: 2.10, edge: 3.4, result: 'WIN', roi: 11.0 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const totalProfit = history.reduce((acc, item) => acc + item.roi, 0);
  const winRate = (history.filter(i => i.result === 'WIN').length / history.length) * 100;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-4">Track Record</h1>
            <p className="text-gray-500">Transparence totale sur les performances de l&apos;IA Nexus Prime.</p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0a0a0a] border border-white/8 p-6 rounded-2xl">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2">Profit Total (Units)</p>
              <p className="text-emerald-400 text-3xl font-black">+{totalProfit.toFixed(1)}%</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/8 p-6 rounded-2xl">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2">Win Rate</p>
              <p className="text-white text-3xl font-black">{winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/8 p-6 rounded-2xl">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2">ROI Moyen</p>
              <p className="text-cyan-400 text-3xl font-black">+{(totalProfit / history.length).toFixed(2)}%</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    <th className="p-4 text-xs font-black text-gray-500 uppercase">Date</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase">Match</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase">Pick</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase text-center">Cote</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase text-center">Edge</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i} className="border-b border-white/5 animate-pulse">
                        <td colSpan={6} className="p-8 bg-white/2"></td>
                      </tr>
                    ))
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="p-4 text-gray-400 text-sm">{item.date}</td>
                        <td className="p-4 text-white font-bold text-sm">{item.match}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded bg-white/5 text-gray-300 text-[10px] font-bold border border-white/10">
                            {item.pick}
                          </span>
                        </td>
                        <td className="p-4 text-center text-white font-mono text-sm">{item.odds.toFixed(2)}</td>
                        <td className="p-4 text-center text-emerald-400 font-mono text-sm">+{item.edge}%</td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-1 rounded text-[10px] font-black ${
                            item.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {item.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
