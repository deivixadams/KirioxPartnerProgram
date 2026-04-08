import { PrismaClient, VendorStatus, CommissionStatus, CommissionType, DealStage, RoleName, ClientStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos con modelo RBAC...')

  // 1. Crear Productos (Globales)
  const risk = await prisma.product.upsert({
    where: { code: 'KR-01' },
    update: {},
    create: { name: 'Kiriox Risk', code: 'KR-01', description: 'Gestión integral de riesgos.' }
  })

  const erp = await prisma.product.upsert({
    where: { code: 'ERPCRM-03' },
    update: {},
    create: { name: 'ERP/CRM', code: 'ERPCRM-03', description: 'Gestión empresarial.' }
  })

  const audit = await prisma.product.upsert({
    where: { code: 'KRA-02' },
    update: {},
    create: { name: 'Kiriox Risk and Auditing', code: 'KRA-02', description: 'Auditoría avanzada.' }
  })

  // 2. Crear Usuarios y Vendedores
  const hashedPassword = await bcrypt.hash('kiriox123', 10)

  // -- ADMIN --
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kiriox.com' },
    update: {},
    create: {
      email: 'admin@kiriox.com',
      password: hashedPassword,
      roleName: RoleName.ADMINISTRADOR,
    }
  })

  // -- PEDWAR (Raíz - 50%) --
  const pedwarUser = await prisma.user.upsert({
    where: { email: 'pedwar@kiriox.com' },
    update: {},
    create: {
      email: 'pedwar@kiriox.com',
      password: hashedPassword,
      roleName: RoleName.VENDEDOR,
    }
  })

  const pedwar = await prisma.vendor.upsert({
    where: { userId: pedwarUser.id },
    update: { commissionPercentage: 50 },
    create: {
      name: 'Pedwar Castillo',
      userId: pedwarUser.id,
      commissionPercentage: 50,
      level: 1,
      status: VendorStatus.ACTIVE,
    }
  })

  // -- PATRICIA (Raíz - 30%) --
  const patriciaUser = await prisma.user.upsert({
    where: { email: 'patricia@kiriox.com' },
    update: {},
    create: {
      email: 'patricia@kiriox.com',
      password: hashedPassword,
      roleName: RoleName.VENDEDOR,
    }
  })

  const patricia = await prisma.vendor.upsert({
    where: { userId: patriciaUser.id },
    update: { commissionPercentage: 30 },
    create: {
      name: 'Patricia Reyes',
      userId: patriciaUser.id,
      commissionPercentage: 30,
      level: 1,
      status: VendorStatus.ACTIVE,
    }
  })

  // -- SUB-VENDEDOR de Pedwar (X1 - 10%) --
  const x1User = await prisma.user.upsert({
    where: { email: 'vendedor_x1@kiriox.com' },
    update: {},
    create: {
      email: 'vendedor_x1@kiriox.com',
      password: hashedPassword,
      roleName: RoleName.VENDEDOR,
    }
  })

  const subVendorX1 = await prisma.vendor.upsert({
    where: { userId: x1User.id },
    update: { commissionPercentage: 10, parentVendorId: pedwar.id },
    create: {
      name: 'Vendedor X1 (Junior)',
      userId: x1User.id,
      commissionPercentage: 10,
      level: 2,
      parentVendorId: pedwar.id,
      status: VendorStatus.ACTIVE,
    }
  })

  // 3. Crear Cliente y Deal inicial para Pedwar
  const clientTech = await prisma.client.upsert({
    where: { email: 'tecnologia@ejemplo.com' },
    update: { ownerVendorId: pedwar.id },
    create: {
      name: 'Tech Solutions SAS',
      email: 'tecnologia@ejemplo.com',
      company: 'Tech Solutions',
      ownerVendorId: pedwar.id,
      status: ClientStatus.ASSIGNED,
      assignedAt: new Date(),
    }
  })

  const dealWon = await prisma.deal.create({
    data: {
      title: 'Venta Kiriox Risk',
      amount: 10000,
      stage: DealStage.WON,
      clientId: clientTech.id,
      vendorId: pedwar.id,
      productId: risk.id,
      result: 'WON'
    }
  })

  // Generar Comisión Directa para Pedwar (50% de 10000 = 5000)
  await prisma.commission.create({
    data: {
      dealId: dealWon.id,
      vendorId: pedwar.id,
      amount: 5000,
      type: CommissionType.DIRECT,
      percentage: 50,
      status: CommissionStatus.PENDING,
    }
  })

  // 4. Crear Cliente UNASSIGNED (para prueba de captura)
  await prisma.client.upsert({
    where: { email: 'prospecto_libre@empresa.com' },
    update: {},
    create: {
      name: 'Prospecto Libre',
      email: 'prospecto_libre@empresa.com',
      status: ClientStatus.UNASSIGNED,
      ownerVendorId: null,
      assignedAt: null
    }
  })

  console.log('✅ Base de datos sembrada con Roles y Usuarios.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
