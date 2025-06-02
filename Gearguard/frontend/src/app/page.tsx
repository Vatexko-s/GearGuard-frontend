'use client'

import React from 'react'
import Link from 'next/link'
import { useToast } from '@/app/contexts/ToastService'
import { AlertCircle, CheckCircle } from 'react-feather'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

export default function Home() {
  const toast = useToast() //This needed for the toast notification
  // Red Toast Notification
  const handleError = () => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-red-300 p-4 rounded-lg shadow-lg'>
          <AlertCircle size={40} />
          <div>
            <h3 className='font-bold'>Action Failed</h3>
            <p className='text-sm'>Please try again later</p>
          </div>
        </div>
      )
    }
  }
  // Green Toast Notification
  const handleSuccess = () => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-green-300 p-4 rounded-lg shadow-lg'>
          <CheckCircle size={40} />
          <div>
            <h3 className='font-bold'>Action Succeed</h3>
            <p className='text-sm'>Action went great</p>
          </div>
        </div>
      )
    }
  }
  // Blue Toast Notification
  const handleNotification = () => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-blue-300 p-4 rounded-lg shadow-lg'>
          <QuestionMarkCircleIcon />
          <div>
            <h3 className='font-bold'>Atention Needed</h3>
            <p className='text-sm'>There may be issuet</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Link href={'/login'}>
        <button
          onClick={handleError}
          className='px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50'
        >
          Login
        </button>
      </Link>
    </div>
  )
}
