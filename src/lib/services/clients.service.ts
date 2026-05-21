import { prisma } from '../prisma';
import { ClientStatus } from '@prisma/client';

export class ClientsService {
  static async create(data: any) {
    const { name, email, phone, company, ownerPartnerId } = data;

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient && existingClient.status === ClientStatus.ASSIGNED) {
      throw new Error('This client is already registered and assigned to a partner');
    }

    if (existingClient && existingClient.status === ClientStatus.UNASSIGNED) {
      // Re-assign existing client
      return prisma.client.update({
        where: { id: existingClient.id },
        data: {
          name,
          phone,
          company,
          ownerPartnerId,
          status: ClientStatus.ASSIGNED,
          assignedAt: new Date()
        }
      });
    }

    // Create new client
    return prisma.client.create({
      data: {
        name,
        email,
        phone,
        company,
        ownerPartnerId,
        status: ClientStatus.ASSIGNED,
        assignedAt: new Date()
      }
    });
  }

  static async findByEmail(email: string) {
    return prisma.client.findUnique({
      where: { email },
      include: { owner: true }
    });
  }

  static async findAll() {
    return prisma.client.findMany({
      include: {
        owner: true,
        deals: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Release stale clients after 30 days of assignment.
   *
   * This can be invoked manually, from a scheduled task, or via API:
   * PATCH /api/clients?action=release-stale
   */
  static async releaseStaleClients() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return prisma.client.updateMany({
      where: {
        status: ClientStatus.ASSIGNED,
        assignedAt: {
          lt: thirtyDaysAgo
        }
      },
      data: {
        status: ClientStatus.UNASSIGNED,
        ownerPartnerId: null,
        assignedAt: null
      }
    });
  }
}
