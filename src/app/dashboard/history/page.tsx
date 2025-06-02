'use client'

import React, { useState, useEffect } from 'react'
import { useToast } from '@/app/contexts/ToastService'
import { AlertCircle, CheckCircle } from 'react-feather'

interface Item {
  id: number
  name: string
  available: boolean
}

interface Reservation {
  id: number
  name: string
  from: string
  to: string
  items: Item[]
  status: 'reserved' | 'rented' | 'returned'
}

const History: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const toast = useToast()

  useEffect(() => {
    fetch('/samples/reservationsSample.json')
      .then(response => response.json())
      .then(data =>
        setReservations(
          data.filter((reservation: Reservation) => reservation.status === 'returned')
        )
      )
  }, [])

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>History</h1>
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.id} className='mb-4 p-4 border rounded shadow'>
            <h2 className='text-xl font-semibold'>{reservation.name}</h2>
            <p>
              From: {reservation.from} To: {reservation.to}
            </p>
            <p>Status: {reservation.status}</p>
            <ul className='list-disc pl-5'>
              {reservation.items.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <button onClick={() => {}} className='m-2 px-4 py-2 bg-blue-500 text-white rounded'>
              Copy Reservation
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default History
