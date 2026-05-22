import { NextResponse, NextRequest } from 'next/server';
import { UsersService } from '@/lib/services/users.service';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const { newPassword } = await req.json();

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
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
