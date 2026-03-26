import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: "Conditions d'utilisation - Nexus Prime Elite 2026",
  description: "Conditions generales d'utilisation de la plateforme Nexus Prime Elite.",
};

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptation des conditions',
      content: `En accedant et en utilisant Nexus Prime Elite ("la Plateforme"), vous acceptez d'etre lie par les presentes conditions generales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.`,
    },
    {
      title: '2. Description du service',
      content: `Nexus Prime Elite est une plateforme d'analyse sportive alimentee par intelligence artificielle. La Plateforme fournit des analyses statistiques, des probabilites calculees par des modeles de machine learning et des recommandations de gestion de bankroll. Ces informations sont fournies a titre informatif uniquement et ne constituent pas des conseils financiers ou des garanties de gains.`,
    },
    {
      title: '3. Avertissement sur les risques',
      content: `Les paris sportifs comportent des risques financiers importants. Les analyses fournies par Nexus Prime Elite sont basees sur des modeles statistiques et ne garantissent aucun resultat. Les performances passees ne garantissent pas les performances futures. Vous etes seul responsable de vos decisions de paris. Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre.`,
    },
    {
      title: '4. Utilisation autorisee',
      content: `Vous vous engagez a utiliser la Plateforme uniquement a des fins personnelles et non commerciales. Il est interdit de revendre, reproduire ou redistribuer les analyses et donnees de la Plateforme sans autorisation ecrite prealable. Vous devez avoir l'age legal pour participer aux jeux d'argent dans votre juridiction.`,
    },
    {
      title: '5. Propriete intellectuelle',
      content: `Tous les modeles d'IA, algorithmes, interfaces et contenus de la Plateforme sont la propriete exclusive de Nexus Prime Elite. Le code source du backend Rust et du frontend Next.js est protege par les droits d'auteur applicables.`,
    },
    {
      title: '6. Confidentialite et donnees',
      content: `Nous collectons uniquement les donnees necessaires au fonctionnement du service (email, bankroll). Vos donnees ne sont jamais vendues a des tiers. Les mots de passe sont haches avec bcrypt. Les sessions sont gerees via des cookies JWT httpOnly securises.`,
    },
    {
      title: '7. Limitation de responsabilite',
      content: `Dans les limites permises par la loi applicable, Nexus Prime Elite ne saurait etre tenu responsable des pertes financieres resultant de l'utilisation des analyses fournies. La Plateforme est fournie "en l'etat" sans garantie d'aucune sorte.`,
    },
    {
      title: '8. Modifications des conditions',
      content: `Nexus Prime Elite se reserve le droit de modifier ces conditions a tout moment. Les modifications entrent en vigueur des leur publication sur la Plateforme. Votre utilisation continue de la Plateforme apres modification constitue votre acceptation des nouvelles conditions.`,
    },
    {
      title: '9. Droit applicable',
      content: `Les presentes conditions sont regies par le droit francais. Tout litige sera soumis a la competence exclusive des tribunaux competents.`,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs font-semibold mb-4">
            Mentions legales
          </div>
          <h1 className="text-4xl font-black mb-4 text-white">
            Conditions d'utilisation
          </h1>
          <p className="text-gray-500 text-sm">
            Derniere mise a jour : Mars 2026
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 mb-10">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-400 font-semibold mb-1">Avertissement important</p>
              <p className="text-amber-200/70 text-sm">
                Les paris sportifs sont interdits aux mineurs et peuvent creer une dependance. Jouez de maniere responsable.
                Nexus Prime Elite fournit des analyses statistiques, pas des garanties de gains.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="border-b border-gray-800 pb-8 last:border-0">
              <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
              <p className="text-gray-400 leading-relaxed text-sm">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
            Retour a l'accueil
          </Link>
          <Link href="/contact" className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-center transition">
            Nous contacter
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
