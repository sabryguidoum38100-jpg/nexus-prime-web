'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SECTIONS = [
  {
    id: 'architecture',
    icon: '⚙️',
    title: 'Architecture Technique',
    color: 'amber',
    content: [
      {
        subtitle: 'Backend Rust + ONNX Runtime',
        text: 'Le cœur de Nexus Prime est un serveur Axum (Rust) déployé sur Render. Il intègre ONNX Runtime pour l\'inférence de modèles XGBoost pré-entraînés sur 5 ligues européennes (Premier League, Bundesliga, La Liga, Serie A, Ligue 1). Rust garantit une latence sub-milliseconde et une sécurité mémoire totale.',
      },
      {
        subtitle: 'Frontend Next.js 14 sur Vercel',
        text: 'L\'interface est construite avec Next.js 14 (App Router), TypeScript et TailwindCSS. Le déploiement sur Vercel assure une disponibilité mondiale avec CDN edge. Les données sont récupérées en temps réel via l\'API REST et un WebSocket pour les signaux live.',
      },
    ],
  },
  {
    id: 'calibration',
    icon: '📐',
    title: 'Calibration Mathématique',
    color: 'emerald',
    content: [
      {
        subtitle: 'Platt Scaling — Calibration des probabilités',
        text: 'Les probabilités brutes du modèle ONNX sont calibrées via un mélange pondéré avec les probabilités implicites du marché (Pinnacle). Le paramètre α = 0.15 signifie que le modèle ne peut dévier du marché que de 15%, empêchant les edges irréalistes (>10%) qui signalent un overfitting.',
        formula: 'P_calibrée = (1 - α) × P_marché + α × P_modèle',
      },
      {
        subtitle: 'Formule de l\'Edge institutionnel',
        text: 'L\'Edge mesure l\'avantage réel du parieur sur le bookmaker. Une valeur positive indique une cote sous-évaluée par le marché. Nous n\'affichons que les edges entre 1.5% et 10% — la zone de valeur réaliste sur les marchés liquides.',
        formula: 'Edge = (P_IA × Cote) - 1',
      },
    ],
  },
  {
    id: 'kelly',
    icon: '💰',
    title: 'Gestion de Bankroll — Quarter-Kelly',
    color: 'teal',
    content: [
      {
        subtitle: 'Critère de Kelly fractionné',
        text: 'Le Kelly Criterion optimal maximise la croissance géométrique de la bankroll à long terme. Nous utilisons le Quarter-Kelly (25% du Kelly plein) pour réduire la variance et protéger contre les séquences de pertes. La mise est plafonnée à 5% de la bankroll quelle que soit la valeur calculée.',
        formula: 'Mise = (Edge / (Cote - 1)) × 0.25',
      },
      {
        subtitle: 'Pourquoi pas le Kelly plein ?',
        text: 'Le Kelly plein suppose une estimation parfaite des probabilités. En pratique, les modèles ML ont une incertitude résiduelle. Le Quarter-Kelly réduit le drawdown maximal de ~75% tout en conservant 50% de la croissance optimale théorique. C\'est le standard des fonds quantitatifs.',
      },
    ],
  },
  {
    id: 'clv',
    icon: '📊',
    title: 'CLV — Closing Line Value',
    color: 'cyan',
    content: [
      {
        subtitle: 'L\'indicateur de qualité du signal',
        text: 'Le CLV mesure si la cote au moment du pick était meilleure que la cote de fermeture (juste avant le match). Un CLV positif signifie que le marché a confirmé notre analyse en faisant baisser la cote. C\'est le meilleur indicateur prédictif de la rentabilité à long terme.',
        formula: 'CLV = (1/Cote_ouverture - 1/Cote_fermeture) × 100',
      },
      {
        subtitle: 'Seuil de qualité',
        text: 'Un CLV moyen > 0.3% sur un échantillon de 100+ picks est statistiquement significatif et indique un edge réel. Nos modèles ciblent un CLV moyen de 0.5-1.5% sur les marchés 1X2 des ligues européennes.',
      },
    ],
  },
  {
    id: 'modeles',
    icon: '🧠',
    title: 'Modèles ONNX par Ligue',
    color: 'purple',
    content: [
      {
        subtitle: 'XGBoost multi-feature',
        text: 'Chaque ligue dispose d\'un modèle XGBoost dédié, exporté en format ONNX pour une inférence universelle. Les features incluent : cotes d\'ouverture Pinnacle, mouvement de cotes, données de forme récente, statistiques domicile/extérieur, et statut des compositions.',
      },
      {
        subtitle: 'Fallback automatique',
        text: 'Si le modèle ONNX d\'une ligue n\'est pas disponible, le système bascule automatiquement sur les probabilités implicites du marché (après retrait de l\'overround). Cela garantit une disponibilité 100% même lors des mises à jour de modèles.',
      },
    ],
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  amber: { border: 'border-amber-500/20', bg: 'from-amber-500/5', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  emerald: { border: 'border-emerald-500/20', bg: 'from-emerald-500/5', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  teal: { border: 'border-teal-500/20', bg: 'from-teal-500/5', text: 'text-teal-400', badge: 'bg-teal-500/15 text-teal-400 border-teal-500/25' },
  cyan: { border: 'border-cyan-500/20', bg: 'from-cyan-500/5', text: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  purple: { border: 'border-purple-500/20', bg: 'from-purple-500/5', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
};

export default function MethodologiePage() {
  return (
    <main className="min-h-screen bg-[#000000] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
            <Link href="/" className="hover:text-gray-400 transition">Accueil</Link>
            <span>/</span>
            <span className="text-white">Méthodologie</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            Méthodologie
            <span className="ml-3 text-lg font-normal text-gray-500">— Transparence totale</span>
          </h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Nexus Prime est construit sur des principes mathématiques rigoureux. Cette page documente
            chaque composante du système — de l&apos;inférence ONNX à la gestion de bankroll Quarter-Kelly.
          </p>

          {/* Stack technique */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Rust (Axum)', 'ONNX Runtime', 'XGBoost', 'Next.js 14', 'TypeScript', 'Platt Scaling', 'Quarter-Kelly', 'CLV'].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, si) => {
            const c = colorMap[section.color];
            return (
              <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
                className={`bg-[#0a0a0a] border ${c.border} rounded-2xl overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${c.border} bg-gradient-to-r ${c.bg} to-transparent flex items-center gap-3`}>
                  <span className="text-xl">{section.icon}</span>
                  <h2 className={`font-bold text-lg ${c.text}`}>{section.title}</h2>
                </div>
                <div className="p-6 space-y-6">
                  {section.content.map((item, ii) => (
                    <div key={ii}>
                      <h3 className="text-white font-semibold mb-2">{item.subtitle}</h3>
                      <p className="text-gray-400 leading-relaxed text-sm">{item.text}</p>
                      {item.formula && (
                        <div className={`mt-3 px-4 py-3 rounded-xl border ${c.border} bg-white/3 font-mono text-sm ${c.text}`}>
                          {item.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-white font-bold text-xl mb-2">Prêt à utiliser le moteur ?</h2>
          <p className="text-gray-400 text-sm mb-6">Accédez aux picks calibrés en temps réel avec le Pass Nexus Premium.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/#picks-section"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all">
              Voir les Free Picks
            </Link>
            <Link href="/pricing"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all">
              Pass Nexus — 19,99€/mois
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
