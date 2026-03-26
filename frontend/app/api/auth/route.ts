import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nexus-prime-elite-2026-super-secret-key-do-not-share'
);

const COOKIE_NAME = 'nexus_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

interface UserPayload {
  id: string;
  name: string;
  email: string;
  plan: string;
  bankroll: number;
  ph: string; // password hash
}

async function signToken(payload: UserPayload) {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

async function hashPwd(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + 'nexus-salt-2026');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });
  const p = await verifyToken(token);
  if (!p) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: p.id, name: p.name, email: p.email, plan: p.plan, bankroll: p.bankroll } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  if (action === 'register') {
    const { name, email, password, bankroll } = body;
    if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    const ph = await hashPwd(password);
    const p: UserPayload = {
      id: crypto.randomUUID(),
      name: name || email.split('@')[0],
      email,
      plan: 'free',
      bankroll: Number(bankroll) || 1000,
      ph,
    };
    const token = await signToken(p);
    const res = NextResponse.json({ success: true, user: { id: p.id, name: p.name, email: p.email, plan: p.plan, bankroll: p.bankroll } });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res;
  }

  if (action === 'login') {
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    const existing = req.cookies.get(COOKIE_NAME)?.value;
    if (existing) {
      const p = await verifyToken(existing);
      if (p && p.email === email) {
        const computed = await hashPwd(password);
        if (computed === p.ph) {
          const newToken = await signToken(p);
          const res = NextResponse.json({ success: true, user: { id: p.id, name: p.name, email: p.email, plan: p.plan, bankroll: p.bankroll } });
          res.cookies.set(COOKIE_NAME, newToken, COOKIE_OPTIONS);
          return res;
        }
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
      }
    }
    // Auto-create on first login (demo UX)
    const ph = await hashPwd(password);
    const p: UserPayload = { id: crypto.randomUUID(), name: email.split('@')[0], email, plan: 'free', bankroll: 1000, ph };
    const token = await signToken(p);
    const res = NextResponse.json({ success: true, user: { id: p.id, name: p.name, email: p.email, plan: p.plan, bankroll: p.bankroll } });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res;
  }

  if (action === 'logout') {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (action === 'update_bankroll') {
    const { bankroll } = body;
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    const p = await verifyToken(token);
    if (!p) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    const updated: UserPayload = { ...p, bankroll: Number(bankroll) };
    const newToken = await signToken(updated);
    const res = NextResponse.json({ success: true, bankroll: updated.bankroll });
    res.cookies.set(COOKIE_NAME, newToken, COOKIE_OPTIONS);
    return res;
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
