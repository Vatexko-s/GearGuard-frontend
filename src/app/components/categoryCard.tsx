import React from 'react'
import Image, { StaticImageData } from 'next/image'

interface CategoryCardProps {
  CategoryName: string
  ImageSrc: string | StaticImageData
}

const CategoryCard: React.FC<CategoryCardProps> = ({ CategoryName, ImageSrc }) => {
  return (
    <div className='w-64 h-64 bg-white rounded-lg shadow-lg dark:bg-gray-800 flex flex-col items-center'>
      <div className='w-full h-full overflow-hidden flex justify-center'>
        <Image
          className='object-cover'
          src={ImageSrc}
          alt={CategoryName}
          width={200} // Adjusted width
          height={128} // Adjusted height
        />
      </div>
      <div className='text-center mt-2 mb-4'>
        <span className='text-lg font-bold text-gray-700 dark:text-gray-200'>{CategoryName}</span>
      </div>
    </div>
  )
}

export default CategoryCard
