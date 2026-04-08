import { prisma } from '../prisma';

export class ProductsService {
  static async findAll() {
    return prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async create(data: any) {
    return prisma.product.create({ data });
  }
}

export class ClientsService {
  static async findAll() {
    return prisma.client.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(data: any) {
    const existing = await prisma.client.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (existing) throw new Error('Client with this email or phone already exists');

    return prisma.client.create({ data });
  }
}
