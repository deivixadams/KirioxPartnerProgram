"use client"

import { useState, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sidebar } from "./Sidebar"

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login')
  const [isExpanded, setIsExpanded] = useState(false)

  // Auth pages use their own layout — no sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar 
        isExpanded={isExpanded} 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      />
      
      <motion.main 
        initial={false}
        animate={{ 
          paddingLeft: isExpanded ? 280 : 80 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 overflow-y-auto p-8 relative transition-all duration-300"
      >
        {/* Decorative backgrounds - Fixed in the background */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
