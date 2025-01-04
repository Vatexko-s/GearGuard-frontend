'use client'

import React, { useState } from 'react'
import ToastContext from '@/app/contexts/ToastService'
import { X } from 'react-feather'

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; comment: React.ReactNode }[]>([])

  const open = (comment: React.ReactNode, timeout = 5000) => {
    const id = Date.now()
    setToasts(toasts => [...toasts, { id, comment }])

    setTimeout(() => close(id), timeout)
  }

  const close = (id: number) => setToasts(toasts => toasts.filter(toast => toast.id !== id))

  return (
    <ToastContext.Provider value={{ open, close }}>
      {children}
      <div className='space-y-2 absolute bottom-4 right-4'>
        {toasts.map(({ id, comment }) => (
          <div key={id} className='relative'>
            <button
              className='absolute top-2 right-2 p-1 rounded-lg bg-gray-200/20 text-grey-800/60'
              onClick={() => close(id)}
            >
              <X size={16} />
            </button>
            {comment}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
