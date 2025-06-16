'use client';

import React, { useState, useEffect } from 'react';
import ReservationCard from '@/app/components/reservationCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/app/contexts/ToastService';
import { AlertCircle, CheckCircle } from 'react-feather';

interface Reservation {
  id: string; // UUID
  start_date?: string;
  end_date?: string;
  items: string[]; // Array of item UUIDs
  status: 'reserved' | 'rented' | 'returned';
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { token } = useAuth();
  const toast = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8081/api/v1/reservations', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations: ${response.status}`);
        }

        const data: Reservation[] = await response.json();
        setReservations(data);
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    if (token) {
      fetchReservations();
    }
  }, [token]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8081/api/v1/reservations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create reservation: ${response.status}`);
      }

      const newReservation: Reservation = await response.json();
      setReservations((prevReservations) => [newReservation, ...prevReservations]);
      handleSuccess('Reservation created successfully');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8081/api/v1/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel reservation: ${response.status}`);
      }

      setReservations((prevReservations) =>
        prevReservations.filter((reservation) => reservation.id !== reservationId)
      );
      handleSuccess('Reservation canceled successfully');
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleRentReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8081/api/v1/reservations/${reservationId}/rent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to rent reservation: ${response.status}`);
      }

      const data = await response.json();
      handleSuccess(data.message);

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, status: 'rented' } : reservation
        )
      );
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleError = (message: string) => {
    if (toast) {
      toast.open(
        <div className="flex gap-2 bg-red-400 p-4 rounded-lg shadow-lg">
          <AlertCircle size={40} />
          <div>
            <h3 className="font-bold">Action Failed</h3>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      );
    }
  };

  const handleSuccess = (message: string) => {
    if (toast) {
      toast.open(
        <div className="flex gap-2 bg-green-300 p-4 rounded-lg shadow-lg">
          <CheckCircle size={40} />
          <div>
            <h3 className="font-bold">Action Succeed</h3>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservations</h1>

      {/* Form for creating reservations */}
      <form onSubmit={handleCreateReservation} className="mb-4 p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Create Reservation</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="start_date">
            Start Date
          </label>
          <input
            type="datetime-local"
            id="start_date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="end_date">
            End Date
          </label>
          <input
            type="datetime-local"
            id="end_date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Reservation
        </button>
      </form>

      {/* List of reservations */}
      <ul>
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onRent={handleRentReservation}
            onReturn={() => {}}
            onCancel={handleCancelReservation}
          />
        ))}
      </ul>
    </div>
  );
};

export default Reservations;