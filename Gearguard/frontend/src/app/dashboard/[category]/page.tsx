'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ItemCard from '../../components/itemCard'
import { useToast } from '@/app/contexts/ToastService'
import { AlertCircle } from 'react-feather'

interface IItem {
  id: string // Changed to UUID
  name: string
  description: string
  category: string
  status: 'available' | 'not available'
  updated_at: string
}

const Category = () => {
  const [items, setItems] = useState<IItem[]>([])
  const toast = useToast()
  const pathname = usePathname()
  const category = pathname.split('/').pop()

  useEffect(() => {
    if (!category) return

    const fetchItems = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8081/api/v1/items/category/${category}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: IItem[] = await response.json()
        setItems(data)
      } catch (err) {
        if (err instanceof Error) {
          handleError(err.message)
        } else {
          handleError('An unknown error occurred')
        }
      }
    }

    fetchItems()
  }, [category])

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

  return (
      <div className='flex flex-col items-center'>
        <h1 className='text-4xl font-bold mb-6'>{category}</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {items.map(item => (
              <ItemCard
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  category={item.category}
                  status={item.status}
                  updatedAt={item.updated_at}
              />
          ))}
        </div>
      </div>
  )
}

export default Category