"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Filter
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { CommissionsAPI } from "@/lib/api"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

export default function CommissionsPage() {
  const { isAdmin, partnerData, loading: userLoading } = useCurrentUser()
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      const { data } = await CommissionsAPI.getAll()
      setCommissions(data)
    } catch (error) {
      console.error("Failed to fetch commissions", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommissions = commissions.filter(comm => {
    if (isAdmin) return true;
    if (!partnerData) return false;
    
    const visibleIds = [partnerData.id];
    if (partnerData.parentPartnerId) {
      visibleIds.push(partnerData.parentPartnerId);
    }
    if (partnerData.subPartners) {
      visibleIds.push(...partnerData.subPartners.map((sub: any) => sub.id));
    }
    
    return visibleIds.includes(comm.partnerId || comm.partner?.id);
  });

  const totals = filteredCommissions.reduce((acc, curr) => {
    if (curr.status === 'PAID') acc.paid += curr.amount
    else acc.pending += curr.amount
    return acc
  }, { paid: 0, pending: 0 })

  const typeMap: any = {
    DIRECT: 'DIRECTA',
    OVERRIDE: 'SOBRECOMISIÓN'
  }

  const statusMap: any = {
    PENDING: 'PENDIENTE',
    PAID: 'PAGADA',
    APPROVED: 'APROBADA'
  }

  if (userLoading) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">
            Comisiones
          </h1>
          <p className="text-white/50">
            Rastree sus ganancias y pagos en toda la red.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">
            <Filter className="w-5 h-5" />
            Filtrar
          </button>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 text-sm">
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-24 h-24" />
          </div>
          <p className="text-white/40 text-sm font-medium mb-1">Total Pendiente</p>
          <p className="text-4xl font-black text-amber-400 mb-2">{formatCurrency(totals.pending)}</p>
          <p className="text-xs text-white/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente de aprobación o pago
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <p className="text-white/40 text-sm font-medium mb-1">Total Pagado</p>
          <p className="text-4xl font-black text-emerald-400 mb-2">{formatCurrency(totals.paid)}</p>
          <p className="text-xs text-white/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Transferido con éxito
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h2 className="font-bold text-lg text-white">Historial de Transacciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase font-bold text-white/30 border-b border-white/5">
                <th className="px-8 py-4">Partner</th>
                <th className="px-8 py-4">Negocio</th>
                <th className="px-8 py-4 text-center">Tipo</th>
                <th className="px-8 py-4 text-right">Tasa</th>
                <th className="px-8 py-4 text-right">Monto</th>
                <th className="px-8 py-4 text-center">Estado</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredCommissions.map((comm) => (
                <tr key={comm.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {comm.partner.name[0]}
                      </div>
                      <span className="text-sm font-medium">{comm.partner.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs text-white/50">{comm.deal.title}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full",
                      comm.type === 'DIRECT' ? "bg-primary-500/10 text-primary-400" : "bg-accent-purple/10 text-accent-purple"
                    )}>
                      {typeMap[comm.type] || comm.type}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right text-xs font-mono text-white/40">
                    {comm.percentage}%
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">
                      {formatCurrency(comm.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                      comm.status === 'PAID' ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                    )}>
                      {comm.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {statusMap[comm.status] || comm.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 rounded-xl hover:bg-white/10 text-white/20 hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommissions.length === 0 && !loading && (
          <div className="text-center py-20">
            <DollarSign className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No hay comisiones registradas aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
