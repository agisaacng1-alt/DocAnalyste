import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const uid = cookieStore.get('uid')?.value;

    if (!uid) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: { email: user.email, credits: user.credits } });
  } catch (error) {
    console.error('Erreur de récupération utilisateur :', error);
    return NextResponse.json({ user: null });
  }
}
