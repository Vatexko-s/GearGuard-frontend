'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ItemCard from '../../components/itemCard'
import { useToast } from '@/app/contexts/ToastService'
import { AlertCircle } from 'react-feather'

interface IItem {
  name: string
  image: string
  availableItems: number
  availability: boolean
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
        const response = await fetch(`/samples/${category}ItemsSample.json`)
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
    <div className='flex flex-wrap gap-4 justify-evenly'>
      {items.map(item => (
        <ItemCard
          key={item.name}
          name={item.name}
          image={item.image}
          availableItems={item.availableItems}
          availability={item.availability}
        />
      ))}
    </div>
  )
}

export default Category
