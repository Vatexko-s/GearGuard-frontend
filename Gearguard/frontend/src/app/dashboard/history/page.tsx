'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface HistoryItem {
  id: string; // UUID
  category: string;
  name: string;
  description: string;
}

interface HistoryReservation {
  id: string; // UUID
  start_date?: string;
  end_date?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const HistoryCard: React.FC<{ reservation: HistoryReservation }> = ({ reservation }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

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
          throw new Error(`Failed to fetch items for reservation ${reservation.id}`);
        }

        const data: HistoryItem[] = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchItems();
  }, [reservation.id, token]);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <li className="mb-4 p-4 border rounded shadow">
      <h2 className="text-sm text-gray-500 font-semibold">{reservation.id}</h2>
      <p>
        From: {formatDate(reservation.start_date)} To: {formatDate(reservation.end_date)}
      </p>
      {error && <p className="text-red-500 font-semibold">{error}</p>}
      <div className="mt-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-lg font-semibold">{category}</h3>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </li>
  );
};

const History: React.FC = () => {
  const [reservations, setReservations] = useState<HistoryReservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8081/api/v1/reservations/history', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.status}`);
        }

        const data: HistoryReservation[] = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {error && <p className="text-red-500 font-semibold">{error}</p>}
      <ul>
        {reservations.map((reservation) => (
          <HistoryCard key={reservation.id} reservation={reservation} />
        ))}
      </ul>
    </div>
  );
};

export default History;