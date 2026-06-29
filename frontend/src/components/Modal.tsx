import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose } from 'react-icons/md'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#14110c] border border-[rgba(212,165,60,0.14)] shadow-2xl overflow-hidden"
        >
          {/* Gold accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4a53c] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#2a2419]">
            <h3
              className="text-[#f3efe7] font-bold text-base tracking-[.06em]"
              style={{ fontFamily: 'Mulish, sans-serif' }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-[#857e71] hover:text-[#d4a53c] p-1.5 hover:bg-[rgba(212,165,60,0.08)] transition-all"
            >
              <MdClose className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
