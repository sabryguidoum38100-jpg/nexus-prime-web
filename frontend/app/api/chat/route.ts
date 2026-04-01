import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SYSTEM_PROMPT = `Tu es l'assistant expert de Nexus Prime. Tu analyses les cotes, expliques l'Edge calculé par notre modèle ONNX et conseilles sur la gestion de bankroll Kelly. Ton ton est pro, direct et analytique. Tu réponds en français, de façon concise et structurée. Tu ne donnes jamais de conseils financiers généraux — tu restes dans le domaine des paris sportifs et de la gestion de bankroll mathématique. Quand tu cites des chiffres, tu es précis. Tu utilises des termes techniques quand c'est pertinent (Edge, CLV, Kelly, Platt Scaling, EV+).`;

// Rate limiting simple en mémoire (Edge runtime)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit par IP : 20 req/heure ─────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
    if (!checkRateLimit(ip, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Limite atteinte. Passez Premium pour un accès illimité.' },
        { status: 429 }
      );
    }

    // ── Validation ────────────────────────────────────────────────────────────
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message trop long (2000 caractères max)' }, { status: 400 });
    }

    // ── Clé Groq ──────────────────────────────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      // Fallback SSE si pas de clé
      return fallbackStream('La clé GROQ_API_KEY n\'est pas configurée sur ce serveur. Contactez l\'administrateur.');
    }

    // ── Construction des messages ─────────────────────────────────────────────
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
    if (context && typeof context === 'string' && context.trim()) {
      messages.push({ role: 'system', content: `Contexte du pick actuel : ${context.trim()}` });
    }
    messages.push({ role: 'user', content: message.trim() });

    // ── Appel Groq streaming ──────────────────────────────────────────────────
    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages,
        stream: true,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      console.error('Groq error:', groqResp.status, errText);
      return fallbackStream(`Erreur Groq (${groqResp.status}). Veuillez réessayer.`);
    }

    // ── Transformer le stream Groq → SSE Nexus ────────────────────────────────
    const encoder = new TextEncoder();
    const groqStream = groqResp.body!;
    const reader = groqStream.getReader();
    const decoder = new TextDecoder();

    const transformedStream = new ReadableStream({
      async start(controller) {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(`event: done\ndata: {"done":true}\n\n`));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const token = parsed?.choices?.[0]?.delta?.content;
                if (token) {
                  const sseData = JSON.stringify({ token });
                  controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                }
              } catch {
                // Ignorer les lignes non-JSON
              }
            }
          }

          // Fin naturelle du stream
          controller.enqueue(encoder.encode(`event: done\ndata: {"done":true}\n\n`));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: ' [Erreur de stream]' })}\n\n`));
          controller.enqueue(encoder.encode(`event: done\ndata: {"done":true}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat route error:', error);
    return fallbackStream('Une erreur inattendue est survenue. Veuillez réessayer.');
  }
}

// ── Fallback SSE ──────────────────────────────────────────────────────────────
function fallbackStream(message: string): Response {
  const encoder = new TextEncoder();
  const words = message.split(' ');

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        const data = JSON.stringify({ token: word + ' ' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        await new Promise(r => setTimeout(r, 35));
      }
      controller.enqueue(encoder.encode(`event: done\ndata: {"done":true}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
