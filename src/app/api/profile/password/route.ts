import { NextResponse } from 'next/server';
import { UsersService } from '@/lib/services/users.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { newPassword, email } = await req.json();

    // Since we don't have NextAuth yet, we'll find the user by email
    // In a real app, this would be const userId = session.user.id
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    await UsersService.changePassword(user.id, newPassword);

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
