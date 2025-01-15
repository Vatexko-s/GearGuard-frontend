'use client'

import React, { useEffect, useState } from 'react'
import CategoryCard from '@/app/components/categoryCard'
import Link from 'next/link'
import { ICategory } from '@/app/data/models'
import { AlertCircle } from 'react-feather'
import { useToast } from '@/app/contexts/ToastService'

const Dashboard = () => {
  const [categories, setCategories] = useState<ICategory[]>([])
  const toast = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/samples/categoriesSample.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: ICategory[] = await response.json()
        setCategories(data)
      } catch (err) {
        if (err instanceof Error) {
          handleError(err.message)
        } else {
          handleError('An unknown error occurred')
        }
      }
    }

    fetchCategories()
  }, [])

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
      {categories.map(category => (
        <Link key={category.name} href={`/dashboard/${category.name.toLowerCase()}`}>
          <CategoryCard CategoryName={category.name} ImageSrc={category.image} />
        </Link>
      ))}
    </div>
  )
}

export default Dashboard
