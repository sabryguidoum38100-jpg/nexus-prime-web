'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Signal {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  edge_percent: number;
  tier: number;
  steam: boolean;
  created_at: string;
}

export default function LiveSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    const wsUrl = backendUrl.replace('http', 'ws') + '/ws/live';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'signal') {
          const signal = data.payload;
          setSignals((prev) => [signal, ...prev].slice(0, 10));
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => ws.close();
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
        <h2 className="text-2xl font-bold text-white">Live Signals</h2>
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      <div className="space-y-3">
        {signals.length === 0 ? (
          <p className="text-gray-400">Waiting for signals...</p>
        ) : (
          signals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getTierColor(signal.tier)}`}>
                      {getTierLabel(signal.tier)}
                    </span>
                    {signal.steam && <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-black">STEAM</span>}
                  </div>
                  <p className="text-white font-semibold">{signal.match_id}</p>
                  <p className="text-gray-400 text-sm">{signal.pick}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{signal.edge_percent.toFixed(2)}% Edge</p>
                  <p className="text-gray-400 text-sm">{(signal.confidence * 100).toFixed(0)}% Conf</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
