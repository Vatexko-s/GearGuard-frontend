import React from 'react';
import Image, {StaticImageData} from "next/image";

interface CategoryCardProps {
    CategoryName: string;
    ImageSrc: string | StaticImageData;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ CategoryName, ImageSrc }) => {
  return (
    <div className='flex flex-col justify-start items-center gap-4 w-64 h-64 border-dashed border border-zinc-500 rounded-lg'>
      <Image
        src={ImageSrc}
        alt='Image'
        className='m-0 rounded-lg w-full h-48 object-cover'
        width={0}
        height={0}
      />
      <p className='text-center'>{CategoryName}</p>
    </div>
  )
}

export default CategoryCard
