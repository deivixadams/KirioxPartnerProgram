"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-lg rounded-3xl p-8 relative z-10 border-white/20 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-accent-purple" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
