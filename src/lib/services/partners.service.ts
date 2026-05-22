import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';

export class PartnersService {
  static async create(data: any) {
    const {
      email,
      password,
      name,
      phone,
      parentPartnerId: rawParentId,
      commissionPercentage,
      roleName = 'SOCIO'
    } = data;
    const parentPartnerId = rawParentId || null;

    let level = 1;
    const hashedPassword = await bcrypt.hash(password || 'kiriox123', 10);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

  static async update(id: string, data: any) {
    const { parentPartnerId, status, name, phone } = data;
    
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const partner = await tx.partner.findUnique({
        where: { id },
        include: { parentPartner: true }
      });

      if (!partner) throw new Error('Partner not found');

      const oldParentId = partner.parentPartnerId;
      const updates: any = {};

      // Handle basic field updates
      if (name !== undefined) updates.name = name;
      if (phone !== undefined) updates.phone = phone;

      const historyData: any = {
        partnerId: id,
        oldParentId,
        changedBy: 'system'
      };

      // Handle parent change
      if (parentPartnerId !== undefined) {
        // Validate new parent if provided
        if (parentPartnerId) {
          const newParent = await tx.partner.findUnique({
            where: { id: parentPartnerId }
          });

          if (!newParent) throw new Error('Parent partner not found');
          if (newParent.level !== 1) throw new Error('Only level 1 partners can be parents');
          if (newParent.parentPartnerId) throw new Error('Cannot create third level');
        }

        updates.parentPartnerId = parentPartnerId || null;
        updates.level = parentPartnerId ? 2 : 1;

        // Update partner's commission based on new level
        if (parentPartnerId !== oldParentId) {
          // Partner is being promoted from level 2 to level 1 (losing parent)
          if (!parentPartnerId && oldParentId) {
            updates.commissionPercentage = 50;
          }
          // Partner is being demoted from level 1 to level 2 (gaining parent)
          else if (parentPartnerId && !oldParentId) {
            updates.commissionPercentage = 30;
          }

          historyData.newParentId = parentPartnerId || null;
          historyData.reason = 'Cambio de parent';
        }
      }

      // Handle status change
      if (status) {
        if (!['ACTIVE', 'SUSPENDED', 'RETIRED'].includes(status)) {
          throw new Error('Invalid status');
        }
        updates.status = status;
      }

      // Update partner
      const updatedPartner = await tx.partner.update({
        where: { id },
        data: updates
      });

      // Register history if parent changed
      if (historyData.newParentId !== undefined) {
        await tx.partnerRelationshipHistory.create({
          data: historyData
        });

        // Handle old parent commission
        if (oldParentId) {
          const otherSubpartners = await tx.partner.count({
            where: {
              parentPartnerId: oldParentId,
              id: { not: id }
            }
          });

          // If no more subpartners, old parent commission to 50%
          if (otherSubpartners === 0) {
            await tx.partner.update({
              where: { id: oldParentId },
              data: { commissionPercentage: 50 }
            });
          }
        }

        // Handle new parent commission
        if (parentPartnerId) {
          // Check if this is the new parent's first subpartner
          const siblingCount = await tx.partner.count({
            where: {
              parentPartnerId: parentPartnerId,
              id: { not: id }
            }
          });

          // If new parent didn't have subpartners before, update its commission to 20%
          if (siblingCount === 0) {
            await tx.partner.update({
              where: { id: parentPartnerId },
              data: { commissionPercentage: 20 }
            });
          }
        }
      }

      return updatedPartner;
    });
  }
}

