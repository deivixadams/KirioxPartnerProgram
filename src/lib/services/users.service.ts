import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';

export class UsersService {
  static async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        partner: {
          include: {
            parentPartner: true
          }
        }
      }
    });

    if (!user) throw new Error('User not found');
    
    // Remove password from response
    const { password: _, ...profile } = user;
    return profile;
  }
}
