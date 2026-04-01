'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  timestamp: Date;
}

// ─── Suggestions rapides ─────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  { label: 'Expliquer l\'Edge', text: 'Explique-moi comment l\'Edge est calculé par le modèle ONNX de Nexus Prime.' },
  { label: 'Kelly Criterion', text: 'Comment fonctionne le Quarter-Kelly pour la gestion de bankroll ?' },
  { label: 'Platt Scaling', text: 'Qu\'est-ce que le Platt Scaling et pourquoi est-il utilisé pour calibrer les probabilités ?' },
  { label: 'CLV', text: 'Qu\'est-ce que la Closing Line Value (CLV) et pourquoi est-ce un indicateur clé ?' },
  { label: 'Tiers ELITE/PRO', text: 'Quelle est la différence entre un pick ELITE et un pick PRO ?' },
  { label: 'Steam Move', text: 'Qu\'est-ce qu\'un Steam Move et comment le détecter ?' },
];

// ─── Composant bulle message ─────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
        isUser
          ? 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-emerald-500/30 text-emerald-400'
          : 'bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-400/20 text-amber-400'
      }`}>
        {isUser ? 'V' : 'N'}
      </div>

      {/* Bulle */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-emerald-500/15 border border-emerald-500/25 text-white rounded-tr-sm'
            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
        }`}>
          {/* Formatage du texte avec support markdown basique */}
          <FormattedText text={message.content} />
          {message.streaming && (
            <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <span className="text-gray-700 text-[10px] px-1">
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Formatage texte basique ─────────────────────────────────────────────────

function FormattedText({ text }: { text: string }) {
  if (!text) return null;

  // Remplacer **bold** et *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="text-gray-300">{part.slice(1, -1)}</em>;
        }
        // Gérer les sauts de ligne
        return part.split('\n').map((line, j) => (
          <span key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </span>
        ));
      })}
    </>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour. Je suis l\'assistant expert de **Nexus Prime**.\n\nJe peux vous expliquer l\'Edge calculé par notre modèle ONNX, vous conseiller sur la gestion de bankroll Quarter-Kelly, ou analyser n\'importe quelle cote. Comment puis-je vous aider ?',
      streaming: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      streaming: false,
      timestamp: new Date(),
    };

    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    // Annuler la requête précédente si elle existe
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
        signal: abortRef.current.signal,
      });

      if (response.status === 429) {
        setRateLimited(true);
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Limite atteinte. Passez Premium pour un accès illimité.', streaming: false }
            : m
        ));
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Pas de stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.done) {
                // Fin du stream
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, streaming: false }
                    : m
                ));
                continue;
              }

              if (parsed.token) {
                fullContent += parsed.token;
                const currentContent = fullContent;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: currentContent, streaming: true }
                    : m
                ));
              }
            } catch {
              // Ignorer les lignes non-JSON
            }
          }
        }
      }

      // S'assurer que le streaming est terminé
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, streaming: false }
          : m
      ));

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      const errMsg = (err as Error).message || 'Erreur de connexion';
      setError(errMsg);
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', streaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      streaming: false,
      timestamp: new Date(),
    }]);
    setError(null);
    setRateLimited(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col pt-16">
        {/* Hero compact */}
        <div className="border-b border-white/5 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-white font-black text-lg">Assistant IA Nexus Prime</h1>
                <p className="text-gray-500 text-xs">Powered by Llama 4 Scout · ONNX v6 · Analyse temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Indicateur de statut */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold">En ligne</span>
              </div>
              {/* Bouton clear */}
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-white text-xs transition hover:bg-white/5 border border-white/5"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col container mx-auto px-4 max-w-4xl w-full">

          {/* Messages */}
          <div className="flex-1 py-6 space-y-4 overflow-y-auto" style={{ minHeight: 'calc(100vh - 340px)' }}>

            {/* Suggestions rapides (si conversation vide) */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-3">Questions fréquentes</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.text)}
                      className="text-left px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-gray-400 hover:text-white hover:bg-white/6 hover:border-white/15 transition-all text-xs font-medium"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Indicateur de chargement (avant que le premier token arrive) */}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-black flex-shrink-0">
                  N
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            {/* Alerte rate limit */}
            {rateLimited && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-sm"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <p className="text-amber-400 font-semibold text-sm mb-1">Limite quotidienne atteinte</p>
                  <p className="text-gray-500 text-xs mb-3">Passez Premium pour un accès illimité à l'assistant IA.</p>
                  <a
                    href="/pricing"
                    className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    Passer Premium — 19,99€/mois
                  </a>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="py-4 border-t border-white/5">
            {/* Erreur */}
            {error && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <span>⚠</span>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-400">✕</button>
              </div>
            )}

            <div className="flex gap-3 items-end">
              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question sur l'Edge, le Kelly, les cotes..."
                  disabled={isLoading || rateLimited}
                  rows={1}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white text-sm outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition placeholder-gray-700 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <div className="absolute right-3 bottom-3 text-gray-700 text-[10px] select-none">
                  {input.length > 0 && `${input.length}/2000`}
                </div>
              </div>

              {/* Bouton envoyer */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || rateLimited}
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Hint */}
            <p className="text-gray-700 text-[10px] mt-2 text-center">
              Entrée pour envoyer · Shift+Entrée pour nouvelle ligne · 10 messages/jour en Free
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
