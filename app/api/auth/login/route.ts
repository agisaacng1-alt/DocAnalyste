import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {},
      create: { email: cleanEmail },
    });

    const cookieStore = await cookies();
    cookieStore.set('uid', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    });

    return NextResponse.json({ email: user.email, credits: user.credits });
  } catch (error) {
    console.error('Erreur de connexion :', error);
    return NextResponse.json({ error: "Impossible de se connecter. Réessayez." }, { status: 500 });
  }
}
