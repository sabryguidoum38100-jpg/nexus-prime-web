'use client';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '0€',
    period: 'pour toujours',
    description: 'Découvrez la puissance du moteur Nexus',
    features: [
      { text: '3 picks gratuits par jour', included: true },
      { text: 'Edge et Kelly affichés', included: true },
      { text: 'Bet Slip interactif', included: true },
      { text: 'Signaux live (délai 15min)', included: true },
      { text: 'Picks ELITE illimités', included: false },
      { text: 'Picks STEAM en temps réel', included: false },
      { text: 'Historique complet', included: false },
      { text: 'Alertes Telegram/Discord', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaHref: '/#picks-section',
    highlight: false,
  },
  {
    name: 'Pass Nexus',
    price: '19,99€',
    period: 'par mois',
    description: 'Accès institutionnel complet au moteur IA',
    badge: 'Plus populaire',
    features: [
      { text: 'Picks illimités (tous tiers)', included: true },
      { text: 'Picks ELITE & STEAM prioritaires', included: true },
      { text: 'Bet Slip avancé + export CSV', included: true },
      { text: 'Signaux live temps réel', included: true },
      { text: 'Historique complet + analytics', included: true },
      { text: 'Alertes Telegram/Discord', included: true },
      { text: 'API access (100 req/jour)', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: 'Démarrer l\'essai gratuit 7 jours',
    ctaHref: '#checkout',
    highlight: true,
  },
];

const FAQ = [
  { q: 'Comment fonctionne l\'essai gratuit ?', a: '7 jours d\'accès complet, sans engagement. Annulez à tout moment avant la fin de l\'essai.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Carte bancaire (Visa, Mastercard), Apple Pay, Google Pay via Stripe. Paiement 100% sécurisé.' },
  { q: 'Puis-je annuler à tout moment ?', a: 'Oui, l\'annulation est immédiate depuis votre espace membre. Aucun frais d\'annulation.' },
  { q: 'Les picks sont-ils garantis gagnants ?', a: 'Non. Nexus Prime détecte des edges statistiques — la rentabilité se confirme sur 100+ picks. Pariez de manière responsable.' },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#000000] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
            👑 Pass Nexus Premium
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Investissez dans
            <span className="block bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">votre edge</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Un abonnement qui se rembourse avec un seul pick gagnant.
            ROI moyen constaté : <span className="text-emerald-400 font-bold">+{'>'}18%</span> sur 30 jours.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border ${
                plan.highlight
                  ? 'bg-gradient-to-b from-amber-500/10 to-[#0a0a0a] border-amber-500/30 shadow-2xl shadow-amber-500/10'
                  : 'bg-[#0a0a0a] border-white/8'
              }`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-white font-bold text-lg mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-amber-400' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-gray-500 text-sm">/{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-3 text-sm ${f.included ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`text-xs flex-shrink-0 ${f.included ? 'text-emerald-400' : 'text-gray-700'}`}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref}
                className={`block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}>
                {plan.cta}
              </Link>
              {plan.highlight && (
                <p className="text-center text-gray-600 text-xs mt-3">7 jours gratuits · Annulation immédiate</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stripe badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-16 text-gray-600 text-xs">
          <span>🔒 Paiement sécurisé par</span>
          <span className="font-bold text-white">Stripe</span>
          <span>·</span>
          <span>SSL 256-bit</span>
          <span>·</span>
          <span>PCI DSS Level 1</span>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-white font-bold text-2xl text-center mb-8">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
    </>
  );
}
