"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  ShieldCheck,
  UserCheck,
  Package,
  ChevronDown,
  X,
  CreditCard,
  Percent,
  Key
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { VendorsAPI, ProductsAPI } from "@/lib/api"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const vRes = await VendorsAPI.getAll()
      setVendors(vRes.data)
    } catch (error) {
      console.error("Error fetching data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredVendors = Array.isArray(vendors) ? vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.email.toLowerCase().includes(search.toLowerCase())
  ) : []

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow text-white">
            Red de Vendedores
          </h1>
          <p className="text-white/50 font-medium">
            Gestione su jerarquía de ventas y distribución de comisiones globales.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" />
          Nuevo Vendedor
        </button>
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
        {filteredVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 glass-card rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filteredVendors.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-lg">No se encontraron registros.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddVendorModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false)
              fetchData()
            }}
            vendors={vendors.filter(v => v.level === 1)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddVendorModal({ onClose, onSuccess, vendors }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    parentVendorId: '',
    commissionPercentage: 50
  })
  const [loading, setLoading] = useState(false)

  const parent = vendors.find((v:any) => v.id === formData.parentVendorId)
  const childCommission = parent ? 30 : 50

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await VendorsAPI.create(formData)
      onSuccess()
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear vendedor")
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
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Nombre del Vendedor</label>
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
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Jerarquía (Vendedor Padre)</label>
            <select 
              value={formData.parentVendorId}
              onChange={e => setFormData({ ...formData, parentVendorId: e.target.value, commissionPercentage: e.target.value ? 30 : 50 })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none appearance-none"
            >
              <option value="" className="bg-[#1e293b]">Independiente (Nivel 1)</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.id} className="bg-[#1e293b]">{v.name} ({v.commissionPercentage}%)</option>
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
                ? `El padre (${parent.name}) recibirá 20% y este vendedor recibirá 30% de cada venta.`
                : "Este vendedor recibirá 50% de cada venta."}
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

function VendorCard({ vendor }: { vendor: any }) {
  const statusMap: any = {
    ACTIVE: 'ACTIVO',
    SUSPENDED: 'SUSPENDIDO',
    RETIRED: 'RETIRADO'
  }

  return (
    <div className="glass-card p-6 rounded-3xl glass-card-hover flex items-center gap-6 group">
      <div className="relative">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border transition-all group-hover:scale-105",
          vendor.level === 1 
            ? "bg-primary-500/20 border-primary-500/30 text-primary-400" 
            : "bg-accent-purple/20 border-accent-purple/30 text-accent-purple"
        )}>
          {vendor.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg",
          vendor.level === 1 ? "bg-primary-500" : "bg-accent-purple"
        )}>
          {vendor.level === 1 ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <UserCheck className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold text-white transition-colors group-hover:text-primary-400">{vendor.name}</h3>
          <span className={cn(
            "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border",
            vendor.level === 1 
              ? "bg-primary-500/10 border-primary-500/10 text-primary-400" 
              : "bg-accent-purple/10 border-accent-purple/10 text-accent-purple"
          )}>
            Nivel {vendor.level}
          </span>
        </div>
        <p className="text-white/40 text-xs font-medium">{vendor.user?.email}</p>
      </div>

      <div className="hidden lg:flex items-center gap-12 px-12 border-x border-white/5">
        <div className="text-center">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Comisión Global</p>
          <div className="flex items-center gap-1.5 justify-center">
            <Percent className="w-4 h-4 text-primary-400" />
            <span className="font-black text-2xl text-white">{vendor.commissionPercentage}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Prospectos</p>
          <div className="flex items-center gap-1.5 justify-center">
            <Users className="w-4 h-4 text-white/50" />
            <span className="font-black text-2xl text-white">{vendor._count?.clients || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Canal</p>
          <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5 justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {statusMap[vendor.status] || vendor.status}
          </span>
        </div>
        <button className="p-3 rounded-2xl hover:bg-white/5 transition-all text-white/30 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
