'use client';

import React, { useEffect, useState } from 'react';

interface ItemData {
  id: string; // UUID
  name: string;
  status: 'Available' | 'Not available' | 'Reserved' | 'Rented';
}

interface Reservation {
  id: string; // UUID
  start_date?: string;
  end_date?: string;
  items: string[]; // Array of item UUIDs
  status: 'reserved' | 'rented' | 'returned';
}

interface ReservationProps {
  reservation: Reservation;
  onRent: (reservationId: string) => void;
  onReturn: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const ReservationCard: React.FC<ReservationProps> = ({
                                                       reservation,
                                                       onRent,
                                                       onReturn,
                                                       onCancel,
                                                     }) => {
  const [fetchedItems, setFetchedItems] = useState<ItemData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsData: ItemData[] = await Promise.all(
          reservation.items.map(async (itemId) => {
            const response = await fetch(`http://127.0.0.1:8081/api/v1/items/${itemId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch item with ID: ${itemId}`);
            }

            const item = await response.json();

            // Update item status to "Rented" if it belongs to the user's reservation and is "Not available"
            return item.status === 'Not available' && reservation.status === 'rented'
              ? { ...item, status: 'Rented' }
              : item;
          })
        );

        setFetchedItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchItems();
  }, [JSON.stringify(reservation.items), reservation.status]);

  return (
    <li className="mb-4 p-4 border rounded shadow">
      <h2 className="text-sm text-gray-500 font-semibold">{reservation.id}</h2>
      <p>
        From: {formatDate(reservation.start_date)} To: {formatDate(reservation.end_date)}
      </p>
      <p>Status: {reservation.status}</p>
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="mt-2">
        {fetchedItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span>{item.name}</span>
            <span
              className={`text-sm font-semibold ${
                item.status === 'Rented' ? 'text-green-500' : 'text-orange-500'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
      {reservation.status === 'reserved' && (
        <button
          onClick={() => onRent(reservation.id)}
          className="mr-2 mt-1 px-4 py-2 bg-green-500 text-white rounded mb-2"
        >
          Rent
        </button>
      )}
      {reservation.status === 'rented' && (
        <button
          onClick={() => onReturn(reservation.id)}
          className="mr-2 mt-1 px-4 py-2 bg-yellow-500 text-white rounded mb-2"
        >
          Return
        </button>
      )}
      <button
        onClick={() => onCancel(reservation.id)}
        className={`mt-1 px-4 py-2 rounded mb-2 ${reservation.status === 'rented' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white'}`}
        disabled={reservation.status === 'rented'}
      >
        Cancel
      </button>
    </li>
  );
};

export default ReservationCard;