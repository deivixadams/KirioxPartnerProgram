"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Briefcase 
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { StatsAPI, DealsAPI, VendorsAPI } from "@/lib/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    vendorCount: 0,
    pendingCommissions: 0,
    openDeals: 0
  })
  const [recentDeals, setRecentDeals] = useState<any[]>([])
  const [topVendors, setTopVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      StatsAPI.getOverview(),
      DealsAPI.getAll(),
      VendorsAPI.getAll()
    ]).then(([statsRes, dealsRes, vendorsRes]) => {
      setStats(statsRes.data)
      setRecentDeals(dealsRes.data.slice(0, 3))
      // Sort vendors by products count or similar simple metric for now
      setTopVendors(vendorsRes.data.slice(0, 3))
      setLoading(false)
    }).catch(err => {
      console.error("Error loading dashboard data", err)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow text-white">
          Vista General
        </h1>
        <p className="text-white/50">
          Información en tiempo real sobre su red de ventas y comisiones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas Totales" 
          value={formatCurrency(stats.totalSales)} 
          change={loading ? "..." : "+100%"} // Simplificado
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
        <StatCard 
          title="Vendedores Activos" 
          value={stats.vendorCount} 
          change={loading ? "..." : "En red"} 
          icon={Users}
          color="purple"
          loading={loading}
        />
        <StatCard 
          title="Comisiones Pendientes" 
          value={formatCurrency(stats.pendingCommissions)} 
          change={loading ? "..." : "Por pagar"} 
          icon={TrendingUp}
          color="pink"
          loading={loading}
        />
        <StatCard 
          title="Negocios Abiertos" 
          value={stats.openDeals} 
          change={loading ? "..." : "Activos"} 
          icon={Briefcase}
          color="blue"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Negocios Recientes</h2>
            <a href="/pipeline" className="text-primary-400 text-sm font-medium hover:underline transition-all">
              Ver todo el pipeline
            </a>
          </div>
          
          <div className="space-y-6">
            {recentDeals.map((deal) => (
              <DealItem 
                key={deal.id}
                client={deal.client?.name || "Cliente"} 
                vendor={deal.vendor?.name || "Vendedor"} 
                product={deal.product?.name || "Producto"} 
                amount={deal.amount} 
                stage={deal.stage} 
              />
            ))}
            {recentDeals.length === 0 && !loading && (
              <p className="text-white/30 italic text-center py-4">No hay negocios registrados.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl h-full">
          <h2 className="text-xl font-bold mb-8 text-white">Vendedores Destacados</h2>
          <div className="space-y-6">
            {topVendors.map((vendor) => (
              <VendorRank 
                key={vendor.id}
                name={vendor.name} 
                level={vendor.level} 
                sales={vendor.deals?.filter((d: any) => d.stage === 'WON').reduce((acc: number, d: any) => acc + d.amount, 0) || 0} 
                commission={vendor.commissions?.reduce((acc: number, c: any) => acc + c.amount, 0) || 0} 
              />
            ))}
            {topVendors.length === 0 && !loading && (
              <p className="text-white/30 italic text-center py-4">No hay vendedores.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, color, loading }: any) {
  const colors: any = {
    blue: 'from-blue-500/20 to-primary-500/10 text-blue-400',
    purple: 'from-purple-500/20 to-accent-purple/10 text-accent-purple',
    pink: 'from-pink-500/20 to-accent-pink/10 text-accent-pink',
  }

  return (
    <div className="glass-card p-6 rounded-3xl glass-card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} border border-white/10`}>
          <Icon className="w-6 h-6" />
        </div>
        {!loading && (
          <div className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-white/40 text-sm font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold group-hover:text-glow transition-all text-white ${loading ? "animate-pulse" : ""}`}>
          {loading ? "---" : value}
        </p>
      </div>
    </div>
  )
}

function DealItem({ client, vendor, product, amount, stage }: any) {
  const stageMap: any = {
    WON: 'GANADO',
    NEGOCIATION: 'NEGOCIACIÓN',
    CONTACTED: 'CONTACTADO',
    PROSPECT: 'PROSPECTO',
    LOST: 'PERDIDO'
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/50">
        {client.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white/90">{client}</p>
        <p className="text-xs text-white/40">{vendor} • {product}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-white/90">{formatCurrency(amount)}</p>
        <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
          stage === 'WON' ? 'bg-emerald-400/20 text-emerald-400' : 
          stage === 'NEGOCIATION' ? 'bg-amber-400/20 text-amber-400' :
          'bg-blue-400/20 text-blue-400'
        }`}>
          {stageMap[stage] || stage}
        </p>
      </div>
    </div>
  )
}

function VendorRank({ name, level, sales, commission }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/50">
        {name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white/90 group-hover:text-primary-400 transition-colors">{name}</p>
        <p className="text-[10px] text-white/30 uppercase tracking-wider">Nivel {level}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-white/80">{formatCurrency(sales)}</p>
        <p className="text-[10px] text-white/40">+{formatCurrency(commission)}</p>
      </div>
    </div>
  )
}
