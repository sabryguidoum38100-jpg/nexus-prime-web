'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    // Simulate sending (in production: connect to email service like Resend/SendGrid)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Message envoye ! Nous vous repondrons sous 24h.');
  };

  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'support@nexusprime.ai', href: 'mailto:support@nexusprime.ai' },
    { icon: '💬', label: 'Discord', value: 'discord.gg/nexusprime', href: '#' },
    { icon: '🐦', label: 'Twitter / X', value: '@NexusPrimeAI', href: '#' },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-5xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Contactez-nous
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Une question sur la plateforme, un bug a signaler ou une suggestion ? Notre equipe vous repond sous 24h.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Nous joindre</h2>
            {contactInfo.map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-emerald-500/30 transition-colors group">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">{item.value}</p>
                </div>
              </a>
            ))}

            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mt-6">
              <p className="text-emerald-400 font-semibold text-sm mb-1">Temps de reponse</p>
              <p className="text-gray-400 text-xs">Nous repondons generalement sous 24 heures en jours ouvrables.</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center bg-gray-900 rounded-xl border border-emerald-500/20 p-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">Message envoye !</h3>
                <p className="text-gray-400 mb-6">Nous vous repondrons a {form.email} sous 24h.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="px-6 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-8 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Nom *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jean Dupont"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jean@example.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Sujet</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Question sur les picks IA..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Decrivez votre question ou probleme..."
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-gray-500 hover:text-emerald-400 text-sm transition">
            Retour a l'accueil
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
