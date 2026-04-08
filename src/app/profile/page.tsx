"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Key
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Las contraseñas no coinciden' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al actualizar contraseña')

      setStatus({ type: 'success', message: 'Contraseña actualizada con éxito' })
      setFormData({ email: '', oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow text-white">
            Mi Perfil
          </h1>
          <p className="text-white/50 font-medium">
            Administre su cuenta y configuración de seguridad.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-[2rem] text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-purple mx-auto flex items-center justify-center border-4 border-white/5 shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Administrador</h3>
              <p className="text-white/40 text-sm font-medium">Nivel 1</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-white/40 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                Acceso Total Habilitado
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Lock className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Cambiar Contraseña</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Confirmar Email</label>
                <div className="relative">
                  <input 
                    required
                    type="email"
                    placeholder="email@kiriox.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Nueva Contraseña</label>
                  <div className="relative">
                    <input 
                      required
                      type="password"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Repetir Contraseña</label>
                  <div className="relative">
                    <input 
                      required
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  </div>
                </div>
              </div>

              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 font-medium text-sm",
                    status.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                  )}
                >
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {status.message}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold font-heading transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? "Guardando..." : "Actualizar Contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
