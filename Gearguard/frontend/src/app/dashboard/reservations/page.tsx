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

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    name: '',
    from: '',
    to: '',
    items: [],
    status: 'reserved',
  })
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    fetch('/samples/reservationsSample.json')
      .then(response => response.json())
      .then(data => setReservations(data))
  }, [])

  const handleRentItem = (reservationId: number) => {
    const currentDate = new Date()
    setReservations(prevReservations =>
      prevReservations.map(reservation => {
        const fromDate = new Date(reservation.from)
        const toDate = new Date(reservation.to)
        if (reservation.id === reservationId && currentDate >= fromDate && currentDate <= toDate) {
          return { ...reservation, status: 'rented' }
        }
        return reservation
      })
    )
  }

  const handleReturnItem = (reservationId: number) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation =>
        reservation.id === reservationId ? { ...reservation, status: 'returned' } : reservation
      )
    )
  }

  const handleCancelReservation = (reservationId: number) => {
    setReservations(prevReservations =>
      prevReservations.filter(reservation => reservation.id !== reservationId)
    )
  }

  const handleCreateReservation = () => {
    const fromDate = new Date(newReservation.from!)
    const toDate = new Date(newReservation.to!)
    const currentDate = new Date()

    if (fromDate > toDate) {
      handleError('The start date cannot be later than the end date.')
      return
    }

    if (fromDate < currentDate) {
      handleError('The reservation cannot start in the past.')
      return
    }

    setReservations(prevReservations => [
      ...prevReservations,
      { ...newReservation, id: prevReservations.length + 1 } as Reservation,
    ])
    setNewReservation({ name: '', from: '', to: '', items: [], status: 'reserved' })
    setError(null)
    handleSuccess()
  }

  const handleError = (message: string) => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-red-400 p-4 rounded-lg shadow-lg'>
          <AlertCircle size={40} />
          <div>
            <h3 className='font-bold'>Action Failed</h3>
            <p className='text-sm'>{message}</p>
          </div>
        </div>
      )
    }
  }

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

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Reservations</h1>
      <div className='mb-4 p-4 border rounded shadow'>
        <h2 className='text-xl font-semibold'>Create New Reservation</h2>
        {error && <p className='text-red-500'>{error}</p>}
        <input
          type='text'
          placeholder='Name'
          value={newReservation.name}
          onChange={e => setNewReservation({ ...newReservation, name: e.target.value })}
          className='block w-full mb-2 p-2 border rounded'
        />
        <input
          type='date'
          placeholder='From'
          value={newReservation.from}
          onChange={e => setNewReservation({ ...newReservation, from: e.target.value })}
          className='block w-full mb-2 p-2 border rounded'
        />
        <input
          type='date'
          placeholder='To'
          value={newReservation.to}
          onChange={e => setNewReservation({ ...newReservation, to: e.target.value })}
          className='block w-full mb-2 p-2 border rounded'
        />
        <button
          onClick={handleCreateReservation}
          className='mt-2 px-4 py-2 bg-blue-500 text-white rounded mb-2'
        >
          Create Reservation
        </button>
      </div>
      <ul>
        {reservations
          .filter(reservation => reservation.status !== 'returned')
          .map(reservation => (
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
              {reservation.status === 'reserved' && (
                <button
                  onClick={() => handleRentItem(reservation.id)}
                  className='mr-2 mt-1 px-4 py-2 bg-green-500 text-white rounded mb-2'
                >
                  Rent
                </button>
              )}
              {reservation.status === 'rented' && (
                <button
                  onClick={() => handleReturnItem(reservation.id)}
                  className='mr-2 mt-1 px-4 py-2 bg-yellow-500 text-white rounded mb-2'
                >
                  Return
                </button>
              )}
              <button
                onClick={() => handleCancelReservation(reservation.id)}
                className='mt-1 px-4 py-2 bg-red-500 text-white rounded mb-2'
              >
                Cancel
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Reservations
