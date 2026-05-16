import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';

export class VendorsService {
  static async create(data: any) {
    const { 
      email, 
      password, 
      name, 
      phone, 
      parentVendorId: rawParentId, 
      commissionPercentage,
      roleName = 'VENDEDOR' 
    } = data;
    const parentVendorId = rawParentId || null;

    let level = 1;

    const hashedPassword = await bcrypt.hash(password || 'kiriox123', 10);

    return prisma.$transaction(async (tx) => {
      // Validate parent (if provided)
      if (parentVendorId) {
        const parent = await tx.vendor.findUnique({ where: { id: parentVendorId } });
        if (!parent) throw new Error('Parent vendor not found');
        if (parent.level !== 1) throw new Error('Only level 1 vendors can be parents');
        level = 2;
      }

      // Determine commission percentages according to new business rules
      const childCommission = parentVendorId ? 30 : 50;

      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleName: roleName as any,
        }
      });

      // 2. If has parent, ensure parent's commission is set to 20%
      if (parentVendorId) {
        await tx.vendor.update({
          where: { id: parentVendorId },
          data: { commissionPercentage: 20 },
        });
      }

      // 3. Create Vendor linked to User
      const vendor = await tx.vendor.create({
        data: {
          name,
          phone,
          commissionPercentage: childCommission,
          parentVendorId,
          level,
          userId: user.id
        },
      });

      return vendor;
    });
  }

  static async updateCommission(id: string, percentage: number) {
    if (percentage < 0 || percentage > 100) throw new Error('Invalid percentage');
    return prisma.vendor.update({
      where: { id },
      data: { commissionPercentage: percentage },
    });
  }

  static async findAll() {
    return prisma.vendor.findMany({
      include: {
        parentVendor: true,
        subVendors: true,
        user: true,
        _count: {
          select: { clients: true, deals: true }
        }
      },
    });
  }

  static async findOne(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        parentVendor: true,
        user: true,
        clients: true,
      },
    });
    if (!vendor) throw new Error('Vendor not found');
    return vendor;
  }
}
