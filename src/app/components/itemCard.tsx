import React from 'react'
import { Icon } from '@iconify/react'
import { useToast } from '@/app/contexts/ToastService'
import { CheckCircle, AlertCircle } from 'react-feather'

interface ItemCardProps {
  name: string
  image: string
  availableItems: number
  availability: boolean
}

const ItemCard: React.FC<ItemCardProps> = ({ name, image, availableItems, availability }) => {
  const toast = useToast()

  const handleSuccess = () => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-green-300 p-4 rounded-lg shadow-lg'>
          <CheckCircle size={40} />
          <div>
            <h3 className='font-bold'>Action Succeed</h3>
            <p className='text-sm'>Item was added to the reservation</p>
          </div>
        </div>
      )
    }
  }

  const handleError = () => {
    if (toast) {
      toast.open(
        <div className='flex gap-2 bg-red-300 p-4 rounded-lg shadow-lg'>
          <AlertCircle size={40} />
          <div>
            <h3 className='font-bold'>Action Failed</h3>
            <p className='text-sm'>Item is not available</p>
          </div>
        </div>
      )
    }
  }

  const handleClick = () => {
    if (availability) {
      handleSuccess()
    } else {
      handleError()
    }
  }

  return (
    <div className='flex flex-col justify-start items-center w-64 h-64 border-dashed border border-zinc-500 rounded-lg'>
      <div className='m-0 rounded-lg w-full h-48 object-cover bg-gray-200 flex items-center justify-center'>
        <span className='text-gray-500'>Image Placeholder</span>
      </div>
      <div className='flex flex-col items-center w-full mt-2'>
        <h3 className='text-lg font-bold'>{name}</h3>
        <p>{availableItems} Items</p>
        <p className={`${availability ? 'text-green-400' : 'text-rose-700'}`}>
          {availability ? 'Available' : 'Not Available'}
        </p>
      </div>
      <button
        className='p-2 border-dashed border border-zinc-500 rounded-lg bg-blue-300 mt-2'
        type='button'
        onClick={handleClick}
      >
        <Icon icon='lucide:plus' width='24' height='24' />
      </button>
    </div>
  )
}

export default ItemCard
