import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendConfirmationCode } from '@/lib/services/email.service'

const OTP_EXPIRY_MINUTES = 5

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Dummy compare para mitigar ataques de timing
      await bcrypt.compare(password, '$2b$10$dummyHashToPreventTimingAttacks1234567890123456789012')
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Check partner account status before issuing OTP
    const partner = await prisma.partner.findUnique({ where: { userId: user.id } })
    if (partner?.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido suspendida. Contacta al administrador para más información.' },
        { status: 403 }
      )
    }
    if (partner?.status === 'RETIRED') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido retirada y ya no tiene acceso al programa.' },
        { status: 403 }
      )
    }

    // Create challenge
    const code = crypto.randomInt(100000, 999999).toString()
    const hashedCode = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    const challenge = await prisma.loginChallenge.create({
      data: {
        userId: user.id,
        code: hashedCode,
        expiresAt
      }
    })

    // Send email
    await sendConfirmationCode(email, code)

    return NextResponse.json({ challengeId: challenge.id })
  } catch (error) {
    console.error('[POST /api/auth/start-login]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
