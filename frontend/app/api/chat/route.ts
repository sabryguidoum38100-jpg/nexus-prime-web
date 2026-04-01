import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://nexus-prime-web.onrender.com';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message trop long (2000 caractères max)' }, { status: 400 });
    }

    // Récupérer le token JWT depuis le cookie pour le transmettre au backend
    const token = req.cookies.get('nexus_token')?.value;

    // Appel au backend Rust SSE
    const backendResp = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '0.0.0.0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: message.trim(), context: context || '' }),
    });

    if (backendResp.status === 429) {
      return NextResponse.json(
        { error: 'Limite atteinte. Passez Premium pour un accès illimité.' },
        { status: 429 }
      );
    }

    if (!backendResp.ok) {
      throw new Error(`Backend error: ${backendResp.status}`);
    }

    // Proxy le stream SSE directement
    const stream = backendResp.body;
    if (!stream) {
      throw new Error('No stream from backend');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    // Fallback : générer une réponse simulée si le backend est down
    const message = (error as Error).message || 'Erreur inconnue';
    console.error('Chat API error:', message);

    // Créer un stream SSE de fallback
    const encoder = new TextEncoder();
    const fallbackText = "Je suis l'assistant Nexus Prime. Le serveur d'analyse est momentanément indisponible. Veuillez réessayer dans quelques instants. Pour toute question sur l'Edge, le Kelly ou la gestion de bankroll, je suis à votre disposition dès le retour du service.";

    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackText.split(' ');
        for (const word of words) {
          const data = JSON.stringify({ token: word + ' ' });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          await new Promise(r => setTimeout(r, 40));
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {"done":true}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
