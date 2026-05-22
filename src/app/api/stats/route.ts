import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [totalSales, partnerCount, pendingCommissions, openDeals] = await Promise.all([
      // 1. Contar Total Sales (Solo negocios WON)
      prisma.deal.aggregate({
        _sum: {
          amount: true
        },
        where: {
          stage: 'WON'
        }
      }),
      // 2. Conteo de Partners
      prisma.partner.count(),
      // 3. Comisiones Pendientes
      prisma.commission.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'PENDING'
        }
      }),
      // 4. Negocios Abiertos (Todo lo que no sea WON o LOST)
      prisma.deal.count({
        where: {
          stage: {
            in: ['PROSPECT', 'CONTACTED', 'NEGOTIATION']
          }
        }
      })
    ])

    return NextResponse.json({
      totalSales: totalSales._sum.amount || 0,
      partnerCount: partnerCount,
      pendingCommissions: pendingCommissions._sum.amount || 0,
      openDeals: openDeals
    })
  } catch (error) {
    console.error('Error calculating stats:', error)
    return NextResponse.json({ error: 'Failed to calculate stats' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
