'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent, ClipboardEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { signIn } from "next-auth/react"

const OTP_LENGTH = 6
const OTP_EXPIRY_SECONDS = 300 // 5 minutes

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('challengeId') || ''

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setError('')

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    setError('')
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError('Ingresa los 6 dígitos del código')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        challengeId,
        code,
        redirect: false
      })

      if (result?.error) {
        setError(result.error || 'Código incorrecto')
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 1200)
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email || resending) return
    setResending(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: '' }),
      })
      // We expect this to fail (wrong password), but we can't re-send without password
      // So we redirect back to login
    } catch {}

    setResending(false)
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-purple flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-primary-500/30 mb-5">
            K
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            KIRIOX
          </h1>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase font-medium">
            Partner Program
          </p>
        </div>

        <div
          className="glass-card p-8 rounded-2xl border border-white/10"
          style={{ background: 'rgba(14,21,47,0.7)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Verificación de email</h2>
              <p className="text-white/40 text-xs mt-1">
                Ingresa el código enviado a tu correo para continuar.
              </p>
            </div>
          </div>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <CheckCircle className="w-14 h-14 text-emerald-400" />
                </motion.div>
                <p className="text-white font-semibold">¡Acceso concedido!</p>
                <p className="text-white/40 text-sm">Redirigiendo al tablero...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Timer */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">El código expira en:</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    secondsLeft < 60 ? 'text-red-400' : 'text-primary-400'
                  }`}
                >
                  {secondsLeft > 0 ? formatTime(secondsLeft) : '⏰ Expirado'}
                </span>
              </div>

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-digit-${i}`}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    autoFocus={i === 0}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 bg-white/5 text-white outline-none
                      ${digit
                        ? 'border-primary-400/60 bg-primary-500/10 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                        : 'border-white/10 focus:border-primary-400/40 focus:bg-white/8'
                      }
                    `}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="confirm-submit"
                type="submit"
                disabled={loading || secondsLeft <= 0}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-primary-500 to-accent-purple hover:from-primary-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/20"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Verificando...
                  </>
                ) : (
                  'Confirmar acceso'
                )}
              </motion.button>

              {/* Resend / back */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al login
                </Link>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-1.5 text-primary-400/60 hover:text-primary-400 text-xs transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  Reenviar código
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Kiriox Partner Program
        </p>
      </motion.div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
