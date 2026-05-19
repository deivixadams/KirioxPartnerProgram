"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCircle, 
  TrendingUp, 
  DollarSign,
  Settings,
  Bell,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: 'Tablero', href: '/', icon: LayoutDashboard },
  { name: 'Vendedores', href: '/vendors', icon: Users },
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Clientes', href: '/clients', icon: UserCircle },
  { name: 'Pipeline de Ventas', href: '/pipeline', icon: TrendingUp },
  { name: 'Comisiones', href: '/commissions', icon: DollarSign },
]

interface SidebarProps {
  isExpanded: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function Sidebar({ isExpanded, onMouseEnter, onMouseLeave }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])

  async function handleLogout() {
    await signOut({ callbackUrl: '/login' })
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        setNotifications(data)
      } catch (err) {
        console.error("Failed to fetch notifications")
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Poll every min
    return () => clearInterval(interval)
  }, [])

  const hasAlerts = notifications.length > 0

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isExpanded ? 280 : 80,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-0 top-0 h-full glass-card border-r border-l-0 rounded-none flex flex-col p-4 m-0 z-50 overflow-hidden"
    >
      <div className="flex items-center gap-4 mb-10 px-2 h-10">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-purple flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">
          K
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 whitespace-nowrap"
            >
              KIRIOX
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 h-12 rounded-xl transition-all duration-300 relative group",
                isActive 
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" 
                  : "text-white/50 hover:text-white hover:bg-white/5",
                isExpanded ? "px-4" : "justify-center px-0"
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className={cn(
                    "bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
                    isExpanded 
                      ? "ml-auto w-1.5 h-1.5 rounded-full" 
                      : "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  )}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 space-y-4 px-1">
        <Link 
          href="/profile"
          className={cn(
            "flex items-center gap-4 h-12 rounded-xl transition-all duration-300 group",
            pathname === '/profile' ? "text-primary-400" : "text-white/50 hover:text-white",
            isExpanded ? "px-3" : "justify-center px-0"
          )}
        >
          <div className="relative">
            <Settings className="w-6 h-6 flex-shrink-0" />
            {hasAlerts && !isExpanded && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 shadow-lg" />
            )}
          </div>
          {isExpanded && <span className="text-sm font-medium">Configuración</span>}
          {hasAlerts && isExpanded && (
            <div className="ml-auto flex items-center gap-1.5 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
              <Bell className="w-3 h-3" />
              {notifications.length}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-4 h-12">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
             <UserCircle className="w-7 h-7 text-white/70" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold whitespace-nowrap text-white">Administrador</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Sesión Activa</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 h-10 w-full rounded-xl transition-all duration-300 group text-white/30 hover:text-red-400 hover:bg-red-500/5",
            isExpanded ? "px-3" : "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Cerrar Sesión
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  )
}
