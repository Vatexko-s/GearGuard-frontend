'use client';

import React, { useEffect, useState } from 'react';
import CategoryCard from '@/app/components/categoryCard';
import Link from 'next/link';
import { useToast } from '@/app/contexts/ToastService';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'react-feather';
import { Icon } from '@iconify/react';

const Dashboard = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const toast = useToast();
  const { token } = useAuth();
  const router = useRouter();

  const categoryIcons: Record<string, JSX.Element> = {
    microphones: <Icon icon='lucide:mic' width='64' height='64' />,
    cables: <Icon icon='lucide:cable' width='64' height='64' />,
    accessories: <Icon icon='lucide:box' width='64' height='64' />,
    speakers: <Icon icon='lucide:speaker' width='64' height='64' />,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8081/api/v1/items/category', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: string[] = await response.json(); // Expecting an array of category names
        setCategories(data);
      } catch (err) {
        if (err instanceof Error) {
          handleError(err.message);
        } else {
          handleError('An unknown error occurred');
        }
      }
    };

    fetchCategories();
  }, [router, token]);

  const handleError = (message: string) => {
    console.error(`Error: ${message}`); // Logs the error message
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

  return (
      <div className="flex flex-wrap gap-4 justify-evenly">
        {categories.map((category) => (
            <Link key={category} href={`/dashboard/${category.toLowerCase()}`}>
              <CategoryCard
                  CategoryName={category}
                  Icon={categoryIcons[category] || <Icon icon='lucide:cog' width='64' height='64' />} // Default icon if category is not mapped
              />
            </Link>
        ))}
      </div>
  );
};

export default Dashboard;