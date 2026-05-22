import type { ReactNode } from 'react'

export const metadata = {
  title: 'Iniciar Sesión — Kiriox Partner Program',
  description: 'Accede a tu cuenta de Kiriox Partner Program',
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
      {/* Decorative background blobs */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] bg-primary-400/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
