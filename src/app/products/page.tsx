"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Plus, Tag, CheckCircle2, X } from "lucide-react"
import { ProductsAPI } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

export default function ProductsPage() {
  const { isAdmin, loading: userLoading } = useCurrentUser()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await ProductsAPI.getAll()
      setProducts(res.data)
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">
            Catálogo de Productos
          </h1>
          <p className="text-white/50">
            Defina y gestione los productos en su red de socios.
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25">
            <Plus className="w-5 h-5" />
            Añadir Producto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-card p-8 rounded-3xl glass-card-hover group h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                <Package className="w-8 h-8" />
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-widest px-2 py-1 rounded-full",
                product.isActive ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400"
              )}>
                {product.isActive ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors uppercase tracking-tight">
              {product.name}
            </h3>
            <p className="text-white/40 text-sm mb-6 flex-1">
              {product.description || 'No hay descripción disponible para este producto.'}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-white/50">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-bold font-mono text-white/70">{product.code}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Disponible
              </div>
            </div>
          </div>
        ))}

        {loading && (
          [1, 2, 3].map(i => (
            <div key={i} className="h-[300px] glass-card rounded-3xl animate-pulse" />
          ))
        )}

        {products.length === 0 && !loading && (
          <div className="col-span-full py-20 glass-card rounded-3xl text-center">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 italic">No hay productos registrados en la red.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddProductModal onClose={() => setIsModalOpen(false)} onSuccess={() => {
            setIsModalOpen(false)
            fetchProducts()
          }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddProductModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ProductsAPI.create(formData)
      onSuccess()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear producto')
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
            <h2 className="text-2xl font-bold text-white">Crear Producto</h2>
            <p className="text-white/40 text-xs mt-1">Registre un nuevo producto para la red.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Nombre del Producto</label>
            <input 
              required
              type="text"
              placeholder="Ej. Software de Ventas"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Código</label>
            <input 
              required
              type="text"
              placeholder="Ej. KX-CRM-01"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Descripción</label>
            <textarea 
              rows={4}
              placeholder="Descripción opcional"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-500 bg-white/5 border-white/10 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-white/70">Activo</label>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 mt-2"
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
