"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Plus, 
  Search, 
  Building, 
  Mail, 
  Phone, 
  MoreVertical, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  Clock, 
  UserPlus 
} from "lucide-react"
import { ClientsAPI, ProductsAPI, PartnersAPI, DealsAPI } from "@/lib/api"
import { cn, formatCurrency } from "@/lib/utils"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        ClientsAPI.getAll(),
        ProductsAPI.getAll()
      ])
      setClients(cRes.data)
      setProducts(pRes.data)
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow text-white">
            Gestión de Clientes
          </h1>
          <p className="text-white/50 font-medium">
            Administre su cartera de clientes y prospectos dentro de la red.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input 
          type="text"
          placeholder="Buscar clientes por nombre, empresa o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const isUnassigned = client.status === 'UNASSIGNED';
          
          // Calculate days remaining
          const assignedAt = client.assignedAt ? new Date(client.assignedAt) : new Date(client.createdAt);
          const daysSinceAssignment = Math.floor((new Date().getTime() - assignedAt.getTime()) / (1000 * 3600 * 24));
          const daysRemaining = Math.max(0, 60 - daysSinceAssignment);
          const isNearExpiration = !isUnassigned && daysRemaining <= 10;

          return (
            <div key={client.id} className={cn(
              "glass-card p-6 rounded-3xl glass-card-hover flex flex-col group relative overflow-hidden",
              isUnassigned && "border-white/5 opacity-80",
              isNearExpiration && "border-red-500/30 shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
            )}>
              {isUnassigned ? (
                <div className="absolute top-0 right-0 bg-accent-purple/20 text-accent-purple text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-bl-xl border-b border-l border-accent-purple/20">
                  Liberado
                </div>
              ) : isNearExpiration ? (
                <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-bl-xl border-b border-l border-red-500/20 animate-pulse">
                  ⚠️ Riesgo de Pérdida
                </div>
              ) : null}

              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 font-bold text-xl group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-all">
                  {client.name[0]}
                </div>
                {!isUnassigned && (
                  <div className={cn(
                    "flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-xl border",
                    isNearExpiration ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
                  )}>
                    <span className={cn(
                      "text-[8px] uppercase font-black tracking-widest",
                      isNearExpiration ? "text-red-400" : "text-white/30"
                    )}>Días Restantes</span>
                    <span className={cn(
                      "text-sm font-black leading-none",
                      isNearExpiration ? "text-red-500" : "text-white"
                    )}>{daysRemaining}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold mb-1 text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">
                {client.name}
              </h3>
              
              <div className="space-y-3 mt-4 flex-1">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Building className="w-3.5 h-3.5" />
                  <span>{client.company || 'Sin empresa'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{client.email}</span>
                </div>
                {!isUnassigned && (
                   <div className="flex items-center gap-2 text-xs text-white/50">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Partner</p>
                  <span className={cn(
                    "text-xs font-bold",
                    isUnassigned ? "text-white/20 italic" : "text-white/70"
                  )}>
                    {isUnassigned ? 'Disponible' : (client.owner?.name || '---')}
                  </span>
                </div>
                {isUnassigned && (
                  <button className="bg-primary-500/10 text-primary-400 p-2 rounded-xl hover:bg-primary-500 hover:text-white transition-all">
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 glass-card rounded-3xl animate-pulse" />
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddClientModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false)
              fetchData()
            }}
            products={products}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddClientModal({ onClose, onSuccess, products }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productId: '',
    ownerPartnerId: '' // In real app, this comes from Auth
  })
  const [partners, setPartners] = useState<any[]>([])
  const [checking, setChecking] = useState(false)
  const [exists, setExists] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    PartnersAPI.getAll().then(res => setPartners(res.data))
  }, [])

  const checkEmail = async (email: string) => {
    if (!email.includes('@')) return
    setChecking(true)
    try {
      // Logic: If already assigned, block. If unassigned, allow but warn.
      const res = await ClientsAPI.getAll() // Simplify: fetch all and check locally for now
      const match = res.data.find((c: any) => c.email.toLowerCase() === email.toLowerCase())
      setExists(match || null)
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Create client
      const { data: client } = await ClientsAPI.create(formData)
      // 2. Create initial deal automatically
      if (formData.productId) {
        await DealsAPI.create({
          clientId: client.id,
          partnerId: formData.ownerPartnerId,
          productId: formData.productId,
          title: `Interés inicial: ${products.find((p:any) => p.id === formData.productId)?.name}`,
          amount: 0 // Will be defined later
        })
      }
      onSuccess()
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al registrar cliente")
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = exists && exists.status === 'ASSIGNED'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-xl p-8 rounded-[2rem] relative z-[101]"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Registrar Prospecto</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Correo Electrónico</label>
            <div className="relative">
              <input 
                required
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value })
                  checkEmail(e.target.value)
                }}
                className={cn(
                  "w-full bg-white/5 border rounded-2xl py-3 px-4 text-white focus:outline-none transition-all",
                  isBlocked ? "border-red-500/50" : "border-white/10"
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checking && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
                {exists && !checking && (
                  isBlocked ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>
            {exists && (
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-tight px-1",
                isBlocked ? "text-red-400" : "text-emerald-400"
              )}>
                {isBlocked 
                  ? `Ya registrado por: ${exists.owner?.name || 'otro partner'}` 
                  : "Cliente liberado - ¡Puedes capturarlo!"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Nombre</label>
              <input 
                required
                disabled={isBlocked}
                type="text"
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white disabled:opacity-30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Empresa</label>
              <input 
                disabled={isBlocked}
                type="text"
                placeholder="Ej. Tech Corp"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white disabled:opacity-30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Partner Responsable</label>
            <select 
              required
              disabled={isBlocked}
              value={formData.ownerPartnerId}
              onChange={e => setFormData({ ...formData, ownerPartnerId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none appearance-none disabled:opacity-30"
            >
              <option value="" className="bg-[#1e293b]">Seleccionar Partner...</option>
              {partners.map((v: any) => (
                <option key={v.id} value={v.id} className="bg-[#1e293b]">{v.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Producto Interesado</label>
            <div className="grid grid-cols-2 gap-2">
              {products.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={isBlocked}
                  onClick={() => setFormData({ ...formData, productId: p.id })}
                  className={cn(
                    "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                    formData.productId === p.id 
                      ? "bg-primary-500/10 border-primary-500 text-primary-400" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || isBlocked || !formData.productId}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold font-heading transition-all shadow-lg shadow-primary-500/25 mt-4"
          >
            {loading ? "Registrando..." : "Confirmar Registro"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
