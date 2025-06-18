'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ItemCard from '../../components/itemCard';
import { useToast } from '@/app/contexts/ToastService';
import { AlertCircle } from 'react-feather';
import { useReservation } from '@/app/contexts/ReservationContext';

interface IItem {
  id: string; // UUID
  name: string;
  description: string;
  category: string;
  status: 'Available' | 'Not available' | 'Reserved';
  updated_at: string;
}

const Category = () => {
  const [items, setItems] = useState<IItem[]>([]);
  const toast = useToast();
  const pathname = usePathname();
  const category = pathname.split('/').pop();
  const { startDate, endDate } = useReservation();

  useEffect(() => {
    console.log('Category:', category);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (!category || !startDate || !endDate) {
      const missingParams = [];
      if (!category) missingParams.push('category');
      if (!startDate) missingParams.push('startDate');
      if (!endDate) missingParams.push('endDate');

      handleError(`Missing required parameters: ${missingParams.join(', ')}`);
      return;
    }

    const fetchItems = async () => {
      try {
        console.log('Sending request to API...');
        const response = await fetch(`http://127.0.0.1:8081/api/v1/items/category/${category}/availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: IItem[] = await response.json();
        console.log('API Response:', data);
        setItems(data);
      } catch (err) {
        console.error('Fetch error:', err);
        handleError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchItems();
  }, [category, startDate, endDate]);

  const handleError = (message: string) => {
    console.error(message);
    if (toast) {
      toast.open(
        <div className="flex gap-2 bg-red-400 p-4 rounded-lg shadow-lg">
          <AlertCircle size={40} />
          <div>
            <h3 className="font-bold">Error</h3>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">{category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            itemId={item.id}
            name={item.name}
            description={item.description}
            category={item.category}
            status={item.status}
            updatedAt={item.updated_at}
          />
        ))}
      </div>
    </div>
  );
};

export default Category;