'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

const FAQS = [
  {
    category: 'Général',
    items: [
      { q: 'Qu\'est-ce que Nexus Prime ?', a: 'Nexus Prime est une plateforme de pronostics sportifs basée sur l\'intelligence artificielle. Notre moteur ONNX v6 analyse les cotes de marché en temps réel et détecte des inefficiences statistiques (edges) pour générer des signaux de valeur.' },
      { q: 'Les picks sont-ils garantis gagnants ?', a: 'Non. Nexus Prime détecte des edges statistiques — la rentabilité se confirme sur 100+ picks. Pariez de manière responsable. Les performances passées ne garantissent pas les résultats futurs.' },
      { q: 'Comment fonctionne le moteur IA ?', a: 'Notre backend Rust (Axum) intègre un runtime ONNX pour l\'inférence de modèles XGBoost pré-entraînés sur 5 ligues européennes. Les probabilités sont calibrées via Platt Scaling (α=0.15) et comparées aux cotes de marché (Pinnacle) pour détecter les edges.' },
    ]
  },
  {
    category: 'Abonnement & Paiement',
    items: [
      { q: 'Comment fonctionne l\'essai gratuit ?', a: '7 jours d\'accès complet au Pass Nexus, sans engagement. Annulez à tout moment avant la fin de l\'essai depuis votre espace membre. Aucun frais d\'annulation.' },
      { q: 'Quels moyens de paiement sont acceptés ?', a: 'Carte bancaire (Visa, Mastercard), Apple Pay, Google Pay via Stripe. Paiement 100% sécurisé SSL 256-bit, certifié PCI DSS Level 1.' },
      { q: 'Puis-je annuler à tout moment ?', a: 'Oui, l\'annulation est immédiate depuis votre espace membre. Aucun frais d\'annulation. Votre accès reste actif jusqu\'à la fin de la période payée.' },
      { q: 'Y a-t-il un remboursement ?', a: 'Si vous n\'êtes pas satisfait dans les 7 premiers jours, contactez notre support pour un remboursement complet.' },
    ]
  },
  {
    category: 'Utilisation',
    items: [
      { q: 'Comment utiliser le Bet Slip ?', a: 'Cliquez sur "+ Bet Slip" sur n\'importe quelle carte de pick pour l\'ajouter à votre sélection. Entrez votre bankroll et le système calcule automatiquement la mise recommandée selon le critère Quarter-Kelly.' },
      { q: 'Qu\'est-ce que le Quarter-Kelly ?', a: 'Le Quarter-Kelly est une fraction du critère de Kelly optimal. Il réduit la variance et protège contre les séquences de pertes. Formule : Mise = (Edge / (Cote - 1)) × 0.25 × Bankroll. C\'est le standard des fonds quantitatifs.' },
      { q: 'Qu\'est-ce qu\'un signal STEAM ?', a: 'Un signal STEAM indique un mouvement de cotes significatif détecté sur le marché — signe que des parieurs professionnels (sharps) ont misé sur ce match. C\'est un indicateur de confiance supplémentaire.' },
      { q: 'Qu\'est-ce que le CLV ?', a: 'Le Closing Line Value mesure si la cote au moment du pick était meilleure que la cote de fermeture. Un CLV positif signifie que le marché a confirmé notre analyse. C\'est le meilleur indicateur prédictif de la rentabilité à long terme.' },
    ]
  },
  {
    category: 'Technique',
    items: [
      { q: 'Les données sont-elles en temps réel ?', a: 'Oui. Les cotes sont récupérées via The Odds API (Pinnacle, Bet365, Unibet) et mises à jour toutes les 5 minutes. Le backend Rust sur Render traite les données en temps réel.' },
      { q: 'Quelles ligues sont couvertes ?', a: 'Premier League (Angleterre), La Liga (Espagne), Bundesliga (Allemagne), Serie A (Italie), Ligue 1 (France). D\'autres ligues seront ajoutées progressivement.' },
      { q: 'Comment sont calculés les Edges ?', a: 'Edge = (P_IA × Cote) - 1. P_IA est la probabilité calibrée via Platt Scaling. Nous n\'affichons que les edges entre 1.5% et 10% — la zone de valeur réaliste sur les marchés liquides.' },
    ]
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-all">
        <span className="text-white font-semibold text-sm pr-4">{q}</span>
        <span className={`text-gray-500 text-lg transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5">
          <div className="pt-3">{a}</div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-gray-600 text-sm">
            <Link href="/" className="hover:text-gray-400 transition">Accueil</Link>
            <span>/</span>
            <span className="text-gray-400">FAQ</span>
          </div>
          <h1 className="text-white font-black text-3xl mb-2">Questions fréquentes</h1>
          <p className="text-gray-500 mb-10">Tout ce que vous devez savoir sur Nexus Prime.</p>

          <div className="space-y-10">
            {FAQS.map((cat, i) => (
              <div key={i}>
                <h2 className="text-amber-400 font-black text-sm uppercase tracking-wider mb-4">{cat.category}</h2>
                <div className="space-y-2">
                  {cat.items.map((item, j) => <FAQItem key={j} q={item.q} a={item.a} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-white font-black text-xl mb-2">Une autre question ?</h2>
            <p className="text-gray-400 text-sm mb-6">Notre équipe répond sous 24h.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/10 transition-all">
                Contacter le support
              </Link>
              <Link href="/pricing" className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                Voir les offres
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
