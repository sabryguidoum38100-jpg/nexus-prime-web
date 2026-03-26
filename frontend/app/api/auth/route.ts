import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nexus-prime-elite-2026-super-secret-key-do-not-share'
);

// Simple in-memory user store (pour MVP — en production, utiliser une DB)
const users: Map<string, { id: string; name: string; email: string; passwordHash: string; plan: string; bankroll: number }> = new Map();

async function createToken(payload: object) {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function POST(req: NextRequest) {
  const { action, name, email, password, bankroll } = await req.json();

  if (action === 'register') {
    if (users.has(email)) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: crypto.randomUUID(),
      name: name || email.split('@')[0],
      email,
      passwordHash,
      plan: 'free',
      bankroll: bankroll || 1000,
    };
    users.set(email, user);
    const token = await createToken({ id: user.id, name: user.name, email: user.email, plan: user.plan, bankroll: user.bankroll });
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, bankroll: user.bankroll } });
    res.cookies.set('nexus_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });
    return res;
  }

  if (action === 'login') {
    const user = users.get(email);
    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
    const token = await createToken({ id: user.id, name: user.name, email: user.email, plan: user.plan, bankroll: user.bankroll });
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, bankroll: user.bankroll } });
    res.cookies.set('nexus_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  }

  if (action === 'logout') {
    const res = NextResponse.json({ success: true });
    res.cookies.delete('nexus_token');
    return res;
  }

  if (action === 'update_bankroll') {
    const token = req.cookies.get('nexus_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = users.get(payload.email as string);
      if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      user.bankroll = bankroll;
      const newToken = await createToken({ id: user.id, name: user.name, email: user.email, plan: user.plan, bankroll: user.bankroll });
      const res = NextResponse.json({ success: true, bankroll: user.bankroll });
      res.cookies.set('nexus_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return res;
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('nexus_token')?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ user: { id: payload.id, name: payload.name, email: payload.email, plan: payload.plan, bankroll: payload.bankroll } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
