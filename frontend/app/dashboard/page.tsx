'use client';
import Link from 'next/link';
import Header from '@/components/Header';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
              <Link href="/" className="hover:text-gray-400 transition">Accueil</Link>
              <span>/</span>
              <span className="text-gray-400">Dashboard</span>
            </div>
            <h1 className="text-white font-black text-3xl mb-2">Dashboard</h1>
            <p className="text-gray-500">Votre espace personnel Nexus Prime</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Picks suivis', value: '0', icon: '🎯', color: 'text-amber-400' },
              { label: 'Bankroll', value: '€1 000', icon: '💰', color: 'text-emerald-400' },
              { label: 'ROI simulé', value: '+0%', icon: '📈', color: 'text-cyan-400' },
              { label: 'Abonnement', value: 'Free', icon: '👑', color: 'text-gray-400' },
            ].map((k, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-5 text-center">
                <div className="text-2xl mb-2">{k.icon}</div>
                <div className={`text-2xl font-black ${k.color} mb-1`}>{k.value}</div>
                <div className="text-gray-600 text-xs">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Link href="/#picks-section" className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-6 hover:border-amber-500/40 transition-all group">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-white font-bold mb-1">Voir les Picks</h3>
              <p className="text-gray-500 text-sm">Accéder aux picks IA en temps réel</p>
            </Link>
            <Link href="/historique" className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 hover:border-emerald-500/25 transition-all group">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-bold mb-1">Track Record</h3>
              <p className="text-gray-500 text-sm">Consulter l&apos;historique des performances</p>
            </Link>
            <Link href="/pricing" className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 hover:border-amber-500/25 transition-all group">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="text-white font-bold mb-1">Passer Premium</h3>
              <p className="text-gray-500 text-sm">Débloquer tous les picks ELITE</p>
            </Link>
          </div>

          {/* Upgrade CTA */}
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-white font-black text-2xl mb-2">Passez au Pass Nexus</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Accédez à tous les picks ELITE, les signaux STEAM en temps réel et l&apos;historique complet avec analytics.
            </p>
            <Link href="/pricing"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm hover:shadow-xl hover:shadow-amber-500/25 transition-all">
              Démarrer l&apos;essai gratuit 7 jours — 19,99€/mois
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
