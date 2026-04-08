import { prisma } from '../prisma';
import { CommissionType, Prisma } from '@prisma/client';

export class CommissionsService {
  static async calculateForDeal(dealId: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        vendor: {
          include: {
            parentVendor: true,
          },
        },
      },
    });

    if (!deal) throw new Error('Deal not found');

    const vendor = deal.vendor;
    const commissions: Prisma.CommissionCreateManyInput[] = [];

    // 1. Direct Commission (Vendedor que cierra)
    const directPercentage = vendor.commissionPercentage;
    const directAmount = (deal.amount * directPercentage) / 100;

    commissions.push({
      dealId: deal.id,
      vendorId: deal.id, // Error check: vendorId should be deal.vendorId
      type: CommissionType.DIRECT,
      percentage: directPercentage,
      amount: directAmount,
    });

    // 2. Override Commission (Diferencial para el Padre)
    // El modelo es: el total disponible es el % del Padre. 
    // El Subvendedor toma su parte y el Padre toma el resto.
    if (vendor.parentVendor) {
      const parent = vendor.parentVendor;
      const overridePercentage = Math.max(0, parent.commissionPercentage - vendor.commissionPercentage);
      const overrideAmount = (deal.amount * overridePercentage) / 100;

      if (overridePercentage > 0) {
        commissions.push({
          dealId: deal.id,
          vendorId: parent.id,
          type: CommissionType.OVERRIDE,
          percentage: overridePercentage,
          amount: overrideAmount,
        });
      }
    }

    // Fix vendorId error in direct commission push
    commissions[0].vendorId = deal.vendorId;

    return prisma.commission.createMany({
      data: commissions,
    });
  }

  static async findAll() {
    return prisma.commission.findMany({
      include: {
        vendor: true,
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
