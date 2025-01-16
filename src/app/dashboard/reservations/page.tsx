'use client'

import React, { useState } from 'react'

interface Item {
  id: number
  name: string
  available: boolean
}

interface Reservation {
  id: number
  itemId: number
  userId: number
  startDate: string
  endDate: string
  status: 'reserved' | 'lent' | 'returned'
}

const Reservations: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Item 1', available: true },
    { id: 2, name: 'Item 2', available: true },
    // Add more items as needed
  ])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleAddReservation = () => {
    if (selectedItem && startDate && endDate) {
      const newReservation: Reservation = {
        id: reservations.length + 1,
        itemId: selectedItem,
        userId: 1, // Replace with actual user ID
        startDate,
        endDate,
        status: 'reserved',
      }
      setReservations([...reservations, newReservation])
      setSelectedItem(null)
      setStartDate('')
      setEndDate('')
    }
  }

  const handleLendItem = (reservationId: number) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation =>
        reservation.id === reservationId ? { ...reservation, status: 'lent' } : reservation
      )
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

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Reservations</h1>
      <div className='mb-4'>
        <select
          value={selectedItem || ''}
          onChange={e => setSelectedItem(Number(e.target.value))}
          className='border p-2 mr-2'
        >
          <option value='' disabled>
            Select Item
          </option>
          {items.map(item => (
            <option key={item.id} value={item.id} disabled={!item.available}>
              {item.name} {item.available ? '' : '(Not Available)'}
            </option>
          ))}
        </select>
        <input
          type='date'
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className='border p-2 mr-2'
        />
        <input
          type='date'
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className='border p-2 mr-2'
        />
        <button onClick={handleAddReservation} className='px-4 py-2 bg-blue-500 text-white rounded'>
          Add Reservation
        </button>
      </div>
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.id} className='mb-2'>
            Item ID: {reservation.itemId} - From: {reservation.startDate} To: {reservation.endDate}{' '}
            - Status: {reservation.status}
            {reservation.status === 'reserved' && (
              <button
                onClick={() => handleLendItem(reservation.id)}
                className='ml-2 px-2 py-1 bg-green-500 text-white rounded'
              >
                Lend
              </button>
            )}
            {reservation.status === 'lent' && (
              <button
                onClick={() => handleReturnItem(reservation.id)}
                className='ml-2 px-2 py-1 bg-yellow-500 text-white rounded'
              >
                Return
              </button>
            )}
            <button
              onClick={() => handleCancelReservation(reservation.id)}
              className='ml-2 px-2 py-1 bg-red-500 text-white rounded'
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
