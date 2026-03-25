'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Pick {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  stake: number;
  edge_percent: number;
  kelly: number;
  tier: number;
  steam: boolean;
}

export default function PicksSection() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/picks`, { method: 'POST' });
      const data = await response.json();
      setPicks(Array.isArray(data) ? data : [data]);
    } catch (e) {
      console.error('Failed to fetch picks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks();
    const interval = setInterval(fetchPicks, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTierColor = (tier: number) => {
    if (tier === 1) return 'bg-green-500';
    if (tier === 2) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getTierLabel = (tier: number) => {
    if (tier === 1) return 'ELITE';
    if (tier === 2) return 'PRO';
    return 'INFO';
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">AI Picks</h2>
        <button
          onClick={fetchPicks}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {picks.length === 0 ? (
          <p className="text-gray-400">No picks available</p>
        ) : (
          picks.map((pick, idx) => (
            <motion.div
              key={pick.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(pick.tier)}`}>
                    {getTierLabel(pick.tier)}
                  </span>
                  {pick.steam && <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-black">STEAM</span>}
                </div>
                <span className="text-green-400 font-bold">{pick.edge_percent.toFixed(2)}% Edge</span>
              </div>
              <p className="text-white font-semibold mb-1">{pick.match_id}</p>
              <p className="text-gray-400 text-sm mb-3">{pick.pick}</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Confidence</p>
                  <p className="text-white font-bold">{(pick.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Stake</p>
                  <p className="text-white font-bold">${pick.stake.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Kelly</p>
                  <p className="text-white font-bold">{(pick.kelly * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-gray-400">Sport</p>
                  <p className="text-white font-bold">{pick.sport}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
