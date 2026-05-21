import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';

export class PartnersService {
  static async create(data: any) {
    const {
      email,
      password,
      name,
      phone,
      parentPartnerId: rawParentId,
      commissionPercentage,
      roleName = 'VENDEDOR'
    } = data;
    const parentPartnerId = rawParentId || null;

    let level = 1;
    const hashedPassword = await bcrypt.hash(password || 'kiriox123', 10);

    return prisma.$transaction(async (tx) => {
      if (parentPartnerId) {
        const parent = await tx.partner.findUnique({ where: { id: parentPartnerId } });
        if (!parent) throw new Error('Parent partner not found');
        if (parent.level !== 1) throw new Error('Only level 1 partners can be parents');
        level = 2;
      }

      const childCommission = parentPartnerId ? 30 : 50;

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleName: roleName as any,
        }
      });

      if (parentPartnerId) {
        await tx.partner.update({
          where: { id: parentPartnerId },
          data: { commissionPercentage: 20 },
        });
      }

      const partner = await tx.partner.create({
        data: {
          name,
          phone,
          commissionPercentage: childCommission,
          parentPartnerId,
          level,
          userId: user.id
        }
      });

      return partner;
    });
  }

  static async updateCommission(id: string, percentage: number) {
    if (percentage < 0 || percentage > 100) throw new Error('Invalid percentage');
    return prisma.partner.update({
      where: { id },
      data: { commissionPercentage: percentage },
    });
  }

  static async findAll() {
    return prisma.partner.findMany({
      include: {
        parentPartner: true,
        subPartners: true,
        user: true,
        _count: {
          select: { clients: true, deals: true }
        }
      }
    });
  }

  static async findOne(id: string) {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        parentPartner: true,
        user: true,
        clients: true,
      }
    });

    if (!partner) throw new Error('Partner not found');
    return partner;
  }
}
