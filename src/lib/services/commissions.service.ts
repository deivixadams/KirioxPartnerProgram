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

    // Determine direct commission percentage based on partner level
    // Level 1 (no parent): 50% | Level 2 (with parent): use partner.commissionPercentage
    const isLevel1 = !partner.parentPartner;
    const directPercentage = isLevel1 ? 50 : partner.commissionPercentage;
    const directAmount = (deal.amount * directPercentage) / 100;

    commissions.push({
      dealId: deal.id,
      partnerId: deal.partnerId,
      type: CommissionType.DIRECT,
      percentage: directPercentage,
      amount: directAmount,
    });

    // Override Commission: Parent partner gets 20% (only if partner is Level 2)
    if (partner.parentPartner) {
      const parent = partner.parentPartner;
      const overridePercentage = 20; // Fixed 20% for parent
      const overrideAmount = (deal.amount * overridePercentage) / 100;

      commissions.push({
        dealId: deal.id,
        partnerId: parent.id,
        type: CommissionType.OVERRIDE,
        percentage: overridePercentage,
        amount: overrideAmount,
      });
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
