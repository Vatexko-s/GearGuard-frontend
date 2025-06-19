'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';

interface ItemData {
  id: string; // UUID
  category: string;
  name: string;
  description: string;
  status: 'Available' | 'Not Available' | 'Reserved' | 'Rented';
}

interface Reservation {
  id: string; // UUID
  start_date?: string;
  end_date?: string;
  status: 'Reserved' | 'Rented' | 'Returned';
}

interface ReservationProps {
  reservation: Reservation;
  onRent: (reservationId: string) => void;
  onReturn: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
  onSelect: (reservationId: string) => void;
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
                                                       onSelect,
                                                     }) => {
  const { token } = useAuth();
  const [fetchedItems, setFetchedItems] = useState<ItemData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8081/api/v1/reservations/${reservation.id}/items`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`No items found for the reservation`);
        }

        const itemsData: ItemData[] = await response.json();
        if (itemsData.length === 0) {
          setError('No items found for this reservation.');
        } else {
          setFetchedItems(itemsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchItems();
  }, [reservation.id, token]);

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8081/api/v1/reservations/${reservation.id}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete the item.');
      }

      setFetchedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const groupedItems = fetchedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ItemData[]>);

  return (
    <li className="mb-4 p-4 border rounded shadow">
      <h2 className="text-sm text-gray-500 font-semibold">{reservation.id}</h2>
      <p>
        From: {formatDate(reservation.start_date)} To: {formatDate(reservation.end_date)}
      </p>
      <p>Status: {reservation.status}</p>
      {error && <p className="text-red-500 font-semibold">{error}</p>}
      <div className="mt-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-lg font-semibold">{category}</h3>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span>{item.name}</span>
                <span
                  className={`text-sm font-semibold ${
                    reservation.status === 'Rented' && item.status === 'Not Available'
                      ? 'text-green-500'
                      : item.status === 'Rented'
                        ? 'text-green-500'
                        : 'text-orange-500'
                  }`}
                >
                  {reservation.status === 'Rented' && item.status === 'Not Available'
                    ? 'Rented'
                    : item.status}
                </span>
                {reservation.status !== 'Rented' && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon icon="lucide:trash-2" width="20" height="20" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {reservation.status === 'Reserved' && (
          <button
            onClick={() => onRent(reservation.id)}
            className="px-4 py-2 w-32 bg-green-500 text-white rounded flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:check-circle" width="20" height="20" />
            Rent
          </button>
        )}
        {reservation.status === 'Rented' && (
          <button
            onClick={() => onReturn(reservation.id)}
            className="px-4 py-2 w-32 bg-yellow-500 text-white rounded flex items-center justify-center gap-2"
          >
            <Icon icon="lucide:undo-2" width="20" height="20" />
            Return
          </button>
        )}
        <button
          onClick={() => onCancel(reservation.id)}
          className={`px-4 py-2 w-32 rounded flex items-center justify-center gap-2 ${
            reservation.status === 'Rented' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white'
          }`}
          disabled={reservation.status === 'Rented'}
        >
          <Icon icon="lucide:circle-x" width="20" height="20" />
          Cancel
        </button>
        <button
          onClick={() => onSelect(reservation.id)}
          className={`px-4 py-2 w-32 rounded flex items-center justify-center gap-2 ${
            reservation.status === 'Rented' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'
          }`}
          disabled={reservation.status === 'Rented'}
        >
          <Icon icon="lucide:square-mouse-pointer" width="20" height="20" />
          Select
        </button>
      </div>
    </li>
  );
};

export default ReservationCard;