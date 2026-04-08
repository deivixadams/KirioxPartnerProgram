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

    if (parentVendorId) {
      const parent = await prisma.vendor.findUnique({
        where: { id: parentVendorId },
      });

      if (!parent) throw new Error('Parent vendor not found');
      if (parent.level !== 1) throw new Error('Only level 1 vendors can be parents');
      
      // Validation: Sub-vendor commission cannot exceed parent's commission
      if (commissionPercentage > parent.commissionPercentage) {
        throw new Error(`Sub-vendor commission (${commissionPercentage}%) cannot exceed parent's commission (${parent.commissionPercentage}%)`);
      }

      level = 2;
    }

    const hashedPassword = await bcrypt.hash(password || 'kiriox123', 10);

    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleName: roleName as any,
        }
      });

      // 2. Create Vendor linked to User
      const vendor = await tx.vendor.create({
        data: {
          name,
          phone,
          commissionPercentage: parseFloat(commissionPercentage) || 0,
          parentVendorId,
          level,
          userId: user.id
        },
      });

      return vendor;
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
