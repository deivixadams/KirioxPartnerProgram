import { prisma } from '../prisma';
import { DealStage, ClientStatus } from '@prisma/client';
import { CommissionsService } from './commissions.service';

export class DealsService {
  static async create(data: any) {
    const { clientId, partnerId, productId, title, amount } = data;

    // RULE: A partner can only create deals for their OWN clients
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) throw new Error('Client not found');
    if (client.status === ClientStatus.UNASSIGNED) {
      // If unassigned, the partner can capture it
      await prisma.client.update({
        where: { id: clientId },
        data: {
          ownerPartnerId: partnerId,
          status: ClientStatus.ASSIGNED,
          assignedAt: new Date()
        }
      });
    } else if (client.ownerPartnerId !== partnerId) {
      throw new Error('This client belongs to another partner');
    }

    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          clientId,
          partnerId,
          productId,
          title,
          amount,
          stage: DealStage.PROSPECT,
        },
      });

      await tx.dealHistory.create({
        data: {
          dealId: deal.id,
          toStage: DealStage.PROSPECT,
          changedBy: partnerId,
          note: 'Deal created',
        },
      });

      return deal;
    });
  }

  static async updateStage(id: string, newStage: DealStage, changedBy: string, note?: string) {
    const deal = await prisma.deal.findUnique({ 
      where: { id },
      include: { client: true }
    });
    if (!deal) throw new Error('Deal not found');

    const fromStage = deal.stage;

    return prisma.$transaction(async (tx) => {
      const updatedDeal = await tx.deal.update({
        where: { id },
        data: {
          stage: newStage,
          closedAt: newStage === DealStage.WON || newStage === DealStage.LOST ? new Date() : null,
          result: newStage === DealStage.WON ? 'WON' : newStage === DealStage.LOST ? 'LOST' : null,
        },
      });

      await tx.dealHistory.create({
        data: {
          dealId: id,
          fromStage,
          toStage: newStage,
          changedBy,
          note,
        },
      });

      // Special Logic for WON: Calculate Commissions
      if (newStage === DealStage.WON && fromStage !== DealStage.WON) {
        await CommissionsService.calculateForDeal(id);
      }

      // Special Logic for LOST: Release Client
      if (newStage === DealStage.LOST && fromStage !== DealStage.LOST) {
        await tx.client.update({
          where: { id: deal.clientId },
          data: {
            status: ClientStatus.UNASSIGNED,
            ownerPartnerId: null,
            assignedAt: null
          }
        });
      }

      return updatedDeal;
    });
  }

  static async findAll() {
    return prisma.deal.findMany({
      include: {
        client: true,
        partner: true,
        product: true,
        history: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
