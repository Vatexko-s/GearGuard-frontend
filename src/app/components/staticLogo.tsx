import React from 'react'
import { CogIcon } from '@heroicons/react/24/solid'

const StaticLogo: React.FC = () => {
  return (
    <div className='flex items-center space-x-1'>
      <CogIcon className='h-10 w-10 text-blue-500' />
      <span className='text-2xl font-bold text-gray-600 dark:text-gray-200'>GearGuard</span>
    </div>
  )
}

export default StaticLogo
