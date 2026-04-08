import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export async function GET() {
  try {
    // Definimos el umbral de alerta (Día 50 al 60)
    // Buscamos clientes que fueron asignados hace más de 50 días
    const alertThreshold = subDays(new Date(), 50);

    const staleClients = await prisma.client.findMany({
      where: {
        status: 'ASSIGNED' as any,
        assignedAt: {
          lte: alertThreshold
        }
      },
      include: {
        owner: true
      },
      orderBy: {
        assignedAt: 'asc'
      }
    });

    const notifications = staleClients.map(client => {
      const daysSinceAsignment = Math.floor((new Date().getTime() - new Date(client.assignedAt).getTime()) / (1000 * 3600 * 24));
      const daysRemaining = 60 - daysSinceAsignment;

      return {
        id: client.id,
        type: 'STALE_CLIENT',
        title: '⚠️ Expiración de Cliente',
        message: `El cliente ${client.name} expirará en ${daysRemaining} días.`,
        data: {
          clientId: client.id,
          daysRemaining
        }
      };
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
