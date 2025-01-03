'use client'

import { createContext, useContext } from 'react'

interface ToastContextType {
  open: (comment: React.ReactNode, timeout?: number) => void
  close: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)
export const useToast = () => useContext(ToastContext)
export default ToastContext
