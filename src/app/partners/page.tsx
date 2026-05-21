"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  ShieldCheck,
  UserCheck,
  Package,
  X,
  Percent,
  Key,
  Edit3,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  UserMinus,
  Phone,
  User,
  TrendingUp,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PartnersAPI } from "@/lib/api"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Partner {
  id: string
  name: string
  phone?: string | null
  status: 'ACTIVE' | 'SUSPENDED' | 'RETIRED'
  level: number
  commissionPercentage: number
  parentPartnerId?: string | null
  parentPartner?: Partner | null
  subPartners?: Partner[]
  user?: { email: string } | null
  _count?: { clients: number; deals: number }
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const statusMap: Record<string, string> = {
  ACTIVE: 'ACTIVO',
  SUSPENDED: 'SUSPENDIDO',
  RETIRED: 'RETIRADO'
}

const statusColor: Record<string, string> = {
  ACTIVE: 'text-emerald-400',
  SUSPENDED: 'text-yellow-400',
  RETIRED: 'text-red-400'
}

const statusDot: Record<string, string> = {
  ACTIVE: 'bg-emerald-400',
  SUSPENDED: 'bg-yellow-400',
  RETIRED: 'bg-red-400'
}

// ─── Commission preview helper ─────────────────────────────────────────────────

function computeCommissionPreview(
  partner: Partner,
  newParentId: string,
  allPartners: Partner[]
): { partnerPct: number; oldParentMsg: string | null; newParentMsg: string | null } {
  const oldParentId = partner.parentPartnerId ?? ''
  const isChangingParent = newParentId !== oldParentId

  if (!isChangingParent) {
    return { partnerPct: partner.commissionPercentage, oldParentMsg: null, newParentMsg: null }
  }

  // Determine new partner commission
  const partnerPct = newParentId ? 30 : 50

  let oldParentMsg: string | null = null
  let newParentMsg: string | null = null

  // Old parent impact
  if (oldParentId) {
    const oldParent = allPartners.find(p => p.id === oldParentId)
    const otherSubCount = allPartners.filter(
      p => p.parentPartnerId === oldParentId && p.id !== partner.id
    ).length

    if (oldParent && otherSubCount === 0) {
      oldParentMsg = `${oldParent.name} perderá todos sus asociados → su comisión vuelve a 50%`
    }
  }

  // New parent impact
  if (newParentId) {
    const newParent = allPartners.find(p => p.id === newParentId)
    const currentSubCount = allPartners.filter(
      p => p.parentPartnerId === newParentId && p.id !== partner.id
    ).length

    if (newParent && currentSubCount === 0) {
      newParentMsg = `${newParent.name} pasará a ser Head Partner → su comisión cambia a 20%`
    }
  }

  return { partnerPct, oldParentMsg, newParentMsg }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const { isAdmin, partnerData, loading: userLoading } = useCurrentUser()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await PartnersAPI.getAll()
      setPartners(res.data)
    } catch (error) {
      console.error("Error fetching data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPartners = Array.isArray(partners) ? partners.filter(p => {
    if (!isAdmin) {
      // Logic for SOCIO
      if (!partnerData) return false
      
      const visibleIds = [partnerData.id]
      if (partnerData.parentPartnerId) {
        visibleIds.push(partnerData.parentPartnerId)
      }
      if (partnerData.subPartners && partnerData.subPartners.length > 0) {
        visibleIds.push(...partnerData.subPartners.map((sub: any) => sub.id))
      }
      
      if (!visibleIds.includes(p.id)) return false
    }

    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.user?.email?.toLowerCase().includes(search.toLowerCase())
  }) : []

  if (userLoading) return null;

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow text-white">
            Red de Partners
          </h1>
          <p className="text-white/50 font-medium">
            Gestione su jerarquía de ventas y distribución de comisiones globales.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25"
          >
            <Plus className="w-5 h-5" />
            Nuevo Partner
          </button>
        )}
      </div>

      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input 
          type="text"
          placeholder="Buscar por nombre o email de usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPartners.map((partner) => (
          <PartnerCard 
            key={partner.id} 
            partner={partner}
            onEdit={() => setEditingPartner(partner)}
            isAdmin={isAdmin}
          />
        ))}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 glass-card rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filteredPartners.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-lg">No se encontraron registros.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddPartnerModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={() => {
              setIsAddModalOpen(false)
              fetchData()
            }}
            parentPartners={partners.filter(p => p.level === 1)}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPartner && (
          <EditPartnerModal
            partner={editingPartner}
            allPartners={partners}
            onClose={() => setEditingPartner(null)}
            onSuccess={() => {
              setEditingPartner(null)
              fetchData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Partner Card ─────────────────────────────────────────────────────────────

function PartnerCard({ partner, onEdit, isAdmin }: { partner: Partner; onEdit: () => void; isAdmin: boolean }) {
  const [showChildren, setShowChildren] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isParent = Array.isArray(partner.subPartners) && partner.subPartners.length > 0

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="glass-card p-6 rounded-3xl glass-card-hover flex flex-col gap-4 group">
      <div className="flex items-center gap-6 w-full">
        {/* Avatar */}
        <div className="relative">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border transition-all group-hover:scale-105",
            partner.level === 1 
              ? "bg-primary-500/20 border-primary-500/30 text-primary-400" 
              : "bg-accent-purple/20 border-accent-purple/30 text-accent-purple"
          )}>
            {partner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg",
            partner.level === 1 ? "bg-primary-500" : "bg-accent-purple"
          )}>
            {partner.level === 1 ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <UserCheck className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-primary-400">{partner.name}</h3>
            <span className={cn(
              "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border",
              partner.level === 1 
                ? "bg-primary-500/10 border-primary-500/10 text-primary-400" 
                : "bg-accent-purple/10 border-accent-purple/10 text-accent-purple"
            )}>
              Nivel {partner.level}
            </span>
            {isParent && (
              <span className="text-[10px] ml-2 uppercase font-black tracking-widest px-2 py-0.5 rounded-full border bg-yellow-500/10 border-yellow-500/20 text-yellow-300">
                Head
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs font-medium">{partner.user?.email}</p>
          {partner.parentPartner && (
            <p className="text-white/30 text-[12px] mt-1">Canal padre: {partner.parentPartner.name}</p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-12 px-12 border-x border-white/5">
          <div className="text-center">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Comisión</p>
            <div className="flex items-center gap-1.5 justify-center">
              <Percent className="w-4 h-4 text-primary-400" />
              <span className="font-black text-2xl text-white">{partner.commissionPercentage}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Prospectos</p>
            <div className="flex items-center gap-1.5 justify-center">
              <Users className="w-4 h-4 text-white/50" />
              <span className="font-black text-2xl text-white">{partner._count?.clients || 0}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Estado</p>
            <span className={cn("font-bold text-sm flex items-center gap-1.5 justify-end", statusColor[partner.status])}>
              <div className={cn("w-1.5 h-1.5 rounded-full", statusDot[partner.status], partner.status === 'ACTIVE' && 'animate-pulse')} />
              {statusMap[partner.status] || partner.status}
            </span>
          </div>

          {isParent && (
            <button
              onClick={() => setShowChildren(!showChildren)}
              className="px-3 py-2 rounded-2xl hover:bg-white/5 transition-all text-white/30 hover:text-white flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-bold">{showChildren ? 'Ocultar' : 'Ver asociados'}</span>
            </button>
          )}

          {/* Context menu */}
          {isAdmin && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-3 rounded-2xl hover:bg-white/5 transition-all text-white/30 hover:text-white"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 z-50 min-w-[160px] glass-card border border-white/10 rounded-2xl py-2 shadow-2xl"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); onEdit() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-primary-400" />
                      Editar partner
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Sub-partners list */}
      {showChildren && isParent && (
        <div className="w-full mt-4 p-4 bg-white/3 rounded-xl border border-white/6">
          <h4 className="text-sm font-bold text-white mb-3">Partners asociados</h4>
          <div className="grid grid-cols-1 gap-2">
            {partner.subPartners!.map((sp) => (
              <div key={sp.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-white">{sp.name}</div>
                  <div className="text-white/40 text-xs">{sp.user?.email || ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/30 text-xs">Nivel {sp.level}</div>
                  <div className="text-white/50 text-xs font-bold">{sp.commissionPercentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Partner Modal ────────────────────────────────────────────────────────

function AddPartnerModal({ onClose, onSuccess, parentPartners }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    parentPartnerId: '',
    commissionPercentage: 50
  })
  const [loading, setLoading] = useState(false)

  const parent = parentPartners.find((p: any) => p.id === formData.parentPartnerId)
  const childCommission = parent ? 30 : 50

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await PartnersAPI.create(formData)
      onSuccess()
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear partner")
    } finally {
      setLoading(false)
    }
  }

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
          <div>
            <h2 className="text-2xl font-bold text-white">Configurar Nuevo Canal</h2>
            <p className="text-white/40 text-xs mt-1">Defina el acceso y la base de comisiones.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Nombre del Partner</label>
            <input 
              required
              type="text"
              placeholder="Ej. Patricia Reyes"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Email de Acceso</label>
              <input 
                required
                type="email"
                placeholder="patricia@kiriox.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Contraseña Inicial</label>
              <div className="relative">
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Jerarquía (Partner Padre)</label>
            <select 
              value={formData.parentPartnerId}
              onChange={e => setFormData({ ...formData, parentPartnerId: e.target.value, commissionPercentage: e.target.value ? 30 : 50 })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#1e293b]">Independiente (Nivel 1)</option>
              {parentPartners.map((p: any) => (
                <option key={p.id} value={p.id} className="bg-[#1e293b]">{p.name} ({p.commissionPercentage}%)</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5" /> Comisión Asignada
              </label>
              <span className="text-xs text-white/30">Asignado: {childCommission}%</span>
            </div>
            <div className="flex items-center gap-4">
               <input 
                type="range"
                min="0"
                max={childCommission}
                step="1"
                value={formData.commissionPercentage}
                disabled
                onChange={() => {}}
                className="flex-1 accent-primary-500"
              />
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white font-bold min-w-[4rem] text-center">
                {formData.commissionPercentage}%
              </div>
            </div>
            <p className="text-[10px] text-white/20 italic">
              {parent 
                ? `El padre (${parent.name}) recibirá 20% y este partner recibirá 30% de cada venta.`
                : "Este partner recibirá 50% de cada venta."}
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 mt-2"
          >
            {loading ? "Registrando..." : "Confirmar Registro"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Edit Partner Modal ───────────────────────────────────────────────────────

function EditPartnerModal({ partner, allPartners, onClose, onSuccess }: {
  partner: Partner
  allPartners: Partner[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: partner.name,
    phone: partner.phone ?? '',
    status: partner.status,
    parentPartnerId: partner.parentPartnerId ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Level-1 partners excluding self and own sub-partners (avoid cycles)
  const eligibleParents = allPartners.filter(p =>
    p.level === 1 &&
    p.id !== partner.id &&
    p.parentPartnerId !== partner.id
  )

  const preview = computeCommissionPreview(partner, formData.parentPartnerId, allPartners)

  const hasChanges =
    formData.name !== partner.name ||
    formData.phone !== (partner.phone ?? '') ||
    formData.status !== partner.status ||
    formData.parentPartnerId !== (partner.parentPartnerId ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await PartnersAPI.update(partner.id, {
        name: formData.name,
        phone: formData.phone || null,
        status: formData.status,
        parentPartnerId: formData.parentPartnerId || null,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar el partner")
    } finally {
      setLoading(false)
    }
  }

  const parentChanged = formData.parentPartnerId !== (partner.parentPartnerId ?? '')

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
        className="glass-card w-full max-w-2xl p-8 rounded-[2rem] relative z-[101] overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border",
                partner.level === 1
                  ? "bg-primary-500/20 border-primary-500/30 text-primary-400"
                  : "bg-accent-purple/20 border-accent-purple/30 text-accent-purple"
              )}>
                {partner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Partner</h2>
                <p className="text-white/40 text-xs mt-0.5">{partner.user?.email}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Nombre
              </label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Teléfono
              </label>
              <input 
                type="text"
                placeholder="+1 000 000 0000"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Estado del Canal</label>
            <div className="grid grid-cols-3 gap-3">
              {(['ACTIVE', 'SUSPENDED', 'RETIRED'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all font-bold text-xs uppercase tracking-wider",
                    formData.status === s
                      ? s === 'ACTIVE'
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : s === 'SUSPENDED'
                        ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                        : "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-white/3 border-white/8 text-white/30 hover:border-white/20"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", 
                    formData.status === s
                      ? s === 'ACTIVE' ? 'bg-emerald-400' : s === 'SUSPENDED' ? 'bg-yellow-400' : 'bg-red-400'
                      : 'bg-white/20'
                  )} />
                  {statusMap[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Parent assignment */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1 flex items-center gap-1.5">
              <GitBranch className="w-3 h-3" /> Jerarquía / Partner Padre
            </label>
            <div className="relative">
              <select
                value={formData.parentPartnerId}
                onChange={e => setFormData({ ...formData, parentPartnerId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
              >
                <option value="" className="bg-[#1e293b]">— Independiente (Nivel 1, sin padre) —</option>
                {eligibleParents.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#1e293b]">
                    {p.name} · {p.commissionPercentage}% comisión actual
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Commission Impact Preview */}
          {parentChanged && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 rounded-2xl border bg-white/3 border-white/8"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Impacto en Comisiones</span>
              </div>

              {/* Partner own commission */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/60">{partner.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/30 text-sm line-through">{partner.commissionPercentage}%</span>
                  <span className="font-black text-white text-sm">→ {preview.partnerPct}%</span>
                </div>
              </div>

              {/* Old parent impact */}
              {preview.oldParentMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-300/80">{preview.oldParentMsg}</p>
                </div>
              )}

              {/* New parent impact */}
              {preview.newParentMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-500/5 border border-primary-500/15">
                  <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-primary-300/80">{preview.newParentMsg}</p>
                </div>
              )}

              {/* Removing parent entirely */}
              {!formData.parentPartnerId && partner.parentPartnerId && !preview.oldParentMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5">
                  <UserMinus className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                  <p className="text-xs text-white/40">
                    Este partner pasará a ser independiente.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 font-bold transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading || !hasChanges}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
