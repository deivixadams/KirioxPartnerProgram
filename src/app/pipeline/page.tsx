"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MoreVertical, 
  Plus, 
  ChevronRight, 
  CreditCard,
  Building,
  User
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { DealsAPI } from "@/lib/api"
import { useCurrentUser } from "@/lib/hooks/useCurrentUser"

const STAGES = [
  'PROSPECT',
  'CONTACTED',
  'NEGOTIATION',
  'WON',
  'LOST'
]

const STAGE_LABELS: any = {
  PROSPECT: 'PROSPECTO',
  CONTACTED: 'CONTACTADO',
  NEGOTIATION: 'NEGOCIACIÓN',
  WON: 'GANADO',
  LOST: 'PERDIDO',
}

const STAGE_COLORS: any = {
  PROSPECT: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  CONTACTED: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
  NEGOTIATION: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  WON: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  LOST: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
}

export default function PipelinePage() {
  const { isAdmin, partnerId, loading: userLoading } = useCurrentUser()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const { data } = await DealsAPI.getAll()
      setDeals(data)
    } catch (error) {
      console.error("Failed to fetch deals", error)
    } finally {
      setLoading(false)
    }
  }

  const updateDealStage = async (dealId: string, newStage: string) => {
    try {
      await DealsAPI.updateStage(dealId, newStage, 'current-user-id') // Mocked user ID
      fetchDeals()
    } catch (error) {
      console.error("Failed to update deal stage", error)
    }
  }

  const filteredDeals = deals.filter(deal => {
    if (isAdmin) return true;
    return deal.partnerId === partnerId;
  });

  if (userLoading) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-glow">
            Pipeline de Ventas
          </h1>
          <p className="text-white/50">
            Rastree y gestione sus negocios a través del embudo de ventas.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25">
          <Plus className="w-5 h-5" />
          Nuevo Negocio
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-1 min-w-[320px] flex flex-col gap-4">
            <div className={cn(
              "flex items-center justify-between px-4 py-2 rounded-xl border",
              STAGE_COLORS[stage]
            )}>
              <span className="text-xs font-black tracking-widest uppercase">{STAGE_LABELS[stage]}</span>
              <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full">
                {filteredDeals.filter(d => d.stage === stage).length}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredDeals
                  .filter((deal) => deal.stage === stage)
                  .map((deal) => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onMove={(newStage) => updateDealStage(deal.id, newStage)} 
                    />
                  ))}
              </AnimatePresence>
              
              {filteredDeals.filter(d => d.stage === stage).length === 0 && (
                <div className="border border-dashed border-white/5 rounded-2xl h-32 flex items-center justify-center text-white/20 text-sm italic">
                  Sin negocios en esta etapa
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DealCard({ deal, onMove }: { deal: any, onMove: (s: string) => void }) {
  const nextStage = STAGES[STAGES.indexOf(deal.stage) + 1]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="glass-card p-5 rounded-2xl glass-card-hover cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight text-sm">
          {deal.title}
        </h3>
        <button className="text-white/30 hover:text-white transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Building className="w-3.5 h-3.5" />
          <span>{deal.client.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <User className="w-3.5 h-3.5" />
          <span>{deal.partner.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <CreditCard className="w-3.5 h-3.5" />
          <span>{deal.product.name}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-lg font-black text-white/90">
          {formatCurrency(deal.amount)}
        </span>
        
        {nextStage && (
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onMove(nextStage)
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-primary-500/20 hover:text-primary-400 transition-all text-white/30 group/btn"
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity uppercase">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>
    </motion.div>
  )
}
