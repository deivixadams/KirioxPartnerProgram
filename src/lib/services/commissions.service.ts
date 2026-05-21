import { prisma } from '../prisma';
import { CommissionType, Prisma } from '@prisma/client';

export class CommissionsService {
  static async calculateForDeal(dealId: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        partner: {
          include: {
            parentPartner: true,
          },
        },
      },
    });

    if (!deal) throw new Error('Deal not found');

    const partner = deal.partner;
    const commissions: Prisma.CommissionCreateManyInput[] = [];

    // 1. Direct Commission (Partner who closes)
    const directPercentage = partner.commissionPercentage;
    const directAmount = (deal.amount * directPercentage) / 100;

    commissions.push({
      dealId: deal.id,
      partnerId: deal.partnerId,
      type: CommissionType.DIRECT,
      percentage: directPercentage,
      amount: directAmount,
    });

    // 2. Override Commission (Parent partner differential)
    if (partner.parentPartner) {
      const parent = partner.parentPartner;
      const overridePercentage = Math.max(0, parent.commissionPercentage - partner.commissionPercentage);
      const overrideAmount = (deal.amount * overridePercentage) / 100;

      if (overridePercentage > 0) {
        commissions.push({
          dealId: deal.id,
          partnerId: parent.id,
          type: CommissionType.OVERRIDE,
          percentage: overridePercentage,
          amount: overrideAmount,
        });
      }
    }

    return prisma.commission.createMany({
      data: commissions,
    });
  }

  static async findAll() {
    return prisma.commission.findMany({
      include: {
        partner: true,
        deal: {
          include: {
            product: true,
            client: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
