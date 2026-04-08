"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Tag, CheckCircle2 } from "lucide-react"
import { ProductsAPI } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ProductsAPI.getAll().then(res => {
      setProducts(res.data)
      setLoading(false)
    })
  }, [])

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
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25">
          <Plus className="w-5 h-5" />
          Añadir Producto
        </button>
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
    </div>
  )
}
